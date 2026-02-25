"use client";

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListViewTable } from '@/components/views/list-view-table';
import { TaskFilterBar } from '@/components/shared/task-filter-bar';
import { TaskDetailModal } from '@/components/modals/task-detail-modal';
import { useTaskFilters } from '@/hooks/use-task-filters';
import { MOCK_PROJECTS, MOCK_BOARDS, MOCK_TASKS, MOCK_USERS } from '@/lib/mock-data';
import { Task } from '@/lib/types';
import { ArrowLeft, Settings, Plus } from 'lucide-react';

export default function ProjectListPage({
  params,
}: {
  params: { projectId: string };
}) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState(MOCK_TASKS);
  const [groupBy, setGroupBy] = useState<string>("none");

  const project = MOCK_PROJECTS.find((p) => p.id === params.projectId);
  const board = MOCK_BOARDS.find((b) => b.projectId === params.projectId);
  const projectTasks = localTasks.filter((t) => t.boardId === board?.id).map((task) => {
    const assignee = task.assigneeId ? MOCK_USERS.find((u) => u.id === task.assigneeId) : null;
    return {
      ...task,
      assignees: assignee ? [assignee] : [],
      labels: Array.isArray(task.labels) && task.labels.length > 0 && typeof task.labels[0] === 'object'
        ? (task.labels as any[]).map((l: any) => l.name)
        : (task.labels || []),
    };
  });

  const { filters, filteredTasks, updateFilter, clearFilters, activeFilterCount } = useTaskFilters(projectTasks);

  if (!project || !board) {
    notFound();
  }

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setLocalTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  };

  const handleTaskDelete = (taskId: string) => {
    setLocalTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const getUserById = (userId: string | null) => {
    if (!userId) return null;
    return MOCK_USERS.find((u) => u.id === userId);
  };

  const groupedTasks = () => {
    if (groupBy === "none") {
      return { "All Tasks": filteredTasks };
    }

    const groups: Record<string, Task[]> = {};
    filteredTasks.forEach((task) => {
      let key = "";
      if (groupBy === "status") {
        key = task.status;
      } else if (groupBy === "priority") {
        key = task.priority;
      } else if (groupBy === "assignee") {
        key = task.assignees?.[0]?.name || "Unassigned";
      }
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(task);
    });
    return groups;
  };

  const taskGroups = groupedTasks();

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        <Tabs value="list" className="w-full">
          <TabsList>
            <Link href={`/projects/${project.id}/board`}>
              <TabsTrigger value="board">Board</TabsTrigger>
            </Link>
            <Link href={`/projects/${project.id}/list`}>
              <TabsTrigger value="list">List</TabsTrigger>
            </Link>
            <Link href={`/projects/${project.id}/calendar`}>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </Link>
            <Link href={`/projects/${project.id}/timeline`}>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </Link>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <TaskFilterBar
              filters={filters}
              onFilterChange={updateFilter}
              onClearFilters={clearFilters}
              activeFilterCount={activeFilterCount}
            />
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No grouping</SelectItem>
                <SelectItem value="status">Group by Status</SelectItem>
                <SelectItem value="priority">Group by Priority</SelectItem>
                <SelectItem value="assignee">Group by Assignee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-8">
            {Object.entries(taskGroups).map(([groupName, tasks]) => (
              <div key={groupName} className="space-y-4">
                {groupBy !== "none" && (
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{groupName}</h3>
                    <span className="text-sm text-muted-foreground">({tasks.length})</span>
                  </div>
                )}
                <ListViewTable
                  tasks={tasks}
                  users={MOCK_USERS}
                  onTaskClick={setSelectedTask}
                  onTaskUpdate={handleTaskUpdate}
                  onTaskDelete={handleTaskDelete}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <TaskDetailModal
        task={selectedTask}
        assignee={selectedTask ? getUserById(selectedTask.assigneeId) : null}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </div>
  );
}
