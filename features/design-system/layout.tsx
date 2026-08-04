import type { ComponentPropsWithoutRef, ReactNode } from "react";

import Image from "next/image";
import { ChevronDown, ChevronRight, Headphones, Search, Shield } from "lucide-react";

import { cn } from "@/features/design-system/lib/cn";
import { Button, Card, IconButton, Separator } from "@/features/design-system/primitives";
import type { SidebarGroup, SidebarLink, SidebarTheme } from "@/features/design-system/types";

type AppShellProps = {
  sidebar: ReactNode;
  topbar: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  rightPanel?: ReactNode;
  mainClassName?: string;
};

export function AppShell({
  sidebar,
  topbar,
  header,
  children,
  rightPanel,
  mainClassName,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen w-full items-stretch">
        <div className="hidden xl:flex xl:w-[var(--sidebar-width)] xl:shrink-0 xl:self-stretch">{sidebar}</div>
        <div className="flex min-w-0 flex-1 flex-col">
          {topbar}
          {header ? (
            <div className="px-4 pb-5 pt-4 md:px-6 md:pb-6 md:pt-5">
              {header}
            </div>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col xl:flex-row">
            <main
              className={cn(
                "min-w-0 flex-1 px-4 md:px-6",
                header ? "pb-5 pt-0 md:pb-7 md:pt-0" : "py-5 md:py-7",
                mainClassName,
              )}
            >
              {children}
            </main>
            {rightPanel ? (
              <aside className="dar-panel-surface border-t border-border/90 px-4 pb-6 pt-4 xl:w-[var(--right-panel-width)] xl:border-l xl:border-t-0 xl:px-6 xl:py-7">
                {rightPanel}
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

type SidebarProps = {
  brand: ReactNode;
  groups: SidebarGroup[];
  footer?: ReactNode;
  theme?: SidebarTheme;
};

export function Sidebar({ brand, groups, footer, theme = "dark" }: SidebarProps) {
  const dark = theme === "dark";

  return (
    <aside
      className={cn(
        "flex w-full flex-col self-stretch border-r",
        dark
          ? "border-white/8 bg-[#08101f] text-white"
          : "border-border bg-white text-foreground",
      )}
    >
      <div className="px-3 pb-4 pt-5">{brand}</div>
      <nav className="flex-1 px-3 pb-3">
        {groups.map((group) => (
          <SidebarSection key={group.title ?? group.items[0]?.label} title={group.title} theme={theme}>
            {group.items.map((item) =>
              item.children?.length ? (
                <SidebarSubmenu key={item.href} item={item} theme={theme} />
              ) : (
                <SidebarItem key={item.href} item={item} theme={theme} />
              ),
            )}
          </SidebarSection>
        ))}
      </nav>
      {footer ? <SidebarFooter theme={theme}>{footer}</SidebarFooter> : null}
    </aside>
  );
}

type SidebarSectionProps = {
  title?: string;
  children: ReactNode;
  theme?: SidebarTheme;
};

export function SidebarSection({ title, children, theme = "dark" }: SidebarSectionProps) {
  return (
    <section className="space-y-0">
      {title ? (
        theme === "dark" ? <span className="sr-only">{title}</span> : (
          <p
            className={cn(
              "px-3 pb-2 text-[0.58rem] font-medium uppercase tracking-[0.22em]",
              "text-foreground-subtle",
            )}
          >
            {title}
          </p>
        )
      ) : null}
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

type SidebarItemProps = {
  item: SidebarLink;
  theme?: SidebarTheme;
  nested?: boolean;
};

export function SidebarItem({ item, theme = "dark", nested = false }: SidebarItemProps) {
  const dark = theme === "dark";

  return (
    <a
      href={item.href}
      aria-current={item.active ? "page" : undefined}
      className={cn(
        "group flex min-h-[37px] items-center gap-2 rounded-[6px] px-3 py-[0.3rem] text-[13px] font-normal transition-[background-color,color,box-shadow] duration-200",
        nested && "ml-3 py-2",
        dark
          ? item.active
            ? "bg-[rgba(108,76,241,0.25)] text-white shadow-none"
            : "text-[#eef2fb] hover:bg-white/[0.04] hover:text-white"
          : item.active
            ? "border-brand/15 bg-brand-soft text-brand shadow-[0_8px_18px_rgba(95,61,245,0.08)]"
            : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
      )}
    >
      {item.icon ? (
        <item.icon
          className={cn(
            "size-[18px] shrink-0",
            item.active ? "text-current" : dark ? "text-[#f2f6ff]/86" : "text-foreground-subtle",
          )}
          aria-hidden="true"
        />
      ) : nested ? (
        <span className="size-1.5 rounded-full bg-current/60" aria-hidden="true" />
      ) : null}
      <span className={cn("min-w-0 flex-1 whitespace-nowrap leading-none", item.active ? "font-medium" : "font-normal")}>{item.label}</span>
      {item.badge ? (
        <span
          className={cn(
            "ml-2 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full px-1.5 py-0 text-[11px] font-semibold leading-none text-white shadow-[0_2px_4px_rgba(86,49,216,0.10)]",
            dark
              ? item.active
                ? "bg-white/16 text-white"
                : "bg-[#5631d8] text-white"
              : item.active
                ? "bg-white text-brand"
                : "bg-surface-muted text-foreground-muted",
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </a>
  );
}

type SidebarSubmenuProps = {
  item: SidebarLink;
  theme?: SidebarTheme;
};

export function SidebarSubmenu({ item, theme = "dark" }: SidebarSubmenuProps) {
  const dark = theme === "dark";
  const isActive = item.active || item.children?.some((child) => child.active);

  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border p-1.5",
        dark
          ? isActive
            ? "border-white/8 bg-white/[0.03]"
            : "border-transparent"
          : isActive
            ? "border-border bg-surface-muted/90"
            : "border-transparent",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-[8px] px-3 py-3 text-[0.875rem] font-medium",
          dark ? "text-white" : "text-foreground",
        )}
      >
        {item.icon ? <item.icon className="size-4.5 shrink-0" aria-hidden="true" /> : null}
        <span className="flex-1">{item.label}</span>
        <ChevronDown className="size-4" aria-hidden="true" />
      </div>
      <div className="mt-1 space-y-1">
        {item.children?.map((child) => (
          <SidebarItem key={child.href} item={child} nested theme={theme} />
        ))}
      </div>
    </div>
  );
}

type SidebarFooterProps = {
  children: ReactNode;
  theme?: SidebarTheme;
};

export function SidebarFooter({ children, theme = "dark" }: SidebarFooterProps) {
  return (
    <div
      className={cn(
        "mt-auto px-3 pb-10 pt-3",
        theme === "dark" ? "border-transparent" : "border-border",
      )}
    >
      {children}
    </div>
  );
}

type TopbarProps = {
  searchPlaceholder?: string;
  searchSlot?: ReactNode | null;
  actions?: ReactNode;
  user?: ReactNode;
};

export function Topbar({
  searchPlaceholder = "Search anything...",
  searchSlot,
  actions,
  user,
}: TopbarProps) {
  return (
    <header className="border-b border-border/90 bg-white/88 px-4 py-2.5 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-3">
        {searchSlot === null ? <div className="hidden xl:block xl:flex-1" /> : (
          <div className="max-w-xl flex-1">
            {searchSlot ?? (
              <div className="flex h-[3.25rem] items-center rounded-[var(--radius-lg)] border border-border bg-white px-4 shadow-[0_8px_22px_rgba(16,25,58,0.045)] transition-[box-shadow,border-color] duration-200 hover:border-border-strong focus-within:border-brand">
                <Search className="size-4 text-foreground-subtle" aria-hidden="true" />
                <input
                  type="search"
                  aria-label="Global search"
                  placeholder={searchPlaceholder}
                  className="h-full w-full bg-transparent pl-3 text-sm text-foreground outline-none"
                />
                <span className="hidden rounded-md border border-border bg-surface-muted px-2 py-1 text-xs font-semibold text-foreground-subtle sm:inline-flex">
                  Ctrl K
                </span>
              </div>
            )}
          </div>
        )}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
          {user}
        </div>
      </div>
    </header>
  );
}

export function PageContainer({
  constrained = false,
  className,
  ...props
}: ComponentPropsWithoutRef<"div"> & { constrained?: boolean }) {
  return (
    <div
      className={cn(
        "w-full",
        constrained ? "mx-auto max-w-[82rem]" : "max-w-none",
        className,
      )}
      {...props}
    />
  );
}

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-3">
        {eyebrow ? (
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
        ) : null}
        <div className="space-y-3">
          <h1 className="text-[var(--font-size-page-title)] font-semibold tracking-[-0.03em] text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="max-w-3xl text-[0.96rem] leading-7 text-foreground-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}

type BreadcrumbsProps = {
  items: Array<{ label: string; href?: string; current?: boolean }>;
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-[0.84rem] font-medium text-foreground-muted">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href && !item.current ? (
              <a href={item.href} className="hover:text-brand">
                {item.label}
              </a>
            ) : (
              <span className={item.current ? "font-semibold text-foreground" : ""}>{item.label}</span>
            )}
            {index < items.length - 1 ? <ChevronRight className="size-4" aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

type ContentGridProps = {
  children: ReactNode;
  rightPanel?: ReactNode;
};

export function ContentGrid({ children, rightPanel }: ContentGridProps) {
  return (
    <div className={cn("grid gap-6", rightPanel ? "2xl:grid-cols-[minmax(0,1fr)_23rem]" : "")}>
      <div className="min-w-0 space-y-6">{children}</div>
      {rightPanel ? <div className="space-y-6">{rightPanel}</div> : null}
    </div>
  );
}

export function RightPanel({
  title,
  children,
  actions,
  className,
}: {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <Card variant="profile" padding="lg" className={cn("space-y-5", className)}>
      {title || actions ? (
        <div className="flex items-center justify-between gap-4">
          {title ? <h2 className="text-[1.1rem] font-semibold tracking-tight text-foreground">{title}</h2> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </Card>
  );
}

export function AdminBrand() {
  return (
    <div className="space-y-5">
      <div className="flex justify-center pb-0.5">
        <Image
          src="/dar-logo.svg"
          alt="DAR"
          width={94}
          height={29}
          priority
          className="h-auto w-[94px]"
        />
      </div>

      <div
        className="rounded-[10px] border bg-[#101a31] px-[20px] py-[18px] shadow-[0_3px_8px_rgba(0,0,0,0.10)]"
        style={{ borderColor: "rgba(55, 65, 85, 0.65)" }}
      >
        <div className="flex items-center gap-4">
          <div className="relative size-[44px] shrink-0 overflow-hidden rounded-full ring-1 ring-[rgba(255,255,255,0.08)]">
            <Image
              src="/admin-team.svg"
              alt="Admin Team"
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0 space-y-0.5">
            <p className="truncate text-[13px] font-semibold leading-[1.2] text-white">
              Admin Team
            </p>
            <p className="truncate text-[11px] font-medium leading-[1.3] text-[#c8d2ea]">
              Super Admin
            </p>
            <p className="truncate text-[11px] leading-[1.3] text-[#c8d2ea]">
              Cairo / Berlin
            </p>
          </div>
        </div>

        <div className="mt-3">
          <span
            className="inline-flex h-[22px] items-center gap-1 rounded-full border bg-transparent px-2.5 text-[10px] font-medium shadow-none"
            style={{
              borderColor: "#D88A00",
              color: "#D88A00",
            }}
          >
            <Shield
              className="size-3"
              style={{ color: "#D88A00" }}
              aria-hidden="true"
            />
            Super Admin
          </span>
        </div>
      </div>
    </div>
  );
}

export function SidebarSupportCard() {
  return (
    <div
      className="rounded-[8px] border bg-[#0d1628] px-3 py-3 shadow-[0_3px_8px_rgba(0,0,0,0.08)]"
      style={{ borderColor: "#A86A00" }}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <Headphones
            className="mt-0.5 size-5 shrink-0"
            style={{ color: "#D88A00" }}
            aria-hidden="true"
          />

          <div className="min-w-0">
            <p className="text-[0.79rem] font-medium text-white">
              Need help?
            </p>

            <p className="mt-0.5 text-[0.7rem] leading-tight text-[#c8d2ea]">
              Admin support center
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="h-[2.15rem] w-full rounded-[6px] border-0 bg-[#5631d8] text-[0.79rem] font-semibold text-white shadow-none outline-none ring-0 hover:bg-[#5631d8]"
        >
          Contact support
        </Button>
      </div>
    </div>
  );
}

export function TopbarUserCard() {
  return (
    <div className="dar-soft-surface flex items-center gap-3 rounded-[var(--radius-lg)] border border-border/95 px-3 py-2.5 shadow-[var(--shadow-card)]">
      <div className="flex size-10 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand">
        AN
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">Ahmed Nabil</p>
        <p className="truncate text-xs text-foreground-muted">Super Admin</p>
      </div>
      <ChevronDown className="size-4 text-foreground-subtle" aria-hidden="true" />
    </div>
  );
}

export function TopbarActions() {
  return (
    <>
      <IconButton
        label="Notifications"
        variant="outline"
        size="md"
        icon={<span className="text-base">N</span>}
      />
      <Button variant="primary" size="md">
        Quick action
      </Button>
    </>
  );
}

export function PreviewToolbar() {
  return (
    <div className="dar-soft-surface mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-xl)] border border-border/95 px-5 py-4.5 shadow-[var(--shadow-card)]">
      <div>
        <p className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-brand">Admin management preview</p>
        <p className="mt-1 text-[0.95rem] font-medium text-foreground-muted">
          Reusable composition based on DAR&apos;s core management references.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm">
          Export users
        </Button>
        <Button variant="primary" size="sm">
          Create user
        </Button>
      </div>
    </div>
  );
}

export function LayoutExampleCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card variant="summary" padding="lg" className="space-y-3">
      <h3 className="text-[1.08rem] font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="text-sm leading-6 text-foreground-muted">{description}</p>
      <Separator />
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.12em] text-foreground-subtle">Reusable shell section</span>
        <Button variant="ghost" size="sm">
          Review
        </Button>
      </div>
    </Card>
  );
}
