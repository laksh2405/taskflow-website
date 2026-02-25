/*
  # Auto-create workspace for new users

  ## Problem
  Users cannot access dashboard or create tasks because they don't have a workspace membership.
  The RLS policies require users to be members of a workspace to access projects, boards, and tasks.

  ## Solution
  1. Create a trigger function that automatically creates a workspace and workspace membership when a new user profile is created
  2. Fix existing users who don't have workspaces

  ## Changes
  1. Create `handle_new_user_workspace` trigger function
  2. Attach trigger to profiles table
  3. Backfill workspaces for existing users without workspaces
*/

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_new_user_workspace();

-- Create function to auto-create workspace for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace_id UUID;
  workspace_name TEXT;
BEGIN
  -- Create workspace name from email or use default
  workspace_name := COALESCE(NEW.name, NEW.email, 'My Workspace') || '''s Workspace';
  
  -- Create workspace
  INSERT INTO public.workspaces (owner_id, name, slug)
  VALUES (
    NEW.id,
    workspace_name,
    'workspace-' || LOWER(REPLACE(NEW.id::TEXT, '-', ''))
  )
  RETURNING id INTO new_workspace_id;
  
  -- Add user as workspace owner in workspace_members
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, NEW.id, 'owner');
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_workspace();

-- Backfill workspaces for existing users who don't have one
DO $$
DECLARE
  user_record RECORD;
  new_workspace_id UUID;
  workspace_name TEXT;
BEGIN
  FOR user_record IN 
    SELECT p.id, p.email, p.name
    FROM profiles p
    LEFT JOIN workspaces w ON w.owner_id = p.id
    WHERE w.id IS NULL
  LOOP
    -- Create workspace name
    workspace_name := COALESCE(user_record.name, user_record.email, 'My Workspace') || '''s Workspace';
    
    -- Create workspace
    INSERT INTO public.workspaces (owner_id, name, slug)
    VALUES (
      user_record.id,
      workspace_name,
      'workspace-' || LOWER(REPLACE(user_record.id::TEXT, '-', ''))
    )
    RETURNING id INTO new_workspace_id;
    
    -- Add user as workspace owner in workspace_members
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (new_workspace_id, user_record.id, 'owner')
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
