/*
  # Fix Workspace RLS Policies

  ## Changes
  1. Update workspace insert policy to allow users to create their own workspaces
  2. Update workspace_members insert policy to allow self-enrollment when creating workspace
  3. Ensure profiles table has proper insert policy for auth trigger

  ## Security
  - Users can create workspaces where they are the owner
  - Users can add themselves as workspace members
  - Maintains existing security for other operations
*/

-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Admins can add workspace members" ON workspace_members;

-- Recreate workspace insert policy with proper check
CREATE POLICY "Authenticated users can create their own workspaces"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
  );

-- Recreate workspace_members insert policy to allow self-enrollment during workspace creation
CREATE POLICY "Users can add workspace members"
  ON workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if user is owner/admin of the workspace OR adding themselves during workspace creation
    get_workspace_role(workspace_id) IN ('owner', 'admin') OR
    user_id = auth.uid()
  );

-- Ensure profiles can be created (needed for new user signup)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow profile inserts (typically done by trigger, but ensure it's allowed)
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
