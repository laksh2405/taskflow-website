"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  FolderKanban,
  CheckSquare,
  Settings,
  Plus,
  Search,
  Clock,
  LayoutDashboard,
  Calendar,
  List,
  Users,
} from "lucide-react";
import { MOCK_PROJECTS, MOCK_TASKS } from "@/lib/mock-data";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSelect = useCallback((callback: () => void) => {
    onOpenChange(false);
    callback();
  }, [onOpenChange]);

  const filteredProjects = MOCK_PROJECTS.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTasks = MOCK_TASKS.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a command or search..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {!search && (
          <>
            <CommandGroup heading="Quick Actions">
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/dashboard"))}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Create Task</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/dashboard"))}
              >
                <FolderKanban className="mr-2 h-4 w-4" />
                <span>Create Project</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Navigation">
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/dashboard"))}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/settings"))}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => router.push("/settings/team"))}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Team</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {search && filteredProjects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Projects">
              {filteredProjects.map((project) => (
                <CommandItem
                  key={project.id}
                  onSelect={() =>
                    handleSelect(() => router.push(`/projects/${project.id}/board`))
                  }
                >
                  <FolderKanban className="mr-2 h-4 w-4" />
                  <span>{project.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {search && filteredTasks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tasks">
              {filteredTasks.map((task) => (
                <CommandItem
                  key={task.id}
                  onSelect={() =>
                    handleSelect(() => router.push(`/projects/${task.boardId}/list`))
                  }
                >
                  <CheckSquare className="mr-2 h-4 w-4" />
                  <span>{task.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
