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

CREATE POLICY "Board admins can delete columns"
  ON columns FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards
      INNER JOIN projects ON projects.id = boards.project_id
      WHERE boards.id = columns.board_id
      AND get_workspace_role(projects.workspace_id) IN ('owner', 'admin')
    )
  );

-- =====================================================
-- TASKS POLICIES
-- =====================================================

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
