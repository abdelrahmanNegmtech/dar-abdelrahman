"use client";

import Link from "next/link";
import { OwnerShell } from "@/components/owner/owner-shell";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PropertyStatus({ id }: { id: string }) {
  const router = useRouter();
  const [status, setStatus] = useState("pending_review");

  useEffect(() => {
    let active = true;
    async function refreshStatus() {
      try {
        const response = await fetch(`/api/owner/properties/${encodeURIComponent(id)}/submit`, { cache: "no-store" });
        if (!response.ok) return;
        const property = await response.json() as { status: string };
        if (!active) return;
        setStatus(property.status);
        window.localStorage.setItem(`dar-owner-property-status:${id}`, property.status);
        if (property.status === "rejected") router.replace(`/owner/properties/${id}/rejected`);
      } catch {
        const saved = window.localStorage.getItem(`dar-owner-property-status:${id}`);
        if (saved) setStatus(saved);
        if (saved === "rejected") router.replace(`/owner/properties/${id}/rejected`);
      }
    }
    refreshStatus();
    const interval = window.setInterval(refreshStatus, 15000);
    return () => { active = false; window.clearInterval(interval); };
  }, [id, router]);

  return <OwnerShell active="My Properties"><div className="owner-dashboard-content"><section className="w-full rounded-2xl border border-[#e8ebf3] bg-white p-5 shadow-sm"><span className="owner-badge inline-flex rounded-full bg-[#fff3d7] px-3 py-1">{status === "pending_review" ? "Pending Review" : status.replaceAll("_", " ")}</span><h1 className="owner-page-title mt-5">Modern Apartment in Zamalek</h1><p className="owner-page-description mt-3">Your property has been submitted to DAR and is waiting for review. We will notify you when its status changes.</p><Link href="/owner/properties" className="owner-button-text mt-6 inline-flex h-10 items-center rounded-lg bg-[#5824e6] px-5 text-white">Back to My Properties</Link></section></div></OwnerShell>;
}
