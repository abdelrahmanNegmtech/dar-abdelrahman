import type { ReactNode } from "react";
import { OwnerDesktopNavigation, OwnerMobileNavigation } from "@/components/owner/owner-navigation";
import { OwnerHeader } from "@/components/owner/owner-header";

export function OwnerShell({ children }: { children: ReactNode; active?: string; actions?: ReactNode; wide?: boolean; fluid?: boolean }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="owner-dashboard-frame">
        <OwnerDesktopNavigation />
        <section className="owner-dashboard-main">
          <OwnerHeader />
          {children}
          <OwnerMobileNavigation />
        </section>
      </div>
    </main>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] ${className}`}>{children}</section>;
}
