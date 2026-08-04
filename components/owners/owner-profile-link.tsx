import Link from "next/link";
import type { ComponentProps } from "react";

export type OwnerProfileReference = {
  id?: string;
  slug?: string;
  name: string;
};

export function getOwnerProfileHref(owner: OwnerProfileReference) {
  const routeKey = owner.slug || owner.id;

  if (!routeKey) {
    throw new Error(`Missing public profile route for owner "${owner.name}".`);
  }

  return `/owners/${encodeURIComponent(routeKey)}`;
}

type OwnerProfileLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  owner: OwnerProfileReference;
};

export function OwnerProfileLink({
  owner,
  className = "",
  children,
  ...props
}: OwnerProfileLinkProps) {
  return (
    <Link
      href={getOwnerProfileHref(owner)}
      aria-label={`View ${owner.name}'s public profile`}
      className={`cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6d35ee] focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
