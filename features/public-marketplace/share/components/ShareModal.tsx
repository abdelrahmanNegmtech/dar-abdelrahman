"use client";

import { MouseEvent, useEffect, useId, useRef, useState } from "react";
import { CloseIcon } from "@/components/ui";
import { useClipboard } from "../hooks/useClipboard";
import type { ShareChannel, ShareModalState, SharePropertyData } from "../types";
import { defaultShareProperty } from "../types";
import { CopyLinkBox } from "./CopyLinkBox";
import { ShareActionGrid } from "./ShareActionGrid";
import { SharePropertyPreview } from "./SharePropertyPreview";
import { ShareSheet } from "./ShareSheet";
import { ShareSuccessMessage } from "./ShareSuccessMessage";

type ShareModalProps = {
  onClose: () => void;
  open: boolean;
  property?: Partial<SharePropertyData>;
  state?: ShareModalState;
};

type Feedback = {
  description: string;
  title: string;
  tone?: "success" | "error" | "info";
};

export function ShareModal({ onClose, open, property, state = "open" }: ShareModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const { copy, status, setStatus } = useClipboard();
  const [selectedChannel, setSelectedChannel] = useState<ShareChannel | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const propertyData: SharePropertyData = { ...defaultShareProperty, ...property };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  async function copyLink() {
    const copied = await copy(propertyData.url);
    if (copied) {
      setFeedback({
        description: "You can paste the link anywhere you want.",
        title: "Link copied!",
        tone: "success",
      });
    } else {
      setStatus("copy-error");
      setFeedback({
        description: "Copy failed in this browser. Select the link and press Ctrl+C.",
        title: "Could not copy link",
        tone: "error",
      });
    }
    return copied;
  }

  return (
    <div
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      aria-modal="true"
      className={`fixed inset-0 z-[80] flex items-end justify-center overflow-hidden bg-[#0F172A]/55 p-0 backdrop-blur-[6px] transition duration-200 motion-reduce:transition-none md:items-center md:p-6 ${
        state === "closing" ? "opacity-0" : "opacity-100"
      }`}
      onMouseDown={handleOverlayClick}
      role="dialog"
    >
      <ShareSheet state={state}>
        <div className="max-h-[92dvh] overflow-y-auto px-5 pb-5 pt-4 md:max-h-[86dvh] md:px-7 md:pb-7 md:pt-6">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#CBD5E1] md:hidden" />
          <header className="flex items-start justify-between gap-5">
            <div>
              <h2 className="text-[24px] font-bold leading-tight text-[#0F172A]" id={titleId}>
                Share this property
              </h2>
              <p className="mt-2 text-[15px] leading-6 text-[#64748B]" id={descriptionId}>
                Invite your friends or share this place.
              </p>
            </div>
            <button
              aria-label="Close share dialog"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-[#E5E7EB] bg-white text-[#0F172A] transition hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2"
              onClick={onClose}
              ref={closeButtonRef}
              type="button"
            >
              <CloseIcon className="size-5" />
            </button>
          </header>

          <div className="mt-6 space-y-5">
            <SharePropertyPreview property={propertyData} />

            <section>
              <h3 className="mb-3 text-[13px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                Share via
              </h3>
              <ShareActionGrid
                onCopyFallback={copyLink}
                onMessage={setFeedback}
                onSelect={setSelectedChannel}
                property={propertyData}
                selectedChannel={selectedChannel}
              />
            </section>

            <CopyLinkBox onCopy={copyLink} status={status} url={propertyData.url} />

            {feedback ? (
              <ShareSuccessMessage
                description={feedback.description}
                title={feedback.title}
                tone={feedback.tone}
              />
            ) : null}
          </div>
        </div>
      </ShareSheet>
    </div>
  );
}
