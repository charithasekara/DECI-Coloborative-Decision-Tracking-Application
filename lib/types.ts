export interface Decision {
  id: string;
  title: string;
  description: string;
  category: string;
  impactScore: number;
  mood: number;
  createdAt: Date;
  updatedAt: Date;
  outcomes: {
    expected: string;
    actual: string;
  };
}

export type DecisionCategory =
  | 'personal'
  | 'professional'
  | 'financial'
  | 'health'
  | 'relationships'
  | 'other';