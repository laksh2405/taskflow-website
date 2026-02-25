/*
  # Fix profiles SELECT policy for workspace members

  ## Problem
  Users in the same workspace cannot see each other's profiles, which breaks:
  - Task assignment (can't see assignee details)
  - Activity logs (can't see actor details)
  - Workspace member lists

  ## Solution
  Allow users to view profiles of other users in the same workspace

  ## Changes
  1. Drop existing restrictive policies
  2. Create new policy allowing workspace members to view each other
*/

-- Drop existing restrictive profile select policies
DROP POLICY IF EXISTS "profiles_select_workspace" ON public.profiles;

-- Create new policy allowing workspace members to see each other
CREATE POLICY "profiles_select_workspace_members"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see their own profile
    id = auth.uid()
    OR
    -- Users can see profiles of other members in their workspaces
    EXISTS (
      SELECT 1 FROM workspace_members wm1
      JOIN workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
      WHERE wm1.user_id = auth.uid()
      AND wm2.user_id = profiles.id
    )
  );
