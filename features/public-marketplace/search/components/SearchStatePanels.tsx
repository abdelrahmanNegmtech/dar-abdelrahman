import { emptyDestinations, errorSuggestions } from "../data";
import { marketplaceImages } from "../../assets";
import {
  ArrowRightIcon,
  HeadphonesIcon,
  HouseIcon,
  MapPinIcon,
  RefreshCwIcon,
  SlidersIcon,
} from "../icons";

export function EmptyResultsState() {
  const destinationImages = [
    marketplaceImages.hero,
    marketplaceImages.modernApartment,
    marketplaceImages.hotelRoom,
    marketplaceImages.servicedWorkspace,
  ];

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white px-6 py-12 text-center shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
      <EmptyIllustration />
      <h2 className="mt-5 text-[32px] font-bold">No places found</h2>
      <p className="mx-auto mt-3 max-w-[520px] text-[17px] leading-7 text-[#475569]">
        We couldn&apos;t find any places that match your search. Try adjusting your
        filters or explore nearby areas.
      </p>

      <div className="mx-auto mt-8 max-w-[840px] rounded-xl border border-[#E5E7EB] bg-[#FBFAFF] p-5 text-left">
        <h3 className="flex items-center gap-3 text-[17px] font-bold">
          <SlidersIcon className="size-5 text-[#5A30E8]" />
          Try adjusting your search
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {["Change dates", "Increase price range", "Reduce guests", "Remove some filters"].map(
            (action) => (
              <button
                className="h-10 rounded-full border border-[#E5E7EB] bg-white px-4 text-[13px] font-semibold"
                key={action}
                type="button"
              >
                {action}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="mt-9 text-left">
        <h3 className="mb-4 flex items-center gap-2 text-[18px] font-bold">
          <MapPinIcon className="size-5" />
          Explore popular destinations in Egypt
        </h3>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {emptyDestinations.map(([city, places], index) => (
            <article className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white text-left shadow-[0_10px_24px_rgba(15,23,42,0.05)]" key={city}>
              <div
                className="h-28 bg-cover bg-center"
                style={{
                  backgroundImage: `url('${destinationImages[index % destinationImages.length]}')`,
                  backgroundPosition: `${40 + index * 12}% 50%`,
                }}
              />
              <div className="flex items-center justify-between p-4">
                <span>
                  <strong className="block">{city}</strong>
                  <span className="text-[13px] text-[#64748B]">{places}</span>
                </span>
                <button className="flex size-8 items-center justify-center rounded-full bg-[#5A30E8] text-white" type="button">
                  <ArrowRightIcon className="size-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-9 flex max-w-[460px] items-center gap-5 rounded-xl border border-[#E5E7EB] bg-[#FBFAFF] p-5 text-left">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#5A30E8] text-white">
          <HouseIcon className="size-7" />
        </span>
        <span className="flex-1">
          <strong>Can&apos;t find what you&apos;re looking for?</strong>
          <span className="mt-1 block text-[14px] text-[#64748B]">
            Let us help you find the perfect place.
          </span>
        </span>
      </div>
    </div>
  );
}

export function ErrorResultsState() {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white px-6 py-12 text-center shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
      <ErrorIllustration />
      <h2 className="mt-5 text-[30px] font-bold">Oops! Something went wrong</h2>
      <p className="mx-auto mt-3 max-w-[560px] text-[17px] leading-7 text-[#475569]">
        We couldn&apos;t load the results right now. Please try again.
      </p>
      <button
        className="mt-6 inline-flex h-12 items-center gap-3 rounded-lg bg-[linear-gradient(180deg,#6C3DFF_0%,#5527D8_100%)] px-14 text-[16px] font-bold text-white"
        type="button"
      >
        <RefreshCwIcon className="size-5" />
        Try again
      </button>

      <div className="mx-auto mt-8 max-w-[900px] rounded-xl border border-[#E5E7EB] bg-white p-6">
        <h3 className="text-[20px] font-bold">You can try one of these</h3>
        <div className="mt-6 grid gap-5 md:grid-cols-4">
          {errorSuggestions.map(({ description, icon: Icon, title }) => (
            <div className="border-[#E5E7EB] px-4 text-center md:border-r last:border-r-0" key={title}>
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#F4F1FF] text-[#5A30E8]">
                <Icon className="size-6" />
              </span>
              <strong className="mt-4 block text-[14px]">{title}</strong>
              <p className="mt-2 text-[12px] leading-5 text-[#475569]">{description}</p>
            </div>
          ))}
        </div>
        <button className="mt-7 h-11 w-[260px] rounded-lg border border-[#A78BFA] text-[15px] font-bold text-[#5A30E8]" type="button">
          Clear all filters
        </button>
      </div>

      <div className="mx-auto mt-6 flex max-w-[900px] items-center justify-between rounded-xl bg-[#F4F1FF] p-5 text-left">
        <span className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-white text-[#5A30E8]">
            <HeadphonesIcon className="size-6" />
          </span>
          <span>
            <strong>Need help finding the right place?</strong>
            <span className="block text-[14px] text-[#475569]">
              Our team is here to help you find the perfect stay.
            </span>
          </span>
        </span>
        <button className="h-11 rounded-lg border border-[#A78BFA] bg-white px-8 text-[14px] font-bold text-[#5A30E8]" type="button">
          Contact support
        </button>
      </div>
    </div>
  );
}

function EmptyIllustration() {
  return (
    <svg className="mx-auto h-[210px] w-[360px] max-w-full" viewBox="0 0 360 210" fill="none">
      <path d="M72 170h220" stroke="#E9DFFF" strokeWidth="8" strokeLinecap="round" />
      <path d="M113 72 178 42l66 30v87l-66 30-65-30V72Z" fill="#EFE9FF" stroke="#C8B6FF" strokeWidth="2" />
      <path d="M178 42v147M113 72l65 30 66-30" stroke="#C8B6FF" strokeWidth="2" />
      <circle cx="234" cy="92" r="38" fill="#F8F5FF" stroke="#5A30E8" strokeWidth="12" />
      <path d="m263 121 43 43" stroke="#5A30E8" strokeWidth="14" strokeLinecap="round" />
      <path d="M55 158c12-42 30-42 42 0M306 158c10-35 26-35 36 0" stroke="#D8CCFF" strokeWidth="10" strokeLinecap="round" />
      <path d="M58 43h36M283 43h28" stroke="#E9DFFF" strokeWidth="12" strokeLinecap="round" />
    </svg>
  );
}

function ErrorIllustration() {
  return (
    <svg className="mx-auto h-[210px] w-[360px] max-w-full" viewBox="0 0 360 210" fill="none">
      <path d="M82 158h210" stroke="#E9DFFF" strokeWidth="8" strokeLinecap="round" />
      <path d="M91 88h48v70H91V88ZM158 58h54v100h-54V58ZM231 78h54v80h-54V78Z" fill="#EFE9FF" />
      <circle cx="207" cy="103" r="44" fill="#F8F5FF" stroke="#0F172A" strokeWidth="3" />
      <circle cx="207" cy="103" r="31" fill="#EF4444" />
      <path d="M207 82v31" stroke="white" strokeWidth="8" strokeLinecap="round" />
      <path d="M207 127h.01" stroke="white" strokeWidth="8" strokeLinecap="round" />
      <path d="m238 134 38 38" stroke="#0F172A" strokeWidth="9" strokeLinecap="round" />
      <path d="M54 61h36M279 45h40M40 126h30" stroke="#F1EDFF" strokeWidth="12" strokeLinecap="round" />
    </svg>
  );
}
