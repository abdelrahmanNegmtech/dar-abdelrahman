import {
  CreditCardIcon,
  GlobeIcon,
  LockIcon,
  RefreshCwIcon,
  ShieldIcon,
  UserIcon,
} from "@/components/ui";
import type { LegalPolicy, QuickLink, TrustHighlight } from "../types";

export const legalPolicies: LegalPolicy[] = [
  {
    blocks: [
      {
        body: "You must be at least 18 years old to create an account. You are responsible for maintaining accurate profile information and keeping your account secure.",
        id: "accounts",
        title: "Accounts and eligibility",
        type: "accordion",
      },
      {
        body: "All listings on DAR are subject to owner verification and platform review before they can be published.",
        id: "verified-listings",
        title: "Verified listings and owner approval",
        type: "accordion",
      },
      {
        body: "Bookings are requests until confirmed. Instant bookings remain subject to property availability, identity checks, and payment verification.",
        id: "booking-requests",
        title: "Booking requests and confirmations",
        type: "accordion",
      },
      {
        body: "Guests must provide accurate information, respect property rules, and use the platform fairly and lawfully.",
        id: "guest-responsibilities",
        title: "Guest responsibilities",
        type: "accordion",
      },
      {
        body: "Owners and brokers must have the right to list the property and must keep pricing, photos, policies, and availability accurate.",
        id: "owner-responsibilities",
        title: "Owner and broker responsibilities",
        type: "accordion",
      },
      {
        body: "All payments are processed securely within DAR. Service fees, owner commissions, and payable amounts are shown before confirmation.",
        id: "payments",
        title: "Payments, commission and service fees",
        type: "accordion",
      },
      {
        body: "Cancellations and refunds follow the policy selected by the owner and DAR's cancellation rules.",
        id: "cancellations",
        title: "Cancellations, refunds and disputes",
        type: "accordion",
      },
      {
        body: "Off-platform payments, fraud, misleading listings, harassment, or illegal activity are strictly prohibited.",
        id: "prohibited-activity",
        title: "Prohibited activity and off-platform payments",
        type: "accordion",
      },
      {
        body: "DAR may suspend or remove accounts that violate these Terms or harm the platform, guests, owners, or payment partners.",
        id: "account-suspension",
        title: "Account suspension and removal",
        type: "accordion",
      },
      {
        body: "Off-platform payments and communication remove your protection and may lead to account suspension.",
        id: "payment-warning",
        title: "Keep all payments and booking changes inside DAR for your protection.",
        tone: "warning",
        type: "callout",
      },
    ],
    description: "Terms that govern your use of DAR marketplace services across Egypt.",
    icon: GlobeIcon,
    id: "terms",
    jumpLinks: [
      "Accounts and eligibility",
      "Booking rules",
      "Owner responsibilities",
      "Guest responsibilities",
      "Payments and fees",
      "Disputes",
      "Account suspension",
    ],
    summary: "Platform rules for guests, owners, brokers, listings, bookings, payments, and disputes.",
    title: "Terms of Service",
    updatedAt: "June 2026",
  },
  {
    blocks: [
      {
        id: "privacy-data",
        items: [
          "Account details, bookings, payment verification, and documents.",
          "Listing, message, device, and support interaction information.",
          "Fraud prevention signals used to protect bookings.",
        ],
        title: "Data we collect",
        type: "list",
      },
      {
        body: "We use data for verification, fraud prevention, support, payment handling, and booking management.",
        id: "privacy-use",
        title: "How we use data",
        type: "accordion",
      },
      {
        body: "Owner IDs and authorization documents are reviewed by DAR admins only and are protected with restricted access.",
        id: "document-privacy",
        title: "Document privacy",
        type: "accordion",
      },
      {
        body: "You can download your data, manage notifications, and request account deletion from support.",
        id: "user-controls",
        title: "User controls",
        type: "accordion",
      },
      {
        body: "Privacy controls are prepared for future CMS and account settings integration.",
        id: "privacy-note",
        title: "Future-ready privacy controls",
        tone: "info",
        type: "callout",
      },
    ],
    description: "How DAR collects, protects, uses, and stores guest and owner data.",
    icon: LockIcon,
    id: "privacy",
    jumpLinks: ["Data we collect", "How we use data", "Document privacy", "User controls"],
    summary: "Privacy commitments for verification, payments, support, and marketplace safety.",
    title: "Privacy Policy",
    updatedAt: "June 2026",
  },
  {
    blocks: [
      {
        id: "cancellation-options",
        items: [
          "Flexible: full refund before the stated deadline.",
          "Moderate: partial refund after the deadline.",
          "Strict: limited refund for special listings.",
        ],
        title: "Cancellation options",
        type: "list",
      },
      {
        body: "Manual refunds for InstaPay, Vodafone Cash, Fawry, or bank transfer may take 1-3 business days after approval.",
        id: "refund-timing",
        title: "Refund timing",
        type: "accordion",
      },
      {
        body: "DAR support can review evidence and payment status when a cancellation or refund dispute is opened.",
        id: "disputes",
        title: "Disputes and exceptions",
        type: "accordion",
      },
    ],
    description: "Refund timelines, owner-selected rules, and guest protection windows.",
    icon: RefreshCwIcon,
    id: "cancellation",
    jumpLinks: ["Flexible", "Moderate", "Strict", "Refund timing", "Disputes"],
    summary: "Clear cancellation choices with timeline visibility before confirmation.",
    title: "Cancellation Policy",
    updatedAt: "June 2026",
  },
  {
    blocks: [
      {
        id: "providers",
        items: ["Card", "Meeza", "InstaPay", "Vodafone Cash", "Fawry", "Bank transfer", "Pay on arrival"],
        title: "Payment providers",
        type: "list",
      },
      {
        body: "DAR service fees and owner commission are shown before confirmation. Owner payouts may be held until check-in confirmation.",
        id: "commission",
        title: "Payment and commission policy",
        type: "accordion",
      },
      {
        body: "Requests to pay outside DAR should be reported immediately because they remove platform payment tracking.",
        id: "payment-security",
        title: "Payment security",
        tone: "warning",
        type: "callout",
      },
    ],
    description: "Accepted payment providers, commission visibility, and payout timing.",
    icon: CreditCardIcon,
    id: "payment",
    jumpLinks: ["Payment providers", "Commission", "Owner payouts", "Payment security"],
    summary: "Secure payment flows with clear fees and payment tracking.",
    title: "Payment Policy",
    updatedAt: "June 2026",
  },
  {
    blocks: [
      {
        id: "owner-verification",
        items: [
          "Submit identity and authorization documents.",
          "Keep listings accurate before publishing.",
          "Respond to booking requests and support reviews promptly.",
        ],
        title: "Verified owner workflow",
        type: "list",
      },
      {
        body: "Owners must not request off-platform payments, misrepresent availability, or cancel confirmed bookings without a valid reason.",
        id: "owner-conduct",
        title: "Owner conduct",
        type: "accordion",
      },
    ],
    description: "Rules for verified owners, brokers, listing accuracy, and payout responsibility.",
    icon: ShieldIcon,
    id: "owner-rules",
    jumpLinks: ["Verification", "Listing accuracy", "Booking response", "Payouts"],
    summary: "Owner protections and requirements for a reliable marketplace.",
    title: "Owner Rules",
    updatedAt: "June 2026",
  },
  {
    blocks: [
      {
        id: "guest-rules",
        items: [
          "Use accurate booking and guest information.",
          "Respect house rules and neighborhood expectations.",
          "Keep booking changes, refunds, and payments inside DAR.",
        ],
        title: "Guest responsibilities",
        type: "list",
      },
      {
        body: "Guests receive platform support, dispute review, payment tracking, and fraud protection when bookings remain inside DAR.",
        id: "guest-protection",
        title: "Guest protection",
        type: "accordion",
      },
    ],
    description: "Guest booking conduct, protection rules, and dispute expectations.",
    icon: UserIcon,
    id: "guest-rules",
    jumpLinks: ["Booking information", "House rules", "Payment safety", "Disputes"],
    summary: "Guest rules that keep stays safe, transparent, and protected.",
    title: "Guest Rules",
    updatedAt: "June 2026",
  },
];

export const privacyHighlights: TrustHighlight[] = [
  {
    description: "Account details, bookings, payment verification and documents.",
    icon: UserIcon,
    title: "Data we collect",
  },
  {
    description: "Verification, fraud prevention, support and booking management.",
    icon: ShieldIcon,
    title: "How we use data",
  },
  {
    description: "Owner IDs and authorization documents are reviewed by DAR admins only.",
    icon: LockIcon,
    title: "Document privacy",
  },
  {
    description: "Download your data, delete account and manage notifications.",
    icon: RefreshCwIcon,
    title: "User controls",
  },
];

export const quickLinks: QuickLink[] = [
  { label: "Refund request", target: "#cancellation" },
  { label: "Report listing", target: "#owner-rules" },
  { label: "Payment issue", target: "#payment" },
  { label: "Owner verification help", target: "#owner-rules" },
];

export const policyStatus = [
  "Guest protection active",
  "Secure payment tracking",
  "Verified owner workflow",
];
