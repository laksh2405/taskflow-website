/*
  # Comprehensive RLS Policy Fix

  ## Overview
  This migration fixes all RLS policies to ensure proper functionality for workspace and project creation.

  ## Changes
  1. Add missing SELECT policy for workspaces
  2. Add missing SELECT policy for workspace_members
  3. Ensure workspace creation flow works properly
  4. Clean up duplicate policies

  ## Security
  - Users can view workspaces they are members of
  - Users can view workspace members for workspaces they belong to
  - Users can create workspaces and automatically become members
  - All existing security constraints are maintained
*/

-- =====================================================
-- CLEAN UP DUPLICATE POLICIES
-- =====================================================

-- Remove duplicate profile policies
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- =====================================================
-- WORKSPACE POLICIES - ADD MISSING SELECT
-- =====================================================

-- Add SELECT policy for workspaces (was missing!)
DROP POLICY IF EXISTS "Workspace members can view workspace" ON workspaces;

CREATE POLICY "Workspace members can view workspace"
  ON workspaces FOR SELECT
  TO authenticated
  USING (
    -- User is the owner OR user is a member
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- =====================================================
-- WORKSPACE_MEMBERS POLICIES - ADD MISSING SELECT
-- =====================================================

-- Add SELECT policy for workspace_members (was missing!)
DROP POLICY IF EXISTS "Members can view workspace members" ON workspace_members;

CREATE POLICY "Members can view workspace members"
  ON workspace_members FOR SELECT
  TO authenticated
  USING (
    -- User is viewing members of a workspace they belong to
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND (
        workspaces.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members wm2
          WHERE wm2.workspace_id = workspaces.id
          AND wm2.user_id = auth.uid()
        )
      )
    )
  );

-- =====================================================
-- WORKSPACE_MEMBERS UPDATE POLICY
-- =====================================================

-- Add UPDATE policy for workspace_members (for role changes)
DROP POLICY IF EXISTS "Admins can update workspace member roles" ON workspace_members;

CREATE POLICY "Admins can update workspace member roles"
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
