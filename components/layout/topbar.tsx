"use client";

import { Bell, Search, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Badge } from '@/components/ui/badge';
import { MOCK_USERS, MOCK_PROJECTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';

interface TopbarProps {
  onMobileMenuToggle?: () => void;
  onCommandToggle?: () => void;
}

export function Topbar({ onMobileMenuToggle, onCommandToggle }: TopbarProps) {
  const pathname = usePathname();
  const { isDemoMode, signOut, profile } = useAuth();

  const currentUser = profile ? {
    id: profile.id,
    name: profile.name || 'User',
    email: profile.email || '',
    avatar: profile.avatar_url,
    full_name: profile.name || 'User',
    avatar_url: profile.avatar_url,
  } : null;

  const projectMatch = pathname.match(/^\/projects\/([^\/]+)/);
  const projectId = projectMatch ? projectMatch[1] : null;
  const project = projectId ? MOCK_PROJECTS.find((p) => p.id === projectId) : null;

  const getBreadcrumbs = () => {
    if (pathname === '/dashboard') {
      return [{ label: 'Dashboard', href: '/dashboard' }];
    }

    if (pathname === '/my-tasks') {
      return [{ label: 'My Tasks', href: '/my-tasks' }];
    }

    if (pathname === '/inbox') {
      return [{ label: 'Inbox', href: '/inbox' }];
    }

    if (pathname.startsWith('/settings')) {
      const crumbs = [{ label: 'Settings', href: '/settings' }];
      if (pathname === '/settings/team') {
        crumbs.push({ label: 'Team', href: '/settings/team' });
      } else if (pathname === '/settings/profile') {
        crumbs.push({ label: 'Profile', href: '/settings/profile' });
      }
      return crumbs;
    }

    if (project) {
      const crumbs = [{ label: project.name, href: `/projects/${project.id}` }];

      if (pathname.includes('/board')) {
        crumbs.push({ label: 'Board', href: `/projects/${project.id}/board` });
      } else if (pathname.includes('/list')) {
        crumbs.push({ label: 'List', href: `/projects/${project.id}/list` });
      } else if (pathname.includes('/calendar')) {
        crumbs.push({ label: 'Calendar', href: `/projects/${project.id}/calendar` });
      } else if (pathname.includes('/timeline')) {
        crumbs.push({ label: 'Timeline', href: `/projects/${project.id}/timeline` });
      }

      return crumbs;
    }

    return [{ label: 'Home', href: '/' }];
  };

  const breadcrumbs = getBreadcrumbs();

  const VIEW_TABS = [
    { label: 'Board', path: 'board' },
    { label: 'List', path: 'list' },
    { label: 'Calendar', path: 'calendar' },
    { label: 'Timeline', path: 'timeline' },
  ];

  const showViewTabs = project && pathname.includes('/projects/');

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMobileMenuToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1">
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              <Link
                href={crumb.href}
                className={cn(
                  'hover:text-foreground transition-colors',
                  index === breadcrumbs.length - 1 && 'text-foreground font-medium'
                )}
              >
                {crumb.label}
              </Link>
            </div>
          ))}
        </nav>

        {showViewTabs && (
          <div className="flex items-center gap-1 mt-2">
            {VIEW_TABS.map((tab) => {
              const tabPath = `/projects/${project.id}/${tab.path}`;
              const isActive = pathname === tabPath;

              return (
                <Link key={tab.path} href={tabPath}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-8 text-xs',
                      isActive && 'bg-muted font-medium'
                    )}
                  >
                    {tab.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isDemoMode && (
          <Badge variant="secondary" className="mr-2">
            Demo Mode
          </Badge>
        )}

        <Button
          variant="ghost"
          className="hidden md:flex gap-2 px-3"
          onClick={onCommandToggle}
        >
          <Search className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">Search</span>
          <kbd className="pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-danger text-danger-foreground text-[10px]">
            3
          </Badge>
        </Button>

        <ThemeToggle />

        {currentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <UserAvatar user={currentUser as any} size="md" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/settings/profile">
                <DropdownMenuItem>Profile</DropdownMenuItem>
              </Link>
              <Link href="/settings">
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </Link>
              <Link href="/settings/team">
                <DropdownMenuItem>Team</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                {isDemoMode ? 'Exit Demo' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
