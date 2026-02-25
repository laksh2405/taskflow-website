"use client";

import { Task, User } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  Calendar,
  MessageSquare,
  Paperclip,
  User as UserIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { UserAvatar } from '@/components/shared/user-avatar';

interface TaskDetailModalProps {
  task: Task | null;
  assignee?: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailModal({
  task,
  assignee,
  open,
  onOpenChange,
}: TaskDetailModalProps) {
  if (!task) return null;

  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto sm:rounded-lg w-full sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status as any} />
            {task.labels && task.labels.map((label: any) => {
              if (typeof label === 'string') {
                return (
                  <Badge key={label} variant="outline">
                    {label}
                  </Badge>
                );
              }
              return (
                <Badge
                  key={label.id}
                  className={cn(label.color, 'text-white')}
                >
                  {label.name}
                </Badge>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserIcon size={16} />
                <span>Assignee</span>
              </div>
              {assignee ? (
                <div className="flex items-center gap-2">
                  <UserAvatar user={assignee} size="md" />
                  <div>
                    <p className="text-sm font-medium">{assignee.name}</p>
                    <p className="text-xs text-muted-foreground">{assignee.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unassigned</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={16} />
                <span>Due Date</span>
              </div>
              {task.dueDate ? (
                <p className="text-sm font-medium">
                  {format(new Date(task.dueDate), 'MMMM d, yyyy')}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No due date</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground">
              {task.description || 'No description provided.'}
            </p>
          </div>

          {task.subtasks.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    Subtasks ({completedSubtasks}/{task.subtasks.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2">
                      <Checkbox checked={subtask.completed} />
                      <span
                        className={cn(
                          'text-sm',
                          subtask.completed && 'line-through text-muted-foreground'
                        )}
                      >
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} />
              <span>{task.commentCount} comments</span>
            </div>
            <div className="flex items-center gap-2">
              <Paperclip size={16} />
              <span>{task.attachmentCount} attachments</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button>Edit Task</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
