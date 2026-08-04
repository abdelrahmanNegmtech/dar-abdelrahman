import type { LegalFaq } from "../types";

export const legalFaqs: LegalFaq[] = [
  {
    answer: "Yes. Your refund depends on the cancellation policy shown before confirmation and whether the payment has already been verified.",
    id: "instapay-cancel",
    policy: "cancellation",
    question: "Can I cancel after paying with InstaPay?",
  },
  {
    answer: "Owner payouts may be held until check-in confirmation so DAR can keep payment tracking and guest protection active.",
    id: "owner-paid",
    policy: "payment",
    question: "When does the owner get paid?",
  },
  {
    answer: "If an owner rejects a request, your booking is not confirmed and any pending payment review is released or refunded according to payment method timing.",
    id: "owner-rejects",
    policy: "terms",
    question: "What happens if the owner rejects my booking?",
  },
  {
    answer: "No. Payments outside DAR remove platform protection and can lead to listing or account suspension.",
    id: "outside-payment",
    policy: "payment",
    question: "Can owners ask for payment outside DAR?",
  },
  {
    answer: "Contact support to request deletion. DAR may retain limited records when needed for fraud prevention, dispute handling, or legal compliance.",
    id: "delete-account",
    policy: "privacy",
    question: "How can I delete my account?",
  },
];
