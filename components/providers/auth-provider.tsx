'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { useRouter } from 'next/navigation'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  isDemoMode: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkDemoMode = () => {
      const demoModeCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('demo_mode='))
        ?.split('=')[1];
      setIsDemoMode(demoModeCookie === 'true');
    };

    const initAuth = async () => {
      try {
        checkDemoMode();

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        console.log('AuthProvider initAuth:', {
          hasSession: !!session,
          sessionError,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
        });

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle()

          if (profileError) {
            console.error('Profile fetch error:', profileError)
          } else {
            console.log('Profile loaded successfully')
          }

          setProfile(profileData)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          const currentUser = session?.user ?? null
          setUser(currentUser)

          if (currentUser) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .maybeSingle()

            if (profileError) {
              console.error('Profile fetch error in auth state change:', profileError)
            }

            setProfile(profileData)
          } else {
            setProfile(null)
          }
        })()
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const refreshProfile = async () => {
    if (!user) return;

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Profile refresh error:', profileError)
    }

    setProfile(profileData)
  }

  const signOut = async () => {
    try {
      if (isDemoMode) {
        document.cookie = 'demo_mode=; path=/; max-age=0';
        window.location.href = '/';
        return;
      }

      await fetch('/api/auth/signout', {
        method: 'POST',
      });
      window.location.href = '/login';
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, isDemoMode, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
