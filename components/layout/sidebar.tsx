"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { UserAvatar } from '@/components/shared/user-avatar';
import { MOCK_PROJECTS } from '@/lib/mock-data';
import { useAuth } from '@/components/providers/auth-provider';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
  LayoutDashboard,
  CheckSquare,
  Bell,
  Settings,
  Search,
  ChevronDown,
  Circle,
  Kanban,
  List,
  Calendar,
  GanttChart,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const PROJECT_VIEWS = [
  { name: 'Board', icon: Kanban, path: 'board' },
  { name: 'List', icon: List, path: 'list' },
  { name: 'Calendar', icon: Calendar, path: 'calendar' },
  { name: 'Timeline', icon: GanttChart, path: 'timeline' },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const isProjectExpanded = (projectId: string) => {
    return expandedProjects.includes(projectId);
  };

  return (
    <div
      className={cn(
        'relative flex flex-col border-r bg-background transition-all duration-200',
        isCollapsed ? 'w-[60px]' : 'w-[260px]'
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <Layers className="h-6 w-6" />
            <span>TaskFlow</span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/dashboard" className="flex items-center justify-center w-full">
            <Layers className="h-6 w-6" />
          </Link>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-4">
          {!isCollapsed && (
            <Button className="w-full justify-start gap-2">
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </Button>
          )}

          {isCollapsed && (
            <Button size="icon" className="w-full">
              <Plus className="h-4 w-4" />
            </Button>
          )}

          {!isCollapsed && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 h-9 text-sm"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          )}

          <Separator />

          <nav className="space-y-1">
            <Link href="/dashboard">
              <Button
                variant={pathname === '/dashboard' ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <LayoutDashboard className="h-5 w-5" />
                {!isCollapsed && <span>Dashboard</span>}
              </Button>
            </Link>

            <Link href="/my-tasks">
              <Button
                variant={pathname === '/my-tasks' ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <CheckSquare className="h-5 w-5" />
                {!isCollapsed && <span>My Tasks</span>}
              </Button>
            </Link>

            <Link href="/inbox">
              <Button
                variant={pathname === '/inbox' ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2 relative',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <Bell className="h-5 w-5" />
                {!isCollapsed && <span>Inbox</span>}
                {!isCollapsed && (
                  <Badge className="ml-auto h-5 w-5 p-0 flex items-center justify-center bg-danger text-danger-foreground">
                    3
                  </Badge>
                )}
                {isCollapsed && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-danger flex items-center justify-center text-[10px] text-danger-foreground">
                    3
                  </span>
                )}
              </Button>
            </Link>
          </nav>

          {!isCollapsed && (
            <>
              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Projects
                  </h3>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1">
                  {MOCK_PROJECTS.map((project) => {
                    const isExpanded = isProjectExpanded(project.id);
                    const isProjectActive = pathname.startsWith(`/projects/${project.id}`);

                    return (
                      <Collapsible
                        key={project.id}
                        open={isExpanded}
                        onOpenChange={() => toggleProject(project.id)}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0"
                              >
                                <ChevronDown
                                  className={cn(
                                    'h-4 w-4 transition-transform',
                                    !isExpanded && '-rotate-90'
                                  )}
                                />
                              </Button>
                            </CollapsibleTrigger>
                            <Link
                              href={`/projects/${project.id}`}
                              className="flex-1"
                            >
                              <Button
                                variant={isProjectActive ? 'secondary' : 'ghost'}
                                className="w-full justify-start gap-2 px-2"
                              >
                                <Circle
                                  className={cn('h-3 w-3', project.color)}
                                  fill="currentColor"
                                />
                                <span className="truncate text-sm">{project.name}</span>
                              </Button>
                            </Link>
                          </div>

                          <CollapsibleContent className="ml-6 space-y-1">
                            {PROJECT_VIEWS.map((view) => {
                              const viewPath = `/projects/${project.id}/${view.path}`;
                              const isActive = pathname === viewPath;
                              const Icon = view.icon;

                              return (
                                <Link key={view.path} href={viewPath}>
                                  <Button
                                    variant={isActive ? 'secondary' : 'ghost'}
                                    className="w-full justify-start gap-2 h-8 text-sm"
                                    size="sm"
                                  >
                                    <Icon className="h-4 w-4" />
                                    <span>{view.name}</span>
                                  </Button>
                                </Link>
                              );
                            })}
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      <div className="border-t">
        {!isCollapsed && (
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(pathname === '/settings' && 'bg-secondary')}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            <Separator />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-auto py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserAvatar
                        user={{
                          id: profile?.id || '',
                          name: profile?.name || 'User',
                          email: profile?.email || user?.email || '',
                          avatarUrl: profile?.avatar_url || '',
                          role: 'member',
                        }}
                        size="sm"
                      />
                      <div className="flex flex-col items-start text-left flex-1 min-w-0">
                        <span className="text-sm font-medium truncate w-full">
                          {profile?.name || 'User'}
                        </span>
                        <span className="text-xs text-muted-foreground truncate w-full">
                          {profile?.email || user?.email}
                        </span>
                      </div>
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {isCollapsed && (
          <div className="p-3 space-y-2 flex flex-col items-center">
            <ThemeToggle />
            <Link href="/settings">
              <Button
                variant="ghost"
                size="icon"
                className={cn(pathname === '/settings' && 'bg-secondary')}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserAvatar
                      user={{
                        id: profile?.id || '',
                        name: profile?.name || 'User',
                        email: profile?.email || user?.email || '',
                        avatarUrl: profile?.avatar_url || '',
                        role: 'member',
                      }}
                      size="sm"
                    />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <div className="p-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn('w-full', isCollapsed && 'px-2')}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
