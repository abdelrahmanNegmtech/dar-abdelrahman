import type { SVGProps } from "react";

type IconName =
  | "arrow-left"
  | "arrow-right"
  | "arrow-up"
  | "bank"
  | "briefcase"
  | "building"
  | "calendar"
  | "calendar-check"
  | "calendar-bookmark"
  | "card"
  | "chevron"
  | "dashboard"
  | "dollar"
  | "download"
  | "external-link"
  | "globe"
  | "headset"
  | "heart"
  | "home"
  | "hotel"
  | "property"
  | "image"
  | "info-circle"
  | "inbox"
  | "mail"
  | "menu"
  | "message"
  | "more-horizontal"
  | "more-vertical"
  | "no-smoking"
  | "minus"
  | "navigation"
  | "play"
  | "party-off"
  | "plus"
  | "receipt"
  | "bell"
  | "search"
  | "season-pricing"
  | "shield"
  | "star"
  | "upload"
  | "user"
  | "user-plain"
  | "users"
  | "bed"
  | "bath"
  | "cloud-upload"
  | "grip"
  | "grip-six"
  | "x"
  | "x-circle"
  | "wifi"
  | "kitchen"
  | "leaf"
  | "washing"
  | "tv"
  | "car"
  | "pool"
  | "dumbbell"
  | "snowflake"
  | "camera"
  | "tag"
  | "target"
  | "wallet"
  | "wand-sparkle"
  | "check"
  | "location"
  | "id-link"
  | "copy"
  | "list-check"
  | "document-text"
  | "bulb"
  | "check-circle"
  | "grid-four"
  | "pencil"
  | "trash"
  | "lightning"
  | "eye"
  | "refresh"
  | "clock"
  | "checkout"
  | "gear"
  | "sun"
  | "flower";

const paths: Record<IconName, string[]> = {
  "arrow-left": ["M19 12H5", "m11 18-6-6 6-6"],
  "arrow-right": ["M5 12h14", "m13 6 6 6-6 6"],
  "arrow-up": ["M12 19V5", "m6 11 6-6 6 6"],
  bank: ["M4 10h16L12 4 4 10Z", "M6 10v8", "M10 10v8", "M14 10v8", "M18 10v8", "M4 20h16"],
  briefcase: ["M9 7V5h6v2", "M5 7h14v11H5z", "M5 12h14"],
  building: ["M5 20V5h10v15", "M9 9h2", "M9 13h2", "M15 11h4v9"],
  calendar: ["M7 4v4", "M17 4v4", "M5 8h14", "M5 6h14v14H5z"],
  "calendar-check": ["M7 4v4", "M17 4v4", "M5 8h14", "M5 6h14v14H5z", "m9 14 2 2 4-4"],
  "calendar-bookmark": ["M7 4v4", "M17 4v4", "M5 8h14", "M5 6h14v14H5z", "M10 11h5v6l-2.5-1.7L10 17v-6Z"],
  card: ["M4 7h16v10H4z", "M4 10h16", "M7 14h4"],
  chevron: ["M8 10l4 4 4-4"],
  dashboard: ["M4 13a8 8 0 1 1 16 0", "M12 13l4-4", "M5 19h14"],
  dollar: ["M12 3v18", "M16 7.5c-1-1-2.3-1.5-4-1.5-2.2 0-4 1-4 2.8 0 4 8 2.1 8 6.4 0 1.7-1.8 2.8-4 2.8-1.9 0-3.4-.6-4.5-1.7"],
  download: ["M12 4v10", "m8 10 4 4 4-4", "M5 20h14"],
  "external-link": ["M14 5h5v5", "M19 5l-8 8", "M18 13v6H5V6h6"],
  globe: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M3 12h18", "M12 3c2.4 2.4 3.5 5.4 3.5 9S14.4 18.6 12 21", "M12 3c-2.4 2.4-3.5 5.4-3.5 9s1.1 6.6 3.5 9"],
  headset: ["M4 13a8 8 0 0 1 16 0", "M4 13v4h4v-5H4", "M20 13v4h-4v-5h4", "M16 20c-1.2.7-2.6 1-4 1"],
  heart: ["M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"],
  home: ["M4 11 12 4l8 7", "M6 10v10h12V10", "M10 20v-6h4v6"],
  hotel: ["M5 20V5h10v15", "M15 10h4v10", "M8 9h2", "M8 13h2", "M8 17h2"],
  property: ["M4 11 12 4l8 7", "M6 10v10h12V10", "M9 20v-6h6v6", "M10 9h4"],
  image: ["M5 5h14v14H5z", "m8 13 3-4 3 4", "m5 15 3-3 4 5", "M8 9h.01"],
  "info-circle": ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 10v6", "M12 7h.01"],
  inbox: ["M5 6h14v11H8l-3 3V6Z", "M8 11h8", "m9 14 3 2 3-2"],
  mail: ["M4 6h16v12H4z", "m4 7 8 6 8-6"],
  menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
  message: ["M5 6h14v10H8l-3 3V6Z"],
  "more-horizontal": ["M5 12h.01", "M12 12h.01", "M19 12h.01"],
  "more-vertical": ["M12 5h.01", "M12 12h.01", "M12 19h.01"],
  "no-smoking": ["M4 15h16v4H4z", "M7 15v4", "M17 15v4", "M14 12c0-1.2.8-1.7 1.8-2.2S18 8.8 18 7.5", "M4 4l16 16"],
  minus: ["M8 12h8"],
  navigation: ["M12 3 20 21l-8-4-8 4 8-18Z", "M12 17V3"],
  play: ["M9 7v10l8-5-8-5Z"],
  "party-off": ["M7 3l5 18", "M17 3l-5 18", "M5 9h14", "M4 4l16 16"],
  plus: ["M12 6v12", "M6 12h12"],
  receipt: ["M6 3h12v18l-3-2-3 2-3-2-3 2V3Z", "M9 8h6", "M9 12h6", "M9 16h3"],
  bell: ["M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9", "M10 21h4"],
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "m21 21-4.3-4.3"],
  "season-pricing": ["M12 3v18", "M16 7.5c-1-1-2.3-1.5-4-1.5-2.2 0-4 1-4 2.8 0 4 8 2.1 8 6.4 0 1.7-1.8 2.8-4 2.8-1.9 0-3.4-.6-4.5-1.7", "M4 5l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z"],
  shield: ["M12 3 19 6v6c0 4.6-3 7.5-7 9-4-1.5-7-4.4-7-9V6l7-3Z", "m9 12 2 2 4-5"],
  star: ["M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3Z"],
  upload: ["M12 16V5", "m8 9 4-4 4 4", "M5 19h14", "M5 19v-3", "M19 19v-3"],
  user: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M4 21a8 8 0 0 1 16 0", "M19 8v6", "M16 11h6"],
  "user-plain": ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M5 21a7 7 0 0 1 14 0"],
  users: ["M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M3.5 20a5.5 5.5 0 0 1 11 0", "M17 11a2.5 2.5 0 1 0 0-5", "M18 14.5a4.5 4.5 0 0 1 2.5 4"],
  bed: ["M4 11V5", "M20 11V8a3 3 0 0 0-3-3h-5v6", "M4 11h16v8", "M4 19v-3", "M20 19v-3", "M8 8h3"],
  bath: ["M6 10V6a3 3 0 0 1 6 0", "M5 10h15v4a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5v-4Z", "M8 19l-1 2", "M17 19l1 2"],
  "cloud-upload": ["M16 16l-4-4-4 4", "M12 12v8", "M20 17.5A4.5 4.5 0 0 0 17.5 9a6 6 0 0 0-11.2 2A4.5 4.5 0 0 0 7 20h10"],
  grip: ["M8 6h.01", "M12 6h.01", "M16 6h.01", "M8 10h.01", "M12 10h.01", "M16 10h.01", "M8 14h.01", "M12 14h.01", "M16 14h.01"],
  "grip-six": ["M9 7h.01", "M15 7h.01", "M9 12h.01", "M15 12h.01", "M9 17h.01", "M15 17h.01"],
  x: ["M6 6l12 12", "M18 6 6 18"],
  "x-circle": ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "m9 9 6 6", "m15 9-6 6"],
  wifi: ["M5 9a10 10 0 0 1 14 0", "M8.5 12.5a5 5 0 0 1 7 0", "M12 17h.01"],
  kitchen: ["M6 3v8", "M10 3v8", "M6 7h4", "M8 11v10", "M16 3v18", "M14 3h4"],
  leaf: ["M19 4C11 4 6 8 6 14c0 3 2 5 5 5 6 0 8-7 8-15Z", "M6 20c2-5 6-8 11-11"],
  washing: ["M5 4h14v16H5z", "M8 7h.01", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"],
  tv: ["M4 6h16v11H4z", "M8 21h8", "M12 17v4"],
  car: ["M5 13l2-5h10l2 5", "M5 13h14v5H5z", "M8 18h.01", "M16 18h.01"],
  pool: ["M4 16c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0", "M4 20c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0", "M12 4v8", "M9 7h6"],
  dumbbell: ["M4 10v4", "M8 8v8", "M16 8v8", "M20 10v4", "M8 12h8"],
  snowflake: ["M12 3v18", "M5 7l14 10", "M19 7 5 17", "M8 5l4 4 4-4", "M8 19l4-4 4 4"],
  camera: ["M6 7h3l1.5-2h3L15 7h3v11H6z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"],
  tag: ["M20 12 12 20 4 12V4h8l8 8Z", "M8 8h.01"],
  target: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z", "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"],
  wallet: ["M4 7h16v12H4z", "M17 12h3v4h-3a2 2 0 0 1 0-4Z", "M6 7V5h11v2"],
  "wand-sparkle": ["m5 19 10-10", "m13 7 4 4", "M7 4l.7 1.8L10 6.5l-2.3.7L7 9l-.7-1.8L4 6.5l2.3-.7L7 4Z", "M17 14l.6 1.4L19 16l-1.4.6L17 19l-.6-1.4L14 16l2.4-.6L17 14Z"],
  check: ["m5 12 4 4L19 6"],
  location: ["M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z", "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"],
  "id-link": ["M7 7h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3Z", "M9 7V4h6v3", "M8 13h.01", "M11 12h5", "M11 15h4"],
  copy: ["M9 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z", "M17 8V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"],
  "list-check": ["m4 7 1.5 1.5L8 6", "M11 7h9", "m4 13 1.5 1.5L8 12", "M11 13h9", "m4 19 1.5 1.5L8 18", "M11 19h9"],
  "document-text": ["M6 3h9l3 3v15H6V3Z", "M14 3v4h4", "M9 11h6", "M9 15h6", "M9 19h3"],
  bulb: ["M9 18h6", "M10 22h4", "M12 2a6 6 0 0 0-3.5 10.9c.7.5 1.1 1.3 1.1 2.1h4.8c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 2Z", "M12 6v3"],
  "check-circle": ["M21 11.1V12a9 9 0 1 1-5.3-8.2", "m9 11 3 3L22 4"],
  "grid-four": ["M4 4h6v6H4z", "M14 4h6v6h-6z", "M4 14h6v6H4z", "M14 14h6v6h-6z"],
  pencil: ["M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z", "m14 7 3 3"],
  trash: ["M4 7h16", "M9 7V4h6v3", "M6 7l1 14h10l1-14", "M10 11v6", "M14 11v6"],
  lightning: ["M13 2 5 14h6l-1 8 8-12h-6l1-8Z"],
  eye: ["M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12Z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"],
  refresh: ["M20 7v5h-5", "M4 17v-5h5", "M6.1 8a7 7 0 0 1 11.8-2L20 12", "M4 12l2.1 6A7 7 0 0 0 18 16"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7v5l3 2"],
  checkout: ["M7 4v4", "M17 4v4", "M5 8h14", "M5 6h14v14H5z", "M9 13h6", "m13 11 2 2-2 2"],
  gear: ["M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z", "M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7-.7-2.1h-3L8.1 4l-1.9-.9-2.1 2.1L5 7.1l-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2.1h3l.7-2.1 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7 2-.7Z"],
  sun: ["M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z", "M12 2v2", "M12 20v2", "M4.9 4.9l1.4 1.4", "m17.7 17.7 1.4 1.4", "M2 12h2", "M20 12h2", "m4.9 19.1 1.4-1.4", "m17.7 6.3 1.4-1.4"],
  flower: ["M12 12c-5-2-5-7-1-8 2-.5 3 2 1 8", "M12 12c2-5 7-5 8-1 .5 2-2 3-8 1", "M12 12c5 2 5 7 1 8-2 .5-3-2-1-8", "M12 12c-2 5-7 5-8 1-.5-2 2-3 8-1", "M12 12h.01"],
};

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName | (string & {});
};

export function Icon({ name, className = "", ...props }: IconProps) {
  const iconPaths = paths[name as IconName] ?? paths.star;

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      {iconPaths.map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
}
