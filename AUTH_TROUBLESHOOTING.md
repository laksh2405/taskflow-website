# Authentication & RLS Troubleshooting Guide

## Latest Updates

### Issue 6: "TypeError: Failed to fetch" and ERR_CONNECTION_TIMED_OUT (FIXED!)
**Problem:** The browser was trying to connect to `obfadpfsccopptkycvhi.supabase.co` which was timing out. The `.env` file had credentials from an old/unreachable Supabase project.

**Root Cause:** The `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` were pointing to project `obfadpfsccopptkycvhi`, but the `SUPABASE_SERVICE_ROLE_KEY` was for project `rwmijuipqdigfpxqurz`. This mismatch meant:
- Server-side queries worked (using the service role key)
- Client-side queries failed (trying to reach the wrong project URL)

**Solution:**
- Updated `.env` to use the correct Supabase project: `rwmijuipqdigfpxqurz`
- Updated both the URL and anon key to match the service role key
- All credentials now point to the same working Supabase instance

**Result:** Client-side Supabase queries now work correctly. You can create projects without errors!

---

### Issue 5: "Acquiring an exclusive Navigator LockManager lock timed out" (Performance Fix)
**Problem:** The auth provider was calling `supabase.auth.getUser()` which acquires an exclusive lock. When combined with `onAuthStateChange`, multiple simultaneous lock requests caused 10-second timeouts, making the website extremely slow to load.

**Solution:**
- Changed `supabase.auth.getUser()` to `supabase.auth.getSession()` in the AuthProvider
- `getSession()` reads from local storage and doesn't require an exclusive lock
- This eliminates lock contention and timeout errors
- Added error handling to prevent crashes

**Result:** Website now loads instantly without lock timeout errors.

---

## Latest Updates (RLS Policy Fixes)

### Issue 3: "new row violates row-level security policy for table 'workspaces'"
**Problem:** Missing INSERT policy for workspaces table prevented project creation.
**Solution:** Created `workspaces_insert_own` policy allowing authenticated users to create workspaces where they are the owner.

### Issue 4: "infinite recursion detected in policy for relation workspace_members"
**Problem:** The workspace_members SELECT policy was querying workspace_members within itself, creating a circular reference.
**Solution:** Rewrote all workspace_members policies to only check the `workspaces` table, eliminating self-references.

**Status:** ✅ FIXED - All RLS policies are now working without recursion

---

## Authentication Issues (Previously Fixed)

## Issues Identified & Fixed

### 1. Email Confirmation Not Handled
**Problem:** Email signup wasn't detecting if email confirmation was required.
**Solution:** Updated signup flow to check if `data.session` exists after signup.

### 2. Password Validation Missing
**Problem:** Passwords weren't validated to match before submission.
**Solution:** Added password match validation in signup form.

### 3. Redirect URL Not Configured
**Problem:** Email confirmation links didn't have proper redirect URL.
**Solution:** Added `emailRedirectTo` with `NEXT_PUBLIC_SITE_URL` environment variable.

### 4. Error Messages Not Displayed
**Problem:** Auth callback errors weren't shown to users.
**Solution:** Enhanced error handling with detailed error messages.

## Current Status

Based on your Supabase data:
- ✅ Google OAuth: Working (user has `last_sign_in_at` timestamp)
- ⚠️  Email/Password: Profile created but no session (requires email confirmation)

## Critical Supabase Settings to Check

### Go to Supabase Dashboard → Authentication → Settings

1. **Email Auth**
   - Enable email confirmations: Check if this is ON or OFF
   - If ON: Users must click email link before they can sign in
   - If OFF: Users can sign in immediately after signup

2. **Redirect URLs**
   - Add these allowed redirect URLs:
     ```
     http://localhost:3000/auth/callback
     https://your-production-domain.com/auth/callback
     ```

3. **Email Templates**
   - Confirm Email: Should contain `{{ .ConfirmationURL }}`
   - Make sure email delivery is working

## Testing Steps

### For Email/Password Auth:

1. **If Email Confirmation is ENABLED:**
   ```
   Step 1: Sign up with new email
   Step 2: You'll see "Check your email" message
   Step 3: Click link in email
   Step 4: You'll be redirected to /dashboard
   ```

2. **If Email Confirmation is DISABLED:**
   ```
   Step 1: Sign up with new email
   Step 2: Immediately redirected to /dashboard
   ```

### For Google OAuth:
   ```
   Step 1: Click "Continue with Google"
   Step 2: Select Google account
   Step 3: Redirected to /dashboard
   ```

## How to Disable Email Confirmation (Recommended for Development)

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/auth/settings
2. Scroll to "Email Auth"
3. Toggle OFF "Enable email confirmations"
4. Click "Save"

This allows immediate sign-in after signup without email verification.

## Debugging Commands

Check if a user exists in auth.users:
```sql
SELECT id, email, email_confirmed_at, last_sign_in_at
FROM auth.users
WHERE email = 'your-email@example.com';
```

Check if profile was created:
```sql
SELECT * FROM profiles WHERE email = 'your-email@example.com';
```

## Common Issues

### Issue: "Email not confirmed"
**Cause:** Email confirmation is enabled but user hasn't clicked the link
**Fix:** Check spam folder or disable email confirmation in Supabase settings

### Issue: "Invalid login credentials"
**Cause:** Trying to sign in before confirming email (when confirmation is enabled)
**Fix:** Click the confirmation link in your email first

### Issue: Google OAuth works but email doesn't
**Cause:** OAuth bypasses email confirmation; email auth requires it
**Fix:** Disable email confirmation or complete email verification

### Issue: Stuck on login page after OAuth
**Cause:** Session cookie not being set properly
**Fix:** Check browser console for errors; verify redirect URLs in Supabase

## What Was Changed

1. **`/app/api/auth/signup/route.ts`**
   - Added email confirmation detection
   - Added `emailRedirectTo` configuration
   - Returns different response if confirmation needed

2. **`/app/(auth)/signup/page.tsx`**
   - Added password match validation
   - Added success message display for email confirmation
   - Better error handling

3. **`/app/(auth)/login/page.tsx`**
   - Added success message for confirmed emails
   - Enhanced error message display
   - Shows auth callback errors

4. **`/app/auth/callback/route.ts`**
   - Enhanced error logging
   - Better redirect handling
   - Passes error messages to login page

5. **`.env`**
   - Added `NEXT_PUBLIC_SITE_URL` for proper redirects

## Next Steps

1. **Check your Supabase email confirmation setting**
   - Decide if you want it enabled or disabled
   - Update setting accordingly

2. **Test the flow**
   - Try signing up with a new email
   - Check if you receive confirmation email (if enabled)
   - Click the link and verify redirect to dashboard

3. **For existing email user**
   - If they never confirmed: They need to request a new confirmation email
   - OR disable email confirmation and they can sign in immediately

---

## RLS Policy Structure (Current)

### Core Tables Security

#### Profiles Table
- **SELECT**: Users can view their own profile OR profiles in workspaces they own
- **INSERT**: Users can create their own profile (automatic during signup)
- **UPDATE**: Users can only update their own profile

#### Workspaces Table
- **SELECT**: Users can view workspaces they own OR are members of
- **INSERT**: Users can create workspaces where they are the owner ✅
- **UPDATE**: Only workspace owners can update
- **DELETE**: Only workspace owners can delete

#### Workspace Members Table (No Recursion)
- **SELECT**: Users can view members if they own the workspace OR viewing their own membership ✅
- **INSERT**: Users can add themselves to workspaces they own ✅
- **UPDATE**: Only workspace owners can update member roles
- **DELETE**: Users can remove themselves OR owners can remove anyone

### Project Creation Flow

1. User clicks "Create Project"
2. System checks if user has a workspace
3. If no workspace:
   - Creates workspace with user as owner
   - Adds user to workspace_members table with 'owner' role
4. Creates project in the workspace
5. Creates default board
6. Creates 4 columns (To Do, In Progress, Review, Done)
7. Logs activity

**All steps now work without RLS errors!**

## Verification SQL

Run these in Supabase SQL Editor to verify everything is working:

```sql
-- Check all RLS policies
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'workspaces', 'workspace_members')
ORDER BY tablename, cmd;

-- Check if RLS is enabled on all tables
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'profiles', 'workspaces', 'workspace_members',
  'projects', 'boards', 'columns', 'tasks'
);
```

## Database Fix Script

If you encounter any RLS issues, run `DATABASE_FIX.sql` in Supabase SQL Editor to reset all policies.

## Production Checklist

- [ ] Set `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Add production domain to Supabase redirect URLs
- [ ] Configure email templates with your branding
- [ ] Test email delivery in production
- [ ] Enable email confirmation for production (recommended)
- [ ] Set up email rate limiting
- [x] Fix all RLS policies (no recursion)
- [x] Test project creation flow
- [x] Verify all CRUD operations work
