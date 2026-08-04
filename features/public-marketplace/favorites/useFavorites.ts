"use client";

import { useCallback, useEffect, useState } from "react";

const FAVORITES_KEY = "dar:marketplace:favorites";
const FAVORITES_EVENT = "dar:favorites-change";

function readFavorites() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((slug): slug is string => typeof slug === "string")
      : [];
  } catch {
    return [];
  }
}

function writeFavorites(slugs: string[]) {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(slugs));
  window.dispatchEvent(new Event(FAVORITES_EVENT));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const syncFavorites = () => setFavorites(readFavorites());

    syncFavorites();
    window.addEventListener(FAVORITES_EVENT, syncFavorites);
    window.addEventListener("storage", syncFavorites);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, syncFavorites);
      window.removeEventListener("storage", syncFavorites);
    };
  }, []);

  const toggleFavorite = useCallback((slug: string) => {
    const current = readFavorites();
    const next = current.includes(slug)
      ? current.filter((favorite) => favorite !== slug)
      : [...current, slug];

    writeFavorites(next);
    setFavorites(next);
    return next.includes(slug);
  }, []);

  const clearFavorites = useCallback(() => {
    writeFavorites([]);
    setFavorites([]);
  }, []);

  return {
    clearFavorites,
    favorites,
    isFavorite: (slug: string) => favorites.includes(slug),
    toggleFavorite,
  };
}
