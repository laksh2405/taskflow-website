"use client";

import { Filter, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TaskFilters } from "@/hooks/use-task-filters";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/constants";
import { MOCK_USERS } from "@/lib/mock-data";
import { useState } from "react";

interface TaskFilterBarProps {
  filters: TaskFilters;
  onFilterChange: (key: keyof TaskFilters, value: any) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function TaskFilterBar({
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterCount,
}: TaskFilterBarProps) {
  const [search, setSearch] = useState(filters.search);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const timeoutId = setTimeout(() => {
      onFilterChange("search", value);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const toggleArrayFilter = (key: keyof TaskFilters, value: string) => {
    const current = filters[key] as string[];
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange(key, newValue);
  };

  const removeFilter = (key: keyof TaskFilters, value?: string) => {
    if (key === "search") {
      setSearch("");
      onFilterChange("search", "");
    } else if (value) {
      const current = filters[key] as string[];
      onFilterChange(key, current.filter((v) => v !== value));
    } else {
      onFilterChange(key, []);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Status</h4>
                <div className="space-y-2">
                  {TASK_STATUSES.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filters.status.includes(status)}
                        onCheckedChange={() => toggleArrayFilter("status", status)}
                      />
                      <Label
                        htmlFor={`status-${status}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Priority</h4>
                <div className="space-y-2">
                  {TASK_PRIORITIES.map((priority) => (
                    <div key={priority} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${priority}`}
                        checked={filters.priority.includes(priority)}
                        onCheckedChange={() => toggleArrayFilter("priority", priority)}
                      />
                      <Label
                        htmlFor={`priority-${priority}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {priority}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Assignee</h4>
                <div className="space-y-2">
                  {MOCK_USERS.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`assignee-${user.id}`}
                        checked={filters.assignee.includes(user.id)}
                        onCheckedChange={() => toggleArrayFilter("assignee", user.id)}
                      />
                      <Label
                        htmlFor={`assignee-${user.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {user.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <>
                  <Separator />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="w-full"
                  >
                    Clear all filters
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <button
                onClick={() => removeFilter("search")}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.status.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1">
              Status: {status}
              <button
                onClick={() => removeFilter("status", status)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.priority.map((priority) => (
            <Badge key={priority} variant="secondary" className="gap-1">
              Priority: {priority}
              <button
                onClick={() => removeFilter("priority", priority)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.assignee.map((userId) => {
            const user = MOCK_USERS.find((u) => u.id === userId);
            return (
              <Badge key={userId} variant="secondary" className="gap-1">
                Assignee: {user?.name}
                <button
                  onClick={() => removeFilter("assignee", userId)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
