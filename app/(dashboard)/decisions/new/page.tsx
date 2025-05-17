'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { decisionApi } from '@/lib/api';
import { Decision } from '@/lib/types';
import Link from 'next/link';
import Confetti from 'react-confetti';
import {
  ArrowLeft,
  Brain,
  Scale,
  Users,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  Star,
  Shield,
  TrendingUp,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// Define API response type
interface DecisionResponse {
  decision: Decision;
}

// Define steps with icons and motivational tips
const steps = [
  { id: 'basics', title: 'Basics', icon: Brain, tip: 'Start with a clear vision!' },
  { id: 'impact', title: 'Impact', icon: Scale, tip: 'Assess your impact wisely!' },
  { id: 'stakeholders', title: 'Stakeholders', icon: Users, tip: 'Engage the right people!' },
  { id: 'outcomes', title: 'Outcomes', icon: Target, tip: 'Plan for success and risks!' },
  { id: 'review', title: 'Review', icon: CheckCircle2, tip: 'Double-check for clarity!' },
];

// Define affected areas for selection
const affectedAreas = [
  { id: 'financial', label: 'Financial', icon: TrendingUp },
  { id: 'productivity', label: 'Productivity', icon: Target },
  { id: 'wellbeing', label: 'Well-being', icon: Star },
  { id: 'relationships', label: 'Relationships', icon: Users },
  { id: 'career', label: 'Career', icon: Brain },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function NewDecisionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [formData, setFormData] = useState<Partial<Decision> & { confirmReview?: boolean }>({
    title: '',
    description: '',
    category: 'personal',
    rationale: '',
    impactScore: 5,
    urgencyLevel: 3,
    confidenceLevel: 5,
    currentMood: 3,
    affectedAreas: [],
    stakeholders: {
      keyStakeholders: '',
      impactAnalysis: '',
      communicationPlan: '',
    },
    outcomes: {
      expected: '',
      actual: '',
      successMetrics: '',
      potentialRisks: '',
      riskMitigation: '',
    },
    approvalRequired: false,
    backupPlan: false,
    status: 'active',
    confirmReview: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    basics: true,
    impact: true,
    stakeholders: true,
    outcomes: true,
  });

  const currentStepIndex = step - 1;
  const progress = ((step) / steps.length) * 100;

  // Handle confetti cleanup after 2 seconds
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Real-time validation for individual fields
  const validateField = (field: string, value: string | number | string[] | boolean | undefined) => {
    const newErrors: { [key: string]: string } = {};
    switch (field) {
      case 'title':
        if (!value || (typeof value === 'string' && !value.trim())) newErrors[field] = 'Title is required';
        break;
      case 'description':
        if (!value || (typeof value === 'string' && !value.trim())) newErrors[field] = 'Description is required';
        break;
      case 'rationale':
        if (!value || (typeof value === 'string' && !value.trim())) newErrors[field] = 'Rationale is required';
        break;
      case 'category':
        if (!value || (typeof value === 'string' && !value.trim())) newErrors[field] = 'Category is required';
        break;
      case 'status':
        if (!value || (typeof value === 'string' && !value.trim())) newErrors[field] = 'Status is required';
        break;
      case 'impactScore':
        if ((value as number) < 1 || (value as number) > 10) newErrors[field] = 'Impact Score must be between 1 and 10';
        break;
      case 'urgencyLevel':
        if ((value as number) < 1 || (value as number) > 5) newErrors[field] = 'Urgency Level must be between 1 and 5';
        break;
      case 'confidenceLevel':
        if ((value as number) < 1 || (value as number) > 10) newErrors[field] = 'Confidence Level must be between 1 and 10';
        break;
      case 'currentMood':
        if ((value as number) < 1 || (value as number) > 5) newErrors[field] = 'Current Mood must be between 1 and 5';
        break;
      case 'affectedAreas':
        if (!Array.isArray(value) || value.length === 0) newErrors[field] = 'At least one affected area is required';
        break;
      case 'keyStakeholders':
        if (!value || (typeof value === 'string' && !value.trim())) newErrors[field] = 'Key Stakeholders are required';
        break;
      case 'impactAnalysis':
        if (!value || (typeof value === 'string' && !value.trim())) newErrors[field] = 'Impact Analysis is required';
        break;
      case 'communicationPlan':
        if (!value || (typeof value === 'string' && !value.trim())) newErrors[field] = 'Communication Plan is required';
        break;
      case 'expected':
        if (!value || (typeof value === 'string' && !value.trim())) newErrors[field] = 'Expected Outcomes are required';
        break;
      case 'successMetrics':
        if (!value || (typeof value === 'string' && !value.trim())) newErrors[field] = 'Success Metrics are required';
        break;
      case 'potentialRisks':
        if (!value || (typeof value === 'string' && !value.trim())) newErrors[field] = 'Potential Risks are required';
        break;
      case 'riskMitigation':
        if (!value || (typeof value === 'string' && !value.trim())) newErrors[field] = 'Risk mitigation is required';
        break;
      case 'confirmReview':
        if (!value) newErrors[field] = 'Please confirm your review before submitting';
        break;
    }
    setErrors((prev) => {
      const updatedErrors = { ...prev, ...newErrors };
      if (!newErrors[field] && prev[field]) {
        delete updatedErrors[field];
      }
      return updatedErrors;
    });
  };

  // Determine if a step is completed by checking if its required fields are valid
  const isStepCompleted = (stepNumber: number) => {
    if (stepNumber === 1) {
      return (
        formData.title?.trim() &&
        formData.description?.trim() &&
        formData.rationale?.trim() &&
        formData.category &&
        !errors.title &&
        !errors.description &&
        !errors.rationale &&
        !errors.category
      );
    } else if (stepNumber === 2) {
      return (
        formData.impactScore &&
        formData.impactScore >= 1 &&
        formData.impactScore <= 10 &&
        formData.urgencyLevel &&
        formData.urgencyLevel >= 1 &&
        formData.urgencyLevel <= 5 &&
        formData.confidenceLevel &&
        formData.confidenceLevel >= 1 &&
        formData.confidenceLevel <= 10 &&
        formData.currentMood &&
        formData.currentMood >= 1 &&
        formData.currentMood <= 5 &&
        formData.affectedAreas &&
        formData.affectedAreas.length > 0 &&
        !errors.impactScore &&
        !errors.urgencyLevel &&
        !errors.confidenceLevel &&
        !errors.currentMood &&
        !errors.affectedAreas
      );
    } else if (stepNumber === 3) {
      return (
        formData.stakeholders?.keyStakeholders?.trim() &&
        formData.stakeholders?.impactAnalysis?.trim() &&
        formData.stakeholders?.communicationPlan?.trim() &&
        !errors.keyStakeholders &&
        !errors.impactAnalysis &&
        !errors.communicationPlan
      );
    } else if (stepNumber === 4) {
      return (
        formData.outcomes?.expected?.trim() &&
        formData.outcomes?.successMetrics?.trim() &&
        formData.outcomes?.potentialRisks?.trim() &&
        formData.outcomes?.riskMitigation?.trim() &&
        !errors.expected &&
        !errors.successMetrics &&
        !errors.potentialRisks &&
        !errors.riskMitigation
      );
    } else if (stepNumber === 5) {
      return formData.confirmReview && !errors.confirmReview;
    }
    return false;
  };

  // Validate step on proceed
  const validateStep = (currentStep: number) => {
    const newErrors: { [key: string]: string } = {};
    if (currentStep === 1) {
      if (!formData.title?.trim()) newErrors.title = 'Title is required';
      if (!formData.description?.trim()) newErrors.description = 'Description is required';
      if (!formData.rationale?.trim()) newErrors.rationale = 'Rationale is required';
      if (!formData.category) newErrors.category = 'Category is required';
    } else if (currentStep === 2) {
      if ((formData.impactScore ?? 0) < 1 || (formData.impactScore ?? 0) > 10)
        newErrors.impactScore = 'Impact Score must be between 1 and 10';
      if ((formData.urgencyLevel ?? 0) < 1 || (formData.urgencyLevel ?? 0) > 5)
        newErrors.urgencyLevel = 'Urgency Level must be between 1 and 5';
      if ((formData.confidenceLevel ?? 0) < 1 || (formData.confidenceLevel ?? 0) > 10)
        newErrors.confidenceLevel = 'Confidence Level must be between 1 and 10';
      if ((formData.currentMood ?? 0) < 1 || (formData.currentMood ?? 0) > 5)
        newErrors.currentMood = 'Current Mood must be between 1 and 5';
      if (!formData.affectedAreas || formData.affectedAreas.length === 0)
        newErrors.affectedAreas = 'At least one affected area is required';
    } else if (currentStep === 3) {
      if (!formData.stakeholders?.keyStakeholders?.trim())
        newErrors.keyStakeholders = 'Key Stakeholders are required';
      if (!formData.stakeholders?.impactAnalysis?.trim())
        newErrors.impactAnalysis = 'Impact Analysis is required';
      if (!formData.stakeholders?.communicationPlan?.trim())
        newErrors.communicationPlan = 'Communication Plan is required';
    } else if (currentStep === 4) {
      if (!formData.outcomes?.expected?.trim())
        newErrors.expected = 'Expected Outcomes are required';
      if (!formData.outcomes?.successMetrics?.trim())
        newErrors.successMetrics = 'Success Metrics are required';
      if (!formData.outcomes?.potentialRisks?.trim())
        newErrors.potentialRisks = 'Potential Risks are required';
      if (!formData.outcomes?.riskMitigation?.trim())
        newErrors.riskMitigation = 'Risk mitigation is required';
    } else if (currentStep === 5) {
      if (!formData.status?.trim()) newErrors.status = 'Status is required';
      if (!formData.confirmReview)
        newErrors.confirmReview = 'Please confirm your review before submitting';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      toast.error('Please fill in all required fields. Check the form for details.', {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) {
      toast.error('Please confirm the review before submitting.', {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: Partial<Decision> = {
        ...formData,
        affectedAreas: Array.isArray(formData.affectedAreas) ? formData.affectedAreas : [],
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
      };
      const response = await decisionApi.create(payload);
      if ('errors' in response && response.errors) {
        toast.error(`Validation failed: ${response.errors.join(', ')}`, {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        });
      } else {
        toast.success('Decision created successfully', {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
        setShowConfetti(true);
        router.push(`/decisions`);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create decision';
      const errorDetails = (error as any).errors || [];
      if (errorDetails.length > 0) {
        toast.error(`Validation failed: ${errorDetails.join(', ')}`, {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        });
      } else {
        toast.error(errorMessage, {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getValue = (value: any): string | number | readonly string[] | undefined => {
  if (typeof value === 'boolean') return '';
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  return value;
};

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <CardContent className="space-y-10 sm:space-y-12 p-8">
  <div>
    <h4 className="text-lg font-semibold flex items-center gap-2">
      <Brain className="h-5 w-5 text-muted-foreground" />
      Basics
    </h4>
    <p className="text-sm text-muted-foreground">{steps[0].tip}</p>
  </div>
  {[
    {
      id: 'title',
      label: 'Title',
      placeholder: 'e.g., Launch New Product',
      Component: Input,
      type: 'text',
    },
    {
      id: 'description',
      label: 'Description',
      placeholder: 'e.g., Introduce a new product to the market',
      Component: Textarea,
      className: 'min-h-[100px]',
    },
    {
      id: 'rationale',
      label: 'Rationale',
      placeholder: 'e.g., To increase market share',
      Component: Textarea,
      className: 'min-h-[100px]',
    },
  ].map(({ id, label, placeholder, Component, className, type }) => (
    <div key={id}>
      <Label htmlFor={id} className="text-base font-medium">
        {label} <span className="text-red-500">*</span>
      </Label>
      <div className="relative mt-3">
        <Component
          id={id}
          type={type}
          value={String(formData[id as keyof typeof formData] ?? '')}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFormData({ ...formData, [id]: e.target.value });
            validateField(id, e.target.value);
          }}
          placeholder={placeholder}
          className={`pr-10 border focus:border-primary focus:ring-1 focus:ring-primary focus:ring-offset-1 transition-all duration-200 active:shadow-[0_0_10px_2px_rgba(var(--primary),0.5)] ${className || ''}`}
        />
        {formData[id as keyof typeof formData] && (
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
        <p className="text-destructive text-sm mt-1 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {errors[id]}
        </p>
      )}
    </div>
  ))}
  <div>
    <Label htmlFor="category" className="text-base font-medium">
      Category <span className="text-red-500">*</span>
    </Label>
    <div className="relative mt-3">
      <Select
        value={formData.category || ''}
        onValueChange={(value) => {
          setFormData({ ...formData, category: value as Decision['category'] });
          validateField('category', value);
        }}
      >
        <SelectTrigger
          id="category"
          className="pr-10 border focus:border-primary focus:ring-1 focus:ring-primary focus:ring-offset-1 transition-all duration-200 active:shadow-[0_0_10px_2px_rgba(var(--primary),0.5)]"
        >
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {['personal', 'professional', 'financial', 'health', 'relationships', 'career', 'education'].map(
            (cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            )
          )}
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
    </div>
    {errors.category && (
      <p className="text-destructive text-sm mt-1 flex items-center">
        <AlertCircle className="h-4 w-4 mr-1" />
        {errors.category}
      </p>
    )}
  </div>
  <div>
    <Label htmlFor="deadline" className="text-base font-medium">
      Deadline (Optional)
    </Label>
    <Input
      id="deadline"
      type="date"
      value={formData.deadline || ''}
      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
      className="mt-3 border focus:border-primary focus:ring-1 focus:ring-primary focus:ring-offset-1 transition-all duration-200 active:shadow-[0_0_10px_2px_rgba(var(--primary),0.5)]"
    />
  </div>
</CardContent>
        );
      case 2:
        return (
          <CardContent className="space-y-10 sm:space-y-12 p-8">
            <div>
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Scale className="h-5 w-5 text-muted-foreground" />
                Impact
              </h4>
              <p className="text-sm text-muted-foreground">{steps[1].tip}</p>
            </div>
            {[
              { id: 'impactScore', label: 'Impact Score (1-10)', value: formData.impactScore ?? 5, max: 10 },
              { id: 'urgencyLevel', label: 'Urgency Level (1-5)', value: formData.urgencyLevel ?? 3, max: 5 },
              { id: 'confidenceLevel', label: 'Confidence Level (1-10)', value: formData.confidenceLevel ?? 5, max: 10 },
              { id: 'currentMood', label: 'Current Mood (1-5)', value: formData.currentMood ?? 3, max: 5 },
            ].map(({ id, label, value, max }) => (
              <div key={id}>
                <Label className="text-base font-medium">
                  {label} <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4 mt-3">
                  <Slider
                    value={[value]}
                    onValueChange={(val) => {
                      setFormData({ ...formData, [id]: val[0] });
                      validateField(id, val[0]);
                    }}
                    max={max}
                    min={1}
                    step={1}
                    className="flex-1 focus:ring-1 focus:ring-primary focus:ring-offset-1 transition-all duration-200 active:shadow-[0_0_10px_2px_rgba(var(--primary),0.5)]"
                  />
                  <span className="w-12 text-center font-medium">{value}</span>
                </div>
                {errors[id] && (
                  <p className="text-destructive text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors[id]}
                  </p>
                )}
              </div>
            ))}
            <div>
              <Label className="text-base font-medium">
                Affected Areas <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {affectedAreas.map((area) => {
                  const isChecked = formData.affectedAreas?.includes(area.id) || false;
                  return (
                    <div
                      key={area.id}
                      className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200 ${
                        isChecked ? 'border-primary bg-primary/10' : 'border-border hover:bg-gray-50'
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
                      <area.icon className="h-4 w-4 text-muted-foreground" />
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
                        className="hover:border-primary/50 transition-all duration-200"
                      />
                    </div>
                  );
                })}
              </div>
              {errors.affectedAreas && (
                <p className="text-destructive text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.affectedAreas}
                </p>
              )}
            </div>
          </CardContent>
        );
      case 3:
        return (
          <CardContent className="space-y-10 sm:space-y-12 p-8">
            <div>
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                Stakeholders
              </h4>
              <p className="text-sm text-muted-foreground">{steps[2].tip}</p>
            </div>
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
                <Label htmlFor={id} className="text-base font-medium">
                  {label} <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-3">
                  <Textarea
                    id={id}
                    value={formData.stakeholders?.[id as keyof typeof formData.stakeholders] ?? ''}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        stakeholders: {
                          ...formData.stakeholders!,
                          [id]: e.target.value,
                        },
                      });
                      validateField(id, e.target.value);
                    }}
                    placeholder={placeholder}
                    className="min-h-[100px] pr-10 border focus:border-primary focus:ring-1 focus:ring-primary focus:ring-offset-1 transition-all duration-200 active:shadow-[0_0_10px_2px_rgba(var(--primary),0.5)]"
                  />
                  {formData.stakeholders?.[id as keyof typeof formData.stakeholders] && (
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
                  <p className="text-destructive text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors[id]}
                  </p>
                )}
              </div>
            ))}
            <div className="flex items-center justify-between">
              <Label htmlFor="approvalRequired" className="text-base font-medium">
                Approval Required
              </Label>
              <Checkbox
                id="approvalRequired"
                checked={formData.approvalRequired || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, approvalRequired: !!checked })
                }
                aria-label="Approval Required"
                className="hover:border-primary/50 transition-all duration-200"
              />
            </div>
          </CardContent>
        );
      case 4:
        return (
          <CardContent className="space-y-10 sm:space-y-12 p-8">
            <div>
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-muted-foreground" />
                Outcomes
              </h4>
              <p className="text-sm text-muted-foreground">{steps[3].tip}</p>
            </div>
            {[
              { id: 'expected', label: 'Expected Outcome', placeholder: 'e.g., Increase sales by 20%' },
              { id: 'successMetrics', label: 'Success Metrics', placeholder: 'e.g., Revenue growth, customer feedback' },
              { id: 'potentialRisks', label: 'Potential Risks', placeholder: 'e.g., Market competition, budget overrun' },
              {
                id: 'riskMitigation',
                label: 'Risk Mitigation',
                placeholder: 'e.g., Diversify suppliers, allocate contingency funds',
              },
            ].map(({ id, label, placeholder }) => (
              <div key={id}>
                <Label htmlFor={id} className="text-base font-medium">
                  {label} <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-3">
                  <Textarea
                    id={id}
                    value={formData.outcomes?.[id as keyof typeof formData.outcomes] ?? ''}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        outcomes: {
                          ...formData.outcomes!,
                          [id]: e.target.value,
                        },
                      });
                      validateField(id, e.target.value);
                    }}
                    placeholder={placeholder}
                    className="min-h-[100px] pr-10 border focus:border-primary focus:ring-1 focus:ring-primary focus:ring-offset-1 transition-all duration-200 active:shadow-[0_0_10px_2px_rgba(var(--primary),0.5)]"
                  />
                  {formData.outcomes?.[id as keyof typeof formData.outcomes] && (
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
                  <p className="text-destructive text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors[id]}
                  </p>
                )}
              </div>
            ))}
            <div className="flex items-center justify-between">
              <Label htmlFor="backupPlan" className="text-base font-medium">
                Backup Plan
              </Label>
              <Checkbox
                id="backupPlan"
                checked={formData.backupPlan || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, backupPlan: !!checked })
                }
                aria-label="Backup Plan"
                className="hover:border-primary/50 transition-all duration-200"
              />
            </div>
          </CardContent>
        );
      case 5:
        return (
          <CardContent className="space-y-10 sm:space-y-12 p-8">
            <div>
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                Review Your Decision
              </h4>
              <p className="text-sm text-muted-foreground">{steps[4].tip}</p>
            </div>
            <div className="space-y-6">
              {[
                {
                  id: 'basics',
                  title: 'Basics',
                  icon: Brain,
                  fields: [
                    { label: 'Title', value: formData.title },
                    { label: 'Description', value: formData.description },
                    { label: 'Rationale', value: formData.rationale },
                    { label: 'Category', value: formData.category },
                    { label: 'Deadline', value: formData.deadline || 'Not set' },
                  ],
                  step: 1,
                },
                {
                  id: 'impact',
                  title: 'Impact',
                  icon: Scale,
                  fields: [
                    { label: 'Impact Score', value: formData.impactScore },
                    { label: 'Urgency Level', value: formData.urgencyLevel },
                    { label: 'Confidence Level', value: formData.confidenceLevel },
                    { label: 'Current Mood', value: formData.currentMood },
                    { label: 'Affected Areas', value: formData.affectedAreas?.join(', ') || 'None' },
                  ],
                  step: 2,
                },
                {
                  id: 'stakeholders',
                  title: 'Stakeholders',
                  icon: Users,
                  fields: [
                    { label: 'Key Stakeholders', value: formData.stakeholders?.keyStakeholders },
                    { label: 'Impact Analysis', value: formData.stakeholders?.impactAnalysis },
                    { label: 'Communication Plan', value: formData.stakeholders?.communicationPlan },
                    { label: 'Approval Required', value: formData.approvalRequired ? 'Yes' : 'No' },
                  ],
                  step: 3,
                },
                {
                  id: 'outcomes',
                  title: 'Outcomes',
                  icon: Target,
                  fields: [
                    { label: 'Expected Outcome', value: formData.outcomes?.expected },
                    { label: 'Success Metrics', value: formData.outcomes?.successMetrics },
                    { label: 'Potential Risks', value: formData.outcomes?.potentialRisks },
                    { label: 'Risk Mitigation', value: formData.outcomes?.riskMitigation },
                    { label: 'Backup Plan', value: formData.backupPlan ? 'Yes' : 'No' },
                  ],
                  step: 4,
                },
              ].map((section) => (
                <div key={section.id} className="border rounded-lg ">
                  <button
                    className="w-full flex items-center justify-between p-4  transition-all duration-200"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-2">
                      <section.icon className="h-5 w-5 text-muted-foreground" />
                      <h5 className="font-semibold">{section.title}</h5>
                    </div>
                    {expandedSections[section.id] ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  {expandedSections[section.id] && (
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.fields.map((field) => (
                          <div
                            key={field.label}
                            className="p-3 rounded-md border hover:border-primary cursor-pointer transition-all duration-200"
                            onClick={() => setStep(section.step)}
                          >
                            <p className="text-sm text-muted-foreground">{field.label}</p>
                            <p className="font-medium mt-1">{field.value || 'Not provided'}</p>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full bg-blue-950 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                        onClick={() => setStep(section.step)}
                      >
                        Edit {section.title}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div>
              <Label htmlFor="status" className="text-base font-medium">
                Status <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-3">
                <Select
                  value={formData.status || 'active'}
                  onValueChange={(value) => {
                    setFormData({ ...formData, status: value as Decision['status'] });
                    validateField('status', value);
                  }}
                >
                  <SelectTrigger
                    id="status"
                    className="pr-10 border focus:border-primary focus:ring-1 focus:ring-primary focus:ring-offset-1 transition-all duration-200 active:shadow-[0_0_10px_2px_rgba(var(--primary),0.5)]"
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
                <p className="text-destructive text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.status}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              
              <Label htmlFor="confirmReview" className="text-base font-medium">
                I have reviewed and confirm the details <span className="text-red-500">*</span>
              </Label>

              <Checkbox
                id="confirmReview"
                checked={formData.confirmReview || false}
                onCheckedChange={(checked) => {
                  setFormData({ ...formData, confirmReview: !!checked });
                  validateField('confirmReview', !!checked);
                }}
                aria-label="Confirm Review"
                className="hover:border-primary/50 transition-all duration-200"
              />

            </div>
            {errors.confirmReview && (
              <p className="text-destructive text-sm mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.confirmReview}
              </p>
            )}
          </CardContent>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">New Decision</h1>
          <p className="text-sm text-muted-foreground">Create a new decision with a structured approach</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/decisions')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Decisions
        </Button>
      </div>
      <Card className="border-border shadow-sm">
        <CardHeader className="p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {steps.map((s, index) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-2 cursor-pointer ${
                    index < step - 1
                      ? 'text-green-500'
                      : index === step - 1
                      ? 'text-foreground font-semibold'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => isStepCompleted(index + 1) && setStep(index + 1)}
                >
                  <s.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{s.title}</span>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 w-8 ${
                        index < step - 1 ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              Step {step} of {steps.length}
            </span>
          </div>
          {/* <Progress value={progress} className="mt-2 h-2" /> */}
        </CardHeader>
        {renderStep()}
        <CardContent className="p-6 flex justify-between gap-4">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
          )}
          <div className="flex-1" />
          {step < 5 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepCompleted(step) || isSubmitting}
              className="transition-all duration-200"
            >
              Next <Clock className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="transition-all duration-200"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'} <CheckCircle2 className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
      {showConfetti && <Confetti />}
    </div>
  );
}