"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon, InfoIcon } from "@/components/ui";
import type { ToastMessage } from "../types";
import { AlertTriangleIcon, XIcon } from "./SystemIcons";

type ToastProps = {
  duration?: number;
  onClose: (id: string) => void;
  toast: ToastMessage;
};

const variants = {
  error: {
    bar: "bg-[#DC2626]",
    border: "border-[#FCA5A5]",
    icon: <AlertTriangleIcon className="size-5" />,
    iconBg: "bg-[#FEE2E2] text-[#DC2626]",
  },
  info: {
    bar: "bg-[#5E2FE5]",
    border: "border-[#C4B5FD]",
    icon: <InfoIcon className="size-5" />,
    iconBg: "bg-[#EDE9FE] text-[#5E2FE5]",
  },
  success: {
    bar: "bg-[#15803D]",
    border: "border-[#86EFAC]",
    icon: <CheckCircleIcon className="size-5" />,
    iconBg: "bg-[#DCFCE7] text-[#15803D]",
  },
  warning: {
    bar: "bg-[#D97706]",
    border: "border-[#FCD34D]",
    icon: <AlertTriangleIcon className="size-5" />,
    iconBg: "bg-[#FEF3C7] text-[#B45309]",
  },
};

export function Toast({ duration = 4500, onClose, toast }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const variant = variants[toast.type];

  useEffect(() => {
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(nextProgress);
      if (nextProgress === 0) onClose(toast.id);
    }, 80);

    return () => window.clearInterval(interval);
  }, [duration, onClose, toast.id]);

  return (
    <article
      className={`relative overflow-hidden rounded-xl border ${variant.border} bg-white p-4 pr-11 shadow-[0_18px_42px_rgba(15,23,42,0.12)]`}
      role={toast.type === "error" ? "alert" : "status"}
    >
      <button
        aria-label={`Dismiss ${toast.title}`}
        className="absolute right-3 top-3 grid size-7 place-items-center rounded-full text-[#64748B] transition hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]"
        onClick={() => onClose(toast.id)}
        type="button"
      >
        <XIcon className="size-4" />
      </button>
      <div className="flex gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-full ${variant.iconBg}`}>{variant.icon}</span>
        <div>
          <h2 className="text-[13px] font-black text-[#0F172A]">{toast.title}</h2>
          <p className="mt-1 text-[12px] font-medium leading-5 text-[#475569]">{toast.description}</p>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
        <div className={`h-full rounded-full ${variant.bar}`} style={{ width: `${progress}%` }} />
      </div>
    </article>
  );
}
