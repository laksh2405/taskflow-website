"use client";

import { Task, User } from '@/lib/types';
import { EmptyState } from '@/components/shared/empty-state';
import { Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  users: User[];
  onTaskClick?: (task: Task) => void;
}

export function CalendarView({ tasks, users, onTaskClick }: CalendarViewProps) {
  return (
    <div className="p-6">
      <EmptyState
        icon={CalendarIcon}
        title="Calendar View"
        description="Calendar view is coming soon. You'll be able to visualize tasks on a calendar timeline."
      />
    </div>
  );
}
