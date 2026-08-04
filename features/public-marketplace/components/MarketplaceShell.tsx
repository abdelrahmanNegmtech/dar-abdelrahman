import { ReactNode } from "react";
import { MarketplaceFooter } from "./MarketplaceFooter";
import { MarketplaceNavbar } from "./MarketplaceNavbar";

type MarketplaceShellProps = {
  children: ReactNode;
  footer?: boolean;
};

export function MarketplaceShell({ children, footer = true }: MarketplaceShellProps) {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-white text-[#0F172A]">
      <MarketplaceNavbar variant="standard" />
      <main className="min-w-0 flex-1">{children}</main>
      {footer ? <MarketplaceFooter /> : null}
    </div>
  );
}
