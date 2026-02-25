"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnResizeMode,
  VisibilityState,
} from "@tanstack/react-table";
import { Task, User } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, MoreHorizontal, Calendar as CalendarIcon, Columns, Trash2, Edit, Copy, Users } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ListViewTableProps {
  tasks: Task[];
  users: User[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
}

export function ListViewTable({
  tasks,
  users,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
}: ListViewTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnResizeMode] = useState<ColumnResizeMode>("onChange");

  const columns: ColumnDef<Task>[] = useMemo(
    () => [
      {
        id: "select",
        size: 40,
        enableResizing: false,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        accessorKey: "title",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4"
            >
              Task Title
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div
            className="font-medium cursor-pointer hover:text-primary"
            onClick={() => onTaskClick(row.original)}
          >
            {row.getValue("title")}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4"
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const task = row.original;
          return (
            <Select
              value={task.status}
              onValueChange={(value) => onTaskUpdate(task.id, { status: value })}
            >
              <SelectTrigger
                className="w-[140px] border-0 hover:bg-muted"
                onClick={(e) => e.stopPropagation()}
              >
                <StatusBadge status={task.status as any} />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    <StatusBadge status={status as any} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: "priority",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4"
            >
              Priority
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const task = row.original;
          return (
            <Select
              value={task.priority}
              onValueChange={(value) => onTaskUpdate(task.id, { priority: value as any })}
            >
              <SelectTrigger
                className="w-[120px] border-0 hover:bg-muted"
                onClick={(e) => e.stopPropagation()}
              >
                <PriorityBadge priority={task.priority} />
              </SelectTrigger>
              <SelectContent>
                {TASK_PRIORITIES.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    <PriorityBadge priority={priority as any} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: "assignees",
        header: "Assignee",
        cell: ({ row }) => {
          const task = row.original;
          const assignees = task.assignees || [];
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 px-2 hover:bg-muted"
                  onClick={(e) => e.stopPropagation()}
                >
                  {assignees.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <UserAvatar user={assignees[0]} size="sm" />
                      <span className="text-sm">{assignees[0].name}</span>
                      {assignees.length > 1 && (
                        <Badge variant="secondary" className="h-5 px-1 text-xs">
                          +{assignees.length - 1}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Unassigned</span>
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Assign to</h4>
                  {users.map((user) => {
                    const isAssigned = assignees.some((a) => a.id === user.id);
                    return (
                      <div
                        key={user.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted",
                          isAssigned && "bg-muted"
                        )}
                        onClick={() => {
                          const newAssignees = isAssigned
                            ? assignees.filter((a) => a.id !== user.id)
                            : [...assignees, user];
                          onTaskUpdate(task.id, { assignees: newAssignees });
                        }}
                      >
                        <Checkbox checked={isAssigned} />
                        <UserAvatar user={user} size="sm" />
                        <span className="text-sm">{user.name}</span>
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          );
        },
      },
      {
        accessorKey: "dueDate",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4"
            >
              Due Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const task = row.original;
          const dueDate = task.dueDate ? new Date(task.dueDate) : null;
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 px-2 hover:bg-muted justify-start"
                  onClick={(e) => e.stopPropagation()}
                >
                  {dueDate ? (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="text-sm">
                        {formatDistanceToNow(dueDate, { addSuffix: true })}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="text-sm">No date</span>
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate || undefined}
                  onSelect={(date) => {
                    onTaskUpdate(task.id, { dueDate: date?.toISOString() || null });
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          );
        },
      },
      {
        accessorKey: "labels",
        header: () => <div className="hidden lg:block">Labels</div>,
        cell: ({ row }) => {
          const labels = row.original.labels || [];
          return (
            <div className="hidden lg:flex gap-1 flex-wrap">
              {labels.map((label: any) => (
                <Badge key={typeof label === 'string' ? label : label.id} variant="outline" className="text-xs">
                  {typeof label === 'string' ? label : label.name}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4 hidden xl:flex"
            >
              Created
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return (
            <span className="hidden xl:inline text-sm text-muted-foreground">
              {formatDistanceToNow(date, { addSuffix: true })}
            </span>
          );
        },
      },
      {
        id: "actions",
        size: 50,
        enableResizing: false,
        cell: ({ row }) => {
          const task = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onTaskClick(task)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onTaskDelete(task.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [users, onTaskClick, onTaskUpdate, onTaskDelete]
  );

  const table = useReactTable({
    data: tasks,
    columns,
    columnResizeMode,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Columns className="h-4 w-4 mr-2" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground relative"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-primary",
                            header.column.getIsResizing() && "bg-primary"
                          )}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 align-middle" style={{ width: cell.column.getSize() }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRows.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-primary text-primary-foreground rounded-lg shadow-lg px-6 py-4 flex items-center gap-4">
            <span className="font-medium">{selectedRows.length} tasks selected</span>
            <div className="flex gap-2">
              <Select onValueChange={(value) => {
                selectedRows.forEach((row) => onTaskUpdate(row.original.id, { status: value }));
                table.resetRowSelection();
              }}>
                <SelectTrigger className="h-8 w-[140px] bg-primary-foreground text-primary">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => {
                selectedRows.forEach((row) => onTaskUpdate(row.original.id, { priority: value as any }));
                table.resetRowSelection();
              }}>
                <SelectTrigger className="h-8 w-[140px] bg-primary-foreground text-primary">
                  <SelectValue placeholder="Change priority" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  selectedRows.forEach((row) => onTaskDelete(row.original.id));
                  table.resetRowSelection();
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => table.resetRowSelection()}
              >
                Deselect All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
