"use client";

import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ToastContext } from "../hooks/useToast";
import type { ToastInput, ToastMessage } from "../types";
import { Toast } from "./Toast";

type ToastProviderProps = {
  children: ReactNode;
  initialToasts?: ToastMessage[];
};

export function ToastProvider({ children, initialToasts = [] }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>(initialToasts);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: ToastInput) => {
    setToasts((current) => [
      ...current,
      {
        ...toast,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
    ]);
  }, []);

  const value = useMemo(() => ({ dismissToast, showToast, toasts }), [dismissToast, showToast, toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-[90] space-y-3 sm:bottom-auto sm:left-auto sm:right-5 sm:top-5 sm:w-[380px]"
      >
        {toasts.map((toast) => (
          <div className="pointer-events-auto" key={toast.id}>
            <Toast onClose={dismissToast} toast={toast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
