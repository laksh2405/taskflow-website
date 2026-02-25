"use client";

import { Task, User } from '@/lib/types';
import { EmptyState } from '@/components/shared/empty-state';
import { GanttChart } from 'lucide-react';

interface TimelineViewProps {
  tasks: Task[];
  users: User[];
  onTaskClick?: (task: Task) => void;
}

export function TimelineView({ tasks, users, onTaskClick }: TimelineViewProps) {
  return (
    <div className="p-6">
      <EmptyState
        icon={GanttChart}
        title="Timeline View"
        description="Timeline view is coming soon. You'll be able to visualize project milestones and dependencies on a Gantt chart."
      />
    </div>
  );
}
