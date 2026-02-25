import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task, User } from '@/lib/types';
import { Calendar, MessageSquare, Paperclip, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PriorityBadge } from './priority-badge';
import { UserAvatar } from './user-avatar';

interface TaskCardProps {
  task: Task;
  assignee?: User | null;
  onClick?: () => void;
}

export function TaskCard({ task, assignee, onClick }: TaskCardProps) {
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const visibleLabels = task.labels?.slice(0, 3) || [];
  const remainingLabels = (task.labels?.length || 0) - visibleLabels.length;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group bg-card"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visibleLabels.map((label: any, index: number) => (
                <Badge
                  key={typeof label === 'string' ? `${label}-${index}` : label.id}
                  variant="secondary"
                  className={cn(
                    'text-xs font-medium',
                    typeof label === 'string' ? '' : label.color + ' text-white border-0'
                  )}
                >
                  {typeof label === 'string' ? label : label.name}
                </Badge>
              ))}
              {remainingLabels > 0 && (
                <Badge variant="secondary" className="text-xs">
                  +{remainingLabels}
                </Badge>
              )}
            </div>
          )}

          <h4 className="font-medium text-sm line-clamp-2">
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={task.priority} />
              {task.dueDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar size={12} />
                  <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                </div>
              )}
            </div>
            {assignee && <UserAvatar user={assignee} size="sm" />}
          </div>

          {(task.subtasks.length > 0 || task.commentCount > 0 || task.attachmentCount > 0) && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t">
              {task.subtasks.length > 0 && (
                <div className="flex items-center gap-1">
                  <CheckSquare size={12} />
                  <span>
                    {completedSubtasks}/{task.subtasks.length}
                  </span>
                </div>
              )}
              {task.commentCount > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare size={12} />
                  <span>{task.commentCount}</span>
                </div>
              )}
              {task.attachmentCount > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip size={12} />
                  <span>{task.attachmentCount}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
