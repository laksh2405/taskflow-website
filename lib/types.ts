export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assigneeId: string | null;
  assignees?: User[];
  dueDate: string | null;
  labels?: string[] | Label[];
  subtasks: Subtask[];
  attachmentCount: number;
  commentCount: number;
  boardId: string;
  columnId: string;
  position: number;
  createdAt: string;
}

export interface Column {
  id: string;
  name: string;
  color: string;
  position: number;
  taskIds: string[];
  wipLimit?: number;
}

export interface Board {
  id: string;
  projectId: string;
  name: string;
  columns: Column[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
}
