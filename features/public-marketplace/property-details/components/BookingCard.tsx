"use client";

import { useMemo, useState } from "react";
import {
  CalendarIcon,
  ChevronDownIcon,
  InfoIcon,
  LockIcon,
  MessageIcon,
  ShieldIcon,
  StarIcon,
  TagIcon,
  UserIcon,
} from "../icons";

type BookingCardProps = {
  compact?: boolean;
};

const nightlyRate = 1200;
const cleaningFee = 250;
const serviceFee = 420;

export function BookingCard({ compact = false }: BookingCardProps) {
  const [picker, setPicker] = useState<"checkin" | "checkout" | "guests" | null>(null);
  const [checkIn, setCheckIn] = useState("2026-05-20");
  const [checkOut, setCheckOut] = useState("2026-05-25");
  const [guests, setGuests] = useState(2);
  const [promo, setPromo] = useState("");
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState<"booking" | "contact" | null>(null);

  const nights = useMemo(() => getNights(checkIn, checkOut), [checkIn, checkOut]);
  const subtotal = nightlyRate * nights;
  const total = subtotal + cleaningFee + serviceFee;

  function applyPromo() {
    setMessage(promo.trim().toUpperCase() === "DAR10" ? "Promo applied: DAR10" : "This promo code is not available.");
  }

  function updateCheckIn(value: string) {
    setCheckIn(value);

    if (new Date(`${value}T00:00:00`) >= new Date(`${checkOut}T00:00:00`)) {
      setCheckOut(addDays(value, 1));
    }
  }

  return (
    <section
      className={`rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] ${
        compact ? "" : "sticky top-[92px]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-[24px] font-bold">
          EGP {nightlyRate.toLocaleString("en-US")} <span className="text-[15px] font-normal text-[#475569]">/ night</span>
        </p>
        <p className="inline-flex items-center gap-1 text-[14px]">
          <StarIcon className="size-4 fill-[#F4B744] text-[#F4B744]" />
          4.9 <span className="text-[#475569]">(32 reviews)</span>
        </p>
      </div>

      <div className="relative mt-5 rounded-lg border border-[#E5E7EB]">
        <div className="grid grid-cols-2 divide-x divide-[#E5E7EB] border-b border-[#E5E7EB]">
          <DateCell label="Check-in" onClick={() => setPicker("checkin")} value={formatDateLabel(checkIn)} />
          <DateCell label="Check-out" onClick={() => setPicker("checkout")} value={formatDateLabel(checkOut)} />
        </div>
        <button
          className="flex h-[62px] w-full items-center justify-between px-5 text-left"
          onClick={() => setPicker((current) => (current === "guests" ? null : "guests"))}
          type="button"
        >
          <span className="inline-flex items-center gap-3">
            <UserIcon className="size-5" />
            <span>
              <span className="block text-[12px] text-[#64748B]">Guests</span>
              <strong className="text-[15px]">
                {guests} {guests === 1 ? "guest" : "guests"}
              </strong>
            </span>
          </span>
          <ChevronDownIcon className="size-4" />
        </button>

        {picker ? (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.15)]">
            {picker === "guests" ? (
              <GuestPicker guests={guests} onChange={setGuests} />
            ) : (
              <DatePickerPanel
                checkIn={checkIn}
                checkOut={checkOut}
                focusedField={picker}
                onCheckInChange={updateCheckIn}
                onCheckOutChange={setCheckOut}
                onDone={() => setPicker(null)}
              />
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-4 rounded-lg border border-[#E9E5FF] bg-[#FBFAFF] px-4 py-3 text-[13px] font-semibold text-[#5A30E8]">
        {nights} {nights === 1 ? "night" : "nights"} selected for {guests} {guests === 1 ? "guest" : "guests"}.
      </div>

      <div className="mt-4 flex h-12 items-center rounded-lg border border-[#E5E7EB]">
        <span className="flex flex-1 items-center gap-3 px-4 text-[14px] text-[#475569]">
          <TagIcon className="size-5" />
          <input
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#475569]"
            onChange={(event) => setPromo(event.target.value)}
            placeholder="Have a promo code?"
            value={promo}
          />
        </span>
        <button className="h-full border-l border-[#E5E7EB] px-5 text-[14px] font-bold text-[#5A30E8]" onClick={applyPromo} type="button">
          Apply
        </button>
      </div>
      {message ? <p className="mt-3 text-[13px] font-semibold text-[#5A30E8]">{message}</p> : null}

      <div className="mt-5 space-y-3 border-b border-[#E5E7EB] pb-5 text-[14px]">
        <PriceRow label={`EGP ${nightlyRate.toLocaleString("en-US")} x ${nights} ${nights === 1 ? "night" : "nights"}`} value={`EGP ${subtotal.toLocaleString("en-US")}`} />
        <PriceRow label="Cleaning fee" value={`EGP ${cleaningFee.toLocaleString("en-US")}`} withInfo />
        <PriceRow label="Service fee" value={`EGP ${serviceFee.toLocaleString("en-US")}`} withInfo />
      </div>

      <div className="mt-5 flex items-center justify-between text-[18px] font-bold">
        <span>Total</span>
        <span>EGP {total.toLocaleString("en-US")}</span>
      </div>

      <button className="mt-6 h-12 w-full rounded-lg bg-[linear-gradient(180deg,#6C3DFF_0%,#5527D8_100%)] text-[17px] font-bold text-white shadow-[0_16px_30px_rgba(108,61,255,0.22)]" onClick={() => setModal("booking")} type="button">
        Reserve now
      </button>

      <p className="mt-4 flex items-center justify-center gap-2 border-b border-[#E5E7EB] pb-5 text-[13px] text-[#475569]">
        <LockIcon className="size-4" />
        You will not be charged yet
      </p>

      <div className="mt-5 flex items-start gap-3">
        <ShieldIcon className="size-6" />
        <span>
          <strong className="block text-[14px]">Secure payment</strong>
          <span className="text-[13px] text-[#64748B]">Your data is protected</span>
        </span>
      </div>

      <button className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#A78BFA] text-[15px] font-bold text-[#5A30E8]" onClick={() => setModal("contact")} type="button">
        <MessageIcon className="size-5" />
        Contact owner
      </button>

      {modal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0F172A]/45 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <h2 className="text-[18px] font-bold">{modal === "booking" ? "Booking request ready" : "Contact owner"}</h2>
            <p className="mt-2 text-[14px] leading-6 text-[#64748B]">
              {modal === "booking"
                ? "Online payment is not connected in this environment, so no charge was made."
                : "Owner messaging is not connected in this environment, so no message was sent."}
            </p>
            <button className="mt-5 h-11 w-full rounded-lg bg-[#5A30E8] font-bold text-white" onClick={() => setModal(null)} type="button">
              Done
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function GuestPicker({ guests, onChange }: { guests: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[14px] font-bold">Guests</span>
      <div className="flex items-center gap-3">
        <button className="size-8 rounded-full border border-[#D8DEE8] font-bold text-[#5A30E8]" onClick={() => onChange(Math.max(1, guests - 1))} type="button">
          -
        </button>
        <strong>{guests}</strong>
        <button className="size-8 rounded-full border border-[#D8DEE8] font-bold text-[#5A30E8]" onClick={() => onChange(guests + 1)} type="button">
          +
        </button>
      </div>
    </div>
  );
}

function DatePickerPanel({
  checkIn,
  checkOut,
  focusedField,
  onCheckInChange,
  onCheckOutChange,
  onDone,
}: {
  checkIn: string;
  checkOut: string;
  focusedField: "checkin" | "checkout";
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  onDone: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="block text-[12px] font-bold text-[#64748B]">Check-in</span>
          <input
            autoFocus={focusedField === "checkin"}
            className="h-11 w-full rounded-lg border border-[#D8DEE8] px-3 text-[14px] font-semibold text-[#0F172A] outline-none focus:border-[#6C3DFF] focus:ring-4 focus:ring-[#6C3DFF]/10"
            min="2026-05-20"
            onChange={(event) => onCheckInChange(event.target.value)}
            type="date"
            value={checkIn}
          />
        </label>
        <label className="space-y-2">
          <span className="block text-[12px] font-bold text-[#64748B]">Check-out</span>
          <input
            autoFocus={focusedField === "checkout"}
            className="h-11 w-full rounded-lg border border-[#D8DEE8] px-3 text-[14px] font-semibold text-[#0F172A] outline-none focus:border-[#6C3DFF] focus:ring-4 focus:ring-[#6C3DFF]/10"
            min={addDays(checkIn, 1)}
            onChange={(event) => onCheckOutChange(event.target.value)}
            type="date"
            value={checkOut}
          />
        </label>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[#E5E7EB] pt-3">
        <span className="text-[13px] font-semibold text-[#64748B]">
          {getNights(checkIn, checkOut)} {getNights(checkIn, checkOut) === 1 ? "night" : "nights"}
        </span>
        <button
          className="h-9 rounded-lg bg-[#5A30E8] px-5 text-[13px] font-bold text-white transition hover:bg-[#4C22D4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2"
          onClick={onDone}
          type="button"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function DateCell({ label, onClick, value }: { label: string; onClick: () => void; value: string }) {
  return (
    <button className="px-5 py-4 text-left" onClick={onClick} type="button">
      <span className="block text-[12px] text-[#64748B]">{label}</span>
      <span className="mt-1 flex items-center gap-2 text-[14px] font-bold">
        <CalendarIcon className="size-4" />
        {value}
      </span>
    </button>
  );
}

function PriceRow({
  label,
  value,
  withInfo = false,
}: {
  label: string;
  value: string;
  withInfo?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="inline-flex items-center gap-1 text-[#334155]">
        {label}
        {withInfo ? <InfoIcon className="size-4 text-[#64748B]" /> : null}
      </span>
      <span className="shrink-0">{value}</span>
    </div>
  );
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

function getNights(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T00:00:00`).getTime();
  const end = new Date(`${checkOut}T00:00:00`).getTime();
  return Math.max(1, Math.round((end - start) / 86_400_000));
}

function formatDateLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthLabels[month - 1]} ${day}, ${year}`;
}
