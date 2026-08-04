import { DarLogo, DAR_LOGO_ASSETS, type DarLogoVariant } from "@/components/brand/dar-logo";

type DarLogoSurface = "light" | "dark";
type DarLogoSize = "desktop" | "mobile" | "drawer";

type DarLogoProps = {
  alt?: string;
  className?: string;
  height?: number;
  priority?: boolean;
  size?: DarLogoSize;
  surface?: DarLogoSurface;
  variant?: DarLogoVariant;
  width?: number;
};

/**
 * DarLogo — thin wrapper around the unified DarLogo.
 * Kept for backward compatibility; delegates to @/components/brand/dar-logo.
 */
export function DarLogo_({ alt = "DAR logo", className = "", height, priority = false, size = "desktop", surface = "light", variant, width }: DarLogoProps) {
  return (
    <DarLogo
      alt={alt}
      className={className}
      height={height}
      priority={priority}
      size={size}
      surface={surface}
      variant={variant}
      width={width}
    />
  );
}

// Backward-compatible export — same name as the old standalone component
export { DarLogo_ as DarLogo };

// Re-export the assets and types
export type { DarLogoVariant };
export { DAR_LOGO_ASSETS };
