"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function CheckEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const hasUrl = !!supabaseUrl;
  const hasKey = !!supabaseAnonKey;
  const hasSite = !!siteUrl;

  const allConfigured = hasUrl && hasKey && hasSite;

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Environment Variables Check</h1>
          <p className="text-muted-foreground">Verify that all required environment variables are configured</p>
        </div>

        {allConfigured ? (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              All environment variables are properly configured!
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Some environment variables are missing. Please configure them in your Netlify dashboard.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Configuration Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {hasUrl ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL</span>
              </div>
              <code className="text-xs bg-background px-2 py-1 rounded">
                {supabaseUrl || 'NOT SET'}
              </code>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {hasKey ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              </div>
              <code className="text-xs bg-background px-2 py-1 rounded">
                {supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET'}
              </code>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {hasSite ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <span className="font-medium">NEXT_PUBLIC_SITE_URL</span>
              </div>
              <code className="text-xs bg-background px-2 py-1 rounded">
                {siteUrl || 'NOT SET'}
              </code>
            </div>
          </CardContent>
        </Card>

        {!allConfigured && (
          <Card>
            <CardHeader>
              <CardTitle>How to Fix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Step 1: Go to Netlify Dashboard</h3>
                <p className="text-muted-foreground">
                  Navigate to:{' '}
                  <a
                    href="https://app.netlify.com/sites/famous-gelato-043156/settings/deploys#environment-variables"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Netlify Environment Variables
                  </a>
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 2: Add Missing Variables</h3>
                <div className="space-y-2">
                  {!hasUrl && (
                    <div className="p-2 bg-muted rounded">
                      <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code>
                    </div>
                  )}
                  {!hasKey && (
                    <div className="p-2 bg-muted rounded">
                      <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                    </div>
                  )}
                  {!hasSite && (
                    <div className="p-2 bg-muted rounded">
                      <code className="text-xs">NEXT_PUBLIC_SITE_URL</code>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 3: Redeploy</h3>
                <p className="text-muted-foreground">
                  After adding the variables, trigger a new deployment from the Netlify dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
