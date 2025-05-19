'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { decisionApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Timeline } from '@/components/ui/timeline';
import { Decision } from '@/lib/types';

// Define API response type
interface DecisionsResponse {
  decisions: Decision[];
}

// Define type for timeline events
interface TimelineEvent {
  date: Date;
  title: string;
  description: string;
}

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response: DecisionsResponse = await decisionApi.getAll({ limit: 100 });
        const decisions = response.decisions;
        const timelineEvents: TimelineEvent[] = decisions.map((decision: Decision) => ({
          date: new Date(decision.createdAt),
          title: decision.title,
          description: `Created decision in ${decision.category} category with impact score ${decision.impactScore}`,
        }));
        setEvents(timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime()));
      } catch (error: any) {
        console.error('Failed to fetch timeline events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Timeline</h1>
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Decision Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <Timeline>
                {events.map((event, index) => (
                  <Timeline.Item key={index} date={format(event.date, 'PP')}>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-muted-foreground">{event.description}</p>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <p className="text-muted-foreground">No events to display. Create a decision to see it here.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}