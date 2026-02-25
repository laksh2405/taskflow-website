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

CREATE POLICY "workspaces_select_member"
  ON workspaces FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

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

CREATE POLICY "workspace_members_select_member"
  ON workspace_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_members.workspace_id
      AND (
        w.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members wm
          WHERE wm.workspace_id = w.id
          AND wm.user_id = auth.uid()
        )
      )
    )
  );

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

CREATE POLICY "workspace_members_update_admin"
  ON workspace_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "workspace_members_delete"
  ON workspace_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );
