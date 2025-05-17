import { notFound } from 'next/navigation';
import { decisionApi } from '@/lib/api';
import DecisionDetailClient from './DecisionDetailClient';
import { Decision } from '@/lib/types';

interface DecisionResponse {
  decision: Decision;
}

interface DecisionsResponse {
  decisions: Decision[];
}

async function fetchDecisionIds() {
  try {
    const response = (await decisionApi.getAll({ limit: 100 })) as DecisionsResponse;
    const ids = response.decisions
      .filter((decision) => typeof decision._id === 'string' && /^[0-9a-fA-F]{24}$/.test(decision._id))
      .map((decision) => ({ id: String(decision._id) }));
    console.log('Fetched decision IDs:', ids);
    return ids;
  } catch (error) {
    console.error('Failed to fetch decision IDs:', error);
    return [];
  }
}

export async function generateStaticParams() {
  const decisionIds = await fetchDecisionIds();
  return decisionIds;
}

export default async function DecisionDetailPage({ params }: { params: { id: string } }) {
  if (!params.id || !/^[0-9a-fA-F]{24}$/.test(params.id)) {
    console.error('Invalid decision ID in params:', params.id);
    notFound();
  }

  try {
    const response = await decisionApi.getById(params.id);
    console.log('Fetched decision from database for ID:', params.id, response);

    // Ensure the response has the expected structure
    if (!response || !('decision' in response)) {
      console.error('Invalid response structure:', response);
      notFound();
    }

    const decision = response.decision as Decision;
    if (!decision || !decision.id) {
      console.error('Decision not found in response:', response);
      notFound();
    }

    console.log('Decision data being passed to DecisionDetailClient:', decision);
    return <DecisionDetailClient initialDecision={decision} />;
  } catch (error: any) {
    console.error('Failed to fetch decision:', error);
    throw new Error(`Failed to load decision: ${error.message}`);
  }
}