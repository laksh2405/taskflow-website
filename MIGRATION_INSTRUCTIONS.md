# Migration Instructions: Moving from rwmijuipqdigfpxqurz to obfadpfsccopptkycvhi

## Overview
This guide will help you migrate your complete TaskFlow database schema and configuration from the current working project (`rwmijuipqdigfpxqurz`) to your old project (`obfadpfsccopptkycvhi`).

---

## Prerequisites

Before starting, ensure:
1. You have access to the Supabase Dashboard for project `obfadpfsccopptkycvhi`
2. The project is **active and not paused** (check your Supabase dashboard)
3. You have owner/admin access to the project

---

## Step 1: Verify Project Status

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Find project `obfadpfsccopptkycvhi`
3. Ensure the project status is "Active" (green indicator)
4. If paused, click "Restore project" or "Resume project"

---

## Step 2: Access SQL Editor

1. In the Supabase Dashboard, select project `obfadpfsccopptkycvhi`
2. Navigate to **SQL Editor** from the left sidebar
3. Click **New Query** to create a new SQL query tab

---

## Step 3: Run the Migration

1. Open the file `MIGRATION_EXPORT_COMPLETE.sql` in this project directory
2. **Copy the ENTIRE contents** of the file (all ~1200+ lines)
3. **Paste** into the SQL Editor in Supabase Dashboard
4. Click **Run** (or press Ctrl/Cmd + Enter)
5. **Wait** for the query to complete (may take 30-60 seconds)

---

## Step 4: Verify Migration Success

After running the migration, verify it was successful:

### Check Tables Created
Run this query in the SQL Editor:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see these tables:
- activity_log
- attachments
- boards
- columns
- comments
- labels
- profiles
- projects
- subtasks
- task_labels
- tasks
- workspace_members
- workspaces

### Check RLS Policies
Run this query to verify Row Level Security policies:
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

You should see multiple policies for each table.

### Check Helper Functions
Run this query to verify helper functions:
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION';
```

You should see:
- get_workspace_role
- handle_new_user
- is_workspace_member

---

## Step 5: Update Environment Variables (ALREADY DONE)

The `.env` file has been updated to point to project `obfadpfsccopptkycvhi`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://obfadpfsccopptkycvhi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The service role key has been corrected to match the `obfadpfsccopptkycvhi` project.

---

## Step 6: Test Authentication

1. Clear your browser cache and cookies
2. Start the development server (if not already running)
3. Navigate to the signup page
4. Create a new test user account
5. Verify:
   - User can sign up successfully
   - Profile is created automatically in the `profiles` table
   - No errors in the browser console

### Verify Profile Creation
In SQL Editor, run:
```sql
SELECT id, name, email, created_at
FROM profiles;
```

You should see your test user.

---

## Step 7: Test Workspace Creation

1. While logged in, create a new workspace
2. Verify the workspace appears in your dashboard
3. Check the database:

```sql
SELECT w.name, w.slug, w.owner_id, p.name as owner_name
FROM workspaces w
JOIN profiles p ON p.id = w.owner_id;
```

---

## Step 8: Test Full Application Flow

1. Create a project within your workspace
2. Create a board within the project
3. Add some tasks to the board
4. Verify everything works without errors

---

## Troubleshooting

### Error: "relation already exists"
- Some tables may already exist in your database
- The migration uses `CREATE TABLE IF NOT EXISTS`, so this is usually safe
- If you need a clean slate, you can drop all tables first (be careful!)

### Error: "permission denied"
- Ensure you're logged in as the database owner
- Check that RLS policies aren't blocking operations
- Verify service role key is correct

### Error: "infinite recursion detected"
- This should not happen with the final migration
- If it does, check that all policies from migration 6 & 7 were applied

### Authentication not working
- Verify the `.env` file has the correct project credentials
- Check that the `handle_new_user()` trigger is installed
- Ensure the `profiles` table has the correct columns

### Can't create workspace
- Check that workspace policies were created correctly
- Verify you're logged in and authenticated
- Run the workspace verification query above

---

## What Was Migrated

### Database Schema
- 13 tables with proper relationships and constraints
- All indexes for performance optimization
- Automatic timestamp triggers
- Profile auto-creation trigger

### Security (Row Level Security)
- All tables have RLS enabled
- 60+ security policies for fine-grained access control
- Workspace-based access control
- Role-based permissions (owner, admin, member, guest)

### Helper Functions
- `is_workspace_member()` - Check workspace membership
- `get_workspace_role()` - Get user's role in workspace
- `handle_new_user()` - Auto-create profile on signup

---

## Files in This Project

1. **MIGRATION_EXPORT_COMPLETE.sql** - Complete SQL migration file (run this in Supabase)
2. **MIGRATION_INSTRUCTIONS.md** - This file (step-by-step guide)
3. **.env** - Updated with obfadpfsccopptkycvhi credentials

---

## Next Steps After Migration

1. Test all major features of the application
2. Optionally, export data from `rwmijuipqdigfpxqurz` and import to `obfadpfsccopptkycvhi`
3. Update any external services pointing to the old project
4. Consider deactivating the old project once migration is confirmed successful

---

## Support

If you encounter issues:
1. Check the Supabase logs (Database → Logs)
2. Verify all migration steps were completed
3. Check browser console for errors
4. Review the RLS policies to ensure they're not too restrictive

---

## Summary

This migration includes:
- Complete database schema (13 tables)
- Row Level Security policies (60+ policies)
- Helper functions for access control
- Auto-update triggers for timestamps
- Profile auto-creation on user signup
- Updated environment variables

The migration is designed to be idempotent (safe to run multiple times) using `IF NOT EXISTS` and `DROP POLICY IF EXISTS` statements.

**Good luck with your migration!**
