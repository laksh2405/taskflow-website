"use client";

import { useState, useMemo } from "react";
import { Task } from "@/lib/types";

export interface TaskFilters {
  search: string;
  status: string[];
  priority: string[];
  assignee: string[];
  labels: string[];
}

export function useTaskFilters(tasks: Task[]) {
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    status: [],
    priority: [],
    assignee: [],
    labels: [],
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }

      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }

      if (filters.assignee.length > 0) {
        const assigneeIds = task.assignees?.map(a => a.id) || [];
        if (!filters.assignee.some(id => assigneeIds.includes(id))) {
          return false;
        }
      }

      if (filters.labels.length > 0) {
        const taskLabels = (task.labels || []).map((l: any) => typeof l === 'string' ? l : l.name);
        if (!filters.labels.some(label => taskLabels.includes(label))) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters]);

  const updateFilter = (key: keyof TaskFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: [],
      priority: [],
      assignee: [],
      labels: [],
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.assignee.length > 0) count++;
    if (filters.labels.length > 0) count++;
    return count;
  }, [filters]);

  return {
    filters,
    filteredTasks,
    updateFilter,
    clearFilters,
    activeFilterCount,
  };
}
