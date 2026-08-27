"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { setSavedProperty } from "@/features/traveler/actions";

type FavoritesContextValue = {
  isAuthenticated: boolean;
  isFavorite: (propertyId: string) => boolean;
  isPending: boolean;
  setFavorite: (propertyId: string, shouldSave: boolean) => Promise<boolean>;
  toggleFavorite: (propertyId: string) => Promise<boolean>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function buildRedirectTo(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function FavoritesProvider({
  children,
  initialSavedPropertyIds,
  isAuthenticated,
}: {
  children: ReactNode;
  initialSavedPropertyIds: string[];
  isAuthenticated: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [savedPropertyIds, setSavedPropertyIds] = useState(() => new Set(initialSavedPropertyIds));
  const [isPending, startTransition] = useTransition();

  async function setFavorite(propertyId: string, shouldSave: boolean) {
    if (!propertyId) {
      return false;
    }

    if (!isAuthenticated) {
      const redirectTo = buildRedirectTo(pathname, searchParams);
      router.push(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
      return false;
    }

    const previous = new Set(savedPropertyIds);
    const next = new Set(savedPropertyIds);

    if (shouldSave) {
      next.add(propertyId);
    } else {
      next.delete(propertyId);
    }

    setSavedPropertyIds(next);

    startTransition(async () => {
      const result = await setSavedProperty(propertyId, shouldSave);

      if (!result.ok) {
        setSavedPropertyIds(previous);

        if (result.message === "Please sign in to manage saved properties.") {
          const redirectTo = buildRedirectTo(pathname, searchParams);
          router.push(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
          return;
        }

        router.refresh();
      }
    });

    return shouldSave;
  }

  const value: FavoritesContextValue = {
    isAuthenticated,
    isFavorite: (propertyId: string) => savedPropertyIds.has(propertyId),
    isPending,
    setFavorite,
    toggleFavorite: async (propertyId: string) => setFavorite(propertyId, !savedPropertyIds.has(propertyId)),
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider.");
  }

  return context;
}
