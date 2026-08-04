"use client";

import { useCallback, useRef, useState } from "react";
import type { ShareModalState } from "../types";

export function useClipboard() {
  const [status, setStatus] = useState<ShareModalState>("open");
  const resetTimer = useRef<number | null>(null);

  const copy = useCallback(async (text: string) => {
    setStatus("copy-loading");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement("textarea");
        input.value = text;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(input);
        if (!copied) throw new Error("Copy command failed");
      }

      setStatus("copied");
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setStatus("open"), 2600);
      return true;
    } catch {
      setStatus("copy-error");
      return false;
    }
  }, []);

  return { copy, status, setStatus };
}
