import Link from "next/link";
import { OwnerShell } from "@/components/owner/owner-shell";

export default function OwnerHelpCenterPage() {
  return <OwnerShell active="Settings"><div className="owner-dashboard-content"><section className="w-full rounded-xl border border-[#e3e7ef] bg-white p-5"><h1 className="owner-page-title">Help Center</h1><p className="owner-page-description mt-3">How can we help with your property?</p><Link href="/owner/properties" className="owner-button-text mt-6 inline-flex rounded-lg bg-[#5824e6] px-5 py-3 text-white">Back to My Properties</Link></section></div></OwnerShell>;
}
