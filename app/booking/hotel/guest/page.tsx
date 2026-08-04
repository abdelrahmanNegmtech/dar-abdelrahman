"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BookingSummaryCard,
  HotelFlowHeader,
  Icon,
  Stepper,
  bookingQuery,
  countryDialCodes,
  defaultGuestInfo,
  localizedPath,
  nationalities,
  readHotelBooking,
  writeHotelBooking,
  type HotelGuestInfo,
} from "../shared";
import { cn } from "@/lib/utils";
import { requiredRedirectForStep } from "@/app/booking/flow-guards";

const required: Array<keyof HotelGuestInfo> = ["fullName", "email", "countryCode", "phone", "nationality", "documentId", "arrivalTime"];

export default function HotelGuestDetailsPage() {
  const router = useRouter();
  const { booking } = useMemo(() => readHotelBooking(), []);
  const [guestInfo, setGuestInfo] = useState<HotelGuestInfo>({ ...defaultGuestInfo, ...booking.guestInfo });
  const [errors, setErrors] = useState<Partial<Record<keyof HotelGuestInfo, string>>>({});

  useEffect(() => {
    const redirect = requiredRedirectForStep("guest");
    if (redirect) router.replace(redirect);
  }, [router]);

  const updateGuest = (key: keyof HotelGuestInfo, value: string | boolean) => {
    setGuestInfo((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const continueToPayment = () => {
    const nextErrors: Partial<Record<keyof HotelGuestInfo, string>> = {};
    required.forEach((field) => {
      if (!guestInfo[field]) nextErrors[field] = "Required";
    });
    if (guestInfo.email && !/^\S+@\S+\.\S+$/.test(guestInfo.email)) {
      nextErrors.email = "Enter a valid email";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const nextBooking = { ...booking, guestInfo };
    writeHotelBooking(nextBooking);
    router.push(`${localizedPath(nextBooking, "/booking/hotel/payment")}?${bookingQuery(nextBooking)}`);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 text-[#080B32]">
      <div className="mx-auto max-w-[1440px] overflow-hidden rounded-[28px] border border-[#DFE6F1] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
        <HotelFlowHeader />
        <div className="px-5 pb-6 lg:px-8">
          <Stepper current={2} />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
            <section className="min-w-0">
              <h1 className="text-[30px] font-black leading-tight">Guest details</h1>
              <p className="mt-2 text-[15px] font-medium text-[#34405A]">Please provide the details for the main guest</p>
              <h2 className="mt-8 text-[17px] font-black">Main guest</h2>
              <div className="mt-4 rounded-[12px] border border-[#E1E7F0] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Full name *" error={errors.fullName}><input value={guestInfo.fullName} onChange={(event) => updateGuest("fullName", event.target.value)} placeholder="Enter full name" className={inputClass(errors.fullName)} /></Field>
                  <Field label="Email address *" error={errors.email}><input value={guestInfo.email} onChange={(event) => updateGuest("email", event.target.value)} placeholder="Enter email address" className={inputClass(errors.email)} /></Field>
                  <Field label="Phone number *" error={errors.phone}>
                    <div className="grid grid-cols-[138px_minmax(0,1fr)]">
                      <input list="dar-country-codes" value={guestInfo.countryCode} onChange={(event) => updateGuest("countryCode", event.target.value)} aria-label="Country code" className={cn(inputClass(errors.countryCode), "rounded-r-none border-r-0 px-3")} />
                      <input value={guestInfo.phone} onChange={(event) => updateGuest("phone", event.target.value)} className={cn(inputClass(errors.phone), "rounded-l-none")} />
                    </div>
                  </Field>
                  <Field label="Nationality *" error={errors.nationality}>
                    <input list="dar-nationalities" value={guestInfo.nationality} onChange={(event) => updateGuest("nationality", event.target.value)} placeholder="Search nationality" className={inputClass(errors.nationality)} />
                  </Field>
                  <Field label="ID / Passport number *" error={errors.documentId}><input value={guestInfo.documentId} onChange={(event) => updateGuest("documentId", event.target.value)} placeholder="Enter ID or passport number" className={inputClass(errors.documentId)} /></Field>
                </div>
                <datalist id="dar-country-codes">{countryDialCodes.map((code) => <option key={code} value={code} />)}</datalist>
                <datalist id="dar-nationalities">{nationalities.map((nationality) => <option key={nationality} value={nationality} />)}</datalist>                <label className="mt-5 flex items-center gap-3 text-[14px] font-medium text-[#34405A]">
                  <input type="checkbox" checked={guestInfo.travelingForWork} onChange={(event) => updateGuest("travelingForWork", event.target.checked)} className="h-4 w-4 accent-[#5F36E9]" />
                  I&apos;m traveling for work
                </label>
              </div>

              <h2 className="mt-8 text-[17px] font-black">Check-in preferences</h2>
              <div className="mt-4 rounded-[12px] border border-[#E1E7F0] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Estimated arrival time" error={errors.arrivalTime}>
                    <select value={guestInfo.arrivalTime} onChange={(event) => updateGuest("arrivalTime", event.target.value)} className={inputClass(errors.arrivalTime)}>
                      <option value="">Select arrival time</option>
                      <option>Before 12:00 PM</option>
                      <option>12:00 PM - 3:00 PM</option>
                      <option>3:00 PM - 6:00 PM</option>
                      <option>After 6:00 PM</option>
                    </select>
                  </Field>
                  <Field label="Purpose of visit (optional)">
                    <select value={guestInfo.visitPurpose} onChange={(event) => updateGuest("visitPurpose", event.target.value)} className={inputClass()}>
                      <option value="">Select purpose</option>
                      <option>Leisure</option>
                      <option>Business</option>
                      <option>Family visit</option>
                      <option>Event</option>
                    </select>
                  </Field>
                </div>
              </div>

              <h2 className="mt-8 text-[17px] font-black">Special requests <span className="font-medium text-[#59637C]">(optional)</span></h2>
              <p className="mt-2 text-[15px] text-[#34405A]">Add any special requests or preferences</p>
              <textarea value={guestInfo.requests} maxLength={200} onChange={(event) => updateGuest("requests", event.target.value)} placeholder="e.g. Early check-in, extra pillows, room on high floor..." className="mt-3 h-[116px] w-full resize-none rounded-[9px] border border-[#DCE3EF] p-4 text-[14px] outline-none focus:border-[#8D6BFF]" />
              <p className="-mt-7 mr-4 text-right text-[12px] text-[#59637C]">{guestInfo.requests.length}/200</p>

              <div className="mt-8 flex items-center gap-5 rounded-[10px] bg-[#F5F1FF] p-5">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[#5F36E9] text-white"><Icon name="shield" /></span>
                <div><p className="text-[16px] font-black">Secure your booking</p><p className="mt-1 text-[14px] text-[#34405A]">Your personal information is secure and used only for your booking.</p></div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-between">
                <Link href={`${localizedPath(booking, "/booking/rooms")}?${bookingQuery(booking)}`} className="inline-flex h-14 items-center justify-center gap-2 rounded-[8px] border border-[#8D6BFF] px-9 text-[15px] font-bold text-[#5F36E9]"><Icon name="chevronLeft" /> Back to room selection</Link>
                <button type="button" onClick={continueToPayment} className="inline-flex h-14 items-center justify-center gap-3 rounded-[8px] bg-[#5F36E9] px-10 text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(95,54,233,0.22)]">Continue to payment <Icon name="chevronRight" /></button>
              </div>
            </section>
            <BookingSummaryCard booking={booking} />
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block text-[13px] font-bold text-[#111735]">{label}<span className="mt-2 block">{children}</span>{error ? <span className="mt-1 block text-[12px] text-[#D92D20]">{error}</span> : null}</label>;
}

function inputClass(error?: string) {
  return cn("h-12 w-full rounded-[7px] border border-[#DCE3EF] bg-white px-4 text-[14px] outline-none focus:border-[#8D6BFF]", error && "border-[#D92D20]");
}
