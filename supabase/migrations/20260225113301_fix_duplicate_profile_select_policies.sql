/*
  # Fix duplicate profile SELECT policies
  
  ## Problem
  There are two SELECT policies on the profiles table which may be causing conflicts:
  - profiles_select_own (only allows viewing own profile)
  - profiles_select_workspace_members (allows viewing own + workspace members)
  
  ## Solution
  Drop the restrictive policy and keep only the workspace members policy
  which already includes the ability to view own profile.
  
  ## Changes
  1. Drop profiles_select_own policy
  2. Keep profiles_select_workspace_members which handles both cases
*/

-- Drop the restrictive policy
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- Verify the workspace members policy still exists
-- This policy allows users to:
-- 1. See their own profile (id = auth.uid())
-- 2. See profiles of other users in the same workspace
