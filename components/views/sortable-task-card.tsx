"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, User } from '@/lib/types';
import { TaskCard } from '@/components/shared/task-card';
import { cn } from '@/lib/utils';

interface SortableTaskCardProps {
  task: Task;
  assignee?: User | null;
  onClick?: () => void;
}

export function SortableTaskCard({ task, assignee, onClick }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'touch-none',
        isDragging && 'opacity-50'
      )}
    >
      <TaskCard task={task} assignee={assignee} onClick={onClick} />
    </div>
  );
}
