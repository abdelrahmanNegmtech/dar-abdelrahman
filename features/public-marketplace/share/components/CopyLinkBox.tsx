"use client";

import { KeyboardEvent } from "react";
import { Button, CopyIcon, LinkIcon } from "@/components/ui";
import type { ShareModalState } from "../types";

type CopyLinkBoxProps = {
  onCopy: () => void;
  status: ShareModalState;
  url: string;
};

export function CopyLinkBox({ onCopy, status, url }: CopyLinkBoxProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
      event.preventDefault();
      onCopy();
    }
  }

  return (
    <section>
      <label className="mb-2 block text-[13px] font-bold text-[#0F172A]" htmlFor="share-property-link">
        Copy link
      </label>
      <div
        className="grid gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-3 sm:grid-cols-[minmax(0,1fr)_116px]"
        onKeyDown={handleKeyDown}
      >
        <div className="flex h-12 min-w-0 items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 text-[#64748B]">
          <LinkIcon className="size-5 shrink-0 text-[#5E2FE5]" />
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-[#334155] outline-none"
            id="share-property-link"
            readOnly
            value={url}
          />
        </div>
        <Button
          className={`h-12 rounded-xl px-4 text-[14px] ${status === "copied" ? "bg-[#16A34A] shadow-[0_16px_30px_rgba(22,163,74,0.20)]" : ""}`}
          disabled={status === "copy-loading"}
          onClick={onCopy}
        >
          <CopyIcon className="size-4" />
          {status === "copy-loading" ? "Copying" : status === "copied" ? "Copied" : "Copy"}
        </Button>
      </div>
    </section>
  );
}
