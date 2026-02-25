"use client";

import { useAuth } from '@/components/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DebugAuthStatePage() {
  const { user, profile, loading } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  const checkSession = async () => {
    setChecking(true);
    const supabase = createClient();

    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      setSessionInfo({
        hasSession: !!session,
        sessionError: error?.message || null,
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || null,
        expiresAt: session?.expires_at || null,
      });
    } catch (err: any) {
      setSessionInfo({
        error: err.message,
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Auth State Debug</h1>
          <p className="text-muted-foreground">Check authentication state</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Auth Provider State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>User:</strong>
              <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Profile:</strong>
              <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supabase Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkSession} disabled={checking}>
              {checking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Refresh Session Info'
              )}
            </Button>

            {sessionInfo && (
              <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto">
                {JSON.stringify(sessionInfo, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
