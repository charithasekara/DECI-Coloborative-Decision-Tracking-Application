import { Decision } from './types';
import { format, startOfMonth, subMonths } from 'date-fns';

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

export const analyticsService = {
  calculateDecisionMetrics: (decisions: Decision[]): AnalyticsMetrics => {
    const totalDecisions = decisions.length;

    // Calculate average impact score
    const averageImpactScore =
      totalDecisions > 0
        ? decisions.reduce((sum, d) => sum + d.impactScore, 0) / totalDecisions
        : 0;

    // Risk analysis based on impact score
    const riskAnalysis = {
      highRisk: decisions.filter((d) => d.impactScore >= 8).length,
      mediumRisk: decisions.filter((d) => d.impactScore >= 5 && d.impactScore < 8).length,
      lowRisk: decisions.filter((d) => d.impactScore < 5).length,
    };

    // Monthly trends for the last 6 months
    const now = new Date();
    const monthlyTrends: Array<{ month: string; count: number; avgImpact: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthDecisions = decisions.filter(
        (d) => new Date(d.createdAt) >= monthStart && new Date(d.createdAt) < startOfMonth(subMonths(now, i - 1))
      );
      const count = monthDecisions.length;
      const avgImpact =
        count > 0
          ? monthDecisions.reduce((sum, d) => sum + d.impactScore, 0) / count
          : 0;
      monthlyTrends.push({
        month: format(monthStart, 'MMM'),
        count,
        avgImpact: Number(avgImpact.toFixed(1)),
      });
    }

    return {
      totalDecisions,
      averageImpactScore: Number(averageImpactScore.toFixed(1)),
      riskAnalysis,
      monthlyTrends,
    };
  },
};