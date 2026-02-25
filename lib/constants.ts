import { LayoutDashboard, FolderKanban, Settings, Users } from 'lucide-react';

export const NAVIGATION_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: FolderKanban,
  },
  {
    title: 'Team',
    href: '/settings/team',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low', color: 'bg-gray-500' },
  { value: 'Medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'High', label: 'High', color: 'bg-orange-500' },
  { value: 'Urgent', label: 'Urgent', color: 'bg-red-500' },
];

export const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog', color: 'bg-gray-500' },
  { value: 'todo', label: 'To Do', color: 'bg-blue-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
  { value: 'done', label: 'Done', color: 'bg-green-500' },
];

export const PROJECT_VIEWS = [
  { value: 'board', label: 'Board' },
  { value: 'list', label: 'List' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'timeline', label: 'Timeline' },
];

export const TASK_STATUSES = ['Backlog', 'To Do', 'In Progress', 'Done'];

export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
