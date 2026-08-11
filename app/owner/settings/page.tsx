import Link from "next/link";
import { ArrowRight, CircleHelp, ShieldCheck } from "lucide-react";
import { Card } from "@/features/design-system";

const settingsCards = [
  {
    title: "Verification",
    description: "Review your identity, documents, and verification status.",
    href: "/owner/verification",
    icon: ShieldCheck,
  },
  {
    title: "Help Center",
    description: "Get help with listings, bookings, payouts, and your Owner account.",
    href: "/owner/help-center",
    icon: CircleHelp,
  },
] as const;

export default function OwnerSettingsPage() {
  return (
    <div className="owner-dashboard-content">
      <div className="px-7 pt-6 max-[600px]:px-4">
        <h1 className="owner-page-title">Settings</h1>
        <p className="owner-page-description mt-2">Manage your Owner account and support preferences.</p>
        <div className="mt-5 grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
          {settingsCards.map((item) => (
            <Link key={item.href} href={item.href} className="group block rounded-[var(--radius-xl)] outline-none focus-visible:shadow-[var(--shadow-focus)]">
              <Card className="h-full min-h-40 border-[var(--border)] p-6 transition-[border-color,box-shadow,background-color] duration-200 group-hover:border-[var(--brand)]/35 group-hover:shadow-[var(--shadow-card-hover)] group-active:bg-[var(--surface-muted)]">
                <span className="grid size-11 place-items-center rounded-[var(--radius-md)] bg-[var(--brand-soft)] text-[var(--brand)] transition-colors duration-200 group-hover:bg-[var(--brand)] group-hover:text-white">
                  <item.icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
                </span>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="owner-section-title transition-colors group-hover:text-[var(--brand)]">{item.title}</h2>
                    <p className="owner-body mt-2 text-[#59637d]">{item.description}</p>
                  </div>
                  <ArrowRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-[var(--brand)]" strokeWidth={1.8} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
