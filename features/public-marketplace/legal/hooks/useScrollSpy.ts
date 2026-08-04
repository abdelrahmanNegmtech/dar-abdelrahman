"use client";

import { useEffect, useState } from "react";

export function useScrollSpy(ids: string[], offset = 160) {
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  useEffect(() => {
    if (ids.length === 0) return;

    function updateActiveSection() {
      const current = ids
        .map((id) => {
          const element = document.getElementById(id);
          return element ? { id, top: Math.abs(element.getBoundingClientRect().top - offset) } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a!.top - b!.top)[0];

      if (current?.id) setActiveId(current.id);
    }

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [ids, offset]);

  return activeId;
}
