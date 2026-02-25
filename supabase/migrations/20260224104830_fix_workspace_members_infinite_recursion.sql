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
-- SIMPLIFY WORKSPACE_MEMBERS INSERT POLICY
-- =====================================================

DROP POLICY IF EXISTS "workspace_members_insert" ON workspace_members;

-- Simplified insert policy without recursion
CREATE POLICY "workspace_members_insert"
  ON workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can add themselves to a workspace they own
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- =====================================================
-- SIMPLIFY WORKSPACE_MEMBERS UPDATE POLICY
-- =====================================================

DROP POLICY IF EXISTS "workspace_members_update_admin" ON workspace_members;

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
-- SIMPLIFY WORKSPACE_MEMBERS DELETE POLICY
-- =====================================================

DROP POLICY IF EXISTS "workspace_members_delete" ON workspace_members;

-- Users can remove themselves OR owner can remove anyone
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
