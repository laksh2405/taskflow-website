-- =====================================================
-- COMPREHENSIVE RLS FIX FOR TASKFLOW DATABASE
-- =====================================================
-- Run this SQL script in your Supabase SQL Editor to fix all RLS policies
-- This fixes the infinite recursion error in workspace_members policies

-- =====================================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- =====================================================

-- Drop all workspace policies
DROP POLICY IF EXISTS "Workspace members can view workspace" ON workspaces;
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Authenticated users can create their own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can update workspace" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete workspace" ON workspaces;
DROP POLICY IF EXISTS "workspaces_select_member" ON workspaces;
DROP POLICY IF EXISTS "workspaces_insert_own" ON workspaces;
DROP POLICY IF EXISTS "workspaces_update_owner" ON workspaces;
DROP POLICY IF EXISTS "workspaces_delete_owner" ON workspaces;

-- Drop all workspace_members policies
DROP POLICY IF EXISTS "Members can view workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Admins can add workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Users can add workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Users can manage workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Admins can update workspace member roles" ON workspace_members;
DROP POLICY IF EXISTS "Admins can remove workspace members" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_select_member" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_update_owner" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_update_admin" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete_simple" ON workspace_members;

-- Drop all profile policies
DROP POLICY IF EXISTS "Users can view profiles in their workspaces" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_workspace" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- =====================================================
-- STEP 2: CREATE CLEAN, NON-RECURSIVE POLICIES
-- =====================================================

-- -----------------------------------------------------
-- PROFILES POLICIES
-- -----------------------------------------------------

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_select_workspace"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.owner_id = profiles.id
      AND workspaces.owner_id = auth.uid()
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

-- -----------------------------------------------------
-- WORKSPACES POLICIES (NO RECURSION)
-- -----------------------------------------------------

-- CRITICAL: Only check owner_id to avoid circular reference with workspace_members
CREATE POLICY "workspaces_select_owner"
  ON workspaces FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

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

-- -----------------------------------------------------
-- WORKSPACE_MEMBERS POLICIES (NO RECURSION - CRITICAL!)
-- -----------------------------------------------------

-- SELECT: Users can view members if they own the workspace OR viewing themselves
CREATE POLICY "workspace_members_select_member"
  ON workspace_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_members.workspace_id
      AND w.owner_id = auth.uid()
    )
    OR
    user_id = auth.uid()
  );

-- INSERT: Users can only add themselves to workspaces they own
CREATE POLICY "workspace_members_insert"
  ON workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- UPDATE: Only workspace owners can update member roles
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

-- DELETE: Users can remove themselves OR owner can remove anyone
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
-- STEP 3: VERIFY POLICIES
-- =====================================================

SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'workspaces', 'workspace_members')
ORDER BY tablename, cmd, policyname;
