import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "table-row" | "page" | "board";
  className?: string;
  count?: number;
}

export function LoadingSkeleton({
  variant = "card",
  className,
  count = 1,
}: LoadingSkeletonProps) {
  if (variant === "card") {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-lg border bg-card p-4 space-y-3 animate-pulse",
              className
            )}
          >
            <div className="flex items-start justify-between">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-6 w-16 bg-muted rounded-full"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-muted rounded"></div>
              <div className="h-5 w-20 bg-muted rounded"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <div className="h-4 w-12 bg-muted rounded"></div>
                <div className="h-4 w-12 bg-muted rounded"></div>
              </div>
              <div className="h-8 w-8 bg-muted rounded-full"></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (variant === "table-row") {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <tr key={i} className="border-b">
            <td className="p-4">
              <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
            </td>
            <td className="p-4">
              <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
            </td>
            <td className="p-4">
              <div className="h-6 w-24 bg-muted rounded-full animate-pulse"></div>
            </td>
            <td className="p-4">
              <div className="h-6 w-20 bg-muted rounded-full animate-pulse"></div>
            </td>
            <td className="p-4">
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
            </td>
            <td className="p-4">
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            </td>
            <td className="p-4">
              <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
            </td>
          </tr>
        ))}
      </>
    );
  }

  if (variant === "board") {
    return (
      <div className="flex gap-4 h-full overflow-x-auto p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-80 space-y-3">
            <div className="h-10 bg-muted rounded animate-pulse"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className="rounded-lg border bg-card p-4 space-y-3 animate-pulse"
                >
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-muted rounded"></div>
                    <div className="h-5 w-20 bg-muted rounded"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-12 bg-muted rounded"></div>
                    <div className="h-8 w-8 bg-muted rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div className="flex h-screen">
        <div className="w-64 border-r bg-muted/20 p-4 space-y-4 animate-pulse">
          <div className="h-12 bg-muted rounded"></div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded"></div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-6 space-y-4">
          <div className="h-12 bg-muted rounded w-1/3 animate-pulse"></div>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
