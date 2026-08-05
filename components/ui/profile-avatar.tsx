"use client";

import Image from "next/image";
import { useState } from "react";

type ProfileAvatarProps = {
  src?: string | null;
  name: string;
  size?: number;
  alt?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

const highResolutionAliases: Record<string, string> = {
  "/publish-avatar-ahmed-reference.png": "/owner-selfie-ahmed-reference.png",
  "/dashboard-avatar-omar.png": "/omar-khaled-profile-reference.png",
};

function normalizeSource(src?: string | null) {
  if (!src) return null;
  return src.startsWith("/") || src.startsWith("http") || src.startsWith("blob:")
    ? src
    : `/${src}`;
}

function initialsFor(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * Shared person image. Existing photos always take priority; initials are only
 * shown when no source exists or the supplied source genuinely fails to load.
 */
export function ProfileAvatar({
  src,
  name,
  size = 40,
  alt,
  className = "",
  imageClassName = "",
  priority = false,
}: ProfileAvatarProps) {
  const normalized = normalizeSource(src);
  const resolved = normalized ? highResolutionAliases[normalized] ?? normalized : null;
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const useFallback = !resolved || failedSource === resolved;

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#eee9ff] text-[#5528dd] ${className}`}
      style={{ width: size, height: size }}
      aria-label={alt ?? name}
      role={useFallback ? "img" : undefined}
    >
      {useFallback ? (
        <span
          aria-hidden="true"
          className="select-none font-semibold leading-none"
          style={{ fontSize: Math.max(10, Math.round(size * 0.34)) }}
        >
          {initialsFor(name)}
        </span>
      ) : (
        <Image
          src={resolved}
          alt={alt ?? name}
          fill
          sizes={`${size}px`}
          quality={90}
          priority={priority}
          unoptimized={resolved.startsWith("blob:") || resolved.startsWith("data:")}
          onError={() => setFailedSource(resolved)}
          className={`object-cover object-center ${imageClassName}`}
        />
      )}
    </span>
  );
}
