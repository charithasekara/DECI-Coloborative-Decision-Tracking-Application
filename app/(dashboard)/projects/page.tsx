'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Briefcase, Plus, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { projectApi } from '@/lib/api';
import { Project } from '@/lib/types';
import { format } from 'date-fns';

// Define API response types
interface ProjectsResponse {
  projects: Project[];
}

interface ProjectResponse {
  project: Project;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', deadline: '', team: 0 });
  const [errors, setErrors] = useState({ name: '' });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response: ProjectsResponse = await projectApi.getAll();
        setProjects(response.projects);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const validateProject = () => {
    if (!newProject.name.trim()) {
      setErrors({ name: 'Name is required' });
      return false;
    }
    setErrors({ name: '' });
    return true;
  };

  const handleCreateProject = async () => {
    if (!validateProject()) {
      toast.error('Please fix form errors');
      return;
    }
    try {
      const payload: Partial<Project> = {
        name: newProject.name,
        description: newProject.description || undefined,
        deadline: newProject.deadline ? new Date(newProject.deadline).toISOString() : undefined,
        team: Number(newProject.team) || 0,
        progress: 0,
        decisions: [],
      };
      const response: ProjectResponse = await projectApi.create(payload);
      setProjects([...projects, response.project]);
      setNewProject({ name: '', description: '', deadline: '', team: 0 });
      setIsNewProjectOpen(false);
      toast.success('Project created successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and track progress</p>
        </div>
        <Button onClick={() => setIsNewProjectOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 && (
            <Card className="border-dashed hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent
                className="flex flex-col items-center justify-center h-full py-8"
                onClick={() => setIsNewProjectOpen(true)}
              >
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Create New Project</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Start managing a new project
                </p>
              </CardContent>
            </Card>
          )}
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{project.description || 'No description'}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="w-full" />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Team: {project.team} members</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Created: {format(new Date(project.createdAt), 'PP')}</span>
                  {project.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(project.deadline), 'PP')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-name">Name</Label>
              <Input
                id="project-name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="e.g., Website Redesign"
              />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="project-description">Description (Optional)</Label>
              <Input
                id="project-description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="e.g., Redesign the company website"
              />
            </div>
            <div>
              <Label htmlFor="project-team">Team Size (Optional)</Label>
              <Input
                id="project-team"
                type="number"
                min="0"
                value={newProject.team}
                onChange={(e) => setNewProject({ ...newProject, team: Number(e.target.value) })}
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <Label htmlFor="project-deadline">Deadline (Optional)</Label>
              <Input
                id="project-deadline"
                type="date"
                value={newProject.deadline}
                onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewProjectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}