"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/host-landing/icons";
import { ownerRoutes } from "@/lib/owner-routes";

type Action = "draft" | "preview" | "submit";

export function AddPropertyActions({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Action | null>(null);
  const [feedback, setFeedback] = useState("");

  async function run(action: Action) {
    setBusy(action);
    setFeedback("");
    const draft = { title: "Modern Studio in Madinaty", updatedAt: new Date().toISOString() };
    window.localStorage.setItem("dar-owner-add-property-draft", JSON.stringify(draft));
    window.localStorage.setItem("dar-owner-property-draft", JSON.stringify(draft));

    if (action === "draft") {
      window.localStorage.setItem("dar-owner-property-status:1", "draft");
      setFeedback("Draft saved.");
      setBusy(null);
      return;
    }

    if (action === "submit") {
      window.localStorage.setItem("dar-owner-property-status:1", "pending_review");
      try {
        await fetch("/api/owner/properties/1/submit", { method: "POST" });
      } catch {
        // The local mock state remains the source of truth when the demo API is unavailable.
      }
    }

    router.push(ownerRoutes.propertyPublish("1"));
  }

  return (
    <div className={`relative flex items-center ${compact ? "gap-4" : "gap-3"}`}>
      <ActionButton icon="receipt" disabled={busy !== null} onClick={() => run("draft")}>
        {busy === "draft" ? "Saving..." : "Save draft"}
      </ActionButton>
      <ActionButton icon="play" disabled={busy !== null} onClick={() => run("preview")}>
        {`Preview${compact ? " listing" : ""}`}
      </ActionButton>
      <ActionButton icon="navigation" primary disabled={busy !== null} onClick={() => run("submit")}>
        {busy === "submit" ? "Submitting..." : "Submit for review"}
      </ActionButton>
      {feedback ? <span role="status" className="owner-helper absolute right-0 top-full mt-1 text-[#159447]">{feedback}</span> : null}
    </div>
  );
}

function ActionButton({
  children,
  icon,
  primary = false,
  disabled,
  onClick,
}: {
  children: string;
  icon: string;
  primary?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 items-center gap-2 rounded-md px-5 owner-card-title disabled:cursor-wait disabled:opacity-70 ${primary ? "bg-[#5b2be0] text-white shadow-[0_10px_22px_rgba(91,43,224,0.18)]" : "border border-[#dbe2ee] bg-white text-[#26344f]"}`}
    >
      <Icon name={icon} className="size-4" />
      {children}
    </button>
  );
}
