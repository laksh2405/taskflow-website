import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const origin = (await headers()).get('origin') || 'http://localhost:3000'
  const { provider } = await request.json()

  if (!provider || !['google', 'github'].includes(provider)) {
    return NextResponse.json(
      { error: 'Invalid provider' },
      { status: 400 }
    )
  }

  const response = NextResponse.json({ url: '' })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as 'google' | 'github',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ url: data.url })
}
