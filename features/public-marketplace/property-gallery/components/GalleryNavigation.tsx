import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui";

type GalleryNavigationProps = {
  className?: string;
  onNext: () => void;
  onPrevious: () => void;
};

export function GalleryNavigation({ className = "", onNext, onPrevious }: GalleryNavigationProps) {
  return (
    <div className={`pointer-events-none absolute inset-y-0 left-4 right-4 hidden items-center justify-between md:flex ${className}`}>
      <button
        aria-label="Previous photo"
        className="pointer-events-auto grid size-11 place-items-center rounded-full bg-black/58 text-white shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur"
        onClick={onPrevious}
        type="button"
      >
        <ArrowLeftIcon className="size-6" />
      </button>
      <button
        aria-label="Next photo"
        className="pointer-events-auto grid size-11 place-items-center rounded-full bg-black/58 text-white shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur"
        onClick={onNext}
        type="button"
      >
        <ArrowRightIcon className="size-6" />
      </button>
    </div>
  );
}
