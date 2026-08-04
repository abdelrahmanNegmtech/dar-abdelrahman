"use client";

import Image from "next/image";
import { Bell, ChevronDown, Globe, Plus, Upload, UserRound } from "lucide-react";

import { Button, IconButton } from "@/features/design-system";

export function UsersTopbar() {
  return (
    <header className="bg-white px-5 py-3 md:px-6">
      <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
        <div className="space-y-1">
          <h1 className="text-[23px] font-bold leading-[1.08] text-foreground">
            Users management.
          </h1>
          <p className="max-w-2xl text-[12px] leading-[1.45] text-foreground-muted">
            Manage guests, owners, brokers, hotels and internal admin roles.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 xl:items-end">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <IconButton
                label="Notifications"
                variant="outline"
                size="md"
                icon={<Bell className="size-4" />}
                className="h-[38px] w-[38px] rounded-[0.7rem] border-0 bg-transparent text-foreground shadow-none hover:bg-transparent"
              />
              <span className="absolute -right-1 -top-1 inline-flex size-4.5 items-center justify-center rounded-full bg-[#6C4CF1] text-[0.6rem] font-semibold text-white shadow-none">
                7
              </span>
            </div>

            <Button
              variant="outline"
              size="md"
              leadingIcon={<Globe className="size-4" />}
              trailingIcon={<ChevronDown className="size-4" />}
              aria-label="Change locale and currency"
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

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <Button
              variant="outline"
              size="sm"
              leadingIcon={<Upload className="size-4" />}
              className="inline-flex h-[36px] w-[136px] items-center justify-center rounded-[0.45rem] border-border/90 bg-white px-3.5 text-[0.76rem] font-medium text-foreground shadow-[0_4px_10px_rgba(16,25,58,0.05)] hover:bg-white"
            >
              Export users
            </Button>
            <Button
              variant="outline"
              size="sm"
              leadingIcon={<UserRound className="size-4" />}
              className="inline-flex h-[36px] w-[136px] items-center justify-center rounded-[0.45rem] border-border/90 bg-white px-3.5 text-[0.76rem] font-medium text-foreground shadow-[0_4px_10px_rgba(16,25,58,0.05)] hover:bg-white"
            >
              Invite admin
            </Button>
            <Button
              variant="primary"
              size="sm"
              leadingIcon={<Plus className="size-4" />}
              className="inline-flex h-[36px] w-[136px] items-center justify-center rounded-[0.45rem] bg-[linear-gradient(90deg,#5b34e6_0%,#4c2ad6_100%)] px-3.5 text-[0.76rem] font-semibold text-white shadow-[0_8px_18px_rgba(91,52,230,0.18)] hover:bg-[linear-gradient(90deg,#5b34e6_0%,#4c2ad6_100%)]"
            >
              Create user
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
