import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { UserAvatar } from './user-avatar';

interface ProjectCardProps {
  project: Project;
  members: User[];
}

export function ProjectCard({ project, members }: ProjectCardProps) {
  const projectMembers = members.filter((m) => project.memberIds.includes(m.id));

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('w-3 h-3 rounded-full', project.color)} />
                <CardTitle className="text-lg">{project.name}</CardTitle>
              </div>
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {projectMembers.slice(0, 3).map((member) => (
                <UserAvatar
                  key={member.id}
                  user={member}
                  size="md"
                  className="border-2 border-background"
                />
              ))}
              {projectMembers.length > 3 && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border-2 border-background text-xs">
                  +{projectMembers.length - 3}
                </div>
              )}
            </div>
            <Badge variant="secondary">{project.memberIds.length} members</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
