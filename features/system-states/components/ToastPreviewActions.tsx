"use client";

import { toastExamples } from "../data/systemStates";
import { useToast } from "../hooks/useToast";

export function ToastPreviewActions() {
  const { showToast } = useToast();

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {toastExamples.map((toast) => (
        <button
          className="h-11 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[13px] font-black text-[#0F172A] transition hover:border-[#A78BFA] hover:bg-[#F7F3FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]"
          key={toast.title}
          onClick={() => showToast(toast)}
          type="button"
        >
          {toast.title}
        </button>
      ))}
    </div>
  );
}
