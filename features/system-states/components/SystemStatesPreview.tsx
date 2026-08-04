import Image from "next/image";
import { EmptyBookingsState } from "./EmptyBookingsState";
import { EmptyMessagesState } from "./EmptyMessagesState";
import { EmptyOwnerListingsState } from "./EmptyOwnerListingsState";
import { EmptySavedState } from "./EmptySavedState";
import { EmptySearchState } from "./EmptySearchState";
import { AccessRestrictedState, ReceiptVerificationError, SearchErrorState } from "./ErrorStateCard";
import {
  AdminTableRowsSkeleton,
  ChatMessageSkeleton,
  DashboardKPICardSkeleton,
  PropertyCardSkeleton,
  SearchResultsSkeleton,
} from "./Skeletons";
import { ToastProvider } from "./ToastProvider";
import { ToastPreviewActions } from "./ToastPreviewActions";
import { TrustStrip } from "./TrustStrip";

function PreviewSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section>
      <p className="mb-3 text-[13px] font-black uppercase tracking-[0.1em] text-[#5E2FE5]">{title}</p>
      {children}
    </section>
  );
}

export function SystemStatesPreview() {
  return (
    <ToastProvider>
      <main id="main-content" className="min-h-dvh overflow-x-hidden bg-[#F8FAFC] text-[#0F172A]">
        <header className="bg-[#06111F] px-5 py-5 text-white sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-[1760px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="dar-logo-frame h-[56px] w-[156px]">
                <Image alt="DAR logo" className="dar-logo-image dar-logo-image-dark w-[152px]" height={864} priority src="/assets/images/dar-logo.png" width={1536} />
              </div>
              <span className="hidden h-12 w-px bg-white/16 sm:block" />
              <div>
                <h1 className="text-[28px] font-black">DAR UI States</h1>
                <p className="mt-1 text-[14px] font-medium text-white/72">
                  Error, empty and loading screens for a premium booking experience.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-5 text-[13px] font-bold text-white/78">
              <span className="inline-flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#6C3DFF]" />
                Primary
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#F6B733]" />
                Accent
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#CBD5E1]" />
                Neutral
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1760px] gap-7 px-5 py-6 sm:px-8 lg:grid-cols-3 lg:px-10">
          <PreviewSection title="2. Empty search results">
            <EmptySearchState />
          </PreviewSection>
          <PreviewSection title="3. Empty saved stays">
            <EmptySavedState />
          </PreviewSection>
          <PreviewSection title="4. Empty bookings">
            <EmptyBookingsState />
          </PreviewSection>
          <PreviewSection title="5. Empty owner listings">
            <EmptyOwnerListingsState />
          </PreviewSection>
          <PreviewSection title="6. Empty messages">
            <EmptyMessagesState />
          </PreviewSection>
          <PreviewSection title="7. Loading skeletons">
            <div className="space-y-5 rounded-xl border border-[#E5E7EB] bg-white p-5">
              <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                <PropertyCardSkeleton />
                <SearchResultsSkeleton />
              </div>
              <DashboardKPICardSkeleton />
              <AdminTableRowsSkeleton />
              <ChatMessageSkeleton />
            </div>
          </PreviewSection>
        </div>

        <div className="mx-auto grid max-w-[1760px] gap-5 px-5 pb-6 sm:px-8 lg:grid-cols-3 lg:px-10">
          <PreviewSection title="8. Error states">
            <ReceiptVerificationError />
          </PreviewSection>
          <PreviewSection title="8. Connection error">
            <SearchErrorState />
          </PreviewSection>
          <PreviewSection title="8. Restricted access">
            <AccessRestrictedState />
          </PreviewSection>
        </div>

        <div className="mx-auto max-w-[1760px] px-5 pb-6 sm:px-8 lg:px-10">
          <PreviewSection title="9. Success / toast states">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <ToastPreviewActions />
            </div>
          </PreviewSection>
        </div>

        <div className="mx-auto max-w-[1760px] px-5 pb-6 sm:px-8 lg:px-10">
          <TrustStrip />
        </div>
      </main>
    </ToastProvider>
  );
}
