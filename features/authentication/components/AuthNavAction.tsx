"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { logAuthError } from "../services/authErrors";
import { getOwnProfile, logout } from "../services/authService";

type AuthNavActionProps = {
  signInClassName: string;
  userClassName?: string;
};

type ProfileSummary = {
  avatar_url?: string | null;
  email?: string | null;
  full_name?: string | null;
};

export function AuthNavAction({
  signInClassName,
  userClassName = "inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-bold text-[#0F172A]",
}: AuthNavActionProps) {
  const router = useRouter();
  const hasSupabaseConfig = Boolean(getSupabaseConfig());
  const [isLoading, setIsLoading] = useState(hasSupabaseConfig);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!hasSupabaseConfig) {
      return () => {
        mounted = false;
      };
    }

    let supabase: ReturnType<typeof createClient>;

    try {
      supabase = createClient();
    } catch (error) {
      logAuthError("navigation auth client unavailable", error);
      queueMicrotask(() => {
        if (!mounted) return;
        setProfile(null);
        setIsLoading(false);
      });
      return () => {
        mounted = false;
      };
    }

    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) {
          return;
        }

        if (!user) {
          setProfile(null);
          setIsLoading(false);
          return;
        }

        const { data } = await getOwnProfile();

        if (mounted) {
          setProfile({
            avatar_url: data?.avatar_url ?? null,
            email: data?.email ?? user.email ?? null,
            full_name: data?.full_name ?? user.user_metadata?.full_name ?? null,
          });
          setIsLoading(false);
        }
      } catch (error) {
        logAuthError("navigation profile lookup failed", error);
        if (mounted) {
          setProfile(null);
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [hasSupabaseConfig]);

  async function handleLogout() {
    await logout();
    setProfile(null);
    router.replace("/login");
    router.refresh();
  }

  if (isLoading || !profile) {
    return (
      <Link className={signInClassName} href="/login">
        Sign in
      </Link>
    );
  }

  const name = profile.full_name || profile.email || "Account";
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <span className="inline-flex items-center gap-2">
      <span className={userClassName}>
        <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-[#F0E9FF] text-xs font-bold text-[#5E2FE5]">
          {initial}
        </span>
        <span className="max-w-[120px] truncate">{name}</span>
      </span>
      <button
        className={signInClassName}
        onClick={handleLogout}
        type="button"
      >
        Logout
      </button>
    </span>
  );
}
