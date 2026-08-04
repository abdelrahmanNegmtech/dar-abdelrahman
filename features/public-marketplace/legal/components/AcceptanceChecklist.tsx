"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui";

const items = [
  { id: "accept-terms", label: "I accept DAR Terms of Service." },
  { id: "accept-privacy", label: "I accept Privacy Policy." },
  { id: "accept-cancellation", label: "I understand Cancellation Policy." },
];

export function AcceptanceChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
      <h2 className="text-[15px] font-extrabold text-[#0F172A]">Your acceptance</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <Checkbox
            checked={Boolean(checked[item.id])}
            id={item.id}
            key={item.id}
            label={item.label}
            onChange={(event) => setChecked((current) => ({ ...current, [item.id]: event.target.checked }))}
          />
        ))}
      </div>
    </section>
  );
}
