# Connection Error Fix Guide

## Current Problem

You're getting `ERR_CONNECTION_TIMED_OUT` and `Failed to fetch` errors when trying to connect to your Supabase project `obfadpfsccopptkycvhi`. This means the Supabase project is **not reachable**.

---

## Most Likely Cause: Paused Project

Supabase **automatically pauses** free-tier projects after a period of inactivity. This is the most common reason for connection timeouts.

---

## Solution Options

### Option 1: Resume Your Paused Project (RECOMMENDED)

If your project `obfadpfsccopptkycvhi` is paused, here's how to resume it:

#### Steps:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Log in to your account
3. Find project **obfadpfsccopptkycvhi** in your project list
4. Look for a status indicator (it might say "Paused" or show a pause icon)
5. Click the **"Resume"** or **"Restore"** button
6. Wait **1-2 minutes** for the project to become fully active
7. Visit `/test-connection` in your app to verify the connection

#### How to Access Directly:
Visit: https://supabase.com/dashboard/project/obfadpfsccopptkycvhi

---

### Option 2: Use the Working Project (ALTERNATIVE)

If you cannot resume `obfadpfsccopptkycvhi`, you can switch back to the working project:

#### Update `.env` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://rwmijuipqdigfpxqurz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3bWlqdWlwcWRpZ2ZwcHhxdXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NjYzNDUsImV4cCI6MjA4NzE0MjM0NX0.hVrOECbG3sUmJLQZdJJ4XfyU0VzA48TQJOxD-rIOqOw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3bWlqdWlwcWRpZ2ZwcHhxdXJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU2NjM0NSwiZXhwIjoyMDg3MTQyMzQ1fQ.xpYS9Iz9jCPE-d5tWrjCWr8fCk0d1ZF3gyM0CUDhA1c
NEXT_PUBLIC_SITE_URL=https://next-js-14-taskflow-geex.bolt.host
```

**Note:** This project (`rwmijuipqdigfpxqurz`) is currently working and has all your data.

---

### Option 3: Create a Fresh Supabase Project (LAST RESORT)

If neither option works, you can create a new Supabase project:

#### Steps:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Choose:
   - Organization: Your organization
   - Name: TaskFlow (or any name)
   - Database Password: Choose a strong password (save it!)
   - Region: Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup
6. Copy the new project credentials:
   - Project URL
   - Anon (public) key
   - Service role key
7. Update your `.env` file with new credentials
8. Run the migration from `MIGRATION_EXPORT_COMPLETE.sql`

---

## Diagnostic Tool

I've created a connection test page for you:

### Access it at:
```
http://localhost:3000/test-connection
```

This page will:
- ✅ Show your current Supabase configuration
- ✅ Test the connection in real-time
- ✅ Provide specific error diagnostics
- ✅ Give you direct links to fix the issue

---

## Understanding the Error

The error you're seeing:
```
Failed to fetch: ERR_CONNECTION_TIMED_OUT
```

Means:
- Your browser/app **cannot reach** the Supabase server
- The project is likely **paused** or **inactive**
- The URL might be wrong (but yours looks correct)
- Network/firewall issues (less likely)

---

## Why Projects Get Paused

Supabase free-tier projects:
- Pause after **7 days of inactivity**
- Can be resumed anytime (free)
- Take 1-2 minutes to resume
- Keep all your data intact

---

## Step-by-Step Fix (Most Common)

1. **Check Project Status**
   - Go to: https://supabase.com/dashboard
   - Look at project `obfadpfsccopptkycvhi`
   - Status should be "Active" (green)

2. **If Paused**
   - Click the project
   - Click "Resume" button
   - Wait 2 minutes

3. **Test Connection**
   - Go to `/test-connection` in your app
   - Should show "Connection Successful!"

4. **Try Creating Project Again**
   - Go to `/dashboard`
   - Click "New Project"
   - Should work now!

---

## Alternative: Use Current Working Database

Your project `rwmijuipqdigfpxqurz` is **currently working** and has:
- ✅ All tables set up
- ✅ All RLS policies
- ✅ Active and responsive
- ✅ Ready to use

You don't need to migrate if you want to keep using it!

---

## What To Do Right Now

### Immediate Action:
1. **Visit** the test page: `http://localhost:3000/test-connection`
2. **Check** what error it shows
3. **Go to** Supabase Dashboard
4. **Resume** the project if paused

### If You Can't Resume:
1. **Keep using** `rwmijuipqdigfpxqurz` (it's working!)
2. **Or create** a new project and run the migration

---

## Need Help?

If you're still stuck, share:
1. What you see on `/test-connection`
2. The status of your project in Supabase Dashboard
3. Whether you can see the project in your dashboard at all

---

## Summary

**Problem:** Cannot connect to `obfadpfsccopptkycvhi`
**Most Likely Cause:** Project is paused
**Best Solution:** Resume the project in Supabase Dashboard
**Alternative:** Keep using `rwmijuipqdigfpxqurz` (it's working!)
**Test Tool:** `/test-connection` page
