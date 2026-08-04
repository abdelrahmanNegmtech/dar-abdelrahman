"use client";

import { useCallback, useState } from "react";

export function useAccordion(initialOpenId?: string) {
  const [openId, setOpenId] = useState<string | null>(initialOpenId ?? null);

  const toggle = useCallback((id: string) => {
    setOpenId((current) => (current === id ? null : id));
  }, []);

  return { openId, setOpenId, toggle };
}
