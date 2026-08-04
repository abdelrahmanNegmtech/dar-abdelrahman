import Image from "next/image";

// ── Types ── //

type DarLogoSurface = "light" | "dark";
type DarLogoSize = "desktop" | "mobile" | "drawer" | "compact" | "auth";

export type DarLogoVariant = "purple" | "white";

export type DarLogoProps = {
  /** Alt text for the image */
  alt?: string;
  /** Additional classes */
  className?: string;
  /** Explicit height (overrides auto-sizing) */
  height?: number;
  /** Whether to prioritise loading */
  priority?: boolean;
  /** Preset size (works when width/height not explicitly set) */
  size?: DarLogoSize;
  /** Background surface determines which logo variant is shown */
  surface?: DarLogoSurface;
  /** Explicit variant override (overrides surface-based auto-detection) */
  variant?: DarLogoVariant;
  /** Explicit width (overrides auto-sizing) */
  width?: number;
};

// ── Asset paths ── //

export const DAR_LOGO_ASSETS: Record<DarLogoVariant, string> = {
  purple: "/dar-logo-purple.png",
  white: "/dar-logo-uploaded.png",
} as const;

// ── Size presets ── //

const sizeClasses: Record<DarLogoSize, string> = {
  desktop: "h-auto w-[140px]",
  mobile: "h-auto w-[98px]",
  drawer: "h-auto w-[132px]",
  compact: "h-auto w-[122px]",
  auth: "h-auto w-[162px]",
};

const intrinsicSizes: Record<DarLogoVariant, { height: number; width: number }> = {
  purple: { height: 272, width: 622 },
  white: { height: 272, width: 622 },
};

// ── Helpers ── //

function logoVariantForSurface(surface: DarLogoSurface): DarLogoVariant {
  return surface === "dark" ? "white" : "purple";
}

// ── Unified Logo Component ── //

export function DarLogo({
  alt = "DAR",
  className = "",
  height,
  priority = false,
  size = "desktop",
  surface = "light",
  variant,
  width,
}: DarLogoProps) {
  const resolvedVariant = variant ?? logoVariantForSurface(surface);
  const hasCustomSize = width !== undefined || height !== undefined;
  const intrinsicSize = intrinsicSizes[resolvedVariant];

  return (
    <Image
      alt={alt}
      className={`block shrink-0 object-contain${hasCustomSize ? " h-auto" : ""} ${sizeClasses[size]} ${className}`}
      data-logo-variant={resolvedVariant}
      height={height ?? intrinsicSize.height}
      priority={priority}
      sizes="(max-width: 1024px) 98px, 140px"
      src={DAR_LOGO_ASSETS[resolvedVariant]}
      style={hasCustomSize ? { height: height ?? "auto", width: width ?? "auto" } : undefined}
      width={width ?? intrinsicSize.width}
    />
  );
}
