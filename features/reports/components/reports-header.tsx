"use client";

import Image from "next/image";
import { Bell, CalendarDays, ChevronDown, Download, Globe, Upload } from "lucide-react";

import { Button } from "@/features/design-system";

export function ReportsHeader() {
  return (
    <header className="bg-white px-5 py-3 md:px-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-end gap-2.5">
          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              className="relative inline-flex size-[38px] items-center justify-center rounded-[0.7rem] bg-transparent text-foreground shadow-none"
            >
              <Bell className="size-4" />
            </button>
            <span className="absolute -right-1 -top-1 inline-flex size-4.5 items-center justify-center rounded-full bg-[#6C4CF1] text-[0.6rem] font-semibold text-white shadow-none">
              3
            </span>
          </div>

          <Button
            variant="outline"
            size="md"
            leadingIcon={<Globe className="size-4" />}
            trailingIcon={<ChevronDown className="size-4" />}
            className="h-[38px] rounded-[0.7rem] border-0 bg-transparent px-1.5 text-[0.76rem] font-medium text-foreground shadow-none hover:bg-transparent"
          >
            English / EGP
          </Button>

          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-[0.7rem] border-transparent bg-transparent px-0 py-0 shadow-none"
            aria-label="Open admin profile menu"
          >
            <div className="relative size-7 shrink-0 overflow-hidden rounded-full ring-1 ring-black/5">
              <Image
                src="/admin-team.svg"
                alt="Admin Team"
                fill
                sizes="28px"
                className="object-cover"
              />
            </div>
            <ChevronDown className="size-3.5 text-foreground-subtle" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
          <div className="space-y-1">
            <h1 className="text-[23px] font-bold leading-[1.08] text-foreground">
              Reports &amp; analytics
            </h1>
            <p className="max-w-2xl text-[12px] leading-[1.45] text-foreground-muted">
              Track growth, revenue, bookings, city performance and operational health.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leadingIcon={<CalendarDays className="size-4" />}
              trailingIcon={<ChevronDown className="size-4" />}
              className="inline-flex h-[36px] items-center justify-center rounded-[0.45rem] border-border/90 bg-white px-3.5 text-[0.76rem] font-medium text-foreground shadow-[0_4px_10px_rgba(16,25,58,0.05)] hover:bg-white"
            >
              Last 30 days
            </Button>
            <Button
              variant="outline"
              size="sm"
              leadingIcon={<Download className="size-4" />}
              className="inline-flex h-[36px] items-center justify-center rounded-[0.45rem] border-border/90 bg-white px-3.5 text-[0.76rem] font-medium text-foreground shadow-[0_4px_10px_rgba(16,25,58,0.05)] hover:bg-white"
            >
              Export report
            </Button>
            <Button
              variant="primary"
              size="sm"
              leadingIcon={<Upload className="size-4" />}
              className="inline-flex h-[36px] items-center justify-center rounded-[0.45rem] bg-[linear-gradient(90deg,#5b34e6_0%,#4c2ad6_100%)] px-3.5 text-[0.76rem] font-semibold text-white shadow-[0_8px_18px_rgba(91,52,230,0.18)] hover:bg-[linear-gradient(90deg,#5b34e6_0%,#4c2ad6_100%)]"
            >
              Schedule report
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
