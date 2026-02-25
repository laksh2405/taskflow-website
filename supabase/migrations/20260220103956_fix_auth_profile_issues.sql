/*
  # Fix Authentication and Profile Creation Issues

  ## Problem
  The handle_new_user() trigger function was incorrectly referencing 'full_name' 
  column when the actual column name is 'name'. This causes signup failures.

  ## Changes
  1. Fix the handle_new_user() function to use correct column name 'name'
  2. Ensure metadata extraction uses the correct field names

  ## Security
  - Maintains SECURITY DEFINER with explicit search_path
  - Preserves all security measures from previous migration
*/

-- Drop and recreate the trigger function with correct column names
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
