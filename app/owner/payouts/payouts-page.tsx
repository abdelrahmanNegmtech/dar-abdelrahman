"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  Info,
  Landmark,
  Search as SearchIcon,
  TriangleAlert,
  WalletCards,
} from "lucide-react";
import { Icon } from "@/components/host-landing/icons";
import { Card, OwnerShell } from "@/components/owner/owner-shell";
import type {
  OwnerPayoutDestinationDisplay,
  OwnerPayoutListItem,
  OwnerPayoutPageData,
} from "@/features/payouts/data/payout-queries";

type PayoutsPageProps = OwnerPayoutPageData;

const ALL_STATUS = "All";
const ALL_METHODS = "All methods";
const ALL_PROPERTIES = "All properties";
const DEFAULT_DATE_RANGE = "May 01, 2026 - May 31, 2026";

const STATUS_OPTIONS = [
  ALL_STATUS,
  "Pending",
  "Scheduled",
  "Processing",
  "Paid",
  "Failed",
  "On hold",
  "Cancelled",
] as const;

function formatMoney(amountMinor: number, currencyCode = "EGP") {
  return new Intl.NumberFormat("en-US", {
    currency: currencyCode,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amountMinor / 100);
}

function formatDateLabel(value: string | null | undefined) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatTimestampLabel(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatMonthLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getPayoutDateValue(payout: OwnerPayoutListItem) {
  return (
    payout.paidAt
    ?? payout.failedAt
    ?? payout.processedAt
    ?? payout.scheduledFor
    ?? payout.createdAt
  );
}

function getPayoutDateLabel(payout: OwnerPayoutListItem) {
  return formatDateLabel(getPayoutDateValue(payout));
}

function getPayoutMethodOptions(payouts: OwnerPayoutListItem[]) {
  return [
    ALL_METHODS,
    ...Array.from(new Set(payouts.map((payout) => payout.methodLabel))),
  ];
}

function getPayoutPropertyOptions(payouts: OwnerPayoutListItem[]) {
  return [
    ALL_PROPERTIES,
    ...Array.from(
      new Set(
        payouts
          .map((payout) => payout.propertyTitle)
          .filter((propertyTitle) => propertyTitle !== "No linked booking"),
      ),
    ),
  ];
}

function parseDateRange(input: string) {
  const [fromRaw, toRaw] = input.split(" - ").map((value) => value.trim());
  if (!fromRaw || !toRaw) {
    return null;
  }

  const from = new Date(fromRaw);
  const to = new Date(toRaw);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return null;
  }

  return { from, to };
}

function matchesDateRange(payout: OwnerPayoutListItem, dateRangeInput: string) {
  if (!dateRangeInput.trim()) {
    return true;
  }

  const range = parseDateRange(dateRangeInput);
  if (!range) {
    return true;
  }

  const payoutDate = new Date(getPayoutDateValue(payout));
  if (Number.isNaN(payoutDate.getTime())) {
    return false;
  }

  return payoutDate >= range.from && payoutDate <= range.to;
}

function matchesSearch(payout: OwnerPayoutListItem, query: string) {
  if (!query.trim()) {
    return true;
  }

  const haystack = [
    payout.id,
    payout.bookingReference,
    payout.propertyTitle,
    payout.guestName,
    payout.methodLabel,
    payout.statusLabel,
    payout.notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.trim().toLowerCase());
}

function getSummaryCards(data: OwnerPayoutPageData) {
  return [
    {
      icon: WalletCards,
      iconClass: "text-[#6c4cf5]",
      label: "Available to withdraw",
      value: formatMoney(data.summary.availableToWithdrawMinor),
      wrapClass: "",
    },
    {
      icon: CalendarDays,
      iconClass: "text-[#6c4cf5]",
      label: "Upcoming payouts",
      value: formatMoney(data.summary.upcomingMinor),
      wrapClass: "",
    },
    {
      icon: CircleCheckBig,
      iconClass: "text-[#2d9b50]",
      label: "Paid this month",
      value: formatMoney(data.summary.paidThisMonthMinor),
      wrapClass: "size-11 rounded-full bg-[#eef9f1]",
    },
    {
      icon: Clock3,
      iconClass: "text-[#efa125]",
      label: "Pending verification",
      value: formatMoney(data.summary.pendingVerificationMinor),
      wrapClass: "size-11 rounded-full bg-[#fff7e9]",
    },
    {
      icon: TriangleAlert,
      iconClass: "text-[#f0645f]",
      label: "Failed payout",
      value: formatMoney(data.summary.failedMinor),
      wrapClass: "size-11 rounded-full bg-[#fff0ef]",
    },
    {
      icon: ChartNoAxesColumnIncreasing,
      iconClass: "text-[#6c4cf5]",
      label: "Total lifetime earnings",
      value: formatMoney(data.summary.lifetimePaidMinor),
      wrapClass: "",
    },
  ] as const;
}

function buildReceiptContent(payout: OwnerPayoutListItem) {
  return [
    "DAR payout receipt",
    `Payout ID: ${payout.id}`,
    `Status: ${payout.statusLabel}`,
    `Net payout: ${formatMoney(payout.netAmountMinor, payout.currencyCode)}`,
    `Method: ${payout.methodLabel}`,
    payout.bookingReference ? `Booking: ${payout.bookingReference}` : "Booking: No linked booking",
  ].join("\n");
}

function generateDownload(name: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getTimelineSteps(payout: OwnerPayoutListItem) {
  const paymentVerified =
    payout.status === "paid"
    || payout.status === "processing"
    || payout.status === "scheduled"
    || payout.status === "on_hold"
    || payout.status === "failed"
    || payout.status === "cancelled";
  const stayCompleted = Boolean(payout.checkOutDate) && paymentVerified;
  const payoutScheduled = Boolean(payout.scheduledFor) || payout.status !== "pending";

  return [
    { complete: Boolean(payout.bookingReference), label: "Booking confirmed" },
    { complete: paymentVerified, label: "Guest payment verified" },
    { complete: stayCompleted, label: "Stay completed" },
    { complete: payoutScheduled, label: "Payout scheduled" },
    {
      complete: payout.status === "paid",
      label:
        payout.status === "failed"
          ? "Payout failed"
          : payout.status === "cancelled"
            ? "Payout cancelled"
            : payout.status === "on_hold"
              ? "Payout on hold"
              : "Payout sent",
    },
  ];
}

function getRecentActivity(payouts: OwnerPayoutListItem[]) {
  return payouts
    .flatMap((payout) => {
      const activity: Array<{
        id: string;
        meta: string;
        timestamp: string;
        title: string;
        tone: "success" | "brand" | "warning";
      }> = [];

      if (payout.paidAt) {
        activity.push({
          id: `${payout.id}-paid`,
          meta: `${formatMoney(payout.netAmountMinor, payout.currencyCode)} · ${formatTimestampLabel(payout.paidAt)}`,
          timestamp: payout.paidAt,
          title: `Payout sent: ${payout.id}`,
          tone: "success",
        });
      }

      if (payout.failedAt) {
        activity.push({
          id: `${payout.id}-failed`,
          meta: `${formatTimestampLabel(payout.failedAt)} · ${payout.methodLabel}`,
          timestamp: payout.failedAt,
          title: `Payout failed: ${payout.id}`,
          tone: "warning",
        });
      }

      if (payout.scheduledFor) {
        activity.push({
          id: `${payout.id}-scheduled`,
          meta: `${formatDateLabel(payout.scheduledFor)} · ${payout.methodLabel}`,
          timestamp: payout.scheduledFor,
          title: `Payout scheduled: ${payout.id}`,
          tone: "brand",
        });
      }

      return activity;
    })
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
    .slice(0, 3);
}

function getStatementEntries(payouts: OwnerPayoutListItem[]) {
  const months = Array.from(new Set(payouts.map((payout) => formatMonthLabel(getPayoutDateValue(payout)))));
  const statementEntries = months.slice(0, 2).map((month, index) => ({
    id: `statement-${month}`,
    meta: `TXT · Generated from local payout data`,
    name: `${month} Owner Statement`,
    size: index === 0 ? "12 KB" : "11 KB",
  }));

  const receiptEntries = payouts.slice(0, 2).map((payout) => ({
    id: `receipt-${payout.id}`,
    meta: `TXT · ${getPayoutDateLabel(payout)}`,
    name: `Payout Receipt ${payout.id}`,
    size: "3 KB",
  }));

  return [...statementEntries, ...receiptEntries];
}

export default function PayoutsPage({
  destinationDisplay,
  payouts,
  summary,
  usingFallback,
}: PayoutsPageProps) {
  const methodOptions = useMemo(() => getPayoutMethodOptions(payouts), [payouts]);
  const propertyOptions = useMemo(() => getPayoutPropertyOptions(payouts), [payouts]);
  const summaryCards = useMemo(
    () => getSummaryCards({ destinationDisplay, payouts, summary, usingFallback }),
    [destinationDisplay, payouts, summary, usingFallback],
  );
  const recentActivity = useMemo(() => getRecentActivity(payouts), [payouts]);
  const statementEntries = useMemo(() => getStatementEntries(payouts), [payouts]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(ALL_STATUS);
  const [method, setMethod] = useState<string>(ALL_METHODS);
  const [property, setProperty] = useState<string>(ALL_PROPERTIES);
  const [date, setDate] = useState(DEFAULT_DATE_RANGE);
  const [applied, setApplied] = useState({
    date: DEFAULT_DATE_RANGE,
    method: ALL_METHODS,
    property: ALL_PROPERTIES,
    search: "",
    status: ALL_STATUS,
  });
  const [selectedId, setSelectedId] = useState<string | null>(payouts[0]?.id ?? null);
  const [modal, setModal] = useState(false);
  const [payMethod, setPayMethod] = useState(destinationDisplay.methodLabel);
  const [toast, setToast] = useState("");
  const [holdReasonId, setHoldReasonId] = useState<string | null>(null);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const shown = useMemo(() => {
    return payouts.filter((payout) => {
      const matchesStatus = applied.status === ALL_STATUS || payout.statusLabel === applied.status;
      const matchesMethod = applied.method === ALL_METHODS || payout.methodLabel === applied.method;
      const matchesProperty = applied.property === ALL_PROPERTIES || payout.propertyTitle === applied.property;

      return (
        matchesSearch(payout, applied.search)
        && matchesStatus
        && matchesMethod
        && matchesProperty
        && matchesDateRange(payout, applied.date)
      );
    });
  }, [applied, payouts]);

  const selected = shown.find((payout) => payout.id === selectedId)
    ?? payouts.find((payout) => payout.id === selectedId)
    ?? shown[0]
    ?? payouts[0]
    ?? null;
  const holdReason = payouts.find((payout) => payout.id === holdReasonId) ?? null;
  const failedPayout = payouts.find((payout) => payout.status === "failed") ?? null;
  const onHoldPayout = payouts.find((payout) => payout.status === "on_hold") ?? null;
  const upcomingPayouts = payouts
    .filter((payout) => payout.status === "scheduled" || payout.status === "processing" || payout.status === "pending")
    .slice(0, 3);

  const exportCsv = () => {
    generateDownload(
      "dar-payouts.csv",
      [
        "Payout ID,Booking,Property,Net payout,Status",
        ...shown.map((payout) =>
          `${payout.id},${payout.bookingReference ?? ""},"${payout.propertyTitle}",${payout.netAmountMinor / 100},${payout.statusLabel}`,
        ),
      ].join("\n"),
      "text/csv",
    );
  };

  const downloadStatement = (label: string) => {
    generateDownload(
      `${label.replace(/\s+/g, "-").toLowerCase()}.txt`,
      `${label}\nGenerated from owner-scoped local payout data.`,
    );
  };

  const actions = (
    <>
      <button
        onClick={() => downloadStatement("DAR Owner Statement")}
        className="owner-button-text flex h-10 items-center gap-2 rounded border border-[#ccd2dd] px-4"
      >
        <Icon name="download" className="size-4" />
        Download statement
      </button>
      <button
        onClick={exportCsv}
        className="owner-button-text flex h-10 items-center gap-2 rounded border border-[#ccd2dd] px-4"
      >
        <Icon name="upload" className="size-4" />
        Export payouts
      </button>
      <button
        onClick={() => setModal(true)}
        className="owner-button-text h-10 rounded bg-[#5522d9] px-5 text-white"
      >
        Update payout method
      </button>
    </>
  );

  return (
    <OwnerShell active="Payments" actions={actions} wide fluid>
      <div className="owner-dashboard-content">
        <div className="flex items-start justify-between gap-5 max-[760px]:flex-col">
          <div>
            <h1 className="owner-page-title">Owner payouts</h1>
            <p className="owner-page-description text-[#5d667d]">
              Track upcoming payouts, payout history, failed transfers and downloadable statements.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-6 gap-3 max-[1100px]:grid-cols-3 max-[600px]:grid-cols-2">
          {summaryCards.map(({ label, value, icon: SummaryIcon, iconClass, wrapClass }) => (
            <Card key={label} className="p-4">
              <div className="flex min-h-[52px] items-center justify-between gap-3">
                <span className="min-w-0">
                  <p className="owner-helper">{label}</p>
                  <b className="owner-number-sm mt-2 block whitespace-nowrap">{value}</b>
                </span>
                <span className={`grid shrink-0 place-items-center ${wrapClass}`}>
                  <SummaryIcon aria-hidden="true" size={27} strokeWidth={1.8} className={iconClass} />
                </span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-3 p-4">
          <div className="grid grid-cols-[minmax(300px,1.4fr)_minmax(150px,.6fr)_minmax(170px,.7fr)_minmax(240px,1fr)_minmax(180px,.8fr)] items-end gap-4 max-[1400px]:grid-cols-2 max-[620px]:grid-cols-1">
            <label className="relative block">
              <SearchIcon
                aria-hidden="true"
                size={18}
                strokeWidth={1.8}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b8498]"
              />
              <input
                value={search}
                onChange={(event) => {
                  const nextSearch = event.target.value;
                  setSearch(nextSearch);
                  setApplied((current) => ({ ...current, search: nextSearch }));
                }}
                placeholder="Search payout ID, booking ID, guest, statement..."
                className="owner-input-text h-10 w-full rounded-md border border-[#dce1e9] pl-10 pr-3 outline-none focus:border-[#7b4cff]"
              />
            </label>
            <Select label="Status" value={status} onChange={setStatus} options={[...STATUS_OPTIONS]} />
            <Select label="Method" value={method} onChange={setMethod} options={methodOptions} />
            <label className="relative block">
              <input
                type="text"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="owner-input-text h-10 w-full rounded-md border border-[#dce1e9] px-3 pr-10 outline-none focus:border-[#7b4cff]"
              />
              <CalendarDays
                aria-hidden="true"
                size={18}
                strokeWidth={1.8}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#59637d]"
              />
            </label>
            <Select label="Property" value={property} onChange={setProperty} options={propertyOptions} />
          </div>
          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {STATUS_OPTIONS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      setStatus(chip);
                      setApplied((current) => ({ ...current, status: chip }));
                    }}
                    className={`owner-button-text flex h-9 items-center gap-2 whitespace-nowrap rounded-[10px] border px-3 transition-colors ${status === chip ? "border-[#6d3bea] bg-[#faf8ff] text-[#5522d9]" : "border-[#dce1e9] bg-white text-[#17213d]"}`}
                  >
                    {chip !== ALL_STATUS ? <span className={`size-2 shrink-0 rounded-full ${statusDotClass(chip)}`} /> : null}
                    {chip}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {methodOptions.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      setMethod(chip);
                      setApplied((current) => ({ ...current, method: chip }));
                    }}
                    className={`owner-button-text h-9 whitespace-nowrap rounded-[10px] border px-3 transition-colors ${method === chip ? "border-[#6d3bea] bg-[#faf8ff] text-[#5522d9]" : "border-[#dce1e9] bg-white text-[#17213d]"}`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setApplied({ date, method, property, search, status })}
                className="owner-button-text ml-auto h-9 whitespace-nowrap rounded-[8px] bg-[#5522d9] px-5 text-white transition-colors hover:bg-[#4518bd]"
              >
                Apply filters
              </button>
              <button
                onClick={() => {
                  setSearch("");
                  setStatus(ALL_STATUS);
                  setMethod(ALL_METHODS);
                  setDate("");
                  setProperty(ALL_PROPERTIES);
                  setApplied({
                    date: "",
                    method: ALL_METHODS,
                    property: ALL_PROPERTIES,
                    search: "",
                    status: ALL_STATUS,
                  });
                }}
                className="owner-button-text h-9 whitespace-nowrap rounded-[8px] border border-[#dce1e9] bg-white px-4 text-[#5522d9] transition-colors hover:bg-[#f7f3ff]"
              >
                Clear all
              </button>
            </div>
          </div>
        </Card>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-5 max-[1849px]:grid-cols-1">
          <div className="min-w-0 space-y-3">
            <PayoutHistoryTable
              rows={shown}
              selectedId={selected?.id ?? null}
              activeStatus={applied.status}
              onDownload={(payout) => generateDownload(`${payout.id}-receipt.txt`, buildReceiptContent(payout))}
              onHoldReason={(payout) => setHoldReasonId(payout.id)}
              onRetry={() => setModal(true)}
              onSelect={(payout) => setSelectedId(payout.id)}
              onStatusChange={(nextStatus) => {
                setStatus(nextStatus);
                setApplied((current) => ({ ...current, status: nextStatus }));
              }}
            />

            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-4 max-[1199px]:grid-cols-2 max-[700px]:grid-cols-1">
              <PayoutMethodCard
                destinationDisplay={destinationDisplay}
                payMethod={payMethod}
                setPayMethod={setPayMethod}
                onEdit={() => setModal(true)}
              />
              <Card className="p-4">
                <div className="flex items-baseline gap-1.5">
                  <b className="owner-card-title">Earnings summary</b>
                  <span className="owner-helper text-[#6f788c]">(Owner-scoped payouts)</span>
                </div>
                <div className="owner-helper mt-4 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1.5">
                    <i className="size-2 rounded-sm bg-[#5522d9]" />
                    Gross earnings
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="size-2 rounded-sm bg-[#2fa84f]" />
                    Net payouts
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="size-2 rounded-sm bg-[#e6a334]" />
                    DAR commission
                  </span>
                </div>
                <div className="mt-4 flex h-32 items-end justify-around border-b border-[#dfe3eb]">
                  {buildChartBars(payouts).map((bar) => (
                    <div key={bar.label} className="flex items-end gap-0.5">
                      <span className="w-2.5 bg-[#5522d9]" style={{ height: `${bar.grossHeight}%` }} />
                      <span className="w-2.5 bg-[#2fa84f]" style={{ height: `${bar.netHeight}%` }} />
                      <span className="w-2.5 bg-[#e6a334]" style={{ height: `${bar.commissionHeight}%` }} />
                    </div>
                  ))}
                </div>
                <div className="owner-helper mt-2 flex justify-around">
                  {buildChartBars(payouts).map((bar) => (
                    <span key={bar.label}>{bar.label}</span>
                  ))}
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex justify-between gap-3">
                  <b className="owner-card-title">Upcoming payouts</b>
                  <button className="owner-button-text whitespace-nowrap text-[#5522d9]">View all</button>
                </div>
                {upcomingPayouts.length ? (
                  upcomingPayouts.map((payout) => (
                    <button
                      key={payout.id}
                      onClick={() => setSelectedId(payout.id)}
                      className="mt-4 grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 text-left"
                    >
                      <Image
                        src={payout.propertyImageUrl}
                        alt=""
                        width={44}
                        height={44}
                        className="size-11 rounded object-cover"
                        quality={90}
                      />
                      <span className="owner-helper min-w-0">
                        <b className="owner-label block">{payout.propertyTitle}</b>
                        {payout.id}
                      </span>
                      <span className="owner-helper text-right">
                        <b className="owner-label block whitespace-nowrap">
                          {formatMoney(payout.netAmountMinor, payout.currencyCode)}
                        </b>
                        {getPayoutDateLabel(payout)}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="owner-helper mt-4">No pending or scheduled payouts are currently on file.</p>
                )}
              </Card>
              <Card className="p-4">
                <b className="owner-card-title">Failed &amp; on-hold payouts</b>
                {failedPayout ? (
                  <div className="mt-4 flex gap-3 rounded border border-red-200 bg-red-50 p-3">
                    <TriangleAlert
                      aria-hidden="true"
                      size={22}
                      strokeWidth={1.8}
                      className="mt-0.5 shrink-0 text-[#ef5c55]"
                    />
                    <div>
                      <b className="owner-label">Failed payout</b>
                      <p className="owner-helper">{failedPayout.failureReason ?? "DAR could not complete this payout on the stored method."}</p>
                      <button
                        onClick={() => setModal(true)}
                        className="owner-button-text mt-2 rounded border border-[#8e6bf0] px-3 py-1"
                      >
                        Review payout method
                      </button>
                    </div>
                  </div>
                ) : null}
                {onHoldPayout ? (
                  <div className="mt-3 flex gap-3 rounded border border-[#f1ce86] bg-[#fffaf0] p-3">
                    <Clock3
                      aria-hidden="true"
                      size={22}
                      strokeWidth={1.8}
                      className="mt-0.5 shrink-0 text-[#eea126]"
                    />
                    <div>
                      <b className="owner-label">On hold payout</b>
                      <p className="owner-helper">
                        {onHoldPayout.notes ?? "This payout remains on hold until the linked operational review is cleared."}
                      </p>
                      <button
                        onClick={() => notify("Payout support remains handled through the DAR help center.")}
                        className="owner-button-text mt-2 rounded border border-[#8e6bf0] px-3 py-1"
                      >
                        View case
                      </button>
                    </div>
                  </div>
                ) : null}
                {!failedPayout && !onHoldPayout ? (
                  <p className="owner-helper mt-4">No failed or on-hold payouts are currently on file.</p>
                ) : null}
              </Card>
            </div>

            <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-4 max-[1199px]:grid-cols-2 max-[700px]:grid-cols-1">
              <Card className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <b className="owner-card-title">Statements & receipts</b>
                  <button
                    onClick={() => downloadStatement("DAR owner statements and receipts")}
                    className="owner-button-text whitespace-nowrap text-[#5522d9]"
                  >
                    Download all
                  </button>
                </div>
                {statementEntries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => downloadStatement(entry.name)}
                    className="mt-3 grid w-full grid-cols-[24px_minmax(0,1fr)_auto_18px] items-center gap-3 border-b border-[#edf0f4] pb-3 text-left last:border-0 last:pb-0"
                  >
                    <Icon name="receipt" className="size-5 text-red-500" />
                    <span className="min-w-0">
                      <b className="owner-label block">{entry.name}</b>
                      <small className="owner-helper text-[#6f788c]">{entry.meta}</small>
                    </span>
                    <span className="owner-helper whitespace-nowrap">{entry.size}</span>
                    <Icon name="download" className="size-4" />
                  </button>
                ))}
              </Card>

              <Card className="p-4">
                <b className="owner-card-title">Important information</b>
                <div className="mt-4 flex gap-3 rounded border border-[#e6e8ef] bg-[#f8f8fb] p-3">
                  <Info aria-hidden="true" size={22} strokeWidth={1.8} className="shrink-0 text-[#4c86ec]" />
                  <div>
                    <b className="owner-label">Tax note</b>
                    <p className="owner-helper mt-1">
                      Taxes are the owner&apos;s responsibility unless otherwise agreed.
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-3 rounded border border-[#e6e8ef] bg-[#f8f8fb] p-3">
                  <SearchIcon aria-hidden="true" size={22} strokeWidth={1.8} className="shrink-0 text-[#4d5771]" />
                  <div>
                    <b className="owner-label">Need help with a payout?</b>
                    <p className="owner-helper mt-1">
                      Open a payout ticket and our team will assist you.
                    </p>
                    <Link href="/owner/help-center" className="owner-button-text mt-2 inline-block text-[#5522d9]">
                      Open payout ticket →
                    </Link>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <b className="owner-card-title">Recent activity</b>
                  <button className="owner-button-text text-[#5522d9]">View all</button>
                </div>
                {recentActivity.length ? (
                  recentActivity.map((item) => (
                    <p key={item.id} className="owner-body mt-4 flex gap-3">
                      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.tone === "success" ? "bg-[#2fa84f]" : item.tone === "warning" ? "bg-[#efa125]" : "bg-[#5522d9]"}`} />
                      <span>
                        <b className="owner-label block">{item.title}</b>
                        <small className="owner-helper text-[#6f788c]">{item.meta}</small>
                      </span>
                    </p>
                  ))
                ) : (
                  <p className="owner-helper mt-4">Payout activity will appear here as owner-scoped rows change status.</p>
                )}
              </Card>
            </div>
          </div>

          <SelectedPayoutCard
            payout={selected}
            close={() => setSelectedId(payouts[0]?.id ?? null)}
            onChangeMethod={() => setModal(true)}
            onDownloadReceipt={(payout) => generateDownload(`${payout.id}-receipt.txt`, buildReceiptContent(payout))}
            onDownloadStatement={(payout) => downloadStatement(`Payout statement ${payout.id}`)}
          />
        </div>
      </div>

      {modal ? (
        <MethodModal
          close={() => setModal(false)}
          onSave={() => {
            setModal(false);
            notify("Payout destination updates remain handled by DAR support in this phase.");
          }}
          setValue={setPayMethod}
          value={payMethod}
        />
      ) : null}

      {holdReason ? (
        <HoldReasonDialog payout={holdReason} close={() => setHoldReasonId(null)} />
      ) : null}

      {toast ? (
        <div className="owner-body fixed bottom-5 left-5 z-50 rounded bg-[#10283a] px-5 py-3 text-white">
          {toast}
        </div>
      ) : null}
    </OwnerShell>
  );
}

function statusDotClass(status: string) {
  switch (status) {
    case "Pending":
      return "bg-[#efa125]";
    case "Scheduled":
      return "bg-[#f29b18]";
    case "Processing":
      return "bg-[#6c3ee8]";
    case "Paid":
      return "bg-[#2fa84f]";
    case "Failed":
      return "bg-[#ef3e3e]";
    case "On hold":
      return "bg-[#9da3ae]";
    case "Cancelled":
      return "bg-[#7b8498]";
    default:
      return "bg-[#6c3ee8]";
  }
}

function buildChartBars(payouts: OwnerPayoutListItem[]) {
  const monthMap = new Map<string, { commission: number; gross: number; net: number }>();

  payouts.forEach((payout) => {
    const label = new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(getPayoutDateValue(payout)));
    const current = monthMap.get(label) ?? { commission: 0, gross: 0, net: 0 };
    current.gross += payout.grossAmountMinor;
    current.net += payout.netAmountMinor;
    current.commission += payout.commissionAmountMinor;
    monthMap.set(label, current);
  });

  const rows = Array.from(monthMap.entries()).slice(0, 6);
  const maxGross = Math.max(...rows.map(([, value]) => value.gross), 1);

  return rows.map(([label, value]) => ({
    commissionHeight: Math.max(12, Math.round((value.commission / maxGross) * 100)),
    grossHeight: Math.max(18, Math.round((value.gross / maxGross) * 100)),
    label,
    netHeight: Math.max(16, Math.round((value.net / maxGross) * 100)),
  }));
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  onChange: (value: string) => void;
  options: readonly string[];
  value: string;
}) {
  return (
    <label className="owner-label block">
      {label}
      <span className="relative mt-1 block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="owner-input-text h-10 w-full appearance-none rounded-md border border-[#dce1e9] bg-white px-3 pr-9 outline-none focus:border-[#7b4cff]"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          size={16}
          strokeWidth={1.8}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#59637d]"
        />
      </span>
    </label>
  );
}

function Badge({ status }: { status: string }) {
  const className =
    status === "Paid"
      ? "bg-green-100 text-green-700"
      : status === "Scheduled" || status === "Pending"
        ? "bg-orange-100 text-orange-700"
        : status === "Failed"
          ? "bg-red-100 text-red-600"
          : status === "On hold" || status === "Cancelled"
            ? "bg-slate-100 text-slate-700"
            : "bg-purple-100 text-purple-700";

  return <span className={`owner-badge rounded px-2 py-1 ${className}`}>{status}</span>;
}

function PaymentMethodBadge({ method }: { method: OwnerPayoutListItem["method"] }) {
  if (method === "instapay") {
    return (
      <Image
        src="/brands/instapay.svg"
        alt="InstaPay"
        width={82}
        height={22}
        className="h-[20px] w-[82px] object-contain object-left"
        quality={90}
      />
    );
  }

  if (method === "bank_transfer") {
    return (
      <span className="inline-flex items-center gap-2">
        <Landmark aria-hidden="true" size={16} strokeWidth={1.8} className="shrink-0 text-[#17213d]" />
        Bank transfer
      </span>
    );
  }

  if (method === "vodafone_cash") {
    return (
      <span className="inline-flex items-center gap-2">
        <Image
          src="/brands/vodafone.svg"
          alt=""
          width={18}
          height={18}
          className="size-[18px] shrink-0 object-contain"
          quality={90}
        />
        Vodafone Cash
      </span>
    );
  }

  return <span>Cash pickup</span>;
}

function PayoutHistoryTable({
  rows,
  selectedId,
  activeStatus,
  onStatusChange,
  onSelect,
  onDownload,
  onRetry,
  onHoldReason,
}: {
  activeStatus: string;
  onDownload: (payout: OwnerPayoutListItem) => void;
  onHoldReason: (payout: OwnerPayoutListItem) => void;
  onRetry: () => void;
  onSelect: (payout: OwnerPayoutListItem) => void;
  onStatusChange: (status: string) => void;
  rows: OwnerPayoutListItem[];
  selectedId: string | null;
}) {
  const runAction = (payout: OwnerPayoutListItem) => {
    if (payout.status === "failed") {
      onRetry();
      return;
    }

    if (payout.status === "on_hold") {
      onHoldReason(payout);
      return;
    }

    if (payout.status === "paid") {
      onDownload(payout);
      return;
    }

    onSelect(payout);
  };

  const getActionLabel = (payout: OwnerPayoutListItem) => {
    switch (payout.status) {
      case "failed":
        return "Review method";
      case "on_hold":
        return "View hold reason";
      case "paid":
        return "Download";
      default:
        return "View";
    }
  };

  return (
    <Card className="min-w-0 max-w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
        <b className="owner-card-title">Payout history</b>
        <div className="flex flex-wrap justify-end gap-2">
          {STATUS_OPTIONS.map((statusOption) => (
            <button
              key={statusOption}
              onClick={() => onStatusChange(statusOption)}
              className={`owner-badge whitespace-nowrap rounded px-3 py-1 ${activeStatus === statusOption ? "bg-[#5522d9] text-white" : "border border-[#dce1e9]"}`}
            >
              {statusOption}
            </button>
          ))}
        </div>
      </div>
      <div className="max-[1499px]:overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-0 max-[1499px]:min-w-[1180px]">
          <colgroup>
            <col className="w-[9.5%]" />
            <col className="w-[10.5%]" />
            <col className="w-[10.5%]" />
            <col className="w-[9%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[10.5%]" />
            <col className="w-[7%]" />
            <col className="w-[8%]" />
            <col className="w-[11%]" />
          </colgroup>
          <thead className="bg-[#f5f6f9]">
            <tr>
              {[
                "Payout ID",
                "Booking",
                "Property",
                "Check-out date",
                "Gross booking",
                "DAR commission",
                "Net payout",
                "Method",
                "Status",
                "Date",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="owner-helper h-12 border-y border-[#e1e5ed] px-2 text-left font-medium"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((payout) => {
              const isSelected = selectedId === payout.id;

              return (
                <tr
                  key={payout.id}
                  onClick={() => onSelect(payout)}
                  className={`cursor-pointer transition-colors hover:bg-[#faf9ff] ${isSelected ? "bg-[#f8f5ff]" : "bg-white"}`}
                >
                  <td className={`owner-body h-[52px] border-b border-[#e8eaf0] px-2 whitespace-nowrap ${isSelected ? "border-l-2 border-l-[#6d3bea]" : "border-l-2 border-l-transparent"}`}>
                    {payout.id}
                  </td>
                  <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap">
                    {payout.bookingReference ? (
                      <Link
                        href={payout.bookingId ? `/owner/bookings?booking=${payout.bookingId}` : "/owner/bookings"}
                        onClick={(event) => event.stopPropagation()}
                        className="text-[#5522d9]"
                      >
                        {payout.bookingReference}
                      </Link>
                    ) : (
                      "Not linked"
                    )}
                  </td>
                  <td className="owner-body border-b border-[#e8eaf0] px-2">
                    {payout.propertyId ? (
                      <Link
                        href={`/owner/properties/${payout.propertyId}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {payout.propertyTitle}
                      </Link>
                    ) : (
                      payout.propertyTitle
                    )}
                  </td>
                  <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap">
                    {payout.checkOutDate ? formatDateLabel(payout.checkOutDate) : "Not linked"}
                  </td>
                  <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap">
                    {formatMoney(payout.grossAmountMinor, payout.currencyCode)}
                  </td>
                  <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap">
                    {formatMoney(payout.commissionAmountMinor, payout.currencyCode)}
                  </td>
                  <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap">
                    {formatMoney(payout.netAmountMinor, payout.currencyCode)}
                  </td>
                  <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap">
                    <PaymentMethodBadge method={payout.method} />
                  </td>
                  <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap">
                    <Badge status={payout.statusLabel} />
                  </td>
                  <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap">
                    {getPayoutDateLabel(payout)}
                  </td>
                  <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        runAction(payout);
                      }}
                      className="owner-button-text text-[#5522d9] hover:underline"
                    >
                      {getActionLabel(payout)}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="relative flex min-h-[58px] items-center px-4">
        <span className="owner-helper">
          {rows.length ? `Showing 1 to ${rows.length} of ${rows.length} payouts` : "Showing 0 payouts"}
        </span>
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
          <button
            disabled
            aria-label="Previous page"
            className="grid size-8 place-items-center rounded-md border border-[#dce1e9] text-[#9aa2b1] disabled:cursor-not-allowed disabled:opacity-55"
          >
            <ChevronLeft size={16} strokeWidth={1.8} />
          </button>
          <button
            aria-current="page"
            className="owner-button-text grid size-8 place-items-center rounded-md border border-[#d8d1ef] bg-[#faf8ff] text-[#31224f]"
          >
            1
          </button>
          <button
            disabled
            aria-label="Next page"
            className="grid size-8 place-items-center rounded-md border border-[#dce1e9] text-[#9aa2b1] disabled:cursor-not-allowed disabled:opacity-55"
          >
            <ChevronRight size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </Card>
  );
}

function HoldReasonDialog({
  payout,
  close,
}: {
  close: () => void;
  payout: OwnerPayoutListItem;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#071126]/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hold-reason-title"
    >
      <Card className="w-full max-w-md p-5">
        <div className="flex items-center justify-between">
          <b id="hold-reason-title" className="owner-section-title">Payout on hold</b>
          <button onClick={close} aria-label="Close hold reason">
            <Icon name="x" className="size-5" />
          </button>
        </div>
        <p className="owner-body mt-4">
          Payout <b>{payout.id}</b> is on hold while the linked case is reviewed.{" "}
          {payout.notes ?? "The payout will resume automatically when the case is resolved."}
        </p>
        <button
          onClick={close}
          className="owner-button-text mt-5 h-10 w-full rounded bg-[#5522d9] text-white"
        >
          Close
        </button>
      </Card>
    </div>
  );
}

function PayoutMethodCard({
  destinationDisplay,
  payMethod,
  setPayMethod,
  onEdit,
}: {
  destinationDisplay: OwnerPayoutDestinationDisplay;
  onEdit: () => void;
  payMethod: string;
  setPayMethod: (value: string) => void;
}) {
  return (
    <Card className="w-full p-5">
      <b className="owner-card-title">Payout method</b>
      <div className="mt-4 flex w-full">
        {["InstaPay", "Bank transfer", "Vodafone Cash", "Cash pickup"].map((methodOption) => (
          <button
            key={methodOption}
            onClick={() => setPayMethod(methodOption)}
            className={`owner-badge h-9 min-w-0 flex-1 whitespace-nowrap rounded-md px-1 text-center !text-[11px] !leading-4 ${payMethod === methodOption ? "bg-[#5522d9] text-white" : "border border-[#e1e5ed] bg-white text-[#17213d]"}`}
          >
            {methodOption}
          </button>
        ))}
      </div>
      <div className="owner-body mt-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <span>Account holder name</span>
          <b className="shrink-0 text-right">{destinationDisplay.accountHolderLabel}</b>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span>Destination on file</span>
          <b className="text-right">
            <span className="block">{destinationDisplay.destinationPrimary}</span>
            <span className="block">{destinationDisplay.destinationSecondary}</span>
          </b>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Verification status</span>
          <b className="inline-flex items-center gap-1.5 text-green-600">
            {destinationDisplay.verificationLabel}
            <CheckCircle aria-hidden="true" size={16} strokeWidth={1.8} />
          </b>
        </div>
      </div>
      <button
        onClick={onEdit}
        className="owner-button-text mt-4 h-10 w-full rounded-md bg-[#5522d9] text-white transition-colors hover:bg-[#4518bd]"
      >
        Update payout details
      </button>
      <p className="owner-helper mt-2.5 flex items-start gap-2 text-[#6f788c]">
        <Info aria-hidden="true" size={14} strokeWidth={1.8} className="mt-0.5 shrink-0" />
        {destinationDisplay.isDeferred
          ? "Payout destination updates remain a DAR-managed support workflow in this phase."
          : "Changes may require verification before next payout."}
      </p>
    </Card>
  );
}

function SelectedPayoutCard({
  payout,
  close,
  onChangeMethod,
  onDownloadReceipt,
  onDownloadStatement,
}: {
  close: () => void;
  onChangeMethod: () => void;
  onDownloadReceipt: (payout: OwnerPayoutListItem) => void;
  onDownloadStatement: (payout: OwnerPayoutListItem) => void;
  payout: OwnerPayoutListItem | null;
}) {
  if (!payout) {
    return (
      <Card className="self-start p-4">
        <b className="owner-card-title">Selected payout</b>
        <p className="owner-helper mt-4">Choose a payout row to inspect the payout details.</p>
      </Card>
    );
  }

  return (
    <Card className="self-start p-4">
      <div className="flex justify-between">
        <b className="owner-card-title">Selected payout</b>
        <button onClick={close}>
          <Icon name="x" className="size-5" />
        </button>
      </div>
      <div className="mt-5 flex justify-between">
        <b className="owner-section-title">{payout.id}</b>
        <Badge status={payout.statusLabel} />
      </div>
      <div className="mt-4 flex gap-3">
        <Image
          src={payout.propertyImageUrl}
          alt=""
          width={90}
          height={70}
          className="h-[70px] w-[90px] rounded object-cover"
          quality={90}
        />
        <span className="owner-helper">
          {payout.propertyId ? (
            <Link href={`/owner/properties/${payout.propertyId}`} className="owner-card-title block">
              {payout.propertyTitle}
            </Link>
          ) : (
            <span className="owner-card-title block">{payout.propertyTitle}</span>
          )}
          {payout.propertyCity ?? "No linked property context"}
        </span>
      </div>
      <div className="owner-body mt-5 space-y-3">
        {[
          ["Booking reference", payout.bookingReference ?? "Not linked"],
          ["Guest", payout.guestName ?? "Not exposed"],
          ["Check-in", payout.checkInDate ? formatDateLabel(payout.checkInDate) : "Not linked"],
          ["Check-out", payout.checkOutDate ? formatDateLabel(payout.checkOutDate) : "Not linked"],
          ["Nights", payout.nightsCount ? String(payout.nightsCount) : "Not linked"],
          ["Gross booking", formatMoney(payout.grossAmountMinor, payout.currencyCode)],
          ["DAR commission", `- ${formatMoney(payout.commissionAmountMinor, payout.currencyCode)}`],
          ["Net payout", formatMoney(payout.netAmountMinor, payout.currencyCode)],
          ["Payout method", payout.methodLabel],
          ["Status", payout.statusLabel],
        ].map(([label, value]) => (
          <p key={label}>
            {label}
            <b className="float-right">{value}</b>
          </p>
        ))}
      </div>
      <hr className="my-5 border-[#e1e5ed]" />
      <b className="owner-card-title">Payout timeline</b>
      {getTimelineSteps(payout).map((step) => (
        <p key={step.label} className="owner-body mt-4 flex gap-3">
          <span
            className={`mt-1 grid size-4 place-items-center rounded-full ${step.complete ? "bg-green-500 text-white" : "border border-[#7b4cff]"}`}
          >
            {step.complete ? <Icon name="check" className="size-3" /> : ""}
          </span>
          {step.label}
        </p>
      ))}
      <div className="mt-5 space-y-2">
        <button
          onClick={() => onDownloadReceipt(payout)}
          className="owner-button-text h-9 w-full rounded bg-[#5522d9] text-white"
        >
          Download receipt
        </button>
        <button
          onClick={() => onDownloadStatement(payout)}
          className="owner-button-text h-9 w-full rounded border border-[#d3d8e2]"
        >
          Download payout statement
        </button>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/owner/help-center" className="owner-button-text grid h-9 place-items-center rounded border border-[#d3d8e2]">
            Contact support
          </Link>
          <button onClick={onChangeMethod} className="owner-button-text rounded border border-[#d3d8e2]">
            Change payout method
          </button>
        </div>
      </div>
    </Card>
  );
}

function MethodModal({
  value,
  setValue,
  close,
  onSave,
}: {
  close: () => void;
  onSave: () => void;
  setValue: (value: string) => void;
  value: string;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#071126]/55 p-4">
      <Card className="w-full max-w-md p-5">
        <div className="flex justify-between">
          <b className="owner-section-title">Update payout method</b>
          <button onClick={close}>
            <Icon name="x" className="size-5" />
          </button>
        </div>
        <div className="mt-5 space-y-2">
          {["InstaPay", "Bank transfer", "Vodafone Cash", "Cash pickup"].map((methodOption) => (
            <button
              key={methodOption}
              onClick={() => setValue(methodOption)}
              className={`owner-button-text h-11 w-full rounded border ${value === methodOption ? "border-[#6d3bea] bg-[#faf8ff]" : "border-[#dce1e9]"}`}
            >
              {methodOption}
            </button>
          ))}
        </div>
        <label className="owner-label mt-4 block">
          Destination
          <input
            readOnly
            value="Managed through DAR support"
            className="owner-input-text mt-1 h-10 w-full rounded border border-[#dce1e9] px-3"
          />
        </label>
        <p className="owner-helper mt-3">
          Owner payout destination updates are intentionally deferred in Phase 15 and remain DAR-managed.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={close} className="owner-button-text h-10 flex-1 rounded border">
            Cancel
          </button>
          <button onClick={onSave} className="owner-button-text h-10 flex-1 rounded bg-[#5522d9] text-white">
            Save method
          </button>
        </div>
      </Card>
    </div>
  );
}
