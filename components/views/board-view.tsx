"use client";

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Board, Task, User, Column } from '@/lib/types';
import { BoardColumn } from './board-column';
import { TaskCard } from '@/components/shared/task-card';
import { BoardHeader } from './board-header';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BoardViewProps {
  board: Board;
  tasks: Task[];
  users: User[];
  onTaskClick?: (task: Task) => void;
}

export function BoardView({ board, tasks, users, onTaskClick }: BoardViewProps) {
  const [columns, setColumns] = useState<Column[]>(board.columns);
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filterAssignees, setFilterAssignees] = useState<string[]>([]);
  const [filterPriorities, setFilterPriorities] = useState<string[]>([]);
  const [filterLabels, setFilterLabels] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('manual');
  const [groupBy, setGroupBy] = useState<string>('status');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeTask = taskList.find((task) => task.id === activeId);
  const activeColumn = columns.find((col) => col.id === activeId);

  const getUserById = (userId: string | null): User | null => {
    if (!userId) return null;
    return users.find((u) => u.id === userId) || null;
  };

  const getFilteredTasks = () => {
    let filtered = [...taskList];

    if (filterAssignees.length > 0) {
      filtered = filtered.filter((task) =>
        task.assigneeId ? filterAssignees.includes(task.assigneeId) : false
      );
    }

    if (filterPriorities.length > 0) {
      filtered = filtered.filter((task) => filterPriorities.includes(task.priority));
    }

    if (filterLabels.length > 0) {
      filtered = filtered.filter((task) =>
        task.labels?.some((label) =>
          typeof label === 'string' ? filterLabels.includes(label) : filterLabels.includes(label.id)
        )
      );
    }

    return filtered;
  };

  const getSortedTasks = (tasks: Task[]) => {
    const sorted = [...tasks];

    if (sortBy === 'priority') {
      const priorityOrder = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
      sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortBy === 'dueDate') {
      sorted.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (sortBy === 'createdDate') {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return sorted;
  };

  const getTasksForColumn = (columnId: string) => {
    const filtered = getFilteredTasks();
    const columnTasks = filtered.filter((task) => task.columnId === columnId);
    return getSortedTasks(columnTasks);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = taskList.find((t) => t.id === activeId);
    const activeColumn = columns.find((c) => c.id === activeId);

    if (activeColumn) {
      const overColumn = columns.find((c) => c.id === overId);
      if (overColumn) {
        const oldIndex = columns.findIndex((c) => c.id === activeId);
        const newIndex = columns.findIndex((c) => c.id === overId);
        setColumns(arrayMove(columns, oldIndex, newIndex));
      }
      return;
    }

    if (!activeTask) return;

    const overTask = taskList.find((t) => t.id === overId);
    const overColumn = columns.find((c) => c.id === overId);

    if (overTask) {
      if (activeTask.columnId !== overTask.columnId) {
        setTaskList((tasks) =>
          tasks.map((task) =>
            task.id === activeId ? { ...task, columnId: overTask.columnId } : task
          )
        );
      }
    } else if (overColumn) {
      setTaskList((tasks) =>
        tasks.map((task) =>
          task.id === activeId ? { ...task, columnId: overColumn.id } : task
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = taskList.find((t) => t.id === activeId);
    const activeColumn = columns.find((c) => c.id === activeId);

    if (activeColumn) {
      const overColumn = columns.find((c) => c.id === overId);
      if (overColumn) {
        const oldIndex = columns.findIndex((c) => c.id === activeId);
        const newIndex = columns.findIndex((c) => c.id === overId);
        setColumns(arrayMove(columns, oldIndex, newIndex));
      }
      return;
    }

    if (!activeTask) return;

    const overTask = taskList.find((t) => t.id === overId);
    const overColumn = columns.find((c) => c.id === overId);

    if (overTask) {
      const oldIndex = taskList.findIndex((t) => t.id === activeId);
      const newIndex = taskList.findIndex((t) => t.id === overId);

      setTaskList((tasks) => {
        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        return newTasks.map((task) =>
          task.id === activeId ? { ...task, columnId: overTask.columnId } : task
        );
      });
    } else if (overColumn) {
      setTaskList((tasks) =>
        tasks.map((task) =>
          task.id === activeId ? { ...task, columnId: overColumn.id } : task
        )
      );
    }
  };

  const handleAddColumn = () => {
    const newColumn: Column = {
      id: `col-${Date.now()}`,
      name: 'New Column',
      color: 'bg-slate-500',
      position: columns.length,
      taskIds: [],
    };
    setColumns([...columns, newColumn]);
  };

  const handleColumnRename = (columnId: string, newName: string) => {
    setColumns(
      columns.map((col) => (col.id === columnId ? { ...col, name: newName } : col))
    );
  };

  const handleColumnColorChange = (columnId: string, newColor: string) => {
    setColumns(
      columns.map((col) => (col.id === columnId ? { ...col, color: newColor } : col))
    );
  };

  const handleColumnDelete = (columnId: string) => {
    setColumns(columns.filter((col) => col.id !== columnId));
    setTaskList(taskList.filter((task) => task.columnId !== columnId));
  };

  const handleSetWipLimit = (columnId: string, limit: number | undefined) => {
    setColumns(
      columns.map((col) => (col.id === columnId ? { ...col, wipLimit: limit } : col))
    );
  };

  const handleAddTask = (columnId: string, title: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description: '',
      status: 'todo',
      priority: 'Medium',
      assigneeId: null,
      dueDate: null,
      labels: [],
      subtasks: [],
      attachmentCount: 0,
      commentCount: 0,
      boardId: board.id,
      columnId,
      position: getTasksForColumn(columnId).length,
      createdAt: new Date().toISOString(),
    };
    setTaskList([...taskList, newTask]);
  };

  return (
    <div className="flex flex-col h-full">
      <BoardHeader
        projectName={board.name}
        onFilterAssigneesChange={setFilterAssignees}
        onFilterPrioritiesChange={setFilterPriorities}
        onFilterLabelsChange={setFilterLabels}
        onSortChange={setSortBy}
        onGroupChange={setGroupBy}
        users={users}
        filterAssignees={filterAssignees}
        filterPriorities={filterPriorities}
        filterLabels={filterLabels}
        sortBy={sortBy}
        groupBy={groupBy}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="flex-1">
          <div className="flex gap-4 p-6 h-full">
            <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
              {columns.map((column) => (
                <BoardColumn
                  key={column.id}
                  column={column}
                  tasks={getTasksForColumn(column.id)}
                  users={users}
                  onTaskClick={onTaskClick}
                  onRename={handleColumnRename}
                  onColorChange={handleColumnColorChange}
                  onDelete={handleColumnDelete}
                  onSetWipLimit={handleSetWipLimit}
                  onAddTask={handleAddTask}
                  getUserById={getUserById}
                />
              ))}
            </SortableContext>

            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                className="h-full min-w-[280px] border-2 border-dashed"
                onClick={handleAddColumn}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Column
              </Button>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-80 rotate-2 scale-105">
              <TaskCard
                task={activeTask}
                assignee={getUserById(activeTask.assigneeId)}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
