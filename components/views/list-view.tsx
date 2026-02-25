"use client";

import { Task, User } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Calendar, CheckSquare, MessageSquare, Paperclip } from 'lucide-react';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { UserAvatar } from '@/components/shared/user-avatar';
import { cn } from '@/lib/utils';

interface ListViewProps {
  tasks: Task[];
  users: User[];
  onTaskClick?: (task: Task) => void;
}

export function ListView({ tasks, users, onTaskClick }: ListViewProps) {
  const getUserById = (userId: string | null) => {
    if (!userId) return null;
    return users.find((u) => u.id === userId);
  };

  const completedSubtasks = (task: Task) =>
    task.subtasks.filter((st) => st.completed).length;

  return (
    <div className="p-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const assignee = getUserById(task.assigneeId);

              return (
                <TableRow
                  key={task.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onTaskClick?.(task)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.labels && task.labels.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {task.labels.map((label: any) => (
                            <Badge
                              key={typeof label === 'string' ? label : label.id}
                              variant="outline"
                              className={cn(
                                'text-xs',
                                typeof label === 'string' ? '' : label.color + ' text-white border-0'
                              )}
                            >
                              {typeof label === 'string' ? label : label.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status as any} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={task.priority} showDot={false} />
                  </TableCell>
                  <TableCell>
                    {assignee ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar user={assignee} size="sm" />
                        <span className="text-sm">{assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar size={14} />
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No due date</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
                      {task.subtasks.length > 0 && (
                        <div className="flex items-center gap-1">
                          <CheckSquare size={14} />
                          <span>
                            {completedSubtasks(task)}/{task.subtasks.length}
                          </span>
                        </div>
                      )}
                      {task.commentCount > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare size={14} />
                          <span>{task.commentCount}</span>
                        </div>
                      )}
                      {task.attachmentCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Paperclip size={14} />
                          <span>{task.attachmentCount}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
