import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDevAuthBypassEnabled, isTravelerPathname } from "../auth/devAuthBypass";
import type { AccountType } from "./database";
import type { Database } from "./database.types";
import { getSupabaseConfig } from "./config";

const protectedRoutePrefixes = ["/dashboard", "/owner", "/admin", "/traveler"];
const authEntryRoutePrefixes = ["/login", "/sign-up", "/create-account"];

function isProtectedRoute(pathname: string) {
  return protectedRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAuthEntryRoute(pathname: string) {
  return authEntryRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function getRoleDestination(accountType?: string | null) {
  return accountType === "owner" ? "/owner" : "/search";
}

function getRedirectPath(request: NextRequest) {
  return `${request.nextUrl.pathname}${request.nextUrl.search}`;
}

export async function updateSession(request: NextRequest) {
  if (isDevAuthBypassEnabled() && isTravelerPathname(request.nextUrl.pathname)) {
    // TEMPORARY LOCAL DEVELOPMENT PREVIEW BYPASS: lets `/traveler` routes render
    // in `next dev` only when NEXT_PUBLIC_DEV_AUTH_BYPASS=true.
    return NextResponse.next({ request });
  }

  const config = getSupabaseConfig();

  if (!config) {
    if (isProtectedRoute(request.nextUrl.pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    config.url,
    config.publicKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedRoute(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", getRedirectPath(request));
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type")
      .eq("id", user.id)
      .maybeSingle();
    const accountType = profile?.account_type as AccountType | null | undefined;

    if (isAuthEntryRoute(request.nextUrl.pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = getRoleDestination(accountType);
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    if (
      (request.nextUrl.pathname === "/admin" || request.nextUrl.pathname.startsWith("/admin/")) &&
      accountType !== "admin" &&
      accountType !== "support_staff"
    ) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/search";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    if (
      (request.nextUrl.pathname === "/owner" ||
        request.nextUrl.pathname.startsWith("/owner/")) &&
      accountType !== "owner"
    ) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/search";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
