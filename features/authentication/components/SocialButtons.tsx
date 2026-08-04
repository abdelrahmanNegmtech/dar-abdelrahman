"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui";
import type { OAuthProvider } from "../authTypes";
import { signInWithOAuth } from "../services/authService";

const providers = [
  { icon: GoogleIcon, label: "Google", provider: "google" },
  { icon: FacebookIcon, label: "Facebook", provider: "facebook" },
] satisfies Array<{ icon: () => ReactNode; label: string; provider: OAuthProvider }>;

type SocialButtonsProps = {
  accountType?: "guest" | "owner";
};

export function SocialButtons({ accountType = "guest" }: SocialButtonsProps) {
  const [activeProvider, setActiveProvider] = useState<OAuthProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleOAuth(provider: OAuthProvider) {
    setErrorMessage("");
    setActiveProvider(provider);
    const { err } = await signInWithOAuth(provider, accountType);

    if (err) {
      setActiveProvider(null);
      setErrorMessage(err);
    }
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {providers.map((provider) => (
          <Button
            aria-label={`Continue with ${provider.label}`}
            className="h-[52px] w-full"
            disabled={activeProvider === provider.provider}
            key={provider.label}
            onClick={() => handleOAuth(provider.provider)}
            variant="outline"
          >
            <provider.icon />
            <span>{activeProvider === provider.provider ? "Connecting..." : provider.label}</span>
          </Button>
        ))}
      </div>
      {errorMessage ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-[13px] font-semibold text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path
        d="M21.6 12.23c0-.78-.07-1.53-.2-2.23H12v4.22h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.32 2.98-7.52Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.97-.9 6.62-2.44l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H3.07v2.59A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.42 13.89A6 6 0 0 1 6.1 12c0-.66.11-1.3.32-1.89V7.52H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.48l3.35-2.59Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.99c1.47 0 2.79.5 3.82 1.5l2.87-2.87C16.96 3.01 14.7 2 12 2a10 10 0 0 0-8.93 5.52l3.35 2.59C7.2 7.75 9.4 5.99 12 5.99Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path
        d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.62.77-1.62 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z"
        fill="#1877F2"
      />
      <path
        d="m15.89 14.89.44-2.89h-2.77v-1.87c0-.79.38-1.56 1.62-1.56h1.26V6.12s-1.14-.2-2.23-.2c-2.28 0-3.77 1.38-3.77 3.88V12H7.9v2.89h2.54v6.99a10.2 10.2 0 0 0 3.12 0v-6.99h2.33Z"
        fill="#fff"
      />
    </svg>
  );
}

