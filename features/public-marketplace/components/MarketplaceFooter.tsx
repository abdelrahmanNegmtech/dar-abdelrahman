import Image from "next/image";
import Link from "next/link";

const footerColumns = [
  {
    links: [
      { href: "/search", label: "Stays" },
      { href: "/favorites", label: "Favorites" },
      { href: "/search?type=hotels", label: "Hotels" },
      { href: "/search?destination=Madinaty", label: "Destinations" },
      { href: "/search?view=map", label: "Map search" },
    ],
    title: "Explore",
  },
  {
    links: [
      { href: "/become-a-host", label: "Become a host" },
      { href: "/about", label: "About us" },
      { href: "/help", label: "Help" },
      { href: "/contact", label: "Contact" },
    ],
    title: "Company",
  },
  {
    links: [
      { href: "/legal", label: "Legal center" },
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/cancellation", label: "Cancellation" },
    ],
    title: "Legal",
  },
  {
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/sign-up", label: "Create account" },
      { href: "/forgot-password", label: "Reset password" },
      { href: "/verify-email", label: "Verify email" },
    ],
    title: "Account",
  },
];

const socials = [
  { label: "Facebook", text: "f" },
  { label: "Instagram", text: "ig" },
  { label: "X", text: "x" },
  { label: "LinkedIn", text: "in" },
];

export function MarketplaceFooter() {
  return (
    <footer className="w-full bg-[#06111F] text-white">
      <div className="mx-auto max-w-[1500px] overflow-hidden">
        <div className="grid gap-9 px-7 py-9 sm:px-10 lg:grid-cols-[1.2fr_repeat(4,1fr)] lg:px-10 xl:gap-6 xl:px-8 xl:py-8">
          <div>
            <Link aria-label="DAR home" className="dar-logo-frame inline-flex h-[56px] w-[156px]" href="/">
              <Image
                alt="DAR logo"
                className="dar-logo-image dar-logo-image-dark w-[152px] object-contain"
                height={864}
                src="/assets/images/dar-logo.png"
                width={1536}
              />
            </Link>
            <p className="mt-5 max-w-[250px] text-[13px] leading-6 text-white/72">
              Premium stays in Egypt. Studios, apartments and hotels in the best locations.
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map((social) => (
                <span
                  aria-label={`${social.label} profile unavailable`}
                  className="flex size-8 items-center justify-center rounded-full text-[13px] font-bold text-white/82"
                  key={social.label}
                  role="img"
                >
                  {social.text}
                </span>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="text-[14px] font-bold text-white">{column.title}</h2>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="text-[13px] text-white/70 transition hover:text-white focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 px-7 py-5 text-[12px] text-white/62 sm:flex-row sm:items-center sm:justify-between sm:px-10 xl:px-8">
          <span>© {new Date().getFullYear()} DAR. All rights reserved.</span>
          <span>Built for verified stays in Egypt.</span>
        </div>
      </div>
    </footer>
  );
}
