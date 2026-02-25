/*
  # Add SELECT policy for activity_log

  ## Problem
  Dashboard page tries to query activity_log but there's no SELECT policy, causing queries to fail.

  ## Solution
  Add SELECT policy allowing workspace members to view activity logs for their workspaces.

  ## Changes
  1. Create SELECT policy for activity_log table
*/

-- Allow workspace members to view activity logs for their workspaces
CREATE POLICY "Workspace members can view activity logs"
  ON public.activity_log
  FOR SELECT
  TO authenticated
  USING (
    workspace_id IS NULL
    OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = activity_log.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );
