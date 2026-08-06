import { NextResponse, type NextRequest } from "next/server";
import type {
  ProfileInsert,
  ProfileRow,
  ProfileUpdate,
  UserAccountType,
} from "@/lib/supabase/database";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

function getSafeRedirect(origin: string, next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return `${origin}/search`;
  }

  if (/^\/[a-z][a-z\d+\-.]*:/i.test(next)) {
    return `${origin}/search`;
  }

  return `${origin}${next}`;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const accountType =
    requestUrl.searchParams.get("account_type") === "owner" ? "owner" : "guest";
  const oauthError = requestUrl.searchParams.get("error");
  const errorRedirect = new URL("/login", requestUrl.origin);
  errorRedirect.searchParams.set("authError", "callback");

  if (oauthError || !code || !getSupabaseConfig()) {
    return NextResponse.redirect(errorRedirect);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(errorRedirect);
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.redirect(errorRedirect);
  }

  const profilePatch: ProfileUpdate = {
    updated_at: new Date().toISOString(),
  };
  const safeAccountType: UserAccountType =
    userData.user.user_metadata?.account_type === "owner" ? "owner" : accountType;
  const safeEmail =
    userData.user.email ?? `${userData.user.id.toLowerCase()}@placeholder.local`;

  const fullName =
    userData.user.user_metadata?.full_name ??
    userData.user.user_metadata?.name ??
    null;
  const safeFullName =
    fullName ??
    userData.user.user_metadata?.display_name ??
    safeEmail.split("@")[0] ??
    "Guest";

  if (fullName) {
    profilePatch.full_name = fullName;
  }

  if (userData.user.user_metadata?.phone) {
    profilePatch.phone = userData.user.user_metadata.phone;
  }

  if (userData.user.user_metadata?.country_code) {
    profilePatch.country_code = userData.user.user_metadata.country_code;
  }

  if (userData.user.user_metadata?.country_name) {
    profilePatch.country_name = userData.user.user_metadata.country_name;
  }

  if (userData.user.user_metadata?.dialing_code) {
    profilePatch.dialing_code = userData.user.user_metadata.dialing_code;
  }

  if (userData.user.user_metadata?.avatar_url) {
    profilePatch.avatar_url = userData.user.user_metadata.avatar_url;
  }

  let profileSyncError = null;
  let profileAccountType: ProfileRow["account_type"] | null = null;
  const profileInsert: ProfileInsert = {
    ...profilePatch,
    account_type: safeAccountType,
    email: safeEmail,
    full_name: safeFullName,
    id: userData.user.id,
  };
  const { error: bootstrapError } = await supabase
    .from("profiles")
    .upsert(profileInsert, { ignoreDuplicates: true, onConflict: "id" });

  if (bootstrapError) {
    profileSyncError = bootstrapError;
  } else {
    const { data: syncedProfile, error: profileReadError } = await supabase
      .from("profiles")
      .select("account_type")
      .eq("id", userData.user.id)
      .single();

    if (profileReadError) {
      profileSyncError = profileReadError;
    } else {
      profileAccountType = syncedProfile.account_type;

      const { error: updateError } = await supabase
        .from("profiles")
        .update(profilePatch)
        .eq("id", userData.user.id);
      profileSyncError = updateError;
    }
  }

  if (profileSyncError) {
    return NextResponse.redirect(errorRedirect);
  }

  const roleAwareNext =
    next === "/search" && profileAccountType === "owner" ? "/owner" : next;
  const redirectTarget = getSafeRedirect(requestUrl.origin, roleAwareNext);
  const response = NextResponse.redirect(redirectTarget);

  if (next?.startsWith("/password-reset")) {
    response.cookies.set("dar-password-recovery", "1", {
      httpOnly: true,
      maxAge: 15 * 60,
      path: "/password-reset",
      sameSite: "lax",
      secure: requestUrl.protocol === "https:",
    });
  }

  return response;
}
