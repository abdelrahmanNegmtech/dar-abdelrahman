"use client";

import { useFavoritesContext } from "./FavoritesProvider";

export function useFavorites() {
  return useFavoritesContext();
}
