"use client";

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Column, Task, User } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SortableTaskCard } from './sortable-task-card';
import { MoreVertical, Plus, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  users: User[];
  onTaskClick?: (task: Task) => void;
  onRename: (columnId: string, newName: string) => void;
  onColorChange: (columnId: string, newColor: string) => void;
  onDelete: (columnId: string) => void;
  onSetWipLimit: (columnId: string, limit: number | undefined) => void;
  onAddTask: (columnId: string, title: string) => void;
  getUserById: (userId: string | null) => User | null;
}

const COLORS = [
  { name: 'Gray', value: 'bg-gray-500' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Orange', value: 'bg-orange-500' },
];

export function BoardColumn({
  column,
  tasks,
  users,
  onTaskClick,
  onRename,
  onColorChange,
  onDelete,
  onSetWipLimit,
  onAddTask,
  getUserById,
}: BoardColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(column.name);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showWipDialog, setShowWipDialog] = useState(false);
  const [wipLimit, setWipLimit] = useState(column.wipLimit?.toString() || '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: 'column' } });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: column.id,
    data: { type: 'column' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleNameSave = () => {
    if (editedName.trim()) {
      onRename(column.id, editedName);
    }
    setIsEditing(false);
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(column.id, newTaskTitle);
      setNewTaskTitle('');
    }
  };

  const handleSetWipLimit = () => {
    const limit = wipLimit.trim() ? parseInt(wipLimit) : undefined;
    onSetWipLimit(column.id, limit);
    setShowWipDialog(false);
  };

  const isOverWipLimit = column.wipLimit && tasks.length > column.wipLimit;

  return (
    <>
      <div
        ref={setSortableRef}
        style={style}
        className={cn(
          'flex-shrink-0 w-[280px] md:w-[320px]',
          isDragging && 'opacity-50'
        )}
      >
        <Card className="flex flex-col h-[calc(100vh-240px)] bg-muted/30">
          <div className="p-3 border-b bg-background">
            <div className="flex items-center gap-2 mb-2">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing hover:bg-muted rounded p-1"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>

              <div className={cn('w-2 h-2 rounded-full flex-shrink-0', column.color)} />

              {isEditing ? (
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNameSave();
                    if (e.key === 'Escape') {
                      setEditedName(column.name);
                      setIsEditing(false);
                    }
                  }}
                  className="h-7 px-2 flex-1"
                  autoFocus
                />
              ) : (
                <h3
                  className="font-semibold text-sm flex-1 cursor-pointer truncate"
                  onDoubleClick={() => setIsEditing(true)}
                >
                  {column.name}
                </h3>
              )}

              <Badge variant="secondary" className="text-xs">
                {tasks.length}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Column Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>
                    <div className="flex items-center gap-2">
                      Change color
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {COLORS.map((color) => (
                    <DropdownMenuItem
                      key={color.value}
                      onClick={() => onColorChange(column.id, color.value)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn('w-3 h-3 rounded-full', color.value)} />
                        <span>{color.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowWipDialog(true)}>
                    Set WIP limit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    Delete column
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {column.wipLimit && (
              <p
                className={cn(
                  'text-xs',
                  isOverWipLimit ? 'text-destructive font-medium' : 'text-muted-foreground'
                )}
              >
                WIP Limit: {tasks.length}/{column.wipLimit}
                {isOverWipLimit && ' (Exceeded!)'}
              </p>
            )}
          </div>

          <ScrollArea className="flex-1" ref={setDroppableRef}>
            <div className="p-3 space-y-3">
              {tasks.length === 0 && !showAddCard ? (
                <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg border-muted-foreground/25">
                  <p className="text-sm text-muted-foreground">
                    Drag tasks here or click + to add
                  </p>
                </div>
              ) : (
                <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  {tasks.map((task) => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      assignee={getUserById(task.assigneeId)}
                      onClick={() => onTaskClick?.(task)}
                    />
                  ))}
                </SortableContext>
              )}

              {showAddCard && (
                <Card className="p-3 space-y-2 border-2 border-primary">
                  <Input
                    placeholder="Task title..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTask();
                      if (e.key === 'Escape') {
                        setShowAddCard(false);
                        setNewTaskTitle('');
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddTask}>
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowAddCard(false);
                        setNewTaskTitle('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </ScrollArea>

          <div className="p-3 border-t bg-background">
            <Button
              variant="ghost"
              className="w-full justify-start h-8"
              size="sm"
              onClick={() => setShowAddCard(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add a card
            </Button>
          </div>
        </Card>
      </div>

      <Dialog open={showWipDialog} onOpenChange={setShowWipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set WIP Limit</DialogTitle>
            <DialogDescription>
              Set a work-in-progress limit for this column to help manage workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>WIP Limit</Label>
            <Input
              type="number"
              placeholder="Leave empty for no limit"
              value={wipLimit}
              onChange={(e) => setWipLimit(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWipDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetWipLimit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Column</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this column? All tasks in this column will be
              removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(column.id);
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
