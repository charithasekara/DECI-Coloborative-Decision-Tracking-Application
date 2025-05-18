'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { goalApi } from '@/lib/api';
import { Goal } from '@/lib/types';
import { format } from 'date-fns';

// Define API response type
interface GoalsResponse {
  goals: Goal[];
}

interface GoalResponse {
  goal: Goal;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', deadline: '' });
  const [errors, setErrors] = useState({ title: '' });

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setIsLoading(true);
        const response: GoalsResponse = await goalApi.getAll();
        setGoals(response.goals);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const validateGoal = () => {
    if (!newGoal.title.trim()) {
      setErrors({ title: 'Title is required' });
      return false;
    }
    setErrors({ title: '' });
    return true;
  };

  const handleCreateGoal = async () => {
    if (!validateGoal()) {
      toast.error('Please fix form errors');
      return;
    }
    try {
      const payload: Partial<Goal> = {
        title: newGoal.title,
        description: newGoal.description || undefined,
        deadline: newGoal.deadline ? new Date(newGoal.deadline).toISOString() : undefined,
        progress: 0,
        decisions: [],
      };
      const response: GoalResponse = await goalApi.create(payload);
      setGoals([...goals, response.goal]);
      setNewGoal({ title: '', description: '', deadline: '' });
      setIsNewGoalOpen(false);
      toast.success('Goal created successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground">Track progress towards your goals</p>
        </div>
        <Button onClick={() => setIsNewGoalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.length === 0 && (
            <Card className="border-dashed hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent
                className="flex flex-col items-center justify-center h-full py-8"
                onClick={() => setIsNewGoalOpen(true)}
              >
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Create New Goal</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Start tracking a new goal to achieve your objectives
                </p>
              </CardContent>
            </Card>
          )}
          {goals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{goal.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{goal.description || 'No description'}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="w-full" />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Created: {format(new Date(goal.createdAt), 'PP')}</span>
                  {goal.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(goal.deadline), 'PP')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isNewGoalOpen} onOpenChange={setIsNewGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal-title">Title</Label>
              <Input
                id="goal-title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="e.g., Complete Project Milestone"
              />
              {errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
            </div>
            <div>
              <Label htmlFor="goal-description">Description (Optional)</Label>
              <Input
                id="goal-description"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="e.g., Finish phase 1 of the project"
              />
            </div>
            <div>
              <Label htmlFor="goal-deadline">Deadline (Optional)</Label>
              <Input
                id="goal-deadline"
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewGoalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGoal}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}