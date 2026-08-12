"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { decideOwnerBookingAction } from "./actions";

export function OwnerBookingDecisionPanel({
  bookingId,
  canDecide,
  statusLabel,
}: {
  bookingId: string;
  canDecide: boolean;
  statusLabel: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [decision, setDecision] = useState<"approve" | "decline">("approve");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!canDecide) {
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await decideOwnerBookingAction({
        bookingId,
        decision,
        message,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_4px_18px_rgba(25,33,60,.025)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="owner-card-title">Decision</h2>
        <span className="owner-badge rounded-full bg-slate-100 px-3 py-1 text-slate-700">{statusLabel}</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          className={`rounded-lg border px-4 py-3 text-left text-sm font-bold ${decision === "approve" ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-700"}`}
          disabled={!canDecide || isPending}
          onClick={() => setDecision("approve")}
          type="button"
        >
          Approve booking
        </button>
        <button
          className={`rounded-lg border px-4 py-3 text-left text-sm font-bold ${decision === "decline" ? "border-red-300 bg-red-50 text-red-700" : "border-slate-200 text-slate-700"}`}
          disabled={!canDecide || isPending}
          onClick={() => setDecision("decline")}
          type="button"
        >
          Decline booking
        </button>
      </div>
      <label className="mt-4 block text-sm font-semibold text-slate-700">
        Message to traveler
        <textarea
          className="mt-2 min-h-28 w-full rounded-lg border border-slate-200 p-3 text-sm font-medium outline-none focus:border-violet-500"
          disabled={!canDecide || isPending}
          maxLength={500}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Add an optional message for the traveler."
          value={message}
        />
      </label>
      {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700"
          disabled={isPending}
          onClick={() => router.push("/owner/bookings")}
          type="button"
        >
          Back to bookings
        </button>
        <button
          className="rounded-lg bg-[#5522d9] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-violet-300"
          disabled={!canDecide || isPending}
          onClick={submit}
          type="button"
        >
          {isPending ? "Saving..." : decision === "approve" ? "Approve booking" : "Confirm decline"}
        </button>
      </div>
    </section>
  );
}
