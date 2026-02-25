"use client";

import { useState, useMemo } from "react";
import { Task, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, TouchSensor } from "@dnd-kit/core";

interface CalendarViewGridProps {
  tasks: Task[];
  users: User[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const priorityColors = {
  Low: "border-l-blue-500",
  Medium: "border-l-yellow-500",
  High: "border-l-orange-500",
  Urgent: "border-l-red-500",
};

export function CalendarViewGrid({
  tasks,
  users,
  onTaskClick,
  onTaskUpdate,
}: CalendarViewGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const tasksWithDueDate = useMemo(() => {
    return tasks.filter((task) => task.dueDate);
  }, [tasks]);

  const getTasksForDay = (day: Date) => {
    return tasksWithDueDate.filter((task) => {
      const taskDate = new Date(task.dueDate!);
      return isSameDay(taskDate, day);
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newDate = over.id as string;

    onTaskUpdate(taskId, { dueDate: newDate });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="grid grid-cols-7 border rounded-lg overflow-hidden">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="bg-muted/50 p-2 text-center text-sm font-medium border-r last:border-r-0"
              >
                {day}
              </div>
            ))}

            {calendarDays.map((day, idx) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);
              const visibleTasks = dayTasks.slice(0, 3);
              const remainingCount = dayTasks.length - 3;

              return (
                <div
                  key={day.toISOString()}
                  data-day={day.toISOString()}
                  className={cn(
                    "min-h-[120px] p-2 border-r border-b last:border-r-0",
                    !isCurrentMonth && "bg-muted/20",
                    isTodayDate && "bg-blue-50 dark:bg-blue-950/20",
                    idx % 7 === 6 && "border-r-0"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        !isCurrentMonth && "text-muted-foreground",
                        isTodayDate && "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {visibleTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={cn(
                          "p-1.5 rounded text-xs cursor-pointer hover:opacity-80 bg-card border-l-2 shadow-sm",
                          priorityColors[task.priority as keyof typeof priorityColors]
                        )}
                      >
                        <div className="flex items-start gap-1">
                          <span className="flex-1 line-clamp-2 font-medium">
                            {task.title}
                          </span>
                          {task.assignees && task.assignees.length > 0 && (
                            <UserAvatar user={task.assignees[0]} size="sm" />
                          )}
                        </div>
                      </div>
                    ))}

                    {remainingCount > 0 && (
                      <button className="text-xs text-muted-foreground hover:text-foreground w-full text-left pl-1.5">
                        +{remainingCount} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="md:hidden space-y-4">
          <div className="text-sm text-muted-foreground mb-2">
            Agenda View
          </div>
          {calendarDays.map((day) => {
            const dayTasks = getTasksForDay(day);
            if (dayTasks.length === 0) return null;

            const isTodayDate = isToday(day);

            return (
              <div key={day.toISOString()} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg p-2 min-w-[60px]",
                      isTodayDate ? "bg-blue-600 text-white" : "bg-muted"
                    )}
                  >
                    <span className="text-xs font-medium uppercase">
                      {format(day, "EEE")}
                    </span>
                    <span className="text-2xl font-bold">{format(day, "d")}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={cn(
                          "p-3 rounded-lg bg-card border-l-4 shadow-sm cursor-pointer",
                          priorityColors[task.priority as keyof typeof priorityColors]
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-medium">{task.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {task.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {task.priority}
                              </Badge>
                            </div>
                          </div>
                          {task.assignees && task.assignees.length > 0 && (
                            <UserAvatar user={task.assignees[0]} size="sm" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {tasksWithDueDate.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No tasks with due dates this month
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
}
