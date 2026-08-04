import { DarLogo } from "@/components/brand/dar-logo";

type BrandLogoProps = {
  compact?: boolean;
  inverted?: boolean;
};

/**
 * BrandLogo — Auth-specific wrapper around the unified DarLogo.
 * Kept for backward compatibility; delegates to @/components/brand/dar-logo.
 */
export function BrandLogo({ compact = false, inverted = false }: BrandLogoProps) {
  return (
    <DarLogo
      alt="DAR logo"
      priority
      size={compact ? "compact" : "auth"}
      surface={inverted ? "dark" : "light"}
    />
  );
}
