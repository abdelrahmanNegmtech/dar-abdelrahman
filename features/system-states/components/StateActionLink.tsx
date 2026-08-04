"use client";

import Link from "next/link";
import type { EmptyStateAction } from "../types";

type StateActionLinkProps = EmptyStateAction;

export function StateActionLink({ href, label, onClick, variant = "primary" }: StateActionLinkProps) {
  const className =
    variant === "primary"
      ? "inline-flex h-11 items-center justify-center rounded-lg bg-[linear-gradient(180deg,#6C3DFF_0%,#5527D8_100%)] px-7 text-[14px] font-extrabold text-white shadow-[0_14px_28px_rgba(108,61,255,0.22)] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2 max-sm:w-full"
      : "inline-flex h-11 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white px-7 text-[14px] font-extrabold text-[#0F172A] transition hover:border-[#A78BFA] hover:bg-[#F7F3FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2 max-sm:w-full";

  if (href) {
    return (
      <Link className={className} href={href}>
        {label}
      </Link>
    );
  }

  return (
    <button className={className} onClick={onClick} type="button">
      {label}
    </button>
  );
}
