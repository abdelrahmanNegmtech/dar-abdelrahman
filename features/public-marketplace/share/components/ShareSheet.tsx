"use client";

import type { ReactNode } from "react";

type ShareSheetProps = {
  children: ReactNode;
  state: string;
};

export function ShareSheet({ children, state }: ShareSheetProps) {
  const visible = state !== "closing";

  return (
    <div
      className={`w-full max-w-[560px] transform overflow-hidden bg-white shadow-[0_26px_90px_rgba(15,23,42,0.22)] transition duration-200 motion-reduce:transition-none md:rounded-[28px] ${
        visible ? "translate-y-0 opacity-100 md:scale-100" : "translate-y-5 opacity-0 md:scale-[0.98]"
      } fixed bottom-0 left-0 right-0 max-h-[92dvh] rounded-t-[28px] md:static md:max-h-[86dvh]`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {children}
    </div>
  );
}
