"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { BookingSummaryCard, HotelFlowHeader, Icon, Stepper, bookingQuery, getBookingFallback, localizedPath, paymentLabel, readHotelBooking, writeHotelBooking } from "../shared";

const serverSnapshot = getBookingFallback();
import { cn } from "@/lib/utils";
import { requiredRedirectForStep } from "@/app/booking/flow-guards";

const methods = [
  { id: "card", title: "Credit or debit card", copy: "Pay securely using your card", logos: ["VISA", "MC", "Meeza"], recommended: true },
  { id: "meeza", title: "Meeza Card", copy: "Pay securely using your Meeza card", logos: ["Meeza"] },
  { id: "wallet", title: "Wallets", copy: "Pay using Vodafone Cash or Etisalat Cash", logos: ["Vodafone", "Etisalat"] },
  { id: "bank", title: "Bank Transfer", copy: "Transfer directly from your bank", logos: ["Bank"] },
  { id: "hotel", title: "Pay at hotel", copy: "Pay in cash or card when you arrive", logos: ["Cash"] },
];

export default function HotelPaymentMethodPage() {
  const router = useRouter();
  const clientBookingRef = useRef<ReturnType<typeof readHotelBooking> | null>(null);
  const { booking } = useSyncExternalStore(
    () => () => {},
    () => {
      if (!clientBookingRef.current) {
        clientBookingRef.current = readHotelBooking();
      }
      return clientBookingRef.current;
    },
    () => serverSnapshot,
  );
  const [paymentMethod, setPaymentMethod] = useState(booking.paymentMethod ?? "card");
  const [error, setError] = useState("");

  useEffect(() => {
    const redirect = requiredRedirectForStep("payment-method");
    if (redirect) router.replace(redirect);
  }, [router]);

  const reviewBooking = () => {
    if (!paymentMethod) {
      setError("Choose a payment method");
      return;
    }
    const nextBooking = {
      ...booking,
      paymentMethod,
      paymentDetails: {
        selectedMethod: paymentLabel(paymentMethod),
        requiresCard: paymentMethod === "card" || paymentMethod === "meeza",
        requiresInstructions: ["wallet", "bank"].includes(paymentMethod),
        payAtHotel: paymentMethod === "hotel",
      },
    };
    writeHotelBooking(nextBooking);
    router.push(`${localizedPath(nextBooking, "/checkout")}?${bookingQuery(nextBooking)}`);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 text-[#080B32]">
      <div className="mx-auto max-w-[1440px] overflow-hidden rounded-[28px] border border-[#DFE6F1] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
        <HotelFlowHeader />
        <div className="border-t border-[#E6EBF3] px-5 pb-6 pt-7 lg:px-8">
          <Stepper current={3} />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
            <section className="min-w-0">
              <h1 className="text-[30px] font-black leading-tight">Payment method</h1>
              <p className="mt-2 text-[15px] font-medium text-[#34405A]">Choose a payment method and complete your booking</p>
              <h2 className="mt-8 text-[17px] font-black">Recommended for you</h2>
              <PaymentOption method={methods[0]} selected={paymentMethod === "card"} onSelect={() => { setPaymentMethod("card"); setError(""); }} />
              <h2 className="mt-8 text-[17px] font-black">Other payment methods</h2>
              <div className="mt-4 space-y-4">
                {methods.slice(1).map((method) => (
                  <PaymentOption key={method.id} method={method} selected={paymentMethod === method.id} onSelect={() => { setPaymentMethod(method.id); setError(""); }} />
                ))}
              </div>
              {error ? <p className="mt-4 rounded-[8px] border border-[#F5C2C2] bg-[#FFF1F1] p-3 text-[13px] font-bold text-[#D92D20]">{error}</p> : null}
              <div className="mt-9 flex items-center gap-5 rounded-[10px] bg-[#F5F1FF] p-5">
                <Icon name="shield" className="h-10 w-10 text-[#5F36E9]" />
                <div><p className="text-[16px] font-black">Secure payment</p><p className="mt-1 text-[14px] text-[#34405A]">Your payment is encrypted and secure. We never store your card details.</p></div>
              </div>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-between">
                <Link href={`${localizedPath(booking, "/booking/hotel/guest")}?${bookingQuery(booking)}`} className="inline-flex h-14 items-center justify-center gap-2 rounded-[8px] border border-[#8D6BFF] px-9 text-[15px] font-bold text-[#5F36E9]"><Icon name="chevronLeft" /> Back to guest details</Link>
                <button type="button" onClick={reviewBooking} className="inline-flex h-14 items-center justify-center gap-3 rounded-[8px] bg-[#5F36E9] px-10 text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(95,54,233,0.22)]">Review your booking <Icon name="chevronRight" /></button>
              </div>
            </section>
            <BookingSummaryCard booking={booking} helper="Best price guarantee" />
          </div>
        </div>
      </div>
    </main>
  );
}

function PaymentOption({ method, selected, onSelect }: { method: (typeof methods)[number]; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className={cn("mt-4 flex min-h-[92px] w-full items-center gap-5 rounded-[10px] border bg-white p-5 text-left shadow-[0_8px_20px_rgba(15,23,42,0.03)] transition", selected ? "border-[#8D6BFF] ring-1 ring-[#8D6BFF]" : "border-[#E1E7F0] hover:border-[#BFAEFF]")}>
      <span className={cn("grid h-5 w-5 place-items-center rounded-full border", selected ? "border-[#5F36E9] bg-[#5F36E9]" : "border-[#B9C2D2]")}>{selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}</span>
      <span className="grid h-10 w-10 place-items-center rounded-[7px] border border-[#E1E7F0]"><Icon name={method.id === "bank" ? "bank" : method.id === "wallet" ? "wallet" : "card"} /></span>
      <span className="min-w-0 flex-1"><span className="block text-[16px] font-black">{method.title}</span><span className="mt-1 block text-[14px] text-[#34405A]">{method.copy}</span></span>
      <span className="hidden gap-3 md:flex">{method.logos.map((logo) => <span key={logo} className="rounded-[5px] bg-[#F8FAFC] px-3 py-1 text-[13px] font-black text-[#5F36E9]">{logo}</span>)}</span>
    </button>
  );
}
