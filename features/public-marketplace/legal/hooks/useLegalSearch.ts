"use client";

import { useMemo, useState } from "react";
import { legalFaqs, legalPolicies, quickLinks } from "../data";

const normalize = (value: string) => value.trim().toLowerCase();

export function useLegalSearch() {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query);

  const filteredPolicies = useMemo(() => {
    if (!normalizedQuery) return legalPolicies;

    return legalPolicies
      .map((policy) => ({
        ...policy,
        blocks: policy.blocks.filter((block) =>
          [policy.title, policy.summary, policy.description, block.title, "body" in block ? block.body : block.items.join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        ),
      }))
      .filter((policy) => {
        const policyText = [policy.title, policy.summary, policy.description, policy.jumpLinks.join(" ")]
          .join(" ")
          .toLowerCase();
        return policyText.includes(normalizedQuery) || policy.blocks.length > 0;
      });
  }, [normalizedQuery]);

  const filteredFaqs = useMemo(() => {
    if (!normalizedQuery) return legalFaqs;
    return legalFaqs.filter((faq) =>
      [faq.question, faq.answer, faq.policy].join(" ").toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  const filteredQuickLinks = useMemo(() => {
    if (!normalizedQuery) return quickLinks;
    return quickLinks.filter((link) => link.label.toLowerCase().includes(normalizedQuery));
  }, [normalizedQuery]);

  return {
    filteredFaqs,
    filteredPolicies,
    filteredQuickLinks,
    hasQuery: normalizedQuery.length > 0,
    query,
    searchTerm: normalizedQuery,
    setQuery,
  };
}
