"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function TestLoginPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('TestPassword123!');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const handleSignUp = async () => {
    setLoading(true);
    setMessage('');
    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage(`Success! User created: ${data.user?.email}`);
        checkSession();
      }
    } catch (err: any) {
      setMessage(`Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setMessage('');
    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage(`Success! Logged in as: ${data.user?.email}`);
        checkSession();
      }
    } catch (err: any) {
      setMessage(`Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setMessage('');
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('Logged out successfully');
        setSessionInfo(null);
      }
    } catch (err: any) {
      setMessage(`Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    setSessionInfo({
      hasSession: !!session,
      error: error?.message || null,
      userId: session?.user?.id || null,
      email: session?.user?.email || null,
      expiresAt: session?.expires_at || null,
    });
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Test Authentication</h1>
          <p className="text-muted-foreground">Test Supabase auth flow</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSignUp} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign Up'}
              </Button>
              <Button onClick={handleSignIn} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
              </Button>
              <Button onClick={handleSignOut} disabled={loading} variant="outline">
                Sign Out
              </Button>
              <Button onClick={checkSession} variant="outline">
                Check Session
              </Button>
            </div>

            {message && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{message}</p>
              </div>
            )}

            {sessionInfo && (
              <div>
                <h3 className="font-medium mb-2">Current Session:</h3>
                <pre className="p-4 bg-muted rounded-lg overflow-auto text-xs">
                  {JSON.stringify(sessionInfo, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p className="font-medium">To fix authentication, add these URLs to Supabase:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Go to Supabase Dashboard</li>
                <li>Click Authentication &gt; URL Configuration</li>
                <li>Add to Redirect URLs:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li><code className="bg-muted px-1 rounded">https://famous-gelato-043156.netlify.app/auth/callback</code></li>
                    <li><code className="bg-muted px-1 rounded">https://famous-gelato-043156.netlify.app/**</code></li>
                  </ul>
                </li>
                <li>Set Site URL to: <code className="bg-muted px-1 rounded">https://famous-gelato-043156.netlify.app</code></li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
