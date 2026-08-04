function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-[#E5E7EB] ${className}`} />;
}

export function PropertyCardSkeleton() {
  return (
    <article aria-busy="true" aria-label="Loading property card" className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
      <SkeletonBlock className="h-40 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <SkeletonBlock className="h-4 w-4/5" />
        <SkeletonBlock className="h-3 w-3/5" />
        <SkeletonBlock className="h-3 w-2/5" />
        <SkeletonBlock className="h-5 w-24" />
      </div>
    </article>
  );
}

export function SearchResultsSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading search results" className="grid gap-5 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </section>
  );
}

export function DashboardKPICardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard KPI cards" className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5" key={index}>
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="mt-5 h-7 w-20" />
          <SkeletonBlock className="mt-4 h-1.5 w-16 bg-[#6C3DFF]/70" />
        </div>
      ))}
    </div>
  );
}

export function AdminTableRowsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading admin table rows" className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="grid grid-cols-[36px_minmax(0,1.2fr)_1fr_1fr_90px] gap-4 border-b border-[#EEF2F7] py-3 last:border-b-0" key={index}>
          <SkeletonBlock className="size-6 rounded-full" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading chat messages" className="space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="size-8 rounded-full" />
        <SkeletonBlock className="h-5 w-48 rounded-full" />
      </div>
      <div className="ml-auto h-10 w-44 animate-pulse rounded-xl rounded-br-sm bg-[#C4B5FD]" />
      <div className="flex items-center gap-3">
        <SkeletonBlock className="size-8 rounded-full" />
        <SkeletonBlock className="h-8 w-56 rounded-full" />
      </div>
    </div>
  );
}
