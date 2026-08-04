import type { QuickLink } from "../types";
import { CancellationOptions } from "./CancellationOptions";
import { LanguageSelector } from "./LanguageSelector";
import { PaymentPolicy } from "./PaymentPolicy";
import { PolicyStatus } from "./PolicyStatus";
import { PrivacyHighlights } from "./PrivacyHighlights";
import { QuickLinks } from "./QuickLinks";
import { SupportCard } from "./SupportCard";

type TrustSidebarProps = {
  quickLinks: QuickLink[];
  query: string;
};

export function TrustSidebar({ quickLinks, query }: TrustSidebarProps) {
  return (
    <aside className="space-y-5">
      <div className="hidden xl:block">
        <SupportCard />
      </div>
      <PrivacyHighlights />
      <CancellationOptions />
      <PaymentPolicy />
      <div className="xl:hidden">
        <SupportCard />
      </div>
      <QuickLinks links={quickLinks} query={query} />
      <PolicyStatus />
      <LanguageSelector />
    </aside>
  );
}
