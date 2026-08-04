"use client";

import { useCallback, useRef, useState } from "react";
import type { ShareModalState } from "../types";

export function useShareModal() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ShareModalState>("closed");
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const openShare = useCallback(() => {
    setOpen(true);
    setState("opening");
    window.setTimeout(() => setState("open"), 20);
  }, []);

  const closeShare = useCallback(() => {
    setState("closing");
    window.setTimeout(() => {
      setOpen(false);
      setState("closed");
      triggerRef.current?.focus();
    }, 180);
  }, []);

  return { closeShare, open, openShare, setState, state, triggerRef };
}
