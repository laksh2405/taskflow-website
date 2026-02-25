# Authentication Debugging Guide

## Test the Authentication Flow

### Step 1: Check Browser Console
Open your browser's Developer Tools (F12) and go to the Console tab. Try to sign in and look for any JavaScript errors.

### Step 2: Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try to sign in
4. Look for the `/api/auth/signin` or `/api/auth/oauth` request
5. Click on it and check:
   - Status Code (should be 200)
   - Response body (look for error messages)
   - Cookies (should see supabase cookies being set)

### Step 3: Check Cookies
After attempting sign in:
1. Open Developer Tools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Look under Cookies → http://localhost:3000
4. You should see cookies like:
   - `sb-obfadpfsccopptkycvhi-auth-token`
   - `sb-obfadpfsccopptkycvhi-auth-token-code-verifier`

If these cookies are NOT there after login, the session isn't being created.

### Step 4: Test Email Login Directly

Open browser console and run this:

```javascript
fetch('/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'lakshmanan.ravi@skillovilla.com',
    password: 'YOUR_PASSWORD_HERE'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

Look for the response. It should be `{success: true}` or an error message.

### Step 5: Test Google OAuth Flow

The OAuth flow should:
1. Redirect you to Google
2. After Google login, redirect to `/auth/callback?code=XXXXX`
3. Exchange code for session
4. Redirect to `/dashboard`

If it's stuck at step 2 or 3, check the callback route logs.

## Common Issues & Solutions

### Issue 1: "Invalid login credentials"
**Cause:** Wrong password or email not confirmed
**Solution:**
- Make sure you're using the correct password
- Check if email confirmation is required in Supabase settings
- For the user `lakshmananravi2405@gmail.com` who never signed in, they need to either:
  - Click the confirmation email (if you have it)
  - OR you disable email confirmation in Supabase

### Issue 2: Stuck on login page after successful auth
**Cause:** Session cookies not being set or middleware blocking
**Solution:**
1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify cookies are being set
4. Check that middleware isn't redirecting in a loop

### Issue 3: OAuth works but email doesn't
**Cause:** Email confirmation enabled but not handled
**Solution:** Disable email confirmation in Supabase (see below)

### Issue 4: Redirects to login immediately after signin
**Cause:** Session not persisting or middleware not detecting session
**Solution:**
1. Check if cookies are httpOnly (they should be)
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` match your Supabase project
3. Check middleware.ts is properly configured

## How to Disable Email Confirmation in Supabase

1. Go to: https://supabase.com/dashboard/project/obfadpfsccopptkycvhi/auth/settings
2. Scroll to "Email Auth"
3. Find "Enable email confirmations"
4. Toggle it OFF
5. Click "Save"

Now email signups will work immediately without confirmation.

## Test Database Connection

Run this in browser console after login:

```javascript
// This won't work in console, but you can add it to a page temporarily
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://obfadpfsccopptkycvhi.supabase.co',
  'your-anon-key-here'
);

supabase.auth.getSession().then(({ data }) => {
  console.log('Session:', data.session);
  console.log('User:', data.session?.user);
});
```

If `data.session` is null, you're not logged in.

## Manual Database Check

Check if user can actually sign in:

1. Go to Supabase SQL Editor
2. Run:
```sql
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  u.last_sign_in_at,
  p.name,
  p.created_at as profile_created_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'lakshmanan.ravi@skillovilla.com';
```

This will show you:
- If user exists
- If email is confirmed
- When they last signed in
- If profile was created

## Force Sign In a User (For Testing)

If you want to test with the existing users who haven't signed in:

**Option A: Reset their password**
1. Go to Supabase Dashboard → Authentication → Users
2. Find the user
3. Click the three dots → "Send Password Reset Email"
4. Click the link in email
5. Set new password
6. Try signing in

**Option B: Create a fresh test user**
1. Use a new email address
2. Sign up through the app
3. If email confirmation is disabled, you'll be signed in immediately

## Current User Status

Based on the database query:

1. **lakshmanan.ravi@skillovilla.com**
   - ✅ Email confirmed
   - ✅ Has signed in successfully
   - ✅ Profile created
   - **This user SHOULD work for login**

2. **lakshmananravi9@gmail.com** (Google OAuth)
   - ✅ Email confirmed
   - ✅ Has signed in successfully
   - ✅ Profile created
   - **This user SHOULD work for Google OAuth**

3. **lakshmananravi2405@gmail.com**
   - ✅ Email confirmed (via Google OAuth originally)
   - ❌ Never signed in with email/password
   - ✅ Profile created
   - **This user signed up but never completed login - might need password reset**

## What to Try Now

1. **Try logging in with** `lakshmanan.ravi@skillovilla.com` (the newest account)
   - This user has successfully signed in before
   - Should work with correct password

2. **Try Google OAuth** with `lakshmananravi9@gmail.com`
   - This has worked before
   - Should redirect to dashboard

3. **If both fail**, open browser console and check for errors
   - Share the error messages with me
   - Check Network tab for failed requests
   - Verify cookies are being set

## Screenshot What You See

If you're still having issues, please share screenshots of:
1. Browser console errors (if any)
2. Network tab showing the /api/auth/signin or /auth/callback request
3. Cookies tab showing what cookies are set
4. The exact error message you see on screen

This will help me identify the exact issue!
