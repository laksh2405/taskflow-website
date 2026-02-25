"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-8">
            <AlertCircle className="h-24 w-24 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground text-lg">
            An error occurred while loading this page. Please try again.
          </p>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Error details
              </summary>
              <pre className="mt-2 rounded-lg bg-muted p-4 text-xs overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
        <Button size="lg" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
