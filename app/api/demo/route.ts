import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  const response = NextResponse.json({ success: true });

  cookieStore.set('demo_mode', 'true', {
    path: '/',
    maxAge: 86400,
    sameSite: 'lax',
  });

  response.cookies.set('demo_mode', 'true', {
    path: '/',
    maxAge: 86400,
    sameSite: 'lax',
  });

  return response;
}
