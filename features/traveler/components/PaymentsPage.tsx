"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  Plus,
  Receipt,
  RotateCcw,
  Wallet,
  X,
} from "lucide-react";
import { removePaymentMethod, setDefaultPaymentMethod } from "../actions";
import type { PaymentMethod, PaymentTransaction, TravelerBooking, WalletSummary } from "../types";
import { Card, EmptyState, IconButton, PageHeader, PrimaryButton, SearchInput, SelectField, StatCard, StatusBadge, cx } from "./shared";
import { useToast } from "@/features/system-states/hooks/useToast";
import { formatCurrency } from "../utils";

type PaymentTab = "methods" | "wallet" | "refunds" | "billing";

const tabConfig: Array<{ id: PaymentTab; label: string }> = [
  { id: "methods", label: "Payment Methods" },
  { id: "wallet", label: "Wallet Transactions" },
  { id: "refunds", label: "Refund History" },
  { id: "billing", label: "Billing History" },
];

function AddPaymentDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-black text-dar-navy">Add payment method</h2>
          <IconButton label="Close" onClick={onClose}>
            <X className="size-5" />
          </IconButton>
        </div>
        <div className="mt-6 flex flex-col items-center gap-4 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-dar-primary-soft text-dar-primary">
            <CreditCard className="size-8" />
          </span>
          <p className="text-sm font-semibold text-dar-muted">
            Saving payment methods is not available yet.
          </p>
          <p className="text-xs font-semibold text-dar-muted">
            We&apos;re working on integrating a secure payment provider. You will be able to
            save cards safely once the integration is complete.
          </p>
          <PrimaryButton className="mt-2" onClick={onClose}>
            Got it
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
}

export function PaymentsPage({
  bookings,
  methods,
  transactions,
  wallet,
}: {
  bookings: TravelerBooking[];
  methods: PaymentMethod[];
  transactions: PaymentTransaction[];
  wallet: WalletSummary;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as PaymentTab | null) ?? "methods";
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function setTab(nextTab: PaymentTab) {
    const next = new URLSearchParams(searchParams.toString());
    if (nextTab === "methods") next.delete("tab");
    else next.set("tab", nextTab);
    router.replace(`${pathname}?${next.toString()}`);
  }

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [hiddenMethods, setHiddenMethods] = useState<Set<string>>(new Set());
  const [defaultMethod, setDefaultMethod] = useState(methods.find((method) => method.isDefault)?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const visibleMethods = useMemo(() => {
    return methods.filter((method) => !hiddenMethods.has(method.id));
  }, [hiddenMethods, methods]);

  const visibleTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return transactions.filter((transaction) => {
      const queryMatch = !normalizedQuery || transaction.description.toLowerCase().includes(normalizedQuery);
      const typeMatch = typeFilter === "all" || transaction.type === typeFilter;
      return queryMatch && typeMatch;
    });
  }, [query, transactions, typeFilter]);

  const refundTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === "refund");
  }, [transactions]);

  const billingBookings = useMemo(() => {
    return bookings
      .filter((b) => b.paymentStatus === "paid" || b.paymentStatus === "pending" || b.paymentStatus === "refunded")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings]);

  function updateDefault(methodId: string) {
    setDefaultMethod(methodId);
    startTransition(async () => {
      const result = await setDefaultPaymentMethod(methodId);
      showToast({
        description: result.message,
        title: result.ok ? "Default updated" : "Could not update",
        type: result.ok ? "success" : "error",
      });
    });
  }

  function removeMethod(methodId: string) {
    setHiddenMethods((current) => new Set(current).add(methodId));
    startTransition(async () => {
      const result = await removePaymentMethod(methodId);
      showToast({
        description: result.message,
        title: result.ok ? "Method removed" : "Could not remove",
        type: result.ok ? "success" : "error",
      });
    });
  }

  // Keyboard navigation for tabs
  function handleTabKeyDown(event: React.KeyboardEvent, currentTab: PaymentTab) {
    const currentIndex = tabConfig.findIndex((t) => t.id === currentTab);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabConfig.length;
      event.preventDefault();
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabConfig.length) % tabConfig.length;
      event.preventDefault();
    } else {
      return;
    }

    const nextTab = tabConfig[nextIndex];
    setTab(nextTab.id);
    tabRefs.current[nextTab.id]?.focus();
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Manage payment methods, wallet balance, and transaction history." title="Wallet & Payments" />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard href="/traveler/payments?tab=wallet" icon={Wallet} label="Wallet Balance" value={formatCurrency(wallet.balance, wallet.currency)} />
        <StatCard href="/traveler/payments?tab=wallet" icon={RotateCcw} label="Total Earned Cashback" tone="green" value={formatCurrency(wallet.totalCashback, wallet.currency)} />
        <StatCard href="/traveler/payments?tab=refunds" icon={Receipt} label="Total Refunds" tone="amber" value={formatCurrency(wallet.totalRefunds, wallet.currency)} />
        <StatCard href="/traveler/payments?tab=wallet" icon={CreditCard} label="Pending Payments" tone="blue" value={formatCurrency(wallet.pendingPayments, wallet.currency)} />
      </section>

      <Card className="overflow-hidden">
        {/* ─── Tab bar ─── */}
        <div
          className="flex gap-2 overflow-x-auto border-b border-dar-border p-3"
          role="tablist"
          aria-label="Payment sections"
        >
          {tabConfig.map(({ id, label }) => (
            <button
              key={id}
              ref={(el) => { tabRefs.current[id] = el; }}
              role="tab"
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              tabIndex={tab === id ? 0 : -1}
              className={cx(
                "shrink-0 rounded-xl px-4 py-2 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary",
                tab === id
                  ? "bg-dar-primary-soft text-dar-primary"
                  : "text-dar-muted hover:bg-slate-50",
              )}
              onClick={() => setTab(id)}
              onKeyDown={(e) => handleTabKeyDown(e, id)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        {/* ─── Tab panels ─── */}

        {/* ═══ Payment Methods ═══ */}
        {tab === "methods" ? (
          <div
            id="panel-methods"
            role="tabpanel"
            aria-labelledby="tab-methods"
            className="p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-dar-navy">Saved Payment Methods</h2>
                <p className="mt-1 text-sm font-semibold text-dar-muted">Safe tokenized payment data only. Raw card numbers are never stored.</p>
              </div>
              <PrimaryButton onClick={() => setAddOpen(true)}>
                <Plus className="size-4" />
                Add New Card
              </PrimaryButton>
            </div>

            <div className="mt-5 space-y-3">
              {visibleMethods.length > 0 ? (
                visibleMethods.map((method) => (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-dar-border p-4" key={method.id}>
                    <div className="flex items-center gap-4">
                      <span className="grid size-12 place-items-center rounded-full bg-dar-primary-soft text-dar-primary">
                        <CreditCard className="size-6" />
                      </span>
                      <div>
                        <p className="font-black text-dar-navy">
                          {method.brand} ending in {method.lastFour}
                          {defaultMethod === method.id ? (
                            <span className="ml-2 rounded-full bg-dar-primary-soft px-2 py-0.5 text-[10px] font-black text-dar-primary">
                              Default
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-dar-muted">
                          {method.expiryMonth
                            ? `Expires ${String(method.expiryMonth).padStart(2, "0")}/${method.expiryYear}`
                            : "Wallet alias"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        aria-label={`Set ${method.brand} ending ${method.lastFour} as default`}
                        className={cx("h-6 w-11 rounded-full p-0.5 transition", defaultMethod === method.id ? "bg-dar-primary" : "bg-slate-200")}
                        disabled={isPending}
                        onClick={() => updateDefault(method.id)}
                        type="button"
                      >
                        <span className={cx("block size-5 rounded-full bg-white transition", defaultMethod === method.id && "translate-x-5")} />
                      </button>
                      <IconButton className="size-9" label={`Remove ${method.brand}`} onClick={() => removeMethod(method.id)}>
                        <X className="size-4" />
                      </IconButton>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState description="Add a tokenized payment method to speed up future bookings." title="No payment methods" />
              )}
            </div>
          </div>
        ) : null}

        {/* ═══ Wallet Transactions ═══ */}
        {tab === "wallet" ? (
          <div
            id="panel-wallet"
            role="tabpanel"
            aria-labelledby="tab-wallet"
            className="p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-dar-navy">Wallet Transactions</h2>
                <p className="mt-1 text-sm font-semibold text-dar-muted">
                  Current balance: <strong className="text-dar-navy">{formatCurrency(wallet.balance, wallet.currency)}</strong>
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-[220px_160px]">
                <SearchInput onChange={setQuery} placeholder="Search transactions" value={query} />
                <SelectField aria-label="Transaction type" onChange={(event) => setTypeFilter(event.target.value)} value={typeFilter}>
                  <option value="all">All types</option>
                  <option value="payment">Payments</option>
                  <option value="refund">Refunds</option>
                  <option value="cashback">Cashback</option>
                  <option value="top_up">Top up</option>
                </SelectField>
              </div>
            </div>

            {visibleTransactions.length > 0 ? (
              <div className="mt-5 overflow-hidden rounded-xl border border-dar-border">
                <div className="hidden grid-cols-[150px_1fr_110px_120px_120px_48px] bg-slate-50 px-4 py-3 text-xs font-black text-dar-muted md:grid">
                  <span>Date</span>
                  <span>Description</span>
                  <span>Type</span>
                  <span>Amount</span>
                  <span>Balance</span>
                  <span />
                </div>
                <div className="divide-y divide-dar-border">
                  {visibleTransactions.map((transaction) => (
                    <div className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[150px_1fr_110px_120px_120px_48px]" key={transaction.id}>
                      <span className="font-semibold text-dar-muted">
                        {new Date(transaction.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="font-black text-dar-navy">{transaction.description}</span>
                      <StatusBadge label={transaction.type} tone="neutral" />
                      <span className={cx("font-black", transaction.amount >= 0 ? "text-dar-success" : "text-dar-error")}>
                        {transaction.amount >= 0 ? "+" : "-"} {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
                      </span>
                      <span className="font-bold text-dar-navy">{formatCurrency(transaction.balance, transaction.currency)}</span>
                      <IconButton
                        className="size-9"
                        label={`Download receipt for ${transaction.description}`}
                        onClick={() => showToast({ description: "Receipt download is available after billing provider integration.", title: "Receipt preview", type: "info" })}
                      >
                        <Download className="size-4" />
                      </IconButton>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState description={query || typeFilter !== "all" ? "No transactions match your search or filter." : "No wallet transactions yet. Payments and top-ups will appear here."} title="No transactions" />
              </div>
            )}
          </div>
        ) : null}

        {/* ═══ Refund History ═══ */}
        {tab === "refunds" ? (
          <div
            id="panel-refunds"
            role="tabpanel"
            aria-labelledby="tab-refunds"
            className="p-5"
          >
            <div>
              <h2 className="text-lg font-black text-dar-navy">Refund History</h2>
              <p className="mt-1 text-sm font-semibold text-dar-muted">Track refund requests and their current status.</p>
            </div>

            {refundTransactions.length > 0 ? (
              <div className="mt-5 overflow-hidden rounded-xl border border-dar-border">
                <div className="hidden grid-cols-[150px_1fr_120px_120px_120px] bg-slate-50 px-4 py-3 text-xs font-black text-dar-muted md:grid">
                  <span>Date</span>
                  <span>Description</span>
                  <span>Amount</span>
                  <span>Status</span>
                  <span />
                </div>
                <div className="divide-y divide-dar-border">
                  {refundTransactions.map((transaction) => (
                    <div className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[150px_1fr_120px_120px_120px]" key={transaction.id}>
                      <span className="font-semibold text-dar-muted">
                        {new Date(transaction.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <div>
                        <span className="font-black text-dar-navy">{transaction.description}</span>
                        {transaction.bookingId ? (
                          <Link
                            className="mt-1 flex items-center gap-1 text-xs font-semibold text-dar-primary hover:underline"
                            href={`/traveler/bookings/${transaction.bookingId}`}
                          >
                            <ExternalLink className="size-3" />
                            View booking
                          </Link>
                        ) : null}
                      </div>
                      <span className="font-black text-dar-success">{formatCurrency(transaction.amount, transaction.currency)}</span>
                      <StatusBadge label={transaction.status} />
                      <Link
                        className="inline-flex items-center gap-2 text-xs font-bold text-dar-primary hover:underline"
                        href={transaction.bookingId ? `/traveler/bookings/${transaction.bookingId}` : "#"}
                      >
                        <Eye className="size-3.5" />
                        View details
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState description="No refund history yet. Refunds will appear here when processed." title="No refunds" />
              </div>
            )}
          </div>
        ) : null}

        {/* ═══ Billing History ═══ */}
        {tab === "billing" ? (
          <div
            id="panel-billing"
            role="tabpanel"
            aria-labelledby="tab-billing"
            className="p-5"
          >
            <div>
              <h2 className="text-lg font-black text-dar-navy">Billing History</h2>
              <p className="mt-1 text-sm font-semibold text-dar-muted">View invoices and receipts for completed bookings.</p>
            </div>

            {billingBookings.length > 0 ? (
              <div className="mt-5 overflow-hidden rounded-xl border border-dar-border">
                <div className="hidden grid-cols-[120px_1fr_130px_120px_130px_150px] bg-slate-50 px-4 py-3 text-xs font-black text-dar-muted md:grid">
                  <span>Date</span>
                  <span>Booking / Property</span>
                  <span>Amount</span>
                  <span>Payment Method</span>
                  <span>Status</span>
                  <span />
                </div>
                <div className="divide-y divide-dar-border">
                  {billingBookings.map((booking) => (
                    <div className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[120px_1fr_130px_120px_130px_150px]" key={booking.id}>
                      <span className="self-center font-semibold text-dar-muted">
                        {new Date(booking.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <div className="min-w-0 self-center">
                        <p className="truncate font-black text-dar-navy">{booking.property.title}</p>
                        <p className="truncate text-xs font-semibold text-dar-muted">{booking.reference}</p>
                      </div>
                      <span className="self-center font-black text-dar-navy">{formatCurrency(booking.totalAmount, booking.currency)}</span>
                      <span className="self-center text-xs font-semibold text-dar-muted">{booking.paymentMethodLabel}</span>
                      <span className="self-center">
                        <StatusBadge label={booking.paymentStatus} tone="payment" />
                      </span>
                      <div className="flex items-center gap-2 self-center">
                        <Link
                          className="inline-flex items-center gap-1.5 rounded-lg border border-dar-border px-3 py-2 text-xs font-black text-dar-primary transition hover:bg-dar-primary-soft"
                          href={`/traveler/bookings/${booking.id}`}
                        >
                          <Eye className="size-3.5" />
                          View
                        </Link>
                        <Link
                          className="inline-flex items-center gap-1.5 rounded-lg border border-dar-border px-3 py-2 text-xs font-black text-dar-primary transition hover:bg-dar-primary-soft"
                          href={`/traveler/bookings/${booking.id}/invoice`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <Download className="size-3.5" />
                          Invoice
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState description="No billing history yet. Completed bookings with payments will appear here." title="No billing records" />
              </div>
            )}
          </div>
        ) : null}
      </Card>

      {addOpen ? <AddPaymentDialog onClose={() => setAddOpen(false)} /> : null}
    </div>
  );
}
