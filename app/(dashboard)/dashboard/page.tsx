'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { decisionApi, goalApi, projectApi } from '@/lib/api';
import { analyticsService } from '@/lib/analytics';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Decision, Goal, Project } from '@/lib/types';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Define API response types
interface DecisionsResponse {
  decisions: Decision[];
}

interface GoalsResponse {
  goals: Goal[];
}

interface ProjectsResponse {
  projects: Project[];
}

interface DashboardStats {
  decisions: number;
  goals: number;
  projects: number;
  highImpactDecisions: number;
}

interface ChartDataPoint {
  month: string;
  count: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    decisions: 0,
    goals: 0,
    projects: 0,
    highImpactDecisions: 0,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentDecisions, setRecentDecisions] = useState<Decision[]>([]);
  const [timeRange, setTimeRange] = useState<'6m' | '12m'>('6m');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const [decisionsRes, goalsRes, projectsRes] = await Promise.all([
        decisionApi.getAll({ limit: 1000 }) as Promise<DecisionsResponse>,
        goalApi.getAll() as Promise<GoalsResponse>,
        projectApi.getAll() as Promise<ProjectsResponse>,
      ]);

      // Calculate stats
      const highImpactDecisions = decisionsRes.decisions.filter(d => d.impactScore >= 8).length;
      setStats({
        decisions: decisionsRes.decisions.length,
        goals: goalsRes.goals.length,
        projects: projectsRes.projects.length,
        highImpactDecisions,
      });

      // Process chart data and recent decisions
      const metrics = analyticsService.calculateDecisionMetrics(decisionsRes.decisions);
      const trends = timeRange === '6m' ? metrics.monthlyTrends : metrics.monthlyTrends.concat(
        Array(6).fill(null).map((_, i) => ({
          month: format(new Date(2024, i, 1), 'MMM'),
          count: 0,
          avgImpact: 0,
        }))
      );
      setChartData(trends.map(trend => ({
        month: trend.month,
        count: trend.count,
      })));

      // Sort and limit recent decisions
      const sortedDecisions = decisionsRes.decisions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentDecisions(sortedDecisions.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  // Chart.js data configuration
  const chartJsData = {
    labels: chartData.map(data => data.month),
    datasets: [
      {
        label: 'Decisions Created',
        data: chartData.map(data => data.count),
        borderColor: 'rgb(59, 130, 246)', // text-blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Decision Trends Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Decisions',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
    },
  };

  // New card data (example metric)
  const totalImpact = stats.decisions > 0 ? stats.decisions * (stats.highImpactDecisions / stats.decisions) : 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      {error && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchStats} className="mt-2">Retry</Button>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="min-h-[200px]">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="min-h-[200px]">
                <CardHeader className="min-h-[96px]">
                  <CardTitle>Total Decisions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between ">
                  <p className="text-4xl font-bold">{stats.decisions}</p>
                  <Link href="/dashboard/decisions" className="text-blue-500 mt-4 inline-block">
                    View Decisions
                  </Link>
                </CardContent>
              </Card>
              <Card className="min-h-[200px]">
                <CardHeader className="min-h-[96px]">
                  <CardTitle>High Impact Decisions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between ">
                  <p className="text-4xl font-bold">{stats.highImpactDecisions}</p>
                  <Link href="/dashboard/decisions?impact=high" className="text-blue-500 mt-4 inline-block">
                    View High Impact
                  </Link>
                </CardContent>
              </Card>
              <Card className="min-h-[200px]">
                <CardHeader className="min-h-[96px]">
                  <CardTitle>Goals</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between">
                  <p className="text-4xl font-bold">{stats.goals}</p>
                  <Link href="/dashboard/goals" className="text-blue-500 mt-4 inline-block">
                    View Goals
                  </Link>
                </CardContent>
              </Card>
              <Card className="min-h-[200px]">
                <CardHeader className="min-h-[96px]">
                  <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between ">
                  <p className="text-4xl font-bold">{stats.projects}</p>
                  <Link href="/dashboard/projects" className="text-blue-500 mt-4 inline-block">
                    View Projects
                  </Link>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-1">
          {loading ? (
            <Card className="min-h-[300px]">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full mb-2" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ) : (
            <Card className="min-h-[300px]">
              <CardHeader>
                <CardTitle className="mb-4">Decision Trends & Activity</CardTitle>
                <Select value={timeRange} onValueChange={(value: '6m' | '12m') => setTimeRange(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6m">Last 6 Months</SelectItem>
                    <SelectItem value="12m">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Line data={chartJsData} options={chartOptions} />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Recent Decisions</h3>
                  {recentDecisions.length > 0 ? (
                    <ul className="max-h-40 overflow-y-auto space-y-2">
                      {recentDecisions.map(decision => (
                        <li key={decision.id} className="flex justify-between items-center py-1 border-b">
                          <Link href={`/dashboard/decisions/${decision.id}`} className="text-blue-500 hover:underline">
                            {decision.title}
                          </Link>
                          <span className="text-sm text-gray-500">
                            {format(new Date(decision.createdAt), 'MMM dd, yyyy')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No recent decisions.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="min-h-[200px]">
            <CardHeader>
              <CardTitle>Total Decision Impact</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-full">
              <p className="text-4xl font-bold">{totalImpact.toFixed(1)}</p>
              <Link href="/dashboard/analytics" className="text-blue-500 mt-4 inline-block">
                View Analytics
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}