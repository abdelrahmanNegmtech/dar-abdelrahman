"use client";

import { useEffect, useMemo } from "react";
import { MarketplaceShell } from "@/features/public-marketplace/components/MarketplaceShell";
import { legalPolicies } from "../data";
import type { LegalPolicySlug } from "../types";
import { useLegalSearch } from "../hooks/useLegalSearch";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { AcceptanceChecklist } from "./AcceptanceChecklist";
import { ActionButtons } from "./ActionButtons";
import { FAQSection } from "./FAQSection";
import { LegalContent } from "./LegalContent";
import { LegalHero } from "./LegalHero";
import { LegalSidebar } from "./LegalSidebar";
import { TrustSidebar } from "./TrustSidebar";

type LegalCenterPageProps = {
  initialPolicy?: LegalPolicySlug;
};

export function LegalCenterPage({ initialPolicy }: LegalCenterPageProps) {
  const { filteredFaqs, filteredPolicies, filteredQuickLinks, hasQuery, query, searchTerm, setQuery } = useLegalSearch();
  const visiblePolicies = useMemo(
    () =>
      initialPolicy && !hasQuery
        ? legalPolicies.filter((policy) => policy.id === initialPolicy)
        : filteredPolicies,
    [filteredPolicies, hasQuery, initialPolicy],
  );
  const policyIds = useMemo(() => visiblePolicies.map((policy) => policy.id), [visiblePolicies]);
  const activeId = useScrollSpy(policyIds);

  useEffect(() => {
    if (!initialPolicy) return;
    const element = document.getElementById(initialPolicy);
    element?.scrollIntoView({ block: "start" });
  }, [initialPolicy]);

  function selectPolicy(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <MarketplaceShell>
      <LegalHero onSearchChange={setQuery} searchValue={query} />

      <div className="mx-auto grid max-w-[1760px] gap-5 px-5 py-5 sm:px-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-11 xl:grid-cols-[250px_minmax(0,1fr)_470px]">
        <LegalSidebar activeId={activeId} onSelect={selectPolicy} policies={initialPolicy && !hasQuery ? visiblePolicies : legalPolicies} />

        <div className="min-w-0 space-y-5">
          {hasQuery ? (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#FBFCFF] px-4 py-3 text-[13px] font-bold text-[#334155]">
              Showing matches for <span className="text-[#5E2FE5]">&ldquo;{query}&rdquo;</span>
            </div>
          ) : null}
          <LegalContent policies={visiblePolicies} query={searchTerm} />
          <div className="grid gap-5 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <AcceptanceChecklist />
            <ActionButtons />
          </div>
          <div className="xl:hidden">
            <TrustSidebar quickLinks={filteredQuickLinks} query={searchTerm} />
          </div>
        </div>

        <div className="hidden xl:block">
          <TrustSidebar quickLinks={filteredQuickLinks} query={searchTerm} />
        </div>
      </div>

      <FAQSection faqs={filteredFaqs} query={searchTerm} />
    </MarketplaceShell>
  );
}
