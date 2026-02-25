'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';

export default function DebugSupabasePage() {
  const { user } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    setSessionInfo(data);
  };

  const testConnection = async () => {
    setLoading(true);
    const supabase = createClient();
    const results: any = {};

    try {
      const { data: session } = await supabase.auth.getSession();
      results.session = { success: !!session.session, data: session };
    } catch (error: any) {
      results.session = { success: false, error: error.message };
    }

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('id')
        .limit(1);
      results.workspaceQuery = { success: !error, data, error: error?.message };
    } catch (error: any) {
      results.workspaceQuery = { success: false, error: error.message };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user?.id || 'test')
        .maybeSingle();
      results.profileQuery = { success: !error, data, error: error?.message };
    } catch (error: any) {
      results.profileQuery = { success: false, error: error.message };
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Supabase Debug Info</h1>

      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Environment</h2>
          <pre className="bg-muted p-3 rounded text-xs overflow-auto">
            {JSON.stringify(
              {
                url: process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
              },
              null,
              2
            )}
          </pre>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Current User</h2>
          <pre className="bg-muted p-3 rounded text-xs overflow-auto">
            {JSON.stringify(
              {
                id: user?.id,
                email: user?.email,
                createdAt: user?.created_at,
              },
              null,
              2
            )}
          </pre>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Session Info</h2>
          <pre className="bg-muted p-3 rounded text-xs overflow-auto">
            {JSON.stringify(
              {
                hasSession: !!sessionInfo?.session,
                expiresAt: sessionInfo?.session?.expires_at,
                user: sessionInfo?.session?.user?.email,
              },
              null,
              2
            )}
          </pre>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Connection Tests</h2>
          <button
            onClick={testConnection}
            disabled={loading}
            className="mb-4 px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Run Tests'}
          </button>
          <pre className="bg-muted p-3 rounded text-xs overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
