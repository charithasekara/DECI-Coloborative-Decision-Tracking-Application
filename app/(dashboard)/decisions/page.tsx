'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import { decisionApi } from '@/lib/api';
import { Decision } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreVertical, Check, X as CloseIcon, X } from 'lucide-react';
import DecisionDetailClient from './[id]/DecisionDetailClient';

interface DecisionsResponse {
  decisions: Decision[];
  total: number;
  pages: number;
  currentPage: number;
}

interface DecisionResponse {
  decision: Decision;
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

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [filteredDecisions, setFilteredDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editDecision, setEditDecision] = useState<Decision | null>(null);
  const [viewDecision, setViewDecision] = useState<Decision | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Decision> & {
    stakeholders?: Partial<Decision['stakeholders']> & { [key: string]: string };
    outcomes?: Partial<Decision['outcomes']> & { [key: string]: string };
  }>({});
  const [activeTab, setActiveTab] = useState<string>('all');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchDecisions = async () => {
      try {
        setIsLoading(true);
        const response = (await decisionApi.getAll({ page, limit: 10, search })) as DecisionsResponse;
        console.log('Fetched decisions:', response.decisions);
        const { decisions = [], pages = 1 } = response || {};
        setDecisions(decisions);
        setTotalPages(pages);
      } catch (error: any) {
        console.error('Fetch decisions error:', error);
        toast.error(error.message || 'Failed to fetch decisions', {
          description: 'Please check your server connection.',
        });
        setDecisions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDecisions();
  }, [page, search]);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredDecisions(decisions);
    } else {
      setFilteredDecisions(decisions.filter((d) => d.category === (activeTab as Decision['category'])));
    }
  }, [decisions, activeTab]);

  const handleDelete = async (id: string) => {
    if (!id) {
      toast.error('Invalid decision ID');
      setShowDeleteConfirm(null);
      return;
    }
    try {
      await decisionApi.delete(id);
      setDecisions((prev) => prev.filter((d) => d.id !== id));
      setShowDeleteConfirm(null);
      toast.success('Decision deleted successfully');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete decision');
    }
  };

  const openViewModal = (decision: Decision) => {
    console.log('Opening view modal for decision:', decision);
    setViewDecision(decision);
  };

  const closeViewModal = () => {
    setViewDecision(null);
  };

  const openEditModal = (decision: Decision) => {
    console.log('Opening edit modal for decision:', decision);
    const status = decision.status && ['draft', 'active', 'completed', 'archived'].includes(decision.status)
      ? decision.status
      : 'active';
    setEditDecision(decision);
    setEditFormData({
      title: decision.title,
      description: decision.description,
      category: decision.category,
      rationale: decision.rationale || '',
      impactScore: decision.impactScore,
      urgencyLevel: decision.urgencyLevel,
      confidenceLevel: decision.confidenceLevel,
      currentMood: decision.currentMood,
      affectedAreas: Array.isArray(decision.affectedAreas) ? [...decision.affectedAreas] : [], // Ensure it's an array
      stakeholders: {
        keyStakeholders: decision.stakeholders?.keyStakeholders || '',
        impactAnalysis: decision.stakeholders?.impactAnalysis || '',
        communicationPlan: decision.stakeholders?.communicationPlan || '',
      },
      outcomes: {
        expected: decision.outcomes?.expected || '',
        actual: decision.outcomes?.actual || '',
        successMetrics: decision.outcomes?.successMetrics || '',
        potentialRisks: decision.outcomes?.potentialRisks || '',
        riskMitigation: decision.outcomes?.riskMitigation || '',
      },
      deadline: decision.deadline ? format(new Date(decision.deadline), 'yyyy-MM-dd') : '',
      approvalRequired: decision.approvalRequired || false,
      backupPlan: decision.backupPlan || false,
      status,
    });
    setCurrentStep(1);
    setErrors({});
  };

  const validateField = (
    field: keyof Decision | keyof Decision['stakeholders'] | keyof Decision['outcomes'],
    value: any
  ) => {
    const newErrors: { [key: string]: string } = {};
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
          newErrors[fieldStr] = `${fieldStr.charAt(0).toUpperCase() + fieldStr.slice(1)} is required`;
        break;
      case 'impactScore':
      case 'confidenceLevel':
        if (value < 1 || value > 10)
          newErrors[fieldStr] = `${fieldStr.charAt(0).toUpperCase() + fieldStr.slice(1)} must be between 1 and 10`;
        break;
      case 'urgencyLevel':
      case 'currentMood':
        if (value < 1 || value > 5)
          newErrors[fieldStr] = `${fieldStr.charAt(0).toUpperCase() + fieldStr.slice(1)} must be between 1 and 5`;
        break;
      case 'affectedAreas':
        if (!Array.isArray(value) || value.length === 0)
          newErrors[fieldStr] = 'At least one affected area is required';
        break;
      case 'status':
        if (!['draft', 'active', 'completed', 'archived'].includes(value))
          newErrors[fieldStr] = 'Invalid status';
        break;
    }
    setErrors((prev) => {
      const updatedErrors = { ...prev, ...newErrors };
      if (!newErrors[fieldStr] && prev[fieldStr]) {
        delete updatedErrors[fieldStr];
      }
      return updatedErrors;
    });
  };

  const validateStep = (step: number) => {
    const newErrors: { [key: string]: string } = {};
    switch (step) {
      case 1:
        (['title', 'description', 'rationale', 'category'] as (keyof Decision)[]).forEach((field) =>
          validateField(field, editFormData[field])
        );
        break;
      case 2:
        (['impactScore', 'urgencyLevel', 'confidenceLevel', 'currentMood', 'affectedAreas'] as (keyof Decision)[]).forEach(
          (field) => validateField(field, editFormData[field])
        );
        break;
      case 3:
        (['keyStakeholders', 'impactAnalysis', 'communicationPlan'] as (keyof Decision['stakeholders'])[]).forEach((field) =>
          validateField(field, editFormData.stakeholders?.[field])
        );
        break;
      case 4:
        (['expected', 'successMetrics', 'potentialRisks', 'riskMitigation'] as (keyof Decision['outcomes'])[]).forEach((field) =>
          validateField(field, editFormData.outcomes?.[field])
        );
        break;
      case 5:
        validateField('status', editFormData.status);
        break;
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    } else {
      toast.error('Please fix the errors before proceeding');
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleEditSave = async () => {
    if (!editDecision || !validateStep(currentStep)) {
      toast.error('Please fix the errors before saving');
      return;
    }
    setIsSaving(true);
    try {
      const payload: Partial<Decision> = {
        ...editFormData,
        affectedAreas: editFormData.affectedAreas || [], // Default to empty array if undefined
        deadline: editFormData.deadline ? new Date(editFormData.deadline).toISOString() : undefined,
        stakeholders: editFormData.stakeholders,
        outcomes: editFormData.outcomes,
      };
      console.log('Sending update payload:', payload);
      const response = await decisionApi.update(editDecision.id, payload);
      console.log('Update response:', response);
      if (response.decision) {
        setDecisions((prev) =>
          prev.map((d) => (d.id === editDecision.id ? response.decision : d))
        );
        setEditDecision(null);
        setCurrentStep(1);
        toast.success('Decision updated successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update decision');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Decisions</h1>
          <p className="text-sm text-muted-foreground">Track and manage your decisions</p>
        </div>
        
      </div>

      <div className="mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search decisions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full border-input rounded-lg focus:ring-2 focus:ring-primary"
            aria-label="Search decisions"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="flex flex-wrap gap-2 bg-muted p-1 rounded-lg h-11">
          <TabsTrigger
            value="all"
            className="px-4 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            All ({decisions.length})
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="px-4 py-2 rounded-md capitalize data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              {category} ({decisions.filter((d) => d.category === category).length})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Loading...</div>
      ) : filteredDecisions.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="flex flex-col items-center justify-center h-64 p-6">
            <h3 className="font-semibold text-foreground mb-2">No Decisions Found</h3>
            <p className="text-sm text-muted-foreground text-center">
              {activeTab === 'all'
                ? 'You haven’t created any decisions yet.'
                : `No decisions found in the ${activeTab} category.`}
            </p>
            <Button asChild className="mt-4">
              <Link href="/decisions/new">Create Your First Decision</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDecisions.map((decision) => (
              <Card
                key={decision.id}
                className="border-border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="relative p-4 border-b border-border">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {decision.title}
                  </CardTitle>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 absolute top-4 right-4"
                        aria-label="More options"
                      >
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditModal(decision)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openViewModal(decision)}>
                        View 
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowDeleteConfirm(decision.id)}
                        className="text-destructive hover:text-destructive-foreground"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>


                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{decision.description}</p>
                  <div className="flex justify-between text-sm">
                    <Badge className="bg-primary/10 text-primary capitalize">{decision.category}</Badge>
                    <Badge variant={decision.status === 'active' ? 'default' : 'secondary'}>
                      {decision.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Impact Score</span>
                      <span>{decision.impactScore}/10</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Created: {format(new Date(decision.createdAt), 'PP')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Previous
              </Button>
              <span className="self-center">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {showDeleteConfirm && (
        <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this decision? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(showDeleteConfirm)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {viewDecision && (
        <Dialog open={!!viewDecision} onOpenChange={closeViewModal}>
          <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
            <div className="py-6 space-y-6">
              <DecisionDetailClient initialDecision={viewDecision} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {editDecision && (
        <Dialog
          open={!!editDecision}
          onOpenChange={() => {
            setEditDecision(null);
            setCurrentStep(1);
            setErrors({});
          }}
        >
          <DialogContent className="max-w-[90vw] sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader className="">
              <DialogTitle>Edit Decision - Step {currentStep} of 5</DialogTitle>
            </DialogHeader>
            <Progress value={(currentStep / 5) * 100} className="mb-4" />
            <div className="space-y-6 py-4">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Basics</h4>
                  {[
                    { id: 'edit-title', label: 'Title', value: editFormData.title, placeholder: 'e.g., Launch New Product', type: 'input' },
                    { id: 'edit-description', label: 'Description', value: editFormData.description, placeholder: 'e.g., Introduce a new product to the market', type: 'textarea' },
                    { id: 'edit-rationale', label: 'Rationale', value: editFormData.rationale, placeholder: 'e.g., To increase market share', type: 'textarea' },
                  ].map(({ id, label, value, placeholder, type }) => (
                    <div key={id}>
                      <Label htmlFor={id}>{label}</Label>
                      <div className="relative mt-1">
                        {type === 'input' ? (
                          <Input
                            id={id}
                            value={value || ''}
                            onChange={(e) => {
                              setEditFormData({ ...editFormData, [id.replace('edit-', '')]: e.target.value });
                              validateField(id.replace('edit-', '') as keyof Decision, e.target.value);
                            }}
                            placeholder={placeholder}
                            className={errors[id.replace('edit-', '')] ? 'border-red-500' : ''}
                            aria-invalid={!!errors[id.replace('edit-', '')]}
                          />
                        ) : (
                          <Textarea
                            id={id}
                            value={value || ''}
                            onChange={(e) => {
                              setEditFormData({ ...editFormData, [id.replace('edit-', '')]: e.target.value });
                              validateField(id.replace('edit-', '') as keyof Decision, e.target.value);
                            }}
                            placeholder={placeholder}
                            className={`min-h-[100px] ${errors[id.replace('edit-', '')] ? 'border-red-500' : ''}`}
                            aria-invalid={!!errors[id.replace('edit-', '')]}
                          />
                        )}
                        {value && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2">
                            {!errors[id.replace('edit-', '')] ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </span>
                        )}
                      </div>
                      {errors[id.replace('edit-', '')] && (
                        <p className="text-destructive text-sm mt-1">{errors[id.replace('edit-', '')]}</p>
                      )}
                    </div>
                  ))}
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <div className="relative mt-1">
                      <Select
                        value={editFormData.category || ''}
                        onValueChange={(value) => {
                          setEditFormData({ ...editFormData, category: value as Decision['category'] });
                          validateField('category', value);
                        }}
                      >
                        <SelectTrigger id="edit-category" className={errors.category ? 'border-red-500' : ''} aria-label="Select category">
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
                      {editFormData.category && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          {!errors.category ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </span>
                      )}
                    </div>
                    {errors.category && <p className="text-destructive text-sm mt-1">{errors.category}</p>}
                  </div>
                  <div>
                    <Label htmlFor="edit-deadline">Deadline (Optional)</Label>
                    <Input
                      id="edit-deadline"
                      type="date"
                      value={editFormData.deadline || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Impact</h4>
                  {[
                    { id: 'impactScore', label: 'Impact Score (1-10)', value: editFormData.impactScore, max: 10 },
                    { id: 'urgencyLevel', label: 'Urgency Level (1-5)', value: editFormData.urgencyLevel, max: 5 },
                    { id: 'confidenceLevel', label: 'Confidence Level (1-10)', value: editFormData.confidenceLevel, max: 10 },
                    { id: 'currentMood', label: 'Current Mood (1-5)', value: editFormData.currentMood, max: 5 },
                  ].map(({ id, label, value, max }) => (
                    <div key={id}>
                      <Label>{label}</Label>
                      <div className="flex items-center gap-4 mt-1">
                        <Slider
                          value={[value || 5]}
                          onValueChange={(val) => {
                            setEditFormData({ ...editFormData, [id]: val[0] });
                            validateField(id as keyof Decision, val[0]);
                          }}
                          max={max}
                          min={1}
                          step={1}
                          className="flex-1"
                          aria-label={label}
                        />
                        <span className="w-12 text-center">{value || 5}</span>
                      </div>
                      {errors[id] && <p className="text-destructive text-sm mt-1">{errors[id]}</p>}
                    </div>
                  ))}
                  <div>
                    <Label>Affected Areas</Label>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      {affectedAreas.map((area) => (
                        <div
                          key={area.id}
                          className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer ${
                            editFormData.affectedAreas?.includes(area.id)
                              ? 'border-primary bg-primary/10'
                              : 'border-border'
                          }`}
                          onClick={() => {
                            const newAreas = editFormData.affectedAreas?.includes(area.id)
                              ? editFormData.affectedAreas.filter((id) => id !== area.id)
                              : [...(editFormData.affectedAreas || []), area.id];
                            setEditFormData({ ...editFormData, affectedAreas: newAreas });
                            validateField('affectedAreas', newAreas);
                          }}
                          role="checkbox"
                          aria-checked={editFormData.affectedAreas?.includes(area.id)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              const newAreas = editFormData.affectedAreas?.includes(area.id)
                                ? editFormData.affectedAreas.filter((id) => id !== area.id)
                                : [...(editFormData.affectedAreas || []), area.id];
                              setEditFormData({ ...editFormData, affectedAreas: newAreas });
                              validateField('affectedAreas', newAreas);
                            }
                          }}
                        >
                          <span className="text-sm font-medium flex-1">{area.label}</span>
                          <Checkbox
                            checked={editFormData.affectedAreas?.includes(area.id) || false}
                            onCheckedChange={() => {
                              const newAreas = editFormData.affectedAreas?.includes(area.id)
                                ? editFormData.affectedAreas.filter((id) => id !== area.id)
                                : [...(editFormData.affectedAreas || []), area.id];
                              setEditFormData({ ...editFormData, affectedAreas: newAreas });
                              validateField('affectedAreas', newAreas);
                            }}
                            aria-label={`Select ${area.label}`}
                          />
                        </div>
                      ))}
                    </div>
                    {errors.affectedAreas && (
                      <p className="text-destructive text-sm mt-1">{errors.affectedAreas}</p>
                    )}
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Stakeholders</h4>
                  {[
                    { id: 'keyStakeholders', label: 'Key Stakeholders', placeholder: 'e.g., Project Manager, Marketing Team' },
                    { id: 'impactAnalysis', label: 'Impact Analysis', placeholder: 'e.g., Will increase workload for the team' },
                    { id: 'communicationPlan', label: 'Communication Plan', placeholder: 'e.g., Weekly updates via email' },
                  ].map(({ id, label, placeholder }) => (
                    <div key={id}>
                      <Label htmlFor={`edit-${id}`}>{label}</Label>
                      <div className="relative mt-1">
                        <Textarea
                          id={`edit-${id}`}
                          value={editFormData.stakeholders?.[id] || ''}
                          onChange={(e) => {
                            setEditFormData({
                              ...editFormData,
                              stakeholders: { ...editFormData.stakeholders!, [id]: e.target.value },
                            });
                            validateField(id as keyof Decision['stakeholders'], e.target.value);
                          }}
                          placeholder={placeholder}
                          className={`min-h-[100px] ${errors[id] ? 'border-red-500' : ''}`}
                          aria-invalid={!!errors[id]}
                        />
                        {editFormData.stakeholders?.[id] && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2">
                            {!errors[id] ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </span>
                        )}
                      </div>
                      {errors[id] && <p className="text-destructive text-sm mt-1">{errors[id]}</p>}
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-approvalRequired">Approval Required</Label>
                    <Checkbox
                      id="edit-approvalRequired"
                      checked={editFormData.approvalRequired || false}
                      onCheckedChange={(checked) =>
                        setEditFormData({ ...editFormData, approvalRequired: !!checked })
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
                    { id: 'successMetrics', label: 'Success Metrics', placeholder: 'e.g., Revenue growth, customer feedback' },
                    { id: 'potentialRisks', label: 'Potential Risks', placeholder: 'e.g., Market competition, budget overrun' },
                    { id: 'riskMitigation', label: 'Risk Mitigation', placeholder: 'e.g., Diversify suppliers, allocate contingency funds' },
                  ].map(({ id, label, placeholder }) => (
                    <div key={id}>
                      <Label htmlFor={`edit-${id}`}>{label}</Label>
                      <div className="relative mt-1">
                        <Textarea
                          id={`edit-${id}`}
                          value={editFormData.outcomes?.[id] || ''}
                          onChange={(e) => {
                            setEditFormData({
                              ...editFormData,
                              outcomes: { ...editFormData.outcomes!, [id]: e.target.value },
                            });
                            validateField(id as keyof Decision['outcomes'], e.target.value);
                          }}
                          placeholder={placeholder}
                          className={`min-h-[100px] ${errors[id] ? 'border-red-500' : ''}`}
                          aria-invalid={!!errors[id]}
                        />
                        {editFormData.outcomes?.[id] && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2">
                            {!errors[id] ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </span>
                        )}
                      </div>
                      {errors[id] && <p className="text-destructive text-sm mt-1">{errors[id]}</p>}
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-backupPlan">Backup Plan</Label>
                    <Checkbox
                      id="edit-backupPlan"
                      checked={editFormData.backupPlan || false}
                      onCheckedChange={(checked) =>
                        setEditFormData({ ...editFormData, backupPlan: !!checked })
                      }
                      aria-label="Backup Plan"
                    />
                  </div>
                </div>
              )}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Status</h4>
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <div className="relative mt-1">
                      <Select
                        value={editFormData.status || 'active'}
                        onValueChange={(value) => {
                          setEditFormData({ ...editFormData, status: value as Decision['status'] });
                          validateField('status', value);
                        }}
                      >
                        <SelectTrigger id="edit-status" className={errors.status ? 'border-red-500' : ''} aria-label="Select status">
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
                      {editFormData.status && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          {!errors.status ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </span>
                      )}
                    </div>
                    {errors.status && <p className="text-destructive text-sm mt-1">{errors.status}</p>}
                  </div>
                </div>
              )}
             <div className="flex justify-between items-center mt-6">
                {currentStep > 1 ? (
                  <Button variant="outline" onClick={prevStep} disabled={isSaving}>
                    Previous
                  </Button>
                ) : (
                  <div /> // Placeholder for alignment
                )}

                <div className="flex gap-2">
                  <Button
                    className="bg-destructive"
                    variant="outline"
                    onClick={() => {
                      setEditDecision(null);
                      setCurrentStep(1);
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
                    <Button onClick={handleEditSave} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  )}
                </div>
              </div>

            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}