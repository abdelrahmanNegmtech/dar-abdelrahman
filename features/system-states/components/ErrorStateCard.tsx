"use client";

import { HeadphonesIcon, LockIcon, RefreshCwIcon, WifiIcon } from "@/components/ui";
import type { ErrorStateConfig } from "../types";
import { AlertTriangleIcon, UploadIcon } from "./SystemIcons";
import { StateActionLink } from "./StateActionLink";

const toneClasses = {
  error: "border-[#FCA5A5] bg-[#FFF7F7] text-[#DC2626]",
  info: "border-[#C4B5FD] bg-[#F8F5FF] text-[#5E2FE5]",
  success: "border-[#86EFAC] bg-[#F0FDF4] text-[#16A34A]",
  warning: "border-[#FCD34D] bg-[#FFFBEB] text-[#B45309]",
};

export function ErrorStateCard({ actions = [], description, icon, title, variant = "error" }: ErrorStateConfig) {
  return (
    <section
      className={`rounded-xl border bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.04)] ${toneClasses[variant]}`}
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="grid size-20 shrink-0 place-items-center rounded-full bg-current/15">{icon}</div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[18px] font-black text-[#0F172A]">{title}</h2>
          <p className="mt-2 max-w-[420px] text-[14px] font-medium leading-6 text-[#475569]">{description}</p>
        </div>
      </div>
      {actions.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {actions.map((action) => (
            <StateActionLink key={action.label} {...action} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ReceiptVerificationError() {
  return (
    <ErrorStateCard
      actions={[
        { label: "Upload again" },
        { href: "mailto:support@dar.example", label: "Contact support", variant: "secondary" },
      ]}
      description="Please upload a clearer receipt or contact support."
      icon={<AlertTriangleIcon className="size-10" />}
      title="Receipt could not be verified."
      variant="error"
    />
  );
}

export function ConnectionErrorState() {
  return (
    <ErrorStateCard
      actions={[{ label: "Retry", onClick: () => window.location.reload() }]}
      description="Check your connection and try again."
      icon={<WifiIcon className="size-10" />}
      title="Something went wrong."
      variant="warning"
    />
  );
}

export function AccessRestrictedState() {
  return (
    <ErrorStateCard
      description="You do not have permission to view this area."
      icon={<LockIcon className="size-10" />}
      title="Access restricted."
      variant="info"
    />
  );
}

export function SearchErrorState() {
  return (
    <div className="space-y-5">
      <ConnectionErrorState />
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: RefreshCwIcon, title: "Retry search", text: "Refresh current results." },
            { icon: UploadIcon, title: "Clear filters", text: "Start with a clean query." },
            { icon: HeadphonesIcon, title: "Support", text: "Ask our team for help." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article className="text-center" key={item.title}>
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#F4F1FF] text-[#5E2FE5]">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-3 text-[14px] font-black text-[#0F172A]">{item.title}</h3>
                <p className="mt-1 text-[12px] font-medium leading-5 text-[#64748B]">{item.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
