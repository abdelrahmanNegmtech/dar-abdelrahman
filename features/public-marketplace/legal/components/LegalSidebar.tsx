"use client";

import { useState } from "react";
import { ChevronDownIcon, ShieldIcon } from "@/components/ui";
import type { LegalPolicy } from "../types";

type LegalSidebarProps = {
  activeId: string;
  onSelect: (id: string) => void;
  policies: LegalPolicy[];
};

export function LegalSidebar({ activeId, onSelect, policies }: LegalSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activePolicy = policies.find((policy) => policy.id === activeId) ?? policies[0];

  const nav = (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
      <p className="px-3 pb-3 text-[13px] font-extrabold text-[#0F172A]">Policies</p>
      <nav aria-label="Legal policies" className="space-y-1">
        {policies.map((policy) => {
          const Icon = policy.icon;
          const active = activeId === policy.id;

          return (
            <button
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-[13px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] ${
                active
                  ? "border-[#8B5CF6] bg-[#F7F3FF] text-[#5E2FE5]"
                  : "border-transparent text-[#334155] hover:border-[#E5E7EB] hover:bg-[#F8FAFC]"
              }`}
              key={policy.id}
              onClick={() => onSelect(policy.id)}
              type="button"
            >
              <Icon className="size-4 shrink-0" />
              {policy.title}
            </button>
          );
        })}
      </nav>

      <div className="mt-5 border-t border-[#E5E7EB] pt-4">
        <button
          aria-expanded="true"
          className="flex w-full items-center justify-between px-3 text-[13px] font-extrabold text-[#0F172A]"
          type="button"
        >
          Jump to in {activePolicy?.title.replace(" of Service", "")}
          <ChevronDownIcon className="size-4" />
        </button>
        <ul className="mt-3 space-y-2 px-3">
          {activePolicy?.jumpLinks.map((link) => (
            <li className="flex items-center gap-3 text-[12px] font-semibold text-[#334155]" key={link}>
              <span className="size-1.5 rounded-full bg-[#5E2FE5]" />
              {link}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 rounded-xl bg-[linear-gradient(135deg,#FFF8EA_0%,#FFFFFF_100%)] p-5">
        <ShieldIcon className="size-8 text-[#0F172A]" />
        <p className="mt-3 text-[13px] font-extrabold text-[#0F172A]">Your trust is our priority</p>
        <p className="mt-2 text-[12px] font-medium leading-5 text-[#64748B]">
          DAR uses secure systems, verified processes and real people to protect your bookings.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden">
        <button
          aria-controls="mobile-legal-navigation"
          aria-expanded={mobileOpen}
          className="flex w-full items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] font-extrabold text-[#0F172A] shadow-[0_10px_26px_rgba(15,23,42,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]"
          onClick={() => setMobileOpen((open) => !open)}
          type="button"
        >
          {activePolicy?.title ?? "Legal policies"}
          <ChevronDownIcon className={`size-4 transition ${mobileOpen ? "rotate-180" : ""}`} />
        </button>
        <div
          className={`grid transition-[grid-template-rows] duration-300 ${mobileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
          id="mobile-legal-navigation"
        >
          <div className="overflow-hidden pt-3">{nav}</div>
        </div>
      </div>
      <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">{nav}</aside>
    </>
  );
}
