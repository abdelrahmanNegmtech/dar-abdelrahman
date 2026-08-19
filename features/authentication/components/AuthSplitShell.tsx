import Image from "next/image";
import type { ReactNode } from "react";

type AuthSplitShellProps = {
  card: ReactNode;
  cardMaxWidthClassName: string;
  hero: ReactNode;
  imageObjectPosition?: string;
  overlayClassName?: string;
  topAction?: ReactNode;
};

export function AuthSplitShell({
  card,
  cardMaxWidthClassName,
  hero,
  imageObjectPosition = "object-[43%_50%]",
  overlayClassName = "bg-[#4B2CBE]/24",
  topAction,
}: AuthSplitShellProps) {
  return (
    <main className="auth-screen min-h-dvh w-full overflow-x-hidden bg-[#090B17] lg:h-dvh lg:overflow-hidden" id="main-content">
      <div className="relative flex min-h-dvh w-full overflow-hidden bg-[#090B17] lg:h-dvh lg:min-h-0">
        <Image
          alt="Cairo Tower and Nile skyline at night"
          className={`absolute inset-0 hidden size-full object-cover ${imageObjectPosition} brightness-[1.16] contrast-[1.32] saturate-[1.35] lg:block`}
          fill
          priority
          sizes="100vw"
          src="/assets/images/backgrounds/cairo-nights.png"
        />
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(3,8,28,0.93)_0%,rgba(13,22,67,0.66)_45%,rgba(2,6,20,0.9)_100%)] lg:block" />
        <div className={`absolute inset-0 hidden mix-blend-color lg:block ${overlayClassName}`} />

        {hero}

        <section className="auth-content-panel relative z-10 flex min-h-dvh flex-1 items-center justify-center overflow-x-hidden bg-white px-5 py-8 sm:px-8 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:bg-transparent lg:px-[32px] lg:py-0 xl:px-[34px]">
          <div className={`auth-card-column relative flex min-h-full w-full items-center justify-center py-8 ${cardMaxWidthClassName}`}>
            {topAction ? (
              <div className="auth-top-action pointer-events-auto absolute right-0 top-8 z-20 hidden max-w-full items-center justify-end text-right lg:flex">
                {topAction}
              </div>
            ) : null}
            {card}
          </div>
        </section>
      </div>
    </main>
  );
}
