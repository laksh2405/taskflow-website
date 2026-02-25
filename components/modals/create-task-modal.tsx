"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/components/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: () => void;
}

export function CreateTaskModal({ open, onOpenChange, onTaskCreated }: CreateTaskModalProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [projects, setProjects] = useState<any[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (open && user) {
      loadProjects();
    }
  }, [open, user]);

  useEffect(() => {
    if (selectedProject) {
      loadBoards(selectedProject);
    } else {
      setBoards([]);
      setSelectedBoard('');
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedBoard) {
      loadColumns(selectedBoard);
    } else {
      setColumns([]);
      setSelectedColumn('');
    }
  }, [selectedBoard]);

  const loadProjects = async () => {
    const supabase = createClient() as any;
    const { data } = await supabase
      .from('projects')
      .select('id, name')
      .eq('status', 'active')
      .order('name');

    setProjects(data || []);
  };

  const loadBoards = async (projectId: string) => {
    const supabase = createClient() as any;
    const { data } = await supabase
      .from('boards')
      .select('id, name')
      .eq('project_id', projectId)
      .order('name');

    setBoards(data || []);
    if (data && data.length > 0) {
      setSelectedBoard(data[0].id);
    }
  };

  const loadColumns = async (boardId: string) => {
    const supabase = createClient() as any;
    const { data } = await supabase
      .from('columns')
      .select('id, name')
      .eq('board_id', boardId)
      .order('position');

    setColumns(data || []);
    if (data && data.length > 0) {
      setSelectedColumn(data[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to create a task');
      return;
    }

    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }

    if (!selectedProject || !selectedBoard || !selectedColumn) {
      toast.error('Please select a project, board, and column');
      return;
    }

    setLoading(true);
    const supabase = createClient() as any;

    try {
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          board_id: selectedBoard,
          column_id: selectedColumn,
          title: title.trim(),
          description: description.trim() || null,
          priority,
          status: 'todo',
          assignee_id: user.id,
          due_date: dueDate || null,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      const { data: assigneeProfile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', user.id)
        .maybeSingle();

      if (assigneeProfile && profile) {
        fetch(`${process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL}/webhook/task.assigned`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': process.env.NEXT_PUBLIC_N8N_WEBHOOK_SECRET || '',
          },
          body: JSON.stringify({
            task_title: task.title,
            assignee_name: assigneeProfile.name,
            assignee_email: assigneeProfile.email,
            assigned_by: profile.name,
          }),
        }).catch(err => console.warn('n8n webhook failed:', err));
      }

      await supabase
        .from('activity_log')
        .insert({
          user_id: user.id,
          action: 'created',
          entity_type: 'task',
          entity_id: task.id,
          metadata: { task_title: title },
        });

      toast.success('Task created successfully');

      setTitle('');
      setDescription('');
      setPriority('medium');
      setSelectedProject('');
      setSelectedBoard('');
      setSelectedColumn('');
      setDueDate('');
      onOpenChange(false);

      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
                disabled={loading || projects.length === 0}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {projects.length === 0 && (
                <p className="text-sm text-muted-foreground">Create a project first</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(value: any) => setPriority(value)}
                  disabled={loading}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || projects.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
