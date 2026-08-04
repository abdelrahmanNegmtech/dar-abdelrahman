"use client";

import {
  BadgeCheck,
  Building2,
  Check,
  CircleAlert,
  CircleCheckBig,
  Clock3,
  Download,
  Landmark,
  Scale,
  Send,
  ShieldAlert,
  UserCog,
  Users,
} from "lucide-react";

import { Button, Card, Select } from "@/features/design-system";

import type { PermissionItem, UserRecord } from "../types";

const permissionIcons = {
  properties: Building2,
  approvals: BadgeCheck,
  payments: Landmark,
  disputes: Scale,
  admins: Users,
} satisfies Record<PermissionItem["id"], typeof Building2>;

const timelineStateStyles = {
  completed: {
    marker: "border-success/25 bg-success-soft text-success",
    line: "bg-success/20",
    icon: CircleCheckBig,
  },
  current: {
    marker: "border-brand/25 bg-brand-soft text-brand",
    line: "bg-brand/20",
    icon: Clock3,
  },
  upcoming: {
    marker: "border-brand/20 bg-brand-soft/70 text-brand",
    line: "bg-border",
    icon: Check,
  },
  alert: {
    marker: "border-warning/25 bg-warning-soft text-warning",
    line: "bg-warning/20",
    icon: CircleAlert,
  },
} as const;

export function UsersLowerPanels({
  roleOptions,
  permissionItems,
  selectedCount,
  user,
}: {
  roleOptions: Array<{ label: string; value: string }>;
  permissionItems: PermissionItem[];
  selectedCount: number;
  user: UserRecord;
}) {
  const visibleAuditItems = user.auditLog.slice(0, 5);

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card padding="md" className="space-y-4 rounded-[0.6rem]">
        <div className="space-y-1.5">
          <h3 className="text-[0.95rem] font-semibold tracking-tight text-foreground">
            Role and permissions
          </h3>
          <div className="space-y-1.5">
            <p className="text-[0.67rem] font-semibold text-foreground-muted">
              Select internal role
            </p>
            <Select
              defaultValue="admin"
              options={roleOptions}
              className="h-8.5 rounded-[0.45rem] px-3 text-[0.72rem]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[0.67rem] font-semibold text-foreground-muted">
            Permissions for Admin
          </p>
          <div className="space-y-1">
            {permissionItems.map((permission) => {
              const Icon =
                permissionIcons[permission.id as keyof typeof permissionIcons];

              return (
                <div
                  key={permission.id}
                  className="flex items-center justify-between gap-3 rounded-[0.45rem] px-1 py-1"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-5 items-center justify-center rounded-[0.4rem] bg-brand-soft/70 text-brand">
                      <Icon className="size-3.25" />
                    </span>
                    <span className="text-[0.76rem] font-medium text-foreground">
                      {permission.label}
                    </span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={permission.checked}
                    aria-label={permission.label}
                    className={`relative inline-flex h-4.5 w-8 shrink-0 rounded-full border transition-colors ${
                      permission.checked
                        ? "border-brand bg-brand"
                        : "border-border bg-white"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 size-3 rounded-full bg-white shadow-[0_1px_2px_rgba(16,25,58,0.15)] transition-transform ${
                        permission.checked ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[0.45rem] border border-warning/20 bg-warning-soft/45 px-3 py-2 text-[0.72rem] text-foreground-muted">
          <span className="font-medium text-warning">Note:</span> Super Admin only can
          assign admin roles.
        </div>
      </Card>

      <Card padding="md" className="space-y-4 rounded-[0.6rem]">
        <div className="space-y-1.5">
          <h3 className="text-[0.95rem] font-semibold tracking-tight text-foreground">
            User activity / audit log
          </h3>
        </div>

        <ol className="space-y-2">
          {visibleAuditItems.map((item, index) => {
            const styles = timelineStateStyles[item.state];
            const Icon = styles.icon;

            return (
              <li key={item.id} className="relative flex gap-2.5">
                {index < visibleAuditItems.length - 1 ? (
                  <span
                    className={`absolute left-[0.55rem] top-5 h-[calc(100%-0.15rem)] w-px ${styles.line}`}
                    aria-hidden="true"
                  />
                ) : null}

                <span
                  className={`relative z-10 mt-0.5 flex size-[1.15rem] shrink-0 items-center justify-center rounded-full border ${styles.marker}`}
                >
                  <Icon className="size-2.5" />
                </span>

                <div className="min-w-0 space-y-0.5 pb-1">
                  <p className="text-[0.78rem] font-semibold text-foreground">
                    {item.title}
                  </p>
                  {item.timestamp ? (
                    <p className="text-[0.68rem] text-foreground-muted">
                      {item.timestamp}
                    </p>
                  ) : null}
                  {item.description ? (
                    <p className="text-[0.72rem] leading-4.5 text-foreground-muted">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card padding="md" className="space-y-4 rounded-[0.6rem]">
        <div className="space-y-1.5">
          <h3 className="text-[0.95rem] font-semibold tracking-tight text-foreground">
            Bulk actions
          </h3>
        </div>

        <div className="flex items-center justify-between gap-3 text-[0.72rem]">
          <span className="font-medium text-foreground-muted">
            {selectedCount} users selected
          </span>
          <button
            type="button"
            className="font-semibold text-brand hover:text-brand-strong"
          >
            Select all 18420 users
          </button>
        </div>

        <div className="grid gap-2.5">
          <Button
            variant="warning-outline"
            size="sm"
            className="h-9 rounded-[0.45rem] border-brand/35 px-3 text-[0.74rem] font-semibold text-brand hover:border-brand hover:bg-brand-soft/35"
            leadingIcon={<Send className="size-3.5" />}
          >
            Send verification reminder
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-[0.45rem] border-brand/20 px-3 text-[0.74rem] font-semibold text-brand hover:border-brand/35 hover:bg-brand-soft/25"
            leadingIcon={<Download className="size-3.5" />}
          >
            Export selected
          </Button>

          <Button
            variant="danger-outline"
            size="sm"
            className="h-9 rounded-[0.45rem] px-3 text-[0.74rem] font-semibold"
            leadingIcon={<ShieldAlert className="size-3.5" />}
          >
            Suspend selected
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-[0.45rem] border-brand/20 px-3 text-[0.74rem] font-semibold text-brand hover:border-brand/35 hover:bg-brand-soft/25"
            leadingIcon={<UserCog className="size-3.5" />}
          >
            Change role
          </Button>
        </div>
      </Card>
    </div>
  );
}
