'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function testConnection() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        setDetails({
          url: supabaseUrl,
          keyPrefix: supabaseKey?.substring(0, 20) + '...',
        });

        // Test basic fetch to Supabase
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            'apikey': supabaseKey || '',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Test Supabase client
        const supabase = createClient(supabaseUrl || '', supabaseKey || '');

        // Try a simple query
        const { data, error: queryError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);

        if (queryError) {
          throw new Error(`Query error: ${queryError.message}`);
        }

        setStatus('success');
        setDetails((prev: any) => ({
          ...prev,
          message: 'Connection successful!',
          queryResult: 'Database is accessible',
        }));
      } catch (err: any) {
        setStatus('error');
        setError(err.message || 'Unknown error');

        // Provide specific diagnostics
        if (err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_TIMED_OUT')) {
          setError('Cannot reach Supabase. Project may be paused or inactive.');
        } else if (err.message.includes('404')) {
          setError('Project not found. Check your SUPABASE_URL.');
        } else if (err.message.includes('401')) {
          setError('Authentication failed. Check your SUPABASE_ANON_KEY.');
        }
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-2 text-sm font-mono">
            <div>
              <span className="font-semibold">URL:</span>{' '}
              <span className="text-blue-600">{details?.url || 'Loading...'}</span>
            </div>
            <div>
              <span className="font-semibold">API Key:</span>{' '}
              <span className="text-gray-600">{details?.keyPrefix || 'Loading...'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>

          {status === 'checking' && (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Testing connection...</span>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Connection Successful!</span>
              </div>
              <p className="text-sm text-gray-600">{details?.message}</p>
              <p className="text-sm text-gray-600">{details?.queryResult}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Connection Failed</span>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-sm text-red-800 font-mono">{error}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Possible Solutions:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
                  <li>
                    <strong>Check if project is paused:</strong> Go to{' '}
                    <a
                      href="https://supabase.com/dashboard/project/obfadpfsccopptkycvhi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600"
                    >
                      your Supabase Dashboard
                    </a>{' '}
                    and resume the project if it's paused.
                  </li>
                  <li>
                    <strong>Verify credentials:</strong> Make sure your .env file has the correct SUPABASE_URL and SUPABASE_ANON_KEY.
                  </li>
                  <li>
                    <strong>Check project status:</strong> The project might be inactive or deleted.
                  </li>
                  <li>
                    <strong>Network issues:</strong> Ensure you have internet connectivity.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Quick Fix:</h3>
          <p className="text-sm text-blue-800">
            If your project <code className="bg-blue-100 px-1 rounded">obfadpfsccopptkycvhi</code> is paused:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 mt-2">
            <li>Visit the Supabase Dashboard</li>
            <li>Find project "obfadpfsccopptkycvhi"</li>
            <li>Click "Resume" or "Restore" button</li>
            <li>Wait 1-2 minutes for the project to become active</li>
            <li>Refresh this page to test again</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
