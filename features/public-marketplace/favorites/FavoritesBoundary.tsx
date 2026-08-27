import type { ReactNode } from "react";
import { FavoritesProvider } from "./FavoritesProvider";
import { getFavoritesSnapshot } from "./queries";

export async function FavoritesBoundary({ children }: { children: ReactNode }) {
  const snapshot = await getFavoritesSnapshot();

  return (
    <FavoritesProvider
      initialSavedPropertyIds={snapshot.savedPropertyIds}
      isAuthenticated={snapshot.isAuthenticated}
    >
      {children}
    </FavoritesProvider>
  );
}
