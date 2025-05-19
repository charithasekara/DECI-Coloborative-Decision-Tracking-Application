'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { decisionApi } from '@/lib/api';
import { aiService } from '@/lib/ai';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Decision } from '@/lib/types';

// Define API response type
interface DecisionsResponse {
  decisions: Decision[];
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setIsLoading(true);
        const response: DecisionsResponse = await decisionApi.getAll({ limit: 100 });
        const decisions = response.decisions;
        const recentDecision = decisions[0];
        if (recentDecision) {
          const insightsData = await aiService.generateInsights(recentDecision);
          setInsights(insightsData);
        }
      } catch (error: any) {
        toast.error('Failed to load insights');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Insights</h1>
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>AI Insights for Recent Decision</CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {insights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No insights available. Create a decision to generate insights.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}