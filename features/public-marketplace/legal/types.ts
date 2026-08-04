import type { ComponentType, SVGProps } from "react";

export type LegalPolicySlug =
  | "terms"
  | "privacy"
  | "cancellation"
  | "payment"
  | "owner-rules"
  | "guest-rules";

export type LegalBlock =
  | {
      body: string;
      id: string;
      title: string;
      type: "accordion";
    }
  | {
      id: string;
      items: string[];
      title: string;
      type: "list";
    }
  | {
      body: string;
      id: string;
      tone: "warning" | "info" | "note";
      title: string;
      type: "callout";
    };

export type LegalPolicy = {
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  id: LegalPolicySlug;
  jumpLinks: string[];
  summary: string;
  title: string;
  updatedAt: string;
  blocks: LegalBlock[];
};

export type LegalFaq = {
  answer: string;
  id: string;
  policy: LegalPolicySlug;
  question: string;
};

export type TrustHighlight = {
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
};

export type QuickLink = {
  label: string;
  target: string;
};
