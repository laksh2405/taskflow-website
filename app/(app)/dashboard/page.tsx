"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { UserAvatar } from '@/components/shared/user-avatar';
import { CreateProjectModal } from '@/components/modals/create-project-modal';
import { CreateTaskModal } from '@/components/modals/create-task-modal';
import { TaskDetailModal } from '@/components/modals/task-detail-modal';
import { Task } from '@/lib/types';
import { useAuth } from '@/components/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import {
  Plus,
  BarChart3,
  Clock,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow, isAfter } from 'date-fns';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EditProjectModal } from '@/components/modals/edit-project-modal';

export default function DashboardPage() {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [greeting, setGreeting] = useState('Good day');
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const { profile, user, loading } = useAuth();

  const firstName = profile?.name?.split(' ')[0] || 'there';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const loadDashboardData = async () => {
    if (!user) return;

    const supabase = createClient() as any;
    setDataLoading(true);

    try {
      const { data: projectsData } = await supabase
        .from('projects')
        .select(`
          *,
          workspace:workspaces(*)
        `)
        .order('created_at', { ascending: false });

      const { data: tasksData } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey(id, name, avatar_url),
          board:boards(id, name, project:projects(id, name))
        `)
        .eq('assignee_id', user.id)
        .order('created_at', { ascending: false });

      const { data: activityData } = await supabase
        .from('activity_log')
        .select(`
          *,
          user:profiles!activity_log_actor_id_fkey(id, name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(8);

      setProjects(projectsData || []);
      setTasks(tasksData || []);
      setRecentActivity(activityData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedThisWeek = tasks.filter((t) => t.status === 'done').length;
  const overdueTasks = tasks.filter((t) => {
    if (!t.due_date) return false;
    return isAfter(new Date(), new Date(t.due_date)) && t.status !== 'done';
  });

  const todoTasks = tasks.filter((t) => t.status === 'todo' || t.status === 'backlog');
  const myInProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const myOverdueTasks = tasks.filter((t) => {
    if (!t.due_date) return false;
    return isAfter(new Date(), new Date(t.due_date)) && t.status !== 'done';
  });

  const formatDueDate = (dueDate: string | null | undefined) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const isOverdue = isAfter(now, date);
    const distance = formatDistanceToNow(date, { addSuffix: true });

    if (isOverdue) {
      return { text: `Overdue ${distance.replace('ago', '')}`, className: 'text-red-600 dark:text-red-500' };
    }

    return { text: `Due ${distance}`, className: 'text-muted-foreground' };
  };

  const projectStats = projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.board?.project?.id === project.id);
    const completed = projectTasks.filter((t) => t.status === 'done').length;
    return {
      ...project,
      taskCount: projectTasks.length,
      completedCount: completed,
      progress: projectTasks.length > 0 ? (completed / projectTasks.length) * 100 : 0,
    };
  });

  if (loading || dataLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {`${greeting}, ${firstName}`}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening across your projects
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCreateProjectOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
          <Button onClick={() => setCreateTaskOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-background to-muted/20 border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-3xl font-bold mt-2">{totalTasks}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-muted/20 border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold mt-2">{inProgressTasks.length}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-muted/20 border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed This Week</p>
                <p className="text-3xl font-bold mt-2">{completedThisWeek}</p>
                <div className="flex items-center gap-1 mt-1 text-green-600 dark:text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-medium">+12%</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {overdueTasks.length > 0 && (
          <Card className="bg-gradient-to-br from-background to-muted/20 border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-3xl font-bold mt-2">{overdueTasks.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">My Tasks</h2>
          <Link href="/projects" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <Tabs defaultValue="todo" className="w-full">
          <TabsList>
            <TabsTrigger value="todo">To Do ({todoTasks.length})</TabsTrigger>
            <TabsTrigger value="progress">In Progress ({myInProgressTasks.length})</TabsTrigger>
            {myOverdueTasks.length > 0 && (
              <TabsTrigger value="overdue" className="text-red-600 dark:text-red-500">
                Overdue ({myOverdueTasks.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="todo" className="space-y-3 mt-4">
            {todoTasks.slice(0, 5).map((task) => {
              const dueDate = formatDueDate(task.due_date);
              const projectName = task.board?.project?.name || 'Unknown Project';
              return (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedTask(task)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <PriorityBadge priority={task.priority} showDot />
                          <h3 className="font-medium truncate">{task.title}</h3>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">{projectName}</span>
                          {dueDate && (
                            <span className={dueDate.className}>{dueDate.text}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {todoTasks.length > 5 && (
              <Button variant="ghost" className="w-full">
                Show more ({todoTasks.length - 5} remaining)
              </Button>
            )}
            {todoTasks.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No tasks to do</p>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-3 mt-4">
            {myInProgressTasks.slice(0, 5).map((task) => {
              const dueDate = formatDueDate(task.due_date);
              const projectName = task.board?.project?.name || 'Unknown Project';
              return (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedTask(task)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <PriorityBadge priority={task.priority} showDot />
                          <h3 className="font-medium truncate">{task.title}</h3>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">{projectName}</span>
                          {dueDate && (
                            <span className={dueDate.className}>{dueDate.text}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {myInProgressTasks.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No tasks in progress</p>
            )}
          </TabsContent>

          {myOverdueTasks.length > 0 && (
            <TabsContent value="overdue" className="space-y-3 mt-4">
              {myOverdueTasks.slice(0, 5).map((task) => {
                const dueDate = formatDueDate(task.due_date);
                const projectName = task.board?.project?.name || 'Unknown Project';
                return (
                  <Card
                    key={task.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors border-red-200 dark:border-red-900"
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <PriorityBadge priority={task.priority} showDot />
                            <h3 className="font-medium truncate">{task.title}</h3>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-muted-foreground">{projectName}</span>
                            {dueDate && (
                              <span className={dueDate.className}>{dueDate.text}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          )}
        </Tabs>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          <Button variant="ghost" size="sm" onClick={() => setCreateProjectOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {projectStats.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-muted-foreground mb-4">No projects yet</p>
              <Button onClick={() => setCreateProjectOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          ) : (
            projectStats.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-primary"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Link href={`/projects/${project.id}/board`} className="flex-1">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{project.description || 'No description'}</p>
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedProject(project);
                        setEditProjectOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{Math.round(project.progress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{project.taskCount} tasks</span>
                          <span>{project.completedCount} done</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            ))
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Link href="/activity" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all activity
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <Card>
          <CardContent className="p-6">
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const activityUser = activity.user || { name: 'Unknown User', avatar_url: null };
                  const timeAgo = activity.created_at ? formatDistanceToNow(new Date(activity.created_at), { addSuffix: true }) : 'recently';

                  return (
                    <div key={activity.id} className="flex gap-4">
                      <div className="relative">
                        <UserAvatar user={activityUser as any} size="sm" />
                        {index !== recentActivity.length - 1 && (
                          <div className="absolute left-1/2 top-8 bottom-0 w-px bg-border -translate-x-1/2 h-8" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm">
                          <span className="font-medium">{activityUser.name}</span>
                          {' '}{activity.action}{' '}
                          {activity.entity_type && (
                            <span className="font-medium text-primary">{activity.entity_type}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateProjectModal
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        onProjectCreated={loadDashboardData}
      />

      <CreateTaskModal
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        onTaskCreated={loadDashboardData}
      />

      <TaskDetailModal
        task={selectedTask}
        assignee={(selectedTask as any)?.assignee || null}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />

      <EditProjectModal
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        project={selectedProject}
        onProjectUpdated={loadDashboardData}
        onProjectDeleted={loadDashboardData}
      />
    </div>
  );
}
