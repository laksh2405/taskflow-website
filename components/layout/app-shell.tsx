"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { useSidebar } from '@/hooks/use-sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { CommandPalette } from '@/components/shared/command-palette';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isCollapsed, toggle, isMobileOpen, toggleMobile, closeMobile } = useSidebar();
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:flex">
        <Sidebar isCollapsed={isCollapsed} onToggle={toggle} />
      </div>

      <Sheet open={isMobileOpen} onOpenChange={toggleMobile}>
        <SheetContent side="left" className="p-0 w-[260px]">
          <Sidebar isCollapsed={false} onToggle={closeMobile} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMobileMenuToggle={toggleMobile} onCommandToggle={() => setCommandOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-muted/20">
          {children}
        </main>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
