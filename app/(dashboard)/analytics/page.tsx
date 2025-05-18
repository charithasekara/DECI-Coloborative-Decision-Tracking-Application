'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsService } from '@/lib/analytics';
import { useEffect, useState } from 'react';
import { decisionApi } from '@/lib/api';
import { Decision } from '@/lib/types';

// Define the expected API response type
interface DecisionsResponse {
  decisions: Decision[];
}

// Define the type for analytics metrics
interface AnalyticsMetrics {
  totalDecisions: number;
  averageImpactScore: number;
  riskAnalysis: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
  monthlyTrends: Array<{
    month: string;
    count: number;
    avgImpact: number;
  }>;
}

const sampleData = [
  { name: 'Jan', decisions: 12, avgImpact: 7 },
  { name: 'Feb', decisions: 19, avgImpact: 6 },
  { name: 'Mar', decisions: 15, avgImpact: 8 },
  { name: 'Apr', decisions: 9, avgImpact: 5 },
  { name: 'May', decisions: 14, avgImpact: 7 },
];

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);

  useEffect(() => {
    const fetchDecisions = async () => {
      try {
        const response: DecisionsResponse = await decisionApi.getAll({ limit: 100 });
        const decisions = response.decisions;
        const analytics = analyticsService.calculateDecisionMetrics(decisions);
        setMetrics(analytics);
      } catch (error) {
        console.error('Failed to fetch decisions for analytics:', error);
      }
    };
    fetchDecisions();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{metrics?.totalDecisions || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Impact Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{metrics?.averageImpactScore?.toFixed(1) || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>High Risk Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{metrics?.riskAnalysis?.highRisk || 0}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Decision Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics?.monthlyTrends || sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" name="Decisions" />
              <Bar dataKey="avgImpact" fill="#82ca9d" name="Avg Impact" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}