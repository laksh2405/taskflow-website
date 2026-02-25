/*
  # Add missing SELECT policies for task-related tables

  ## Problem
  Several tables are missing SELECT policies, preventing users from viewing:
  - Comments on tasks
  - Attachments on tasks  
  - Labels and task labels
  - Subtasks

  ## Solution
  Add comprehensive SELECT policies for all task-related tables.

  ## Changes
  1. Add SELECT policy for comments
  2. Add SELECT policy for attachments
  3. Add complete policies for labels
  4. Add complete policies for task_labels
  5. Add complete policies for subtasks
*/

-- Comments: Allow viewing comments on tasks in accessible boards
CREATE POLICY "Task members can view comments"
  ON public.comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM tasks t
      JOIN boards b ON b.id = t.board_id
      JOIN projects p ON p.id = b.project_id
      WHERE t.id = comments.task_id
      AND is_workspace_member(p.workspace_id)
    )
  );

-- Attachments: Allow viewing attachments on tasks in accessible boards
CREATE POLICY "Task members can view attachments"
  ON public.attachments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM tasks t
      JOIN boards b ON b.id = t.board_id
      JOIN projects p ON p.id = b.project_id
      WHERE t.id = attachments.task_id
      AND is_workspace_member(p.workspace_id)
    )
  );

-- Labels: Full CRUD policies
CREATE POLICY "Board members can view labels"
  ON public.labels
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM boards b
      JOIN projects p ON p.id = b.project_id
      WHERE b.id = labels.board_id
      AND is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "Board members can create labels"
  ON public.labels
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM boards b
      JOIN projects p ON p.id = b.project_id
      WHERE b.id = labels.board_id
      AND is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "Board members can update labels"
  ON public.labels
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM boards b
      JOIN projects p ON p.id = b.project_id
      WHERE b.id = labels.board_id
      AND is_workspace_member(p.workspace_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM boards b
      JOIN projects p ON p.id = b.project_id
      WHERE b.id = labels.board_id
      AND is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "Board admins can delete labels"
  ON public.labels
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM boards b
      JOIN projects p ON p.id = b.project_id
      WHERE b.id = labels.board_id
      AND get_workspace_role(p.workspace_id) = ANY (ARRAY['owner'::text, 'admin'::text])
    )
  );

-- Task Labels: Full CRUD policies
CREATE POLICY "Task members can view task labels"
  ON public.task_labels
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM tasks t
      JOIN boards b ON b.id = t.board_id
      JOIN projects p ON p.id = b.project_id
      WHERE t.id = task_labels.task_id
      AND is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "Task members can add task labels"
  ON public.task_labels
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM tasks t
      JOIN boards b ON b.id = t.board_id
      JOIN projects p ON p.id = b.project_id
      WHERE t.id = task_labels.task_id
      AND is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "Task members can remove task labels"
  ON public.task_labels
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM tasks t
      JOIN boards b ON b.id = t.board_id
      JOIN projects p ON p.id = b.project_id
      WHERE t.id = task_labels.task_id
      AND is_workspace_member(p.workspace_id)
    )
  );

-- Subtasks: Full CRUD policies
CREATE POLICY "Task members can view subtasks"
  ON public.subtasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM tasks t
      JOIN boards b ON b.id = t.board_id
      JOIN projects p ON p.id = b.project_id
      WHERE t.id = subtasks.task_id
      AND is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "Task members can create subtasks"
  ON public.subtasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM tasks t
      JOIN boards b ON b.id = t.board_id
      JOIN projects p ON p.id = b.project_id
      WHERE t.id = subtasks.task_id
      AND is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "Task members can update subtasks"
  ON public.subtasks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM tasks t
      JOIN boards b ON b.id = t.board_id
      JOIN projects p ON p.id = b.project_id
      WHERE t.id = subtasks.task_id
      AND is_workspace_member(p.workspace_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM tasks t
      JOIN boards b ON b.id = t.board_id
      JOIN projects p ON p.id = b.project_id
      WHERE t.id = subtasks.task_id
      AND is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "Task members can delete subtasks"
  ON public.subtasks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM tasks t
      JOIN boards b ON b.id = t.board_id
      JOIN projects p ON p.id = b.project_id
      WHERE t.id = subtasks.task_id
      AND is_workspace_member(p.workspace_id)
    )
  );
