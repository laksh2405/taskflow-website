'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function TestWebhookPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testWebhook = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        error: 'Failed to test webhook',
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>n8n Webhook Test</CardTitle>
          <CardDescription>
            Test the connection to your n8n webhook endpoint
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Click the button below to send a test payload to your n8n webhook.
            </p>
          </div>

          <Button onClick={testWebhook} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Testing...' : 'Test Webhook'}
          </Button>

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">
                    {result.success ? 'Webhook triggered successfully!' : 'Webhook test failed'}
                  </p>
                  <div className="mt-4 bg-muted p-4 rounded-md">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
