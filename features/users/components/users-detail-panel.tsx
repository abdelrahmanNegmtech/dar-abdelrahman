"use client";

import type { ReactNode } from "react";

import { ArrowRight, Headphones, Shield, Star, UserRoundCheck } from "lucide-react";

import {
  Avatar,
  Badge,
  Button,
  RightPanel,
  Separator,
  Textarea,
} from "@/features/design-system";

import type { UserRecord, UserSummaryCard } from "../types";

function MetricStat({
  label,
  value,
  trailing,
}: {
  label: string;
  value: string | number;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center gap-1 px-2 py-2 text-center">
      <div className="flex items-center gap-1">
        <p className="text-[0.92rem] font-semibold tracking-tight text-foreground">{value}</p>
        {trailing}
      </div>
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.04em] text-foreground-muted">
        {label}
      </p>
    </div>
  );
}

function CompactChecklist({ user }: { user: UserRecord }) {
  return (
    <ul className="space-y-3">
      {user.checklist.map((item) => {
        const toneClass =
          item.state === "verified"
            ? "text-success"
            : item.state === "pending"
              ? "text-warning"
              : "text-danger";

        const markerClass =
          item.state === "verified"
            ? "border-success/25 bg-success-soft"
            : item.state === "pending"
              ? "border-warning/25 bg-warning-soft"
              : "border-danger/25 bg-danger-soft";

        return (
          <li key={item.id} className="flex items-center gap-2.5 text-sm">
            <span
              className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${markerClass}`}
              aria-hidden="true"
            >
              <span className={`size-1.5 rounded-full ${toneClass.replace("text-", "bg-")}`} />
            </span>
            <p className="font-medium text-foreground">{item.label}</p>
            {item.description ? (
              <span className={`text-xs font-semibold capitalize ${toneClass}`}>
                {item.description}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function SummaryInfoCard({
  summary,
  icon,
}: {
  summary: UserSummaryCard;
  icon: ReactNode;
}) {
  const isVerificationQueue = summary.title === "Verification queue";
  const queueStats = isVerificationQueue
    ? summary.value.split(",").map((part) => part.trim())
    : [];

  return (
    <section className="dar-soft-surface rounded-[0.55rem] border border-border/85 px-3 py-2.5 shadow-[0_2px_8px_rgba(16,25,58,0.03)]">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-[0.45rem] bg-brand-soft/70 text-brand">
          <span className="scale-[0.8]">{icon}</span>
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-[12px] font-semibold leading-[1.2] tracking-tight text-foreground">
            {summary.title}
          </h3>
          {isVerificationQueue ? (
            <div className="flex flex-wrap items-center gap-3 text-[11px] leading-[1.2] text-foreground">
              {queueStats.map((stat) => (
                <span key={stat} className="font-semibold">
                  {stat}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] font-semibold leading-[1.25] text-foreground">
              {summary.value}
            </p>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-1 px-0 py-0 text-[10px] font-semibold leading-none text-brand"
          >
            <span>{summary.hint}</span>
            <ArrowRight className="size-3" />
          </button>
        </div>
      </div>
    </section>
  );
}

const actionButtonClassName =
  "h-9 rounded-[0.25rem] px-3 text-[0.82rem] font-semibold shadow-none";

export function UsersDetailPanel({
  user,
  adminNote,
  onAdminNoteChange,
  summaries,
}: {
  user: UserRecord;
  adminNote: string;
  onAdminNoteChange: (value: string) => void;
  summaries: {
    riskMonitor: UserSummaryCard;
    verificationQueue: UserSummaryCard;
    linkedTickets: UserSummaryCard;
  };
}) {
  const latestAuditItem = user.auditLog[user.auditLog.length - 1];

  return (
    <div className="space-y-2.5">
      <RightPanel className="rounded-[0.55rem] !p-3.5">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar name={user.name} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[1.12rem] font-semibold tracking-tight text-foreground">
                  {user.name}
                </h3>
                {user.roleBadgeLabel ? (
                  <Badge tone="warning" className="text-[0.68rem]">
                    {user.roleBadgeLabel}
                  </Badge>
                ) : null}
              </div>
              <div className="mt-1.5">
                <p className="text-[0.88rem] font-semibold text-warning">
                  {user.verificationState === "pending"
                    ? "Pending verification"
                    : user.status.replace(/-/g, " ")}
                </p>
              </div>
              <div className="mt-2.5 space-y-0.5 text-[0.82rem] text-foreground-muted">
                <p>User ID: {user.id}</p>
                <p>Joined: {user.joinedDate}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 divide-x divide-border rounded-[0.45rem] border border-border/85 bg-[linear-gradient(180deg,#ffffff,#f9fbff)]">
            <MetricStat label="Listings" value={user.listingCount} />
            <MetricStat label="Booking requests" value={user.bookingRequests} />
            <MetricStat label="Revenue" value={user.revenue} />
            <MetricStat
              label="Rating"
              value={user.rating}
              trailing={<Star className="size-3.5 fill-warning text-warning" />}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-[0.95rem] font-semibold tracking-tight text-foreground">
                Verification checklist
              </h4>
              <CompactChecklist user={user} />
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-[0.95rem] font-semibold tracking-tight text-foreground">
                Admin actions
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <Button variant="primary" size="sm" className={actionButtonClassName}>
                  Approve owner
                </Button>
                <Button
                  variant="warning-outline"
                  size="sm"
                  className={`${actionButtonClassName} !border-[#F59E0B] !text-[#B66F00] hover:!border-[#F59E0B] hover:!bg-[rgba(245,158,11,0.08)]`}
                >
                  Request documents
                </Button>
                <Button
                  variant="danger-outline"
                  size="sm"
                  className={`${actionButtonClassName} !border-[#EF4444] !text-[#EF4444] hover:!border-[#EF4444] hover:!bg-[rgba(239,68,68,0.08)]`}
                >
                  Suspend account
                </Button>
                <Button variant="outline" size="sm" className={actionButtonClassName}>
                  Reset password
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Textarea
                label="Admin notes"
                value={adminNote}
                onChange={(event) => onAdminNoteChange(event.target.value)}
                placeholder="Add notes about this user..."
                rows={3}
                className="min-h-20 resize-none rounded-[4px] text-sm"
              />
              {latestAuditItem?.timestamp ? (
                <div className="text-xs leading-5 text-foreground-muted">
                  <p>Last updated by Admin Team</p>
                  <p>{latestAuditItem.timestamp}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </RightPanel>

      <SummaryInfoCard
        summary={summaries.riskMonitor}
        icon={<Shield className="size-4" />}
      />
      <SummaryInfoCard
        summary={summaries.verificationQueue}
        icon={<UserRoundCheck className="size-4" />}
      />
      <SummaryInfoCard
        summary={summaries.linkedTickets}
        icon={<Headphones className="size-4" />}
      />
    </div>
  );
}
