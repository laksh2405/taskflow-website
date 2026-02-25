import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Status = 'backlog' | 'todo' | 'in_progress' | 'done';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; color: string }> = {
  backlog: {
    label: 'Backlog',
    color: 'bg-status-backlog text-background',
  },
  todo: {
    label: 'To Do',
    color: 'bg-status-todo text-background',
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-status-progress text-background',
  },
  done: {
    label: 'Done',
    color: 'bg-status-done text-background',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="secondary" className={cn(config.color, className)}>
      {config.label}
    </Badge>
  );
}
