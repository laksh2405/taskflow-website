"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      setTestResult(`Error: ${error.message}`);
    } else if (session) {
      setSession(session);
      setUser(session.user);
      setTestResult('Authenticated!');
    } else {
      setTestResult('Not authenticated');
    }
    setLoading(false);
  };

  const testSignIn = async () => {
    const email = prompt('Enter email:');
    const password = prompt('Enter password:');

    if (!email || !password) return;

    setLoading(true);
    setTestResult('Attempting sign in...');

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setTestResult(`Sign in failed: ${error.message}`);
    } else if (data.session) {
      setSession(data.session);
      setUser(data.user);
      setTestResult('Sign in successful!');
    } else {
      setTestResult('Sign in returned no session');
    }
    setLoading(false);
  };

  const testSignOut = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setTestResult('Signed out');
    setLoading(false);
  };

  return (
    <div className="container max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Authentication Test Page</h1>

      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
          <CardDescription>Check if you're currently authenticated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="font-medium">Status: <span className={session ? 'text-green-600' : 'text-red-600'}>{testResult}</span></p>

            {loading && <p>Loading...</p>}

            {user && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">User Info:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(user, null, 2)}</pre>
              </div>
            )}

            {session && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Session Info:</h3>
                <p><strong>Access Token:</strong> {session.access_token.substring(0, 20)}...</p>
                <p><strong>Expires At:</strong> {new Date(session.expires_at * 1000).toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={checkAuth} disabled={loading}>
              Refresh Status
            </Button>
            {!session && (
              <Button onClick={testSignIn} disabled={loading}>
                Test Sign In
              </Button>
            )}
            {session && (
              <Button onClick={testSignOut} variant="destructive" disabled={loading}>
                Sign Out
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Users</CardTitle>
          <CardDescription>These users exist in your Supabase database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
              <p className="font-semibold">lakshmanan.ravi@skillovilla.com</p>
              <p className="text-xs text-muted-foreground">✅ Email confirmed | ✅ Has signed in | ✅ Profile created</p>
              <p className="text-xs mt-1">This user should work for email login</p>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
              <p className="font-semibold">lakshmananravi9@gmail.com</p>
              <p className="text-xs text-muted-foreground">✅ Email confirmed | ✅ Has signed in | ✅ Profile created</p>
              <p className="text-xs mt-1">This user should work for Google OAuth</p>
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
              <p className="font-semibold">lakshmananravi2405@gmail.com</p>
              <p className="text-xs text-muted-foreground">✅ Email confirmed | ⚠️ Never signed in | ✅ Profile created</p>
              <p className="text-xs mt-1">This user created account but never completed login</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Debugging Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold">1. Open Browser Console (F12)</p>
            <p className="text-muted-foreground">Look for any red error messages</p>
          </div>
          <div>
            <p className="font-semibold">2. Check Network Tab</p>
            <p className="text-muted-foreground">Monitor requests when you click "Test Sign In"</p>
          </div>
          <div>
            <p className="font-semibold">3. Check Cookies</p>
            <p className="text-muted-foreground">After sign in, look for cookies starting with "sb-obfadpfsccopptkycvhi"</p>
          </div>
          <div>
            <p className="font-semibold">4. If it works here but not on /login</p>
            <p className="text-muted-foreground">The issue is with the login page implementation, not Supabase</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
