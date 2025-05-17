export interface Decision {
  _id: boolean;
  id: string;
  title: string;
  description: string;
  category: 'personal' | 'professional' | 'financial' | 'health' | 'relationships' | 'career' | 'education';
  impactScore: number;
  urgencyLevel: number;
  confidenceLevel: number;
  currentMood: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt?: Date;
  deadline?: string;
  rationale: string;
  affectedAreas?: string[];
  stakeholders: {
    keyStakeholders: string;
    impactAnalysis: string;
    communicationPlan: string;
  };
  outcomes: {
    expected: string;
    actual?: string;
    successMetrics: string;
    potentialRisks: string;
    riskMitigation: string;
  };
  approvalRequired?: boolean;
  backupPlan?: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  progress: number;
  createdAt: Date;
  decisions: Decision[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  team: number;
  progress: number;
  createdAt: Date;
  decisions: Decision[];
}