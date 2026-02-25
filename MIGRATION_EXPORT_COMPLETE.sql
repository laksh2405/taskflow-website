/*
  ========================================================
  TASKFLOW - COMPLETE DATABASE MIGRATION EXPORT
  ========================================================

  This file contains ALL migrations from project rwmijuipqdigfpxqurz
  to be applied to project obfadpfsccopptkycvhi

  Created: 2026-02-24

  IMPORTANT INSTRUCTIONS:
  1. Open Supabase Dashboard for project obfadpfsccopptkycvhi
  2. Navigate to SQL Editor
  3. Create a new query
  4. Copy and paste this ENTIRE file
  5. Run the query
  6. Check for any errors and resolve them

  WARNING: This will create new tables and policies.
  Make sure the target database is ready for this migration.
  ========================================================
*/

-- =====================================================
-- MIGRATION 1: Initial Schema
-- File: 20260220093303_initial_schema.sql
-- =====================================================

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
-- MIGRATION 2: Fix Auth Profile Issues
-- File: 20260220103956_fix_auth_profile_issues.sql
-- =====================================================

/*
  # Fix Authentication and Profile Creation Issues

  ## Problem
  The handle_new_user() trigger function was incorrectly referencing 'full_name'
  column when the actual column name is 'name'. This causes signup failures.

  ## Changes
  1. Fix the handle_new_user() function to use correct column name 'name'
  2. Ensure metadata extraction uses the correct field names

  ## Security
  - Maintains SECURITY DEFINER with explicit search_path
  - Preserves all security measures from previous migration
*/

-- Drop and recreate the trigger function with correct column names
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- MIGRATION 3: Add Missing Board Fields
-- File: 20260224102255_add_missing_board_fields.sql
-- =====================================================

/*
  # Add Missing Board Fields

  ## Changes
  1. Add description field to boards table
  2. Add settings field to boards table for future extensibility

  ## Notes
  - description is optional text field
  - settings is JSONB for flexible configuration storage
*/

-- Add missing fields to boards table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'boards' AND column_name = 'description'
  ) THEN
    ALTER TABLE boards ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'boards' AND column_name = 'settings'
  ) THEN
    ALTER TABLE boards ADD COLUMN settings JSONB DEFAULT '{}';
  END IF;
END $$;

-- =====================================================
-- MIGRATION 4: Comprehensive RLS Policy Fix
-- File: 20260224103422_comprehensive_rls_policy_fix.sql
-- =====================================================

/*
  # Comprehensive RLS Policy Fix

  ## Overview
  Complete rebuild of all RLS policies for profiles, workspaces, and workspace_members tables.
  This ensures workspace and project creation works correctly.

  ## Changes
  1. Drop all existing conflicting policies
  2. Create clean, properly named policies
  3. Fix circular dependencies
  4. Ensure workspace creation flow works

  ## Security
  - Users can only view/edit their own profiles
  - Users can create workspaces where they are the owner
  - Users can view workspaces they own or are members of
  - Proper role-based access control for workspace management
*/

-- =====================================================
-- DROP ALL EXISTING POLICIES
-- =====================================================

-- Drop all workspace policies
DROP POLICY IF EXISTS "Workspace members can view workspace" ON workspaces;
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Authenticated users can create their own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can update workspace" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete workspace" ON workspaces;

-- Drop all workspace_members policies
DROP POLICY IF EXISTS "Members can view workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Admins can add workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Users can add workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Users can manage workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Admins can update workspace member roles" ON workspace_members;
DROP POLICY IF EXISTS "Admins can remove workspace members" ON workspace_members;

-- Drop all profile policies
DROP POLICY IF EXISTS "Users can view profiles in their workspaces" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_select_workspace"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm1
      WHERE wm1.user_id = profiles.id
      AND EXISTS (
        SELECT 1 FROM workspace_members wm2
        WHERE wm2.workspace_id = wm1.workspace_id
        AND wm2.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =====================================================
-- WORKSPACES POLICIES
-- =====================================================

CREATE POLICY "workspaces_insert_own"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_update_owner"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_delete_owner"
  ON workspaces FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- =====================================================
-- WORKSPACE_MEMBERS POLICIES
-- =====================================================

CREATE POLICY "workspace_members_insert"
  ON workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      user_id = auth.uid() AND
      EXISTS (
        SELECT 1 FROM workspaces
        WHERE workspaces.id = workspace_members.workspace_id
        AND workspaces.owner_id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "workspace_members_delete_simple"
  ON workspace_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_members.workspace_id
      AND w.owner_id = auth.uid()
    )
  );

-- =====================================================
-- MIGRATION 5: Fix Workspaces Recursion Final
-- File: 20260224110517_fix_workspaces_recursion_final.sql
-- =====================================================

/*
  # Final Fix for Workspaces Recursion

  ## Issue
  The workspaces SELECT policy checks workspace_members, and workspace_members
  SELECT policy checks workspaces, creating infinite recursion.

  ## Solution
  Simplify workspaces SELECT policy to ONLY check owner_id, removing the
  workspace_members check entirely. Users will see workspaces they own.

  For shared workspaces (future feature), we can add a separate policy later.

  ## Security
  - Users can view workspaces they own (direct check, no recursion)
  - This allows workspace creation flow to work
  - Still maintains proper security
*/

-- Drop the recursive policy
DROP POLICY IF EXISTS "workspaces_select_member" ON workspaces;

-- Create simple, non-recursive SELECT policy
-- Only check owner_id, no workspace_members lookup
CREATE POLICY "workspaces_select_owner"
  ON workspaces FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- =====================================================
-- MIGRATION 6: Fix Workspace Members Infinite Recursion
-- File: 20260224104830_fix_workspace_members_infinite_recursion.sql
-- =====================================================

/*
  # Fix Infinite Recursion in Workspace Members Policies

  ## Issue
  The workspace_members SELECT policy was creating infinite recursion by querying
  workspace_members within itself.

  ## Solution
  Simplify policies to avoid self-referential queries:
  - workspace_members SELECT: Only check workspaces table (no self-reference)
  - workspace_members INSERT: Check workspaces table directly
  - Remove circular dependencies

  ## Security
  - Maintains proper access control
  - Users can only access workspace_members for workspaces they own or belong to
  - No circular policy checks
*/

-- =====================================================
-- FIX WORKSPACE_MEMBERS POLICIES - REMOVE RECURSION
-- =====================================================

-- Drop the recursive policy
DROP POLICY IF EXISTS "workspace_members_select_member" ON workspace_members;

-- Create non-recursive SELECT policy
-- Users can view members of workspaces where they are the owner OR already a member
CREATE POLICY "workspace_members_select_member"
  ON workspace_members FOR SELECT
  TO authenticated
  USING (
    -- Can view if user is the owner of the workspace
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_members.workspace_id
      AND w.owner_id = auth.uid()
    )
    OR
    -- Can view if user is viewing themselves as a member
    user_id = auth.uid()
  );

-- =====================================================
-- SIMPLIFY WORKSPACE_MEMBERS UPDATE POLICY
-- =====================================================

DROP POLICY IF EXISTS "workspace_members_update_admin" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_update_owner" ON workspace_members;

-- Only workspace owners can update member roles
CREATE POLICY "workspace_members_update_owner"
  ON workspace_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_members.workspace_id
      AND w.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_members.workspace_id
      AND w.owner_id = auth.uid()
    )
  );

-- =====================================================
-- ALSO SIMPLIFY PROFILES SELECT POLICY TO AVOID RECURSION
-- =====================================================

DROP POLICY IF EXISTS "profiles_select_workspace" ON profiles;

-- Simplified profile viewing - no workspace_members check
CREATE POLICY "profiles_select_workspace"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    -- Can view profiles of workspace owners where user is owner
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.owner_id = profiles.id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- =====================================================
-- MIGRATION 7: Restore Missing Project Board Policies
-- File: 20260224105306_restore_missing_project_board_policies.sql
-- =====================================================

/*
  # Restore Missing Project, Board, Column, and Task Policies

  ## Overview
  Restores all SELECT and INSERT policies that were accidentally removed during
  the workspace RLS policy cleanup.

  ## Changes
  1. Restore project SELECT and INSERT policies
  2. Restore board SELECT and INSERT policies
  3. Restore column SELECT, INSERT, and UPDATE policies
  4. Restore task SELECT, INSERT, and UPDATE policies

  ## Security
  - Users can view/create items in workspaces they belong to
  - Role-based access control maintained
  - Uses existing helper functions (is_workspace_member, get_workspace_role)
*/

-- =====================================================
-- PROJECTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Workspace members can view projects" ON projects;
DROP POLICY IF EXISTS "Workspace members can create projects" ON projects;
DROP POLICY IF EXISTS "Project creators and admins can update projects" ON projects;
DROP POLICY IF EXISTS "Project creators and admins can delete projects" ON projects;

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

DROP POLICY IF EXISTS "Project members can view boards" ON boards;
DROP POLICY IF EXISTS "Project members can create boards" ON boards;
DROP POLICY IF EXISTS "Project members can update boards" ON boards;
DROP POLICY IF EXISTS "Project admins can delete boards" ON boards;

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
  )
  WITH CHECK (
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

DROP POLICY IF EXISTS "Board viewers can view columns" ON columns;
DROP POLICY IF EXISTS "Board members can create columns" ON columns;
DROP POLICY IF EXISTS "Board members can update columns" ON columns;
DROP POLICY IF EXISTS "Board members can delete columns" ON columns;
DROP POLICY IF EXISTS "Board admins can delete columns" ON columns;

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
  )
  WITH CHECK (
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

DROP POLICY IF EXISTS "Board members can view tasks" ON tasks;
DROP POLICY IF EXISTS "Board viewers can view tasks" ON tasks;
DROP POLICY IF EXISTS "Board members can create tasks" ON tasks;
DROP POLICY IF EXISTS "Board members can update tasks" ON tasks;
DROP POLICY IF EXISTS "Task assignees and members can update tasks" ON tasks;
DROP POLICY IF EXISTS "Task creators and admins can delete tasks" ON tasks;

CREATE POLICY "Board viewers can view tasks"
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

CREATE POLICY "Task assignees and members can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    assignee_id = auth.uid() OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM boards
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE boards.id = tasks.board_id
      AND get_workspace_role(projects.workspace_id) IN ('owner', 'admin', 'member')
    )
  )
  WITH CHECK (
    assignee_id = auth.uid() OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM boards
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE boards.id = tasks.board_id
      AND get_workspace_role(projects.workspace_id) IN ('owner', 'admin', 'member')
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

DROP POLICY IF EXISTS "Board members can view labels" ON labels;
DROP POLICY IF EXISTS "Board members can create labels" ON labels;
DROP POLICY IF EXISTS "Board members can update labels" ON labels;
DROP POLICY IF EXISTS "Board members can delete labels" ON labels;

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

DROP POLICY IF EXISTS "Board members can view task labels" ON task_labels;
DROP POLICY IF EXISTS "Board members can add task labels" ON task_labels;
DROP POLICY IF EXISTS "Board members can remove task labels" ON task_labels;

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

DROP POLICY IF EXISTS "Task viewers can view subtasks" ON subtasks;
DROP POLICY IF EXISTS "Task members can create subtasks" ON subtasks;
DROP POLICY IF EXISTS "Task members can update subtasks" ON subtasks;
DROP POLICY IF EXISTS "Task members can delete subtasks" ON subtasks;

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

DROP POLICY IF EXISTS "Task viewers can view comments" ON comments;
DROP POLICY IF EXISTS "Task members can create comments" ON comments;
DROP POLICY IF EXISTS "Comment authors can update own comments" ON comments;
DROP POLICY IF EXISTS "Comment authors and admins can delete comments" ON comments;

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

DROP POLICY IF EXISTS "Task viewers can view attachments" ON attachments;
DROP POLICY IF EXISTS "Task members can upload attachments" ON attachments;
DROP POLICY IF EXISTS "Uploaders and admins can delete attachments" ON attachments;

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

DROP POLICY IF EXISTS "Workspace members can view activity log" ON activity_log;
DROP POLICY IF EXISTS "System can insert activity log" ON activity_log;

CREATE POLICY "Workspace members can view activity log"
  ON activity_log FOR SELECT
  TO authenticated
  USING (is_workspace_member(workspace_id));

CREATE POLICY "System can insert activity log"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- END OF MIGRATION EXPORT
-- =====================================================

/*
  MIGRATION COMPLETE!

  Next steps:
  1. Verify all tables were created successfully
  2. Test authentication by signing up a new user
  3. Create a workspace and verify RLS is working
  4. Create a project and tasks to test the full flow
*/
