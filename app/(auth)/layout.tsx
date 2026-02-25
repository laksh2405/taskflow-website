import Link from 'next/link';
import { Layers, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20" />
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05]" style={{ maskImage: 'radial-gradient(ellipse at center, transparent 20%, black)' }} />

      <div className="relative">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="w-full max-w-[420px]">
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl mb-2">
                <Layers className="h-8 w-8" />
                <span>TaskFlow</span>
              </Link>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
