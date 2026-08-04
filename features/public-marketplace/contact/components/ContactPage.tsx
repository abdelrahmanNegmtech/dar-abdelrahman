"use client";

import { FormEvent, useState } from "react";
import { MarketplaceShell } from "../../components/MarketplaceShell";

type ContactErrors = Partial<Record<"email" | "message" | "name" | "subject", string>>;

export function ContactPage() {
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const subject = String(form.get("subject") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const nextErrors: ContactErrors = {};

    if (name.length < 2) nextErrors.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email.";
    if (subject.length < 3) nextErrors.subject = "Enter a subject.";
    if (message.length < 20) nextErrors.message = "Message must be at least 20 characters.";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("Please fix the highlighted fields.");
      return;
    }

    setStatus(
      "Your message is validated locally. Support submission will be connected when the backend support endpoint is added.",
    );
  }

  return (
    <MarketplaceShell>
      <main className="mx-auto grid max-w-[1500px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-12">
        <section className="rounded-2xl bg-[#06111F] p-7 text-white sm:p-9">
          <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-white/70">
            Contact
          </p>
          <h1 className="mt-3 text-[38px] font-bold leading-tight sm:text-[48px]">
            Tell DAR support what you need.
          </h1>
          <p className="mt-5 text-[15px] leading-7 text-white/72">
            Use this frontend-ready form for support details. It validates input clearly and avoids
            pretending a backend ticket was created before support persistence exists.
          </p>
        </section>

        <form
          className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field error={errors.name} label="Name" name="name" placeholder="Your name" />
            <Field error={errors.email} label="Email" name="email" placeholder="you@example.com" />
          </div>
          <div className="mt-5">
            <Field error={errors.subject} label="Subject" name="subject" placeholder="How can we help?" />
          </div>
          <label className="mt-5 block">
            <span className="text-[13px] font-bold text-[#0F172A]">Message</span>
            <textarea
              aria-describedby={errors.message ? "contact-message-error" : undefined}
              className="mt-2 min-h-[160px] w-full rounded-xl border border-[#CBD5E1] px-4 py-3 text-[14px] outline-none focus:border-[#5A30E8]"
              name="message"
              placeholder="Share the details..."
            />
            {errors.message ? (
              <span className="mt-2 block text-[12px] font-semibold text-[#DC2626]" id="contact-message-error">
                {errors.message}
              </span>
            ) : null}
          </label>
          {status ? (
            <p
              className={`mt-5 rounded-lg px-4 py-3 text-[13px] font-semibold ${
                Object.keys(errors).length > 0
                  ? "bg-[#FEF2F2] text-[#B91C1C]"
                  : "bg-[#ECFDF5] text-[#047857]"
              }`}
              role="status"
            >
              {status}
            </p>
          ) : null}
          <button
            className="mt-6 h-12 rounded-lg bg-[#5A30E8] px-7 text-[14px] font-bold text-white"
            type="submit"
          >
            Validate message
          </button>
        </form>
      </main>
    </MarketplaceShell>
  );
}

function Field({
  error,
  label,
  name,
  placeholder,
}: {
  error?: string;
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-bold text-[#0F172A]">{label}</span>
      <input
        aria-describedby={error ? `contact-${name}-error` : undefined}
        className="mt-2 h-12 w-full rounded-xl border border-[#CBD5E1] px-4 text-[14px] outline-none focus:border-[#5A30E8]"
        name={name}
        placeholder={placeholder}
      />
      {error ? (
        <span className="mt-2 block text-[12px] font-semibold text-[#DC2626]" id={`contact-${name}-error`}>
          {error}
        </span>
      ) : null}
    </label>
  );
}
