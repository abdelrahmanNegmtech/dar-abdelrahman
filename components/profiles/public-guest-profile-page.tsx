import Image from "next/image";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Globe2, Heart, ShieldCheck, Star, UserRound } from "lucide-react";
import { DarLogo } from "@/components/brand/dar-logo";
import { Card } from "@/features/design-system";
import { MarketplaceFooter } from "@/features/public-marketplace/components/MarketplaceFooter";

const stats = [
  { icon: Star, value: "4.9", label: "Guest rating" },
  { icon: Star, value: "26", label: "Reviews" },
  { icon: CalendarDays, value: "April 2023", label: "Member since" },
] as const;

export function PublicGuestProfilePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-xs text-[var(--foreground-muted)]">
          <Link href="/" className="rounded hover:text-[var(--brand)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]">Home</Link>
          <span className="mx-1.5">/</span><span>Profiles</span><span className="mx-1.5">/</span><span className="font-medium text-[var(--foreground)]">Omar Khaled</span>
        </nav>

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
          <div className="min-w-0 space-y-5">
            <Card className="p-5 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <Image src="/omar-khaled-profile-reference.png" alt="Omar Khaled" width={112} height={112} priority className="size-24 shrink-0 rounded-full border-4 border-white object-cover shadow-[var(--shadow-sm)] sm:size-28" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold sm:text-3xl">Omar Khaled</h1>
                    <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">Guest</span>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[var(--success)]"><ShieldCheck className="size-4" />ID verified</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">Software engineer from Alexandria. Loves to travel and explore new places.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 border-t border-[var(--border)] pt-5 sm:grid-cols-3">
                {stats.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]"><Icon className="size-5" /></span>
                    <span><strong className="block text-base">{value}</strong><span className="mt-0.5 block text-xs text-[var(--foreground-muted)]">{label}</span></span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <h2 className="text-lg font-semibold">About Omar</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--foreground-muted)]">Software engineer from Alexandria.<br />Loves to travel and explore new places.</p>
            </Card>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-20">
            <Card className="p-5">
              <h2 className="text-lg font-semibold">Guest verification</h2>
              <p className="mt-4 flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-[var(--success)]" />Identity verified</p>
              <p className="mt-3 flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-[var(--success)]" />DAR member since April 2023</p>
            </Card>

            <Card className="p-5">
              <h2 className="text-lg font-semibold">Communication</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4"><dt className="text-[var(--foreground-muted)]">Response rate</dt><dd className="font-semibold">100%</dd></div>
                <div className="flex items-center justify-between gap-4"><dt className="text-[var(--foreground-muted)]">Response time</dt><dd className="font-semibold">Within an hour</dd></div>
              </dl>
            </Card>

            <Card className="p-5">
              <h2 className="text-lg font-semibold">Safety</h2>
              <p className="mt-3 flex gap-3 text-sm leading-6 text-[var(--foreground-muted)]"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-[var(--brand)]" />Keep communication, payments, and booking changes inside DAR.</p>
            </Card>
          </aside>
        </div>
      </main>
      <MarketplaceFooter />
    </div>
  );
}

function PublicHeader() {
  return <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-8"><Link href="/" aria-label="DAR home" className="rounded focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"><DarLogo size="compact" /></Link><nav aria-label="Public navigation" className="ml-auto hidden items-center gap-7 text-sm font-medium md:flex"><Link className="hover:text-[var(--brand)]" href="/search">Stays</Link><Link className="hover:text-[var(--brand)]" href="/hotels">Hotels</Link><Link className="hover:text-[var(--brand)]" href="/become-a-host">Become a host</Link><Link className="hover:text-[var(--brand)]" href="/about">About us</Link><Link className="hover:text-[var(--brand)]" href="/help">Help</Link></nav><Link href="/favorites" aria-label="Saved stays" className="ml-auto rounded-full p-2 hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] md:ml-4"><Heart className="size-5" strokeWidth={1.8} /></Link><span className="hidden items-center gap-2 text-sm sm:flex"><Globe2 className="size-4" />English / EGP</span><Link href="/login" aria-label="Sign in" className="rounded-full p-2 hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"><UserRound className="size-5" /></Link></div></header>;
}
