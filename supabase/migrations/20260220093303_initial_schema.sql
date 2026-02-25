/*
  # TaskFlow - Initial Database Schema

  ## Overview
  Complete database schema for TaskFlow project management application with workspaces,
  projects, boards, tasks, and comprehensive activity tracking.

  ## Extensions
  - uuid-ossp: For UUID generation
  - moddatetime: For automatic updated_at timestamp management

  ## Tables Created
  1. profiles - User profiles extending auth.users
  2. workspaces - Team workspaces
  3. workspace_members - Workspace membership join table
  4. projects - Projects within workspaces
  5. boards - Kanban boards for projects
  6. columns - Board columns (todo, in progress, done, etc.)
  7. tasks - Individual tasks/cards
  8. labels - Task labels/tags
  9. task_labels - Task-label join table
  10. subtasks - Checklist items within tasks
  11. comments - Task comments
  12. attachments - File attachments for tasks
  13. activity_log - Audit trail for all actions

  ## Security
  - RLS enabled on all tables
  - Workspace-based access control
  - Role-based permissions (owner, admin, member, guest)
  - Auto-insert trigger for new user profiles

  ## Notes
  - All timestamps use timestamptz (timestamp with timezone)
  - Cascading deletes configured for data integrity
  - Comprehensive indexing for performance
  - Auto-updating updated_at fields via triggers
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- =====================================================
-- TABLES
-- =====================================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. WORKSPACES
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. WORKSPACE_MEMBERS
CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'guest')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- 4. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. BOARDS
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Main Board',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. COLUMNS
CREATE TABLE IF NOT EXISTS columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  position INTEGER NOT NULL DEFAULT 0,
  wip_limit INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  column_id UUID REFERENCES columns(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('backlog', 'todo', 'in_progress', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date DATE,
  position INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. LABELS
CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280'
);

-- 9. TASK_LABELS (join table)
CREATE TABLE IF NOT EXISTS task_labels (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);

-- 10. SUBTASKS
CREATE TABLE IF NOT EXISTS subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0
);

-- 11. COMMENTS
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. ATTACHMENTS
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  uploader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. ACTIVITY_LOG
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tasks_board_id ON tasks(board_id);
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_comments_task_created ON comments(task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_workspace_created ON activity_log(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);

-- =====================================================
-- AUTO-UPDATE TRIGGERS
-- =====================================================

CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER handle_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER handle_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER handle_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER handle_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- =====================================================
-- AUTO-INSERT PROFILE TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ROW-LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Helper function to check workspace membership
CREATE OR REPLACE FUNCTION public.is_workspace_member(workspace_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = is_workspace_member.workspace_id
    AND workspace_members.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check workspace role
CREATE OR REPLACE FUNCTION public.get_workspace_role(workspace_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM workspace_members
    WHERE workspace_members.workspace_id = get_workspace_role.workspace_id
    AND workspace_members.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

CREATE POLICY "Users can view profiles in their workspaces"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_members wm1
      INNER JOIN workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
      WHERE wm1.user_id = auth.uid()
      AND wm2.user_id = profiles.id
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =====================================================
-- WORKSPACES POLICIES
-- =====================================================

CREATE POLICY "Workspace members can view workspace"
  ON workspaces FOR SELECT
  TO authenticated
  USING (is_workspace_member(id));

CREATE POLICY "Authenticated users can create workspaces"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspace owners can update workspace"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Workspace owners can delete workspace"
  ON workspaces FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- =====================================================
-- WORKSPACE_MEMBERS POLICIES
-- =====================================================

CREATE POLICY "Members can view workspace members"
  ON workspace_members FOR SELECT
  TO authenticated
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Admins can add workspace members"
  ON workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    get_workspace_role(workspace_id) IN ('owner', 'admin')
  );

CREATE POLICY "Admins can remove workspace members"
  ON workspace_members FOR DELETE
  TO authenticated
  USING (
    get_workspace_role(workspace_id) IN ('owner', 'admin') OR
    user_id = auth.uid()
  );

-- =====================================================
-- PROJECTS POLICIES
-- =====================================================

CREATE POLICY "Workspace members can view projects"
  ON projects FOR SELECT
  TO authenticated
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    is_workspace_member(workspace_id) AND
    get_workspace_role(workspace_id) IN ('owner', 'admin', 'member')
  );

CREATE POLICY "Project creators and admins can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    get_workspace_role(workspace_id) IN ('owner', 'admin')
  )
  WITH CHECK (
    created_by = auth.uid() OR
    get_workspace_role(workspace_id) IN ('owner', 'admin')
  );

CREATE POLICY "Project creators and admins can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    get_workspace_role(workspace_id) IN ('owner', 'admin')
  );

-- =====================================================
-- BOARDS POLICIES
-- =====================================================

CREATE POLICY "Project members can view boards"
  ON boards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = boards.project_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Project members can create boards"
  ON boards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = boards.project_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Project members can update boards"
  ON boards FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = boards.project_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Project admins can delete boards"
  ON boards FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = boards.project_id
      AND get_workspace_role(projects.workspace_id) IN ('owner', 'admin')
    )
  );

-- =====================================================
-- COLUMNS POLICIES
-- =====================================================

CREATE POLICY "Board viewers can view columns"
  ON columns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE boards.id = columns.board_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Board members can create columns"
  ON columns FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE boards.id = columns.board_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Board members can update columns"
  ON columns FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE boards.id = columns.board_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Board members can delete columns"
  ON columns FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE boards.id = columns.board_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

-- =====================================================
-- TASKS POLICIES
-- =====================================================

CREATE POLICY "Board members can view tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE boards.id = tasks.board_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Board members can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE boards.id = tasks.board_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Board members can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE boards.id = tasks.board_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Task creators and admins can delete tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM boards
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE boards.id = tasks.board_id
      AND get_workspace_role(projects.workspace_id) IN ('owner', 'admin')
    )
  );

-- =====================================================
-- LABELS POLICIES
-- =====================================================

CREATE POLICY "Board members can view labels"
  ON labels FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE boards.id = labels.board_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Board members can create labels"
  ON labels FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE boards.id = labels.board_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Board members can update labels"
  ON labels FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE boards.id = labels.board_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Board members can delete labels"
  ON labels FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE boards.id = labels.board_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

-- =====================================================
-- TASK_LABELS POLICIES
-- =====================================================

CREATE POLICY "Board members can view task labels"
  ON task_labels FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      INNER JOIN boards ON boards.id = tasks.board_id
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE tasks.id = task_labels.task_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Board members can add task labels"
  ON task_labels FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      INNER JOIN boards ON boards.id = tasks.board_id
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE tasks.id = task_labels.task_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Board members can remove task labels"
  ON task_labels FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      INNER JOIN boards ON boards.id = tasks.board_id
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE tasks.id = task_labels.task_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

-- =====================================================
-- SUBTASKS POLICIES
-- =====================================================

CREATE POLICY "Task viewers can view subtasks"
  ON subtasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      INNER JOIN boards ON boards.id = tasks.board_id
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE tasks.id = subtasks.task_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Task members can create subtasks"
  ON subtasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      INNER JOIN boards ON boards.id = tasks.board_id
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE tasks.id = subtasks.task_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Task members can update subtasks"
  ON subtasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      INNER JOIN boards ON boards.id = tasks.board_id
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE tasks.id = subtasks.task_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Task members can delete subtasks"
  ON subtasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      INNER JOIN boards ON boards.id = tasks.board_id
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE tasks.id = subtasks.task_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

-- =====================================================
-- COMMENTS POLICIES
-- =====================================================

CREATE POLICY "Task viewers can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      INNER JOIN boards ON boards.id = tasks.board_id
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE tasks.id = comments.task_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Task members can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tasks
      INNER JOIN boards ON boards.id = tasks.board_id
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE tasks.id = comments.task_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Comment authors can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Comment authors and admins can delete comments"
  ON comments FOR DELETE
  TO authenticated
  USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM tasks
      INNER JOIN boards ON boards.id = tasks.board_id
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE tasks.id = comments.task_id
      AND get_workspace_role(projects.workspace_id) IN ('owner', 'admin')
    )
  );

-- =====================================================
-- ATTACHMENTS POLICIES
-- =====================================================

CREATE POLICY "Task viewers can view attachments"
  ON attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      INNER JOIN boards ON boards.id = tasks.board_id
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE tasks.id = attachments.task_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Task members can upload attachments"
  ON attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    uploader_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tasks
      INNER JOIN boards ON boards.id = tasks.board_id
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE tasks.id = attachments.task_id
      AND is_workspace_member(projects.workspace_id)
    )
  );

CREATE POLICY "Uploaders and admins can delete attachments"
  ON attachments FOR DELETE
  TO authenticated
  USING (
    uploader_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM tasks
      INNER JOIN boards ON boards.id = tasks.board_id
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE tasks.id = attachments.task_id
      AND get_workspace_role(projects.workspace_id) IN ('owner', 'admin')
    )
  );

-- =====================================================
-- ACTIVITY_LOG POLICIES
-- =====================================================

CREATE POLICY "Workspace members can view activity log"
  ON activity_log FOR SELECT
  TO authenticated
  USING (is_workspace_member(workspace_id));

CREATE POLICY "System can insert activity log"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);