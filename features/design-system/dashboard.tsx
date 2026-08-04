import type { ReactNode } from "react";

import { AlertCircle, ArrowDownRight, ArrowUpRight, CheckCircle2, Circle, Clock3 } from "lucide-react";

import { cn } from "@/features/design-system/lib/cn";
import { Button, Card, Checkbox, SearchInput, Select, Separator, Skeleton, StatusBadge, Tabs } from "@/features/design-system/primitives";
import type { ChecklistItemData, KeyValueItem, MetricCardTrend, TableColumn, TimelineItemData } from "@/features/design-system/types";

export function MetricCard({
  icon,
  label,
  value,
  trend,
  accent = "brand",
  compact = false,
  trailing,
  className,
  iconContainerClassName,
  footer,
  compactLayout = "row",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  trend?: MetricCardTrend;
  accent?: "brand" | "info" | "success" | "warning" | "danger";
  compact?: boolean;
  trailing?: ReactNode;
  className?: string;
  iconContainerClassName?: string;
  footer?: ReactNode;
  compactLayout?: "row" | "column" | "row-bottom";
}) {
  const accentClass =
    accent === "info"
      ? compact
        ? "bg-info-soft/55 text-info ring-1 ring-info/10"
        : "bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(232,240,255,0.96))] text-info shadow-[0_14px_30px_rgba(37,99,235,0.14)] ring-1 ring-info/8"
      : accent === "success"
        ? compact
          ? "bg-success-soft/55 text-success ring-1 ring-success/10"
          : "bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(232,248,238,0.96))] text-success shadow-[0_14px_30px_rgba(22,163,74,0.14)] ring-1 ring-success/8"
        : accent === "warning"
          ? compact
            ? "bg-warning-soft/65 text-warning ring-1 ring-warning/10"
            : "bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,245,221,0.96))] text-warning shadow-[0_14px_30px_rgba(245,158,11,0.14)] ring-1 ring-warning/8"
          : accent === "danger"
            ? compact
              ? "bg-danger-soft/55 text-danger ring-1 ring-danger/10"
              : "bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(254,236,236,0.96))] text-danger shadow-[0_14px_30px_rgba(239,68,68,0.14)] ring-1 ring-danger/8"
            : compact
              ? "bg-brand-soft/65 text-brand ring-1 ring-brand/10"
              : "bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(237,233,255,0.95))] text-brand shadow-[0_14px_30px_rgba(95,61,245,0.14)] ring-1 ring-brand/8";

  return (
    <Card
      variant="metric"
      padding={compact ? "none" : "lg"}
      className={cn(
        "relative overflow-hidden",
        compact
          ? "min-h-[106px] rounded-[10px] border-border/80 px-4 py-[0.875rem] shadow-[0_2px_8px_rgba(16,25,58,0.035)] hover:translate-y-0 hover:shadow-[0_2px_8px_rgba(16,25,58,0.035)]"
          : "",
        className,
      )}
    >
      {compact ? null : (
        <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[radial-gradient(circle,_rgba(95,61,245,0.12),_transparent_65%)]" aria-hidden="true" />
      )}
      <div
        className={cn(
          "relative",
          compact
            ? compactLayout === "column"
              ? "flex h-full flex-col items-start gap-3"
              : compactLayout === "row-bottom"
                ? "flex h-full flex-col gap-3"
              : "flex h-full items-center gap-3"
            : "space-y-5",
        )}
      >
        <div className={cn(compactLayout === "row-bottom" ? "flex items-center gap-3" : "")}>
          <div
            className={cn(
              compact ? (compactLayout === "column" ? "" : "shrink-0") : "flex items-start justify-between gap-3",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center",
                compact ? "size-10 rounded-[8px]" : "size-[3.25rem] rounded-[var(--radius-lg)]",
                accentClass,
                iconContainerClassName,
              )}
            >
              {icon}
            </div>
          </div>
          <div
            className={cn(
              compact
                ? compactLayout === "column"
                  ? "w-full space-y-1"
                  : "min-w-0 flex-1 space-y-1"
                : "space-y-1.5",
            )}
          >
            <p
              className={cn(
                compact
                  ? "text-[0.72rem] font-medium tracking-normal text-foreground-muted"
                  : "text-[0.84rem] font-medium uppercase tracking-[0.12em] text-foreground-subtle",
              )}
            >
              {label}
            </p>
            <p
              className={cn(
                compact
                  ? "text-[1.55rem] font-semibold leading-none tracking-[-0.025em] text-foreground"
                  : "text-[2rem] font-semibold tracking-[-0.03em] text-foreground",
              )}
            >
              {value}
            </p>
            {compactLayout === "row-bottom" ? null : footer ? footer : trend ? (
              compact ? (
                <div
                  className={cn(
                    "flex items-center gap-1 text-[0.66rem] font-medium leading-none",
                    trend.direction === "up"
                      ? "text-success"
                      : trend.direction === "down"
                        ? "text-danger"
                        : "text-foreground-muted",
                  )}
                >
                  {trend.direction === "up" ? (
                    <ArrowUpRight className="size-3.5 shrink-0" />
                  ) : trend.direction === "down" ? (
                    <ArrowDownRight className="size-3.5 shrink-0" />
                  ) : null}
                  <span>{trend.value}</span>
                  <span className="text-foreground-muted">{trend.label}</span>
                </div>
              ) : (
                <p className="text-sm font-medium text-foreground-muted">{trend.label}</p>
              )
            ) : null}
          </div>
        </div>
        {compactLayout === "row-bottom" ? (
          footer ? <div className="w-full">{footer}</div> : null
        ) : null}
        {compact && trailing ? (
          <div className={cn(compactLayout === "column" ? "w-full" : "ml-auto shrink-0")}>
            {trailing}
          </div>
        ) : null}
        {!compact && trend ? (
          <span
            className={cn(
              "absolute right-0 top-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.72rem] font-semibold shadow-[0_8px_18px_rgba(16,25,58,0.04)]",
              trend.direction === "up"
                ? "border-success/10 bg-success-soft text-success"
                : trend.direction === "down"
                  ? "border-danger/10 bg-danger-soft text-danger"
                  : "border-border bg-surface-muted text-foreground-muted",
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="size-3.5" />
            ) : trend.direction === "down" ? (
              <ArrowDownRight className="size-3.5" />
            ) : null}
            {trend.value}
          </span>
        ) : null}
      </div>
    </Card>
  );
}

export function FilterPanel({
  search,
  filters,
  actions,
  className,
}: {
  search?: ReactNode;
  filters: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <Card variant="summary" padding="lg" className={cn("space-y-5", className)}>
      {search ? search : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{filters}</div>
      {actions ? <div className="flex flex-wrap items-center gap-3 pt-1">{actions}</div> : null}
    </Card>
  );
}

export function FilterPanelDemo() {
  return (
    <FilterPanel
      search={
        <SearchInput
          aria-label="Search users"
          placeholder="Search by name, email, phone, or user ID"
        />
      }
      filters={
        <>
          <Select
            aria-label="Role"
            defaultValue="all"
            options={[
              { label: "All roles", value: "all" },
              { label: "Guests", value: "guests" },
              { label: "Owners", value: "owners" },
            ]}
          />
          <Select
            aria-label="Status"
            defaultValue="all"
            options={[
              { label: "Active / Pending / Suspended", value: "all" },
              { label: "Active", value: "active" },
              { label: "Pending", value: "pending" },
            ]}
          />
          <Select
            aria-label="Verification"
            defaultValue="all"
            options={[
              { label: "Verified / Unverified", value: "all" },
              { label: "Verified", value: "verified" },
              { label: "Unverified", value: "unverified" },
            ]}
          />
          <Select
            aria-label="City"
            defaultValue="all"
            options={[
              { label: "Cairo / Madinaty / New Capital", value: "all" },
              { label: "Cairo", value: "cairo" },
              { label: "New Capital", value: "new-capital" },
            ]}
          />
          <Select
            aria-label="Joined date"
            defaultValue="month"
            options={[
              { label: "May 1, 2024 - May 20, 2026", value: "month" },
              { label: "Last 30 days", value: "30" },
              { label: "Last 7 days", value: "7" },
            ]}
          />
        </>
      }
      actions={
        <>
          <Button variant="primary" size="sm">
            Apply filters
          </Button>
          <Button variant="outline" size="sm">
            Clear all
          </Button>
        </>
      }
    />
  );
}

type DataTableProps<T> = {
  columns: Array<TableColumn<T>>;
  rows: T[];
  rowKey: (row: T) => string;
  emptyState?: ReactNode;
  loading?: boolean;
  selectedRowIds?: string[];
  activeRowId?: string;
  onToggleRowSelection?: (rowId: string) => void;
  onToggleAllRows?: () => void;
  allRowsSelected?: boolean;
  onRowClick?: (row: T) => void;
  rowAriaLabel?: (row: T) => string;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyState,
  loading = false,
  selectedRowIds = [],
  activeRowId,
  onToggleRowSelection,
  onToggleAllRows,
  allRowsSelected = false,
  onRowClick,
  rowAriaLabel,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <Card padding="none" className="overflow-hidden">
        <div className="space-y-4 p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-6 gap-3">
              <Skeleton className="col-span-2 h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!rows.length) {
    return <>{emptyState}</>;
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="dar-scrollbar overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-[linear-gradient(180deg,#fafcff,#f4f7fd)] text-left text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-foreground-subtle">
              <th className="px-5 py-4.5">
                {onToggleAllRows ? (
                  <Checkbox
                    id="datatable-select-all"
                    label=""
                    aria-label="Select all rows"
                    checked={allRowsSelected}
                    onChange={onToggleAllRows}
                  />
                ) : (
                  <span className="sr-only">Selection</span>
                )}
              </th>
              {columns.map((column) => (
                <th key={column.key} className={cn("px-5 py-4.5", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = rowKey(row);
              const selected = selectedRowIds.includes(id);
              const active = activeRowId === id;

              return (
                <tr
                  key={id}
                  aria-selected={active}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "text-sm text-foreground transition-colors duration-200",
                    onRowClick && "cursor-pointer",
                    active && "ring-1 ring-inset ring-brand/18",
                    selected
                      ? "bg-brand-soft/45"
                      : "bg-white hover:bg-[linear-gradient(180deg,rgba(248,250,253,0.88),rgba(245,248,252,0.96))]",
                  )}
                >
                  <td className="border-t border-border/80 px-5 py-4.5 align-top">
                    <div onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        id={`datatable-select-${id}`}
                        label=""
                        aria-label={rowAriaLabel ? rowAriaLabel(row) : `Select row ${id}`}
                        checked={selected}
                        onChange={() => onToggleRowSelection?.(id)}
                      />
                    </div>
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className={cn("border-t border-border/80 px-5 py-4.5 align-top", column.className)}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function TablePagination({
  summary,
  page,
  totalPages,
  onPageChange,
}: {
  summary: string;
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}) {
  const visiblePages = Array.from(
    { length: Math.min(totalPages, 4) },
    (_, index) => index + 1,
  );

  return (
    <div className="dar-soft-surface flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border/95 px-5 py-4 shadow-[var(--shadow-card)] md:flex-row md:items-center md:justify-between">
      <p className="text-sm font-medium text-foreground-muted">{summary}</p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={onPageChange ? () => onPageChange(page - 1) : undefined}
        >
          Previous
        </Button>
        <div className="flex items-center gap-2">
          {visiblePages.map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={page === pageNumber ? "primary" : "outline"}
              size="sm"
              className="min-w-10 px-0"
              onClick={onPageChange ? () => onPageChange(pageNumber) : undefined}
            >
              {pageNumber}
            </Button>
          ))}
          <span className="px-2 text-sm text-foreground-muted">...</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onPageChange ? () => onPageChange(totalPages) : undefined}
          >
            {totalPages}
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={onPageChange ? () => onPageChange(page + 1) : undefined}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export function BulkActionBar({
  selectedCount,
  actions,
}: {
  selectedCount: number;
  actions: ReactNode;
}) {
  return (
    <div className="dar-soft-surface flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border/95 px-5 py-4 shadow-[var(--shadow-card)] md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <Checkbox id="bulk-action-select-all" label="" aria-label="Select all rows" />
        <p className="text-sm font-semibold text-foreground">
          {selectedCount} selected
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">{actions}</div>
    </div>
  );
}

export function KeyValueList({ items }: { items: KeyValueItem[] }) {
  return (
    <dl className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-start justify-between gap-6">
          <dt className="text-[0.92rem] text-foreground-muted">{item.label}</dt>
          <dd className="max-w-[14rem] text-right text-sm font-semibold text-foreground">
            <div>{item.value}</div>
            {item.hint ? <div className="mt-1 text-xs font-normal text-foreground-muted">{item.hint}</div> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Checklist({ items }: { items: ChecklistItemData[] }) {
  return (
    <ul className="space-y-3.5">
      {items.map((item) => {
        const icon =
          item.state === "verified" ? (
            <CheckCircle2 className="size-4 text-success" />
          ) : item.state === "pending" ? (
            <Clock3 className="size-4 text-warning" />
          ) : (
            <AlertCircle className="size-4 text-danger" />
          );

        return (
          <li key={item.id} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 rounded-full bg-surface-strong p-1">{icon}</span>
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">{item.label}</p>
              {item.description ? (
                <p className="text-xs leading-5 text-foreground-muted">{item.description}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function Timeline({ items }: { items: TimelineItemData[] }) {
  return (
    <ol className="space-y-5">
      {items.map((item, index) => {
        const marker =
          item.state === "completed" ? (
            <CheckCircle2 className="size-5 text-brand" />
          ) : item.state === "current" ? (
            <Clock3 className="size-5 text-warning" />
          ) : item.state === "alert" ? (
            <AlertCircle className="size-5 text-danger" />
          ) : (
            <Circle className="size-5 text-border-strong" />
          );

        return (
          <li key={item.id} className="relative flex gap-3">
            {index < items.length - 1 ? (
              <span className="absolute left-[13px] top-8 h-[calc(100%-0.35rem)] w-px bg-border" aria-hidden="true" />
            ) : null}
            <span className="relative z-10 mt-0.5 rounded-full bg-surface-strong p-1.5 shadow-[0_4px_12px_rgba(16,25,58,0.04)]">{marker}</span>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground">{item.title}</p>
                {item.timestamp ? (
                  <span className="text-xs font-medium text-foreground-muted">{item.timestamp}</span>
                ) : null}
              </div>
              {item.description ? (
                <p className="text-sm leading-6 text-foreground-muted">{item.description}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card padding="lg" className="flex flex-col items-center justify-center gap-5 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(237,233,255,0.96)_60%,_rgba(217,205,255,0.9)_100%)] text-brand shadow-[0_18px_34px_rgba(95,61,245,0.14)]">
        <AlertCircle className="size-7" />
      </div>
      <div className="space-y-2.5">
        <h3 className="text-[1.12rem] font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="max-w-lg text-sm leading-6 text-foreground-muted">{description}</p>
      </div>
      {action}
    </Card>
  );
}

export function LoadingState({ title }: { title: string }) {
  return (
    <Card padding="lg" className="space-y-5">
      <div>
        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-brand">{title}</p>
      </div>
      <div className="space-y-3.5">
        <Skeleton className="h-6 w-2/5" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-4/5" />
      </div>
    </Card>
  );
}

export function AdminPreviewTableSection<T>({
  title,
  tabs,
  activeTab,
  columns,
  rows,
  rowKey,
  selectedRowIds,
}: {
  title: string;
  tabs: Array<{ value: string; label: string; count?: string | number }>;
  activeTab: string;
  columns: Array<TableColumn<T>>;
  rows: T[];
  rowKey: (row: T) => string;
  selectedRowIds?: string[];
}) {
  return (
    <div className="space-y-4.5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <h2 className="text-[1.28rem] font-semibold tracking-tight text-foreground">{title}</h2>
        <Tabs items={tabs} value={activeTab} className="w-full xl:w-auto" />
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={rowKey}
        selectedRowIds={selectedRowIds}
        emptyState={
          <EmptyState
            title="No users match the current filters"
            description="Try clearing one or more filters to review more DAR users and account activity."
            action={<Button variant="outline">Clear filters</Button>}
          />
        }
      />
    </div>
  );
}

export function PreviewRightPanelSection({
  heading,
  children,
  action,
}: {
  heading: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-[1rem] font-semibold tracking-tight text-foreground">{heading}</h3>
        {action ? action : null}
      </div>
      {children}
    </div>
  );
}

export function TableStateShowcase() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <LoadingState title="Loading table state" />
      <EmptyState
        title="No disputes found"
        description="The current filter set does not return any dispute cases. Adjust the status or date range to continue."
        action={<Button variant="primary">Reset filters</Button>}
      />
    </div>
  );
}

export function InlineStateLegend() {
  return (
    <Card padding="lg" className="space-y-4">
      <h3 className="text-[1.08rem] font-semibold tracking-tight text-foreground">Status Variants</h3>
      <div className="flex flex-wrap gap-2">
        {[
          "active",
          "confirmed",
          "completed",
          "approved",
          "live",
          "pending",
          "under-review",
          "payment-review",
          "processing",
          "rejected",
          "cancelled",
          "failed",
          "disputed",
          "suspended",
          "draft",
          "open",
        ].map((status) => (
          <StatusBadge key={status} status={status as never} />
        ))}
      </div>
    </Card>
  );
}

export function DetailSummaryCard({
  title,
  badge,
  body,
}: {
  title: string;
  badge?: ReactNode;
  body: ReactNode;
}) {
  return (
    <Card variant="summary" padding="lg" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[1.08rem] font-semibold tracking-tight text-foreground">{title}</h3>
        {badge}
      </div>
      <Separator />
      {body}
    </Card>
  );
}
