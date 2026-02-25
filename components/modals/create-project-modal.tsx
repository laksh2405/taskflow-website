"use client";

import { useState } from 'react';
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
import { useAuth } from '@/components/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: () => void;
}

const PROJECT_COLORS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Red' },
  { value: '#EC4899', label: 'Pink' },
];

export function CreateProjectModal({
  open,
  onOpenChange,
  onProjectCreated,
}: CreateProjectModalProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0].value);

  console.log('CreateProjectModal - user:', user?.id, 'profile:', profile?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('handleSubmit - user:', user);
    console.log('handleSubmit - profile:', profile);

    if (!user) {
      console.error('No user found in auth context');
      toast.error('You must be logged in to create a project');
      return;
    }

    if (!name.trim()) {
      toast.error('Project name is required');
      return;
    }

    console.log('Creating project for user:', user.id, user.email);

    setLoading(true);
    const supabase = createClient() as any;

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      console.log('Session check:', { session: !!session, sessionError });

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }

      if (!session) {
        console.error('No active session found');
        throw new Error('No active session. Please log in again.');
      }

      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (workspaceError) {
        console.error('Workspace query error:', workspaceError);
        throw new Error(`Failed to check workspace: ${workspaceError.message}`);
      }

      let workspaceId = workspace?.id;

      if (!workspace) {
        const { data: newWorkspace, error: createWorkspaceError } = await supabase
          .from('workspaces')
          .insert({
            name: `${user.email}'s Workspace`,
            slug: user.id.substring(0, 8),
            owner_id: user.id,
            settings: {},
          })
          .select()
          .single();

        if (createWorkspaceError) {
          console.error('Workspace creation error:', createWorkspaceError);
          throw new Error(`Failed to create workspace: ${createWorkspaceError.message}`);
        }

        if (!newWorkspace) {
          throw new Error('Failed to create workspace: No data returned');
        }

        workspaceId = newWorkspace.id;

        const { error: memberError } = await supabase
          .from('workspace_members')
          .insert({
            workspace_id: workspaceId,
            user_id: user.id,
            role: 'owner',
          });

        if (memberError) {
          console.error('Workspace member creation error:', memberError);
        }
      }

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          workspace_id: workspaceId,
          name: name.trim(),
          description: description.trim() || null,
          color: selectedColor,
          status: 'active',
          created_by: user.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      const { data: board, error: boardError } = await supabase
        .from('boards')
        .insert({
          project_id: project.id,
          name: 'Main Board',
          description: `Default board for ${name}`,
          settings: {},
        })
        .select()
        .single();

      if (boardError) throw boardError;

      const defaultColumns = [
        { name: 'To Do', position: 0, color: '#94A3B8' },
        { name: 'In Progress', position: 1, color: '#F59E0B' },
        { name: 'Review', position: 2, color: '#8B5CF6' },
        { name: 'Done', position: 3, color: '#10B981' },
      ];

      const { error: columnsError } = await supabase
        .from('columns')
        .insert(
          defaultColumns.map(col => ({
            board_id: board.id,
            name: col.name,
            position: col.position,
            color: col.color,
          }))
        );

      if (columnsError) throw columnsError;

      await supabase
        .from('activity_log')
        .insert({
          workspace_id: workspaceId,
          actor_id: user.id,
          action: 'created',
          entity_type: 'project',
          entity_id: project.id,
          metadata: { project_name: name },
        });

      toast.success('Project created successfully');

      setName('');
      setDescription('');
      setSelectedColor(PROJECT_COLORS[0].value);
      onOpenChange(false);

      if (onProjectCreated) {
        onProjectCreated();
      }
    } catch (error: any) {
      console.error('Error creating project:', error);

      let errorMessage = 'Failed to create project';

      if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'PGRST116') {
        errorMessage = 'Database connection error. Please try again.';
      } else if (error.code === 'PGRST301') {
        errorMessage = 'Permission denied. Please check your account permissions.';
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
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
                placeholder="Enter project description"
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Project Color</Label>
              <div className="flex gap-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-8 h-8 rounded-full hover:scale-110 transition-transform ${
                      selectedColor === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                    disabled={loading}
                  />
                ))}
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
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
