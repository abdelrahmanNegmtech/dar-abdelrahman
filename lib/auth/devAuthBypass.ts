export const DEV_AUTH_BYPASS_USER = {
  avatarUrl: "/assets/images/backgrounds/Nighttime_photo.jpeg",
  email: "ahmed@example.com",
  fullName: "Ahmed Hassan",
  id: "dev-traveler-user",
  role: "traveler",
} as const;

// TEMPORARY LOCAL DEVELOPMENT PREVIEW BYPASS: keep this gated to `next dev`
// and remove it once the Traveler Dashboard can be previewed with real auth.
export function isDevAuthBypassEnabled() {
  return process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";
}

export function isTravelerPathname(pathname: string) {
  return pathname === "/traveler" || pathname.startsWith("/traveler/");
}
