import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password');
  const isAuthCallback = pathname.startsWith('/auth/callback');
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/projects') || pathname.startsWith('/settings');
  const isPublicRoute = pathname === '/' || pathname.startsWith('/pricing');

  // Log authentication state for debugging
  if (error) {
    console.error('Auth error in middleware:', error);
  }

  if (isAuthCallback) {
    console.log('Auth callback detected, allowing through');
    return supabaseResponse;
  }

  const demoModeCookie = request.cookies.get('demo_mode');
  const isDemoMode = demoModeCookie?.value === 'true';

  if (isProtectedRoute && !user && !isDemoMode) {
    console.log('Protected route accessed without auth, redirecting to login:', pathname);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && user) {
    console.log('Auth route accessed with valid user, redirecting to dashboard:', user.email);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  if (isDemoMode && demoModeCookie) {
    supabaseResponse.cookies.set('demo_mode', 'true', {
      path: '/',
      maxAge: 86400,
    });
  }

  return supabaseResponse;
}
