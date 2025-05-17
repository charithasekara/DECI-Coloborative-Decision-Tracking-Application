'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Decision } from '@/lib/types';
import { aiService } from '@/lib/ai';
import { decisionApi } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Check, X, XCircle } from 'lucide-react';
import Link from 'next/link';

interface DecisionsResponse {
  decisions: Decision[];
  total?: number;
  pages?: number;
  currentPage?: number;
}

interface DecisionResponse {
  decision: Decision;
}

interface SimilarDecision extends Decision {
  similarity?: number;
}

interface StakeholderFields {
  keyStakeholders: string;
  impactAnalysis: string;
  communicationPlan: string;
}

interface OutcomeFields {
  expected: string;
  successMetrics: string;
  potentialRisks: string;
  riskMitigation: string;
}

interface FormData extends Partial<Decision> {
  stakeholders: StakeholderFields;
  outcomes: OutcomeFields;
}

interface StepValidationConfig {
  fields: Array<keyof Decision | keyof StakeholderFields | keyof OutcomeFields>;
  validator: (field: string, value: any) => string | undefined;
}

const categories: Decision['category'][] = [
  'personal',
  'professional',
  'financial',
  'health',
  'relationships',
  'career',
  'education',
];

const affectedAreas = [
  { id: 'financial', label: 'Financial' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'wellbeing', label: 'Well-being' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'career', label: 'Career' },
  { id: 'security', label: 'Security' },
];

const defaultStakeholders: StakeholderFields = {
  keyStakeholders: '',
  impactAnalysis: '',
  communicationPlan: '',
};

const defaultOutcomes: OutcomeFields = {
  expected: '',
  successMetrics: '',
  potentialRisks: '',
  riskMitigation: '',
};

export default function DecisionDetailClient({ initialDecision }: { initialDecision: Decision }) {
  const router = useRouter();
  const [decision, setDecision] = useState<Decision | null>(initialDecision);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    ...initialDecision,
    deadline: initialDecision.deadline ? format(new Date(initialDecision.deadline), 'yyyy-MM-dd') : '',
    stakeholders: initialDecision.stakeholders || defaultStakeholders,
    outcomes: initialDecision.outcomes || defaultOutcomes,
    status: initialDecision.status || 'active',
    affectedAreas: Array.isArray(initialDecision.affectedAreas) ? initialDecision.affectedAreas : [],
  });
  const [insights, setInsights] = useState<string[]>([]);
  const [similarDecisions, setSimilarDecisions] = useState<SimilarDecision[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsightsAndSimilarDecisions = async () => {
      try {
        setFetchError(null);
        const insightsResult = await aiService.generateInsights(initialDecision);
        const allDecisionsResponse = await decisionApi.getAll({ limit: 100 }) as DecisionsResponse;
        const allDecisions = allDecisionsResponse.decisions || [];
        const similar = await aiService.getSimilarDecisions(initialDecision, allDecisions);
        setInsights(insightsResult);
        setSimilarDecisions(similar);
      } catch (error: any) {
        console.error('Error fetching insights or similar decisions:', error);
        toast.error('Failed to load insights or similar decisions');
        setFetchError('Failed to load additional data. Some features may be unavailable.');
      }
    };
    fetchInsightsAndSimilarDecisions();
  }, [initialDecision.id]);

  const validateField = useCallback(
    (field: keyof Decision | keyof StakeholderFields | keyof OutcomeFields, value: any): string | undefined => {
      const fieldStr = field as string;
      switch (fieldStr) {
        case 'title':
        case 'description':
        case 'rationale':
        case 'category':
        case 'keyStakeholders':
        case 'impactAnalysis':
        case 'communicationPlan':
        case 'expected':
        case 'successMetrics':
        case 'potentialRisks':
        case 'riskMitigation':
          if (!value || (typeof value === 'string' && !value.trim()))
            return `${fieldStr.charAt(0).toUpperCase() + fieldStr.slice(1)} is required`;
          return undefined;
        case 'impactScore':
        case 'confidenceLevel':
          if (typeof value !== 'number' || value < 1 || value > 10)
            return `${fieldStr.charAt(0).toUpperCase() + fieldStr.slice(1)} must be between 1 and 10`;
          return undefined;
        case 'urgencyLevel':
        case 'currentMood':
          if (typeof value !== 'number' || value < 1 || value > 5)
            return `${fieldStr.charAt(0).toUpperCase() + fieldStr.slice(1)} must be between 1 and 5`;
          return undefined;
        case 'affectedAreas':
          if (!Array.isArray(value) || value.length === 0)
            return 'At least one affected area is required';
          return undefined;
        case 'status':
          if (!value || !['draft', 'active', 'completed', 'archived'].includes(value))
            return 'Invalid status';
          return undefined;
        default:
          return undefined;
      }
    },
    []
  );

  const stepValidationConfig: StepValidationConfig[] = useMemo(
    () => [
      {
        fields: ['title', 'description', 'rationale', 'category'],
        validator: (field, value) => validateField(field as keyof Decision, value),
      },
      {
        fields: ['impactScore', 'urgencyLevel', 'confidenceLevel', 'currentMood', 'affectedAreas'],
        validator: (field, value) => validateField(field as keyof Decision, value),
      },
      {
        fields: ['keyStakeholders', 'impactAnalysis', 'communicationPlan'],
        validator: (field, value) => validateField(field as keyof StakeholderFields, value),
      },
      {
        fields: ['expected', 'successMetrics', 'potentialRisks', 'riskMitigation'],
        validator: (field, value) => validateField(field as keyof OutcomeFields, value),
      },
      {
        fields: ['status'],
        validator: (field, value) => validateField(field as keyof Decision, value),
      },
    ],
    [validateField]
  );

  const validateStep = useCallback(
    (step: number): boolean => {
      const config = stepValidationConfig[step - 1];
      const newErrors: { [key: string]: string } = {};
      config.fields.forEach((field) => {
        const value =
          config.fields.some((f) => (f as string) in formData.stakeholders)
            ? formData.stakeholders[field as keyof StakeholderFields]
            : config.fields.some((f) => (f as string) in formData.outcomes)
            ? formData.outcomes[field as keyof OutcomeFields]
            : formData[field as keyof Decision];
        const error = config.validator(field, value);
        if (error) newErrors[field] = error;
      });
      setErrors((prev) => {
        const updatedErrors = { ...prev, ...newErrors };
        Object.keys(prev).forEach((key) => {
          if (!newErrors[key] && !config.fields.includes(key as any)) delete updatedErrors[key];
        });
        return updatedErrors;
      });
      return Object.keys(newErrors).length === 0;
    },
    [formData, stepValidationConfig]
  );

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      setErrors({});
    } else {
      toast.error('Please fix the errors before proceeding');
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
  }, []);

  const handleUpdate = async () => {
    if (!decision || !validateStep(currentStep)) {
      toast.error('Please fix the errors before saving');
      return;
    }
    setIsSaving(true);
    try {
      let parsedDeadline: Date | undefined;
      if (formData.deadline) {
        parsedDeadline = new Date(formData.deadline + 'T00:00:00Z');
        if (isNaN(parsedDeadline.getTime())) throw new Error('Invalid deadline date');
      }

      const payload: Partial<Decision> = {
        ...formData,
        affectedAreas: formData.affectedAreas || [],
        deadline: parsedDeadline && !isNaN(parsedDeadline.getTime()) ? parsedDeadline.toISOString() : undefined,
        stakeholders: formData.stakeholders,
        outcomes: formData.outcomes,
      };
      console.log('Update payload:', payload);
      const response = await decisionApi.update(decision.id, payload);
      if ('decision' in response && response.decision) {
        setDecision(response.decision);
        setFormData({
          ...response.decision,
          deadline: response.decision.deadline ? format(new Date(response.decision.deadline), 'yyyy-MM-dd') : '',
          stakeholders: response.decision.stakeholders || defaultStakeholders,
          outcomes: response.decision.outcomes || defaultOutcomes,
          affectedAreas: Array.isArray(response.decision.affectedAreas) ? response.decision.affectedAreas : [],
        });
        setIsEditing(false);
        setCurrentStep(1);
        setErrors({});
        toast.success('Decision updated successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update decision', {
        description: error.errors?.join(', ') || '',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!decision?.id || !/^[0-9a-fA-F]{24}$/.test(decision.id)) {
      toast.error('Invalid decision ID');
      return;
    }
    try {
      console.log('Attempting to delete decision with ID:', decision.id);
      await decisionApi.delete(decision.id);
      toast.success('Decision deleted successfully');
      router.push('/decisions');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete decision', {
        description: error.errors?.join(', ') || '',
      });
    }
  };

  const progressValue = useMemo(() => {
    const stepWeights = [20, 20, 20, 20, 20];
    return stepWeights.slice(0, currentStep).reduce((sum, weight) => sum + weight, 0);
  }, [currentStep]);

  if (!decision) return <div className="text-center py-10">Loading...</div>;

  if (fetchError) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{fetchError}</p>
        <Button onClick={() => router.refresh()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">{decision.title}</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setIsEditing(!isEditing);
              if (!isEditing) setErrors({});
            }}
            disabled={isSaving}
            variant="outline"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
            Delete
          </Button>
        </div>
      </div>

      {isEditing && (
        <Dialog open={isEditing} onOpenChange={(open) => !isSaving && (setIsEditing(open), setErrors({}))}>
          <DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Decision - Step {currentStep} of 5</DialogTitle>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  className="absolute right-4 top-4"
                  disabled={isSaving}
                  aria-label="Close"
                >
                  <XCircle className="h-6 w-6" />
                </Button>
              </DialogClose>
            </DialogHeader>
            <Progress value={progressValue} className="mb-4" />
            <div className="space-y-6 py-4">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Basics</h4>
                  {[
                    {
                      id: 'title',
                      label: 'Title',
                      value: formData.title,
                      placeholder: 'e.g., Launch New Product',
                      type: 'input',
                    },
                    {
                      id: 'description',
                      label: 'Description',
                      value: formData.description,
                      placeholder: 'e.g., Introduce a new product to the market',
                      type: 'textarea',
                    },
                    {
                      id: 'rationale',
                      label: 'Rationale',
                      value: formData.rationale,
                      placeholder: 'e.g., To increase market share',
                      type: 'textarea',
                    },
                  ].map(({ id, label, value, placeholder, type }) => (
                    <div key={id}>
                      <Label htmlFor={id}>{label}</Label>
                      <div className="relative mt-1">
                        {type === 'input' ? (
                          <Input
                            id={id}
                            value={value || ''}
                            onChange={(e) => {
                              setFormData({ ...formData, [id]: e.target.value });
                              validateField(id as keyof Decision, e.target.value);
                            }}
                            placeholder={placeholder}
                            className={errors[id] ? 'border-red-500' : ''}
                            aria-invalid={!!errors[id]}
                            aria-describedby={errors[id] ? `${id}-error` : undefined}
                            aria-label={label}
                          />
                        ) : (
                          <Textarea
                            id={id}
                            value={value || ''}
                            onChange={(e) => {
                              setFormData({ ...formData, [id]: e.target.value });
                              validateField(id as keyof Decision, e.target.value);
                            }}
                            placeholder={placeholder}
                            className={`min-h-[100px] ${errors[id] ? 'border-red-500' : ''}`}
                            aria-invalid={!!errors[id]}
                            aria-describedby={errors[id] ? `${id}-error` : undefined}
                            aria-label={label}
                          />
                        )}
                        {value && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2">
                            {!errors[id] ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </span>
                        )}
                      </div>
                      {errors[id] && (
                        <p id={`${id}-error`} className="text-red-500 text-sm mt-1">
                          {errors[id]}
                        </p>
                      )}
                    </div>
                  ))}
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <div className="relative mt-1">
                      <Select
                        value={formData.category || ''}
                        onValueChange={(value) => {
                          setFormData({ ...formData, category: value as Decision['category'] });
                          validateField('category', value);
                        }}
                      >
                        <SelectTrigger
                          id="category"
                          className={errors.category ? 'border-red-500' : ''}
                          aria-label="Select category"
                          aria-invalid={!!errors.category}
                          aria-describedby={errors.category ? 'category-error' : undefined}
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.category && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          {!errors.category ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </span>
                      )}
                      {errors.category && (
                        <p id="category-error" className="text-red-500 text-sm mt-1">
                          {errors.category}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="deadline">Deadline (Optional)</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline || ''}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="mt-1"
                      aria-label="Deadline"
                    />
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Impact</h4>
                  {[
                    { id: 'impactScore', label: 'Impact Score (1-10)', value: formData.impactScore ?? 5, max: 10 },
                    { id: 'urgencyLevel', label: 'Urgency Level (1-5)', value: formData.urgencyLevel ?? 5, max: 5 },
                    {
                      id: 'confidenceLevel',
                      label: 'Confidence Level (1-10)',
                      value: formData.confidenceLevel ?? 5,
                      max: 10,
                    },
                    { id: 'currentMood', label: 'Current Mood (1-5)', value: formData.currentMood ?? 5, max: 5 },
                  ].map(({ id, label, value, max }) => (
                    <div key={id}>
                      <Label>{label}</Label>
                      <div className="flex items-center gap-4 mt-1">
                        <Slider
                          value={[value]}
                          onValueChange={(val) => {
                            setFormData({ ...formData, [id]: val[0] });
                            validateField(id as keyof Decision, val[0]);
                          }}
                          max={max}
                          min={1}
                          step={1}
                          className="flex-1"
                          aria-label={label}
                          aria-describedby={errors[id] ? `${id}-error` : undefined}
                        />
                        <span className="w-12 text-center">{value}</span>
                      </div>
                      {errors[id] && (
                        <p id={`${id}-error`} className="text-red-500 text-sm mt-1">
                          {errors[id]}
                        </p>
                      )}
                    </div>
                  ))}
                  <div>
                    <Label>Affected Areas</Label>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      {affectedAreas.map((area) => {
                        const isChecked = formData.affectedAreas?.includes(area.id) || false;
                        return (
                          <div
                            key={area.id}
                            className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer ${
                              isChecked ? 'border-primary bg-primary/10' : 'border-border'
                            }`}
                            onClick={() => {
                              const newAreas = isChecked
                                ? formData.affectedAreas!.filter((id) => id !== area.id)
                                : [...(formData.affectedAreas || []), area.id];
                              setFormData({ ...formData, affectedAreas: newAreas });
                              validateField('affectedAreas', newAreas);
                            }}
                            role="checkbox"
                            aria-checked={isChecked}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                const newAreas = isChecked
                                  ? formData.affectedAreas!.filter((id) => id !== area.id)
                                  : [...(formData.affectedAreas || []), area.id];
                                setFormData({ ...formData, affectedAreas: newAreas });
                                validateField('affectedAreas', newAreas);
                              }
                            }}
                          >
                            <span className="text-sm font-medium flex-1">{area.label}</span>
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => {
                                const newAreas = isChecked
                                  ? formData.affectedAreas!.filter((id) => id !== area.id)
                                  : [...(formData.affectedAreas || []), area.id];
                                setFormData({ ...formData, affectedAreas: newAreas });
                                validateField('affectedAreas', newAreas);
                              }}
                              aria-label={`Select ${area.label}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {errors.affectedAreas && (
                      <p id="affectedAreas-error" className="text-red-500 text-sm mt-1">
                        {errors.affectedAreas}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Stakeholders</h4>
                  {[
                    {
                      id: 'keyStakeholders',
                      label: 'Key Stakeholders',
                      placeholder: 'e.g., Project Manager, Marketing Team',
                    },
                    {
                      id: 'impactAnalysis',
                      label: 'Impact Analysis',
                      placeholder: 'e.g., Will increase workload for the team',
                    },
                    {
                      id: 'communicationPlan',
                      label: 'Communication Plan',
                      placeholder: 'e.g., Weekly updates via email',
                    },
                  ].map(({ id, label, placeholder }) => (
                    <div key={id}>
                      <Label htmlFor={id}>{label}</Label>
                      <div className="relative mt-1">
                        <Textarea
                          id={id}
                          value={formData.stakeholders[id as keyof StakeholderFields]}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              stakeholders: {
                                ...formData.stakeholders,
                                [id]: e.target.value,
                              },
                            });
                            validateField(id as keyof StakeholderFields, e.target.value);
                          }}
                          placeholder={placeholder}
                          className={`min-h-[100px] ${errors[id] ? 'border-red-500' : ''}`}
                          aria-invalid={!!errors[id]}
                          aria-describedby={errors[id] ? `${id}-error` : undefined}
                          aria-label={label}
                        />
                        {formData.stakeholders[id as keyof StakeholderFields] && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2">
                            {!errors[id] ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </span>
                        )}
                      </div>
                      {errors[id] && (
                        <p id={`${id}-error`} className="text-red-500 text-sm mt-1">
                          {errors[id]}
                        </p>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="approvalRequired">Approval Required</Label>
                    <Checkbox
                      id="approvalRequired"
                      checked={formData.approvalRequired || false}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, approvalRequired: !!checked })
                      }
                      aria-label="Approval Required"
                    />
                  </div>
                </div>
              )}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Outcomes</h4>
                  {[
                    { id: 'expected', label: 'Expected Outcome', placeholder: 'e.g., Increase sales by 20%' },
                    {
                      id: 'successMetrics',
                      label: 'Success Metrics',
                      placeholder: 'e.g., Revenue growth, customer feedback',
                    },
                    {
                      id: 'potentialRisks',
                      label: 'Potential Risks',
                      placeholder: 'e.g., Market competition, budget overrun',
                    },
                    {
                      id: 'riskMitigation',
                      label: 'Risk Mitigation',
                      placeholder: 'e.g., Diversify suppliers, allocate contingency funds',
                    },
                  ].map(({ id, label, placeholder }) => (
                    <div key={id}>
                      <Label htmlFor={id}>{label}</Label>
                      <div className="relative mt-1">
                        <Textarea
                          id={id}
                          value={formData.outcomes[id as keyof OutcomeFields]}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              outcomes: { ...formData.outcomes, [id]: e.target.value },
                            });
                            validateField(id as keyof OutcomeFields, e.target.value);
                          }}
                          placeholder={placeholder}
                          className={`min-h-[100px] ${errors[id] ? 'border-red-500' : ''}`}
                          aria-invalid={!!errors[id]}
                          aria-describedby={errors[id] ? `${id}-error` : undefined}
                          aria-label={label}
                        />
                        {formData.outcomes[id as keyof OutcomeFields] && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2">
                            {!errors[id] ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </span>
                        )}
                      </div>
                      {errors[id] && (
                        <p id={`${id}-error`} className="text-red-500 text-sm mt-1">
                          {errors[id]}
                        </p>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="backupPlan">Backup Plan</Label>
                    <Checkbox
                      id="backupPlan"
                      checked={formData.backupPlan || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, backupPlan: !!checked })}
                      aria-label="Backup Plan"
                    />
                  </div>
                </div>
              )}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Status</h4>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <div className="relative mt-1">
                      <Select
                        value={formData.status || 'active'}
                        onValueChange={(value) => {
                          setFormData({ ...formData, status: value as Decision['status'] });
                          validateField('status', value);
                        }}
                      >
                        <SelectTrigger
                          id="status"
                          className={errors.status ? 'border-red-500' : ''}
                          aria-label="Select status"
                          aria-invalid={!!errors.status}
                          aria-describedby={errors.status ? 'status-error' : undefined}
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {['draft', 'active', 'completed', 'archived'].map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.status && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          {!errors.status ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </span>
                      )}
                    </div>
                    {errors.status && (
                      <p id="status-error" className="text-red-500 text-sm mt-1">
                        {errors.status}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap justify-between mt-6 gap-2">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep} disabled={isSaving}>
                    Previous
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setErrors({});
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                {currentStep < 5 ? (
                  <Button onClick={nextStep} disabled={isSaving}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleUpdate} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {!isEditing && (
        <div className="space-y-6">
          <Card className="shadow-md border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-2xl font-bold">Decision Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <details className="group" open>
                <summary className="text-lg font-semibold text-foreground mb-2 cursor-pointer">
                  Basics
                </summary>
                <div className="ml-4 space-y-2 text-sm text-muted-foreground">
                  <p><strong>Description:</strong> {decision.description || 'N/A'}</p>
                  <p><strong>Category:</strong> <Badge variant="secondary">{decision.category || 'N/A'}</Badge></p>
                  <p><strong>Rationale:</strong> {decision.rationale || 'N/A'}</p>
                  <p><strong>Deadline:</strong> {decision.deadline ? format(new Date(decision.deadline), 'PPP') : 'N/A'}</p>
                </div>
              </details>
              <details className="group">
                <summary className="text-lg font-semibold text-foreground mb-2 cursor-pointer">
                  Impact Metrics
                </summary>
                <div className="ml-4 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <p><strong>Impact Score:</strong> {decision.impactScore ?? 0}/10</p>
                  <p><strong>Urgency Level:</strong> {decision.urgencyLevel ?? 0}/5</p>
                  <p><strong>Confidence Level:</strong> {decision.confidenceLevel ?? 0}/10</p>
                  <p><strong>Current Mood:</strong> {decision.currentMood ?? 0}/5</p>
                  <p>
                    <strong>Affected Areas:</strong>{' '}
                    {Array.isArray(decision.affectedAreas) && decision.affectedAreas.length > 0
                      ? decision.affectedAreas.map(area => {
                          const areaLabel = affectedAreas.find(a => a.id === area)?.label || area;
                          return areaLabel;
                        }).join(', ')
                      : 'None'}
                  </p>
                </div>
              </details>
              <details className="group">
                <summary className="text-lg font-semibold text-foreground mb-2 cursor-pointer">
                  Stakeholders
                </summary>
                <div className="ml-4 space-y-2 text-sm text-muted-foreground">
                  <p><strong>Key Stakeholders:</strong> {decision.stakeholders?.keyStakeholders || 'N/A'}</p>
                  <p><strong>Impact Analysis:</strong> {decision.stakeholders?.impactAnalysis || 'N/A'}</p>
                  <p><strong>Communication Plan:</strong> {decision.stakeholders?.communicationPlan || 'N/A'}</p>
                  <p><strong>Approval Required:</strong> {decision.approvalRequired ? 'Yes' : 'No'}</p>
                </div>
              </details>
              <details className="group">
                <summary className="text-lg font-semibold text-foreground mb-2 cursor-pointer">
                  Outcomes
                </summary>
                <div className="ml-4 space-y-2 text-sm text-muted-foreground">
                  <p><strong>Expected Outcome:</strong> {decision.outcomes?.expected || 'N/A'}</p>
                  <p><strong>Success Metrics:</strong> {decision.outcomes?.successMetrics || 'N/A'}</p>
                  <p><strong>Potential Risks:</strong> {decision.outcomes?.potentialRisks || 'N/A'}</p>
                  <p><strong>Risk Mitigation:</strong> {decision.outcomes?.riskMitigation || 'N/A'}</p>
                  <p><strong>Backup Plan:</strong> {decision.backupPlan ? 'Yes' : 'No'}</p>
                </div>
              </details>
              <details className="group">
                <summary className="text-lg font-semibold text-foreground mb-2 cursor-pointer">
                  Status & Timeline
                </summary>
                <div className="ml-4 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <p><strong>Status:</strong> <Badge variant={decision.status === 'active' ? 'default' : 'secondary'}>{decision.status || 'N/A'}</Badge></p>
                  <p><strong>Created:</strong> {decision.createdAt ? format(new Date(decision.createdAt), 'PPP') : 'N/A'}</p>
                  {decision.updatedAt && <p><strong>Updated:</strong> {format(new Date(decision.updatedAt), 'PPP')}</p>}
                </div>
              </details>
            </CardContent>
          </Card>

          <Card className="shadow-md border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-2xl font-bold">AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {insights.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  {insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No insights available.</p>
              )}
            </CardContent>
          </Card>

          {similarDecisions.length > 0 && (
            <Card className="shadow-md border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-2xl font-bold">Similar Decisions</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {similarDecisions.map((similar, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <Link
                      href={`/decisions/${similar.id}`}
                      className="text-primary hover:underline"
                    >
                      {similar.title || 'Untitled Decision'}
                    </Link>
                    {similar.similarity && (
                      <span className="text-muted-foreground">
                        Similarity: {(similar.similarity * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}