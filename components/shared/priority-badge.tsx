import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';

interface PriorityBadgeProps {
  priority: Priority;
  showDot?: boolean;
  className?: string;
}

const priorityConfig: Record<Priority, { color: string; dotColor: string }> = {
  Urgent: {
    color: 'bg-danger text-danger-foreground',
    dotColor: 'bg-danger',
  },
  High: {
    color: 'bg-warning text-warning-foreground',
    dotColor: 'bg-warning',
  },
  Medium: {
    color: 'bg-primary text-primary-foreground',
    dotColor: 'bg-primary',
  },
  Low: {
    color: 'bg-muted text-muted-foreground',
    dotColor: 'bg-muted-foreground',
  },
};

export function PriorityBadge({
  priority,
  showDot = true,
  className,
}: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge variant="secondary" className={cn(config.color, 'gap-1.5', className)}>
      {showDot && <span className={cn('h-2 w-2 rounded-full', config.dotColor)} />}
      <span>{priority}</span>
    </Badge>
  );
}
