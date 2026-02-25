"use client";

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BoardView } from '@/components/views/board-view';
import { TaskDetailModal } from '@/components/modals/task-detail-modal';
import { MOCK_PROJECTS, MOCK_BOARDS, MOCK_TASKS, MOCK_USERS } from '@/lib/mock-data';
import { Task } from '@/lib/types';
import { ArrowLeft, Settings } from 'lucide-react';

export default function ProjectBoardPage({
  params,
}: {
  params: { projectId: string };
}) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const project = MOCK_PROJECTS.find((p) => p.id === params.projectId);
  const board = MOCK_BOARDS.find((b) => b.projectId === params.projectId);
  const tasks = MOCK_TASKS.filter((t) => t.boardId === board?.id);

  if (!project || !board) {
    notFound();
  }

  const getUserById = (userId: string | null) => {
    if (!userId) return null;
    return MOCK_USERS.find((u) => u.id === userId);
  };

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
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        <Tabs value="board" className="w-full">
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

      <div className="flex-1 overflow-hidden">
        <BoardView
          board={board}
          tasks={tasks}
          users={MOCK_USERS}
          onTaskClick={setSelectedTask}
        />
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
