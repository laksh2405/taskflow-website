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

-- Note: If you need shared workspace viewing in the future,
-- you can add a separate policy that checks workspace_members,
-- but for now this removes the recursion issue
