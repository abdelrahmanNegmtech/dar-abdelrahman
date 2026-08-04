"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/features/design-system/lib/cn";
import type { SidebarSection } from "../sidebar.types";

// ── Props ── //
export type SidebarProps = {
  sections: SidebarSection[];
  title: string;
  subtitle: string;
  footer?: ReactNode;
};

// ── Generic Sidebar ── //
export function Sidebar({ sections, title, subtitle, footer }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="dar-surface-dark flex w-[var(--sidebar-width)] shrink-0 flex-col border-r border-[var(--sidebar-dark-border)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--sidebar-dark-border)] px-5 py-5">
        <div className="flex size-10 items-center justify-center rounded-[var(--radius-lg)] bg-brand/20 text-sm font-bold text-brand-soft ring-1 ring-inset ring-white/10">
          D
        </div>
        <div>
          <h1 className="text-sm font-semibold text-[var(--sidebar-dark-foreground)]">
            {title}
          </h1>
          <p className="text-xs text-[var(--sidebar-dark-muted)]">{subtitle}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto dar-scrollbar px-3 py-4">
        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[var(--sidebar-dark-muted)]">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                // Active when exact match or when current path starts with item href + "/"
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-brand-soft/20 text-[var(--sidebar-dark-foreground)]"
                          : "text-[var(--sidebar-dark-muted)] hover:bg-white/5 hover:text-[var(--sidebar-dark-foreground)]",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <item.icon
                        className={cn(
                          "size-5 shrink-0",
                          isActive
                            ? "text-brand"
                            : "text-[var(--sidebar-dark-muted)]",
                        )}
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.badge ? (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold",
                            isActive
                              ? "bg-brand text-white"
                              : "bg-white/10 text-[var(--sidebar-dark-muted)]",
                          )}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div className="border-t border-[var(--sidebar-dark-border)] px-4 py-4">
          {footer}
        </div>
      )}
    </aside>
  );
}

// ── Pre-configured Admin Sidebar (backward compatible) ── //
import { adminSidebarSections, ownerSidebarSections } from "../sidebar.data";

export function AdminSidebar() {
  return (
    <Sidebar
      sections={adminSidebarSections}
      title="DAR"
      subtitle="Admin Console"
      footer={
        <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-white/5 px-3 py-2.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-brand/20 text-xs font-bold text-brand-soft">
            AD
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--sidebar-dark-foreground)]">
              Admin
            </p>
            <p className="truncate text-xs text-[var(--sidebar-dark-muted)]">
              Administrator
            </p>
          </div>
        </div>
      }
    />
  );
}

// ── Pre-configured Owner Sidebar ── //
export function OwnerSidebar() {
  return (
    <Sidebar
      sections={ownerSidebarSections}
      title="Owner Portal"
      subtitle="Manage your properties"
    />
  );
}
