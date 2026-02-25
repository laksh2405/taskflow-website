/*
  # Fix Workspace Members Insert Policy

  ## Changes
  1. Update workspace_members insert policy to handle workspace creation edge case
  2. Allow users to add themselves to a workspace they own (during initial creation)

  ## Security
  - Users can add themselves to workspaces they own
  - Admins can add members to workspaces they manage
  - Self-enrollment only allowed for workspaces user owns
*/

-- Drop the policy we just created
DROP POLICY IF EXISTS "Users can add workspace members" ON workspace_members;

-- Create a better policy that handles the workspace creation edge case
CREATE POLICY "Users can manage workspace members"
  ON workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if user is adding themselves to a workspace they own
    (user_id = auth.uid() AND EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = workspace_members.workspace_id 
      AND workspaces.owner_id = auth.uid()
    ))
    OR
    -- OR if user has owner/admin role in existing workspace
    get_workspace_role(workspace_id) IN ('owner', 'admin')
  );
