"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User } from '@/lib/types';
import { Filter, ArrowUpDown, Layers } from 'lucide-react';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Badge } from '@/components/ui/badge';

interface BoardHeaderProps {
  projectName: string;
  onFilterAssigneesChange: (assignees: string[]) => void;
  onFilterPrioritiesChange: (priorities: string[]) => void;
  onFilterLabelsChange: (labels: string[]) => void;
  onSortChange: (sort: string) => void;
  onGroupChange: (group: string) => void;
  users: User[];
  filterAssignees: string[];
  filterPriorities: string[];
  filterLabels: string[];
  sortBy: string;
  groupBy: string;
}

export function BoardHeader({
  projectName,
  onFilterAssigneesChange,
  onFilterPrioritiesChange,
  onFilterLabelsChange,
  onSortChange,
  onGroupChange,
  users,
  filterAssignees,
  filterPriorities,
  filterLabels,
  sortBy,
  groupBy,
}: BoardHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(projectName);

  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const sortOptions = [
    { value: 'manual', label: 'Manual' },
    { value: 'priority', label: 'Priority' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'createdDate', label: 'Created Date' },
  ];
  const groupOptions = [
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'assignee', label: 'Assignee' },
    { value: 'label', label: 'Label' },
  ];

  const handleNameSave = () => {
    setIsEditing(false);
  };

  const toggleAssignee = (userId: string) => {
    if (filterAssignees.includes(userId)) {
      onFilterAssigneesChange(filterAssignees.filter((id) => id !== userId));
    } else {
      onFilterAssigneesChange([...filterAssignees, userId]);
    }
  };

  const togglePriority = (priority: string) => {
    if (filterPriorities.includes(priority)) {
      onFilterPrioritiesChange(filterPriorities.filter((p) => p !== priority));
    } else {
      onFilterPrioritiesChange([...filterPriorities, priority]);
    }
  };

  const clearFilters = () => {
    onFilterAssigneesChange([]);
    onFilterPrioritiesChange([]);
    onFilterLabelsChange([]);
  };

  const activeFilterCount =
    filterAssignees.length + filterPriorities.length + filterLabels.length;

  return (
    <div className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          {isEditing ? (
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSave();
                if (e.key === 'Escape') {
                  setEditedName(projectName);
                  setIsEditing(false);
                }
              }}
              className="text-2xl font-bold h-auto py-1 px-2"
              autoFocus
            />
          ) : (
            <h1
              className="text-2xl font-bold cursor-pointer hover:text-muted-foreground transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {editedName}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Filters</h4>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-auto p-0 text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Assignee</Label>
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => toggleAssignee(user.id)}
                      >
                        <input
                          type="checkbox"
                          checked={filterAssignees.includes(user.id)}
                          onChange={() => toggleAssignee(user.id)}
                          className="rounded"
                        />
                        <UserAvatar user={user} size="sm" />
                        <span className="text-sm">{user.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Priority</Label>
                  <div className="space-y-2">
                    {priorities.map((priority) => (
                      <div
                        key={priority}
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => togglePriority(priority)}
                      >
                        <input
                          type="checkbox"
                          checked={filterPriorities.includes(priority)}
                          onChange={() => togglePriority(priority)}
                          className="rounded"
                        />
                        <span className="text-sm">{priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort: {sortOptions.find((o) => o.value === sortBy)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={sortBy === option.value}
                  onCheckedChange={() => onSortChange(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Layers className="h-4 w-4 mr-2" />
                Group: {groupOptions.find((o) => o.value === groupBy)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Group by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {groupOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={groupBy === option.value}
                  onCheckedChange={() => onGroupChange(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
