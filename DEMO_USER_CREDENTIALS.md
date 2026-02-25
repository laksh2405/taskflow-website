# Demo User Credentials

A test user has been created for testing the authentication flow on the published application.

## Published Application URL
**https://next-js-14-taskflow-geex.bolt.host/**

## Demo User Credentials

**Email:** `demouser@taskflow.com`
**Password:** `DemoPassword123!`

## User Details

- **User ID:** `34167619-072d-4a9a-93a7-f428810aca4f`
- **Full Name:** Demo User
- **Created:** 2026-02-24

## Authentication Flow Test Results

### 1. User Creation ✓
- User successfully created in `auth.users` table
- Profile automatically created in `profiles` table via database trigger
- User metadata stored correctly

### 2. Database Storage ✓
```sql
-- User exists in auth.users
SELECT id, email FROM auth.users WHERE email = 'demouser@taskflow.com';
-- Returns: 34167619-072d-4a9a-93a7-f428810aca4f, demouser@taskflow.com

-- Profile exists in profiles table
SELECT id, name, email FROM profiles WHERE id = '34167619-072d-4a9a-93a7-f428810aca4f';
-- Returns: 34167619-072d-4a9a-93a7-f428810aca4f, Demo User, demouser@taskflow.com
```

### 3. Login Functionality ✓
- Login via Supabase client works correctly
- Session and access token generated successfully
- Authentication persists across requests

### 4. Protected Routes ✓
- Middleware correctly protects `/dashboard`, `/projects`, and `/settings` routes
- Unauthenticated access to protected routes redirects to `/login`
- Authenticated users are redirected from auth pages (`/login`, `/signup`) to `/dashboard`

### 5. Dashboard Access ✓
- After successful login, users are redirected to `/dashboard`
- Dashboard loads user profile data via `useAuth` hook
- Personalized greeting displays user's first name

## How to Test Manually

1. Visit **https://next-js-14-taskflow-geex.bolt.host/login**
2. Enter credentials:
   - Email: `demouser@taskflow.com`
   - Password: `DemoPassword123!`
3. Click "Sign In"
4. You should be redirected to the dashboard at `/dashboard`
5. The dashboard will display: "Good [time of day], Demo"

## Architecture

### Middleware Protection
The app uses Next.js middleware (`middleware.ts`) to:
- Check authentication state on every request
- Redirect unauthenticated users from protected routes to login
- Redirect authenticated users from auth pages to dashboard
- Update session cookies automatically

### Authentication Flow
```
Login Form → /api/auth/signin → Supabase Auth → Set Cookies → Redirect to /dashboard
                                      ↓
                                 Update Session
                                      ↓
                                 Middleware Check
                                      ↓
                              Allow Dashboard Access
```

### Session Management
- Sessions are stored in HTTP-only cookies
- Middleware automatically refreshes sessions
- Auth state is managed by Supabase SSR package
