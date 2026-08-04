"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MarketplaceShell } from "../../components/MarketplaceShell";
import { ChevronDownIcon } from "../../search/icons";

const faqs = [
  {
    answer: "Use Search to compare stays, open a property, then continue through the reserve or contact flow. Booking persistence is planned for the backend phase.",
    category: "Booking",
    question: "How do I book a stay?",
  },
  {
    answer: "Use the sign-in page for email login, OAuth, password recovery, and account creation.",
    category: "Account",
    question: "How do I sign in or reset my password?",
  },
  {
    answer: "Payments are not connected yet. Payment-related information is marked as a future marketplace capability.",
    category: "Payments",
    question: "Can I pay online today?",
  },
  {
    answer: "Favorites are saved locally on this device for the current frontend prototype. Backend sync will be added later.",
    category: "Favorites",
    question: "Where are my saved stays stored?",
  },
  {
    answer: "Hosts can start from Become a Host. The owner dashboard and backend listing workflow are future work.",
    category: "Hosts",
    question: "How can I list a property?",
  },
  {
    answer: "Review cancellation information in the Legal Center. Property-specific cancellation logic will connect during booking backend work.",
    category: "Cancellations",
    question: "Where can I find cancellation information?",
  },
];

const categories = ["Booking", "Account", "Payments", "Favorites", "Hosts", "Cancellations"];

export function HelpCenterPage() {
  const [query, setQuery] = useState("");
  const [openQuestion, setOpenQuestion] = useState(faqs[0].question);

  const filteredFaqs = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return faqs;

    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term) ||
        faq.category.toLowerCase().includes(term),
    );
  }, [query]);

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 lg:px-12">
        <section className="rounded-2xl bg-[#06111F] p-7 text-white sm:p-10">
          <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-white/70">
            Help Center
          </p>
          <h1 className="mt-3 text-[36px] font-bold leading-tight sm:text-[48px]">
            How can we help?
          </h1>
          <label className="mt-7 block max-w-2xl">
            <span className="sr-only">Search help topics</span>
            <input
              className="h-14 w-full rounded-xl border border-white/12 bg-white px-5 text-[15px] font-semibold text-[#0F172A] outline-none focus:border-[#A78BFA]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search booking, account, favorites, hosts..."
              value={query}
            />
          </label>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3 xl:grid-cols-6">
          {categories.map((category) => (
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]" key={category}>
              <p className="text-[15px] font-bold text-[#0F172A]">{category}</p>
              <p className="mt-2 text-[13px] leading-6 text-[#64748B]">Common DAR marketplace questions</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-7">
            <h2 className="text-[26px] font-bold text-[#0F172A]">Frequently asked questions</h2>
            <div className="mt-5 divide-y divide-[#E5E7EB]">
              {filteredFaqs.map((faq) => {
                const open = openQuestion === faq.question;

                return (
                  <div key={faq.question}>
                    <button
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left"
                      onClick={() => setOpenQuestion(open ? "" : faq.question)}
                      type="button"
                    >
                      <span>
                        <span className="block text-[12px] font-bold uppercase tracking-[0.1em] text-[#5A30E8]">
                          {faq.category}
                        </span>
                        <span className="mt-1 block text-[17px] font-bold text-[#0F172A]">
                          {faq.question}
                        </span>
                      </span>
                      <ChevronDownIcon className={`size-5 shrink-0 transition ${open ? "rotate-180" : ""}`} />
                    </button>
                    {open ? (
                      <p className="pb-5 text-[14px] leading-7 text-[#475569]">{faq.answer}</p>
                    ) : null}
                  </div>
                );
              })}
              {filteredFaqs.length === 0 ? (
                <p className="py-8 text-[14px] text-[#64748B]">No matching help topics found.</p>
              ) : null}
            </div>
          </div>

          <aside className="h-fit rounded-2xl bg-[#F8F5FF] p-6">
            <h2 className="text-[22px] font-bold text-[#0F172A]">Still need support?</h2>
            <p className="mt-3 text-[14px] leading-7 text-[#475569]">
              Send us the details and the support flow can be connected to the backend support queue later.
            </p>
            <Link
              className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-[#5A30E8] px-5 text-[14px] font-bold text-white"
              href="/contact"
            >
              Contact support
            </Link>
          </aside>
        </section>
      </main>
    </MarketplaceShell>
  );
}
