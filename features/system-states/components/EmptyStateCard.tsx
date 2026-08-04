import type { ReactNode } from "react";
import type { EmptyStateAction } from "../types";
import { StateActionLink } from "./StateActionLink";

type EmptyStateCardProps = {
  actions?: EmptyStateAction[];
  children?: ReactNode;
  description: string;
  illustration: ReactNode;
  title: string;
};

export function EmptyStateCard({ actions = [], children, description, illustration, title }: EmptyStateCardProps) {
  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-9 text-center shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
      {illustration}
      <h2 className="mt-4 text-[24px] font-black leading-tight text-[#080B1F]">{title}</h2>
      <p className="mx-auto mt-2 max-w-[440px] text-[14px] font-medium leading-6 text-[#475569]">{description}</p>
      {children}
      {actions.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actions.map((action) => (
            <StateActionLink key={action.label} {...action} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
