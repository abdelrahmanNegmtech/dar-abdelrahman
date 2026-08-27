import { getPublicPropertyCardsByIds } from "@/features/properties/data/public-property-queries";
import { FavoritesBoundary } from "@/features/public-marketplace/favorites/FavoritesBoundary";
import { FavoritesPage } from "@/features/public-marketplace/favorites/components/FavoritesPage";
import { getFavoritesSnapshot } from "@/features/public-marketplace/favorites/queries";

export default async function Page() {
  const snapshot = await getFavoritesSnapshot();
  const properties = snapshot.isAuthenticated
    ? await getPublicPropertyCardsByIds(snapshot.savedPropertyIds).catch(() => [])
    : [];

  return (
    <FavoritesBoundary>
      <FavoritesPage
        authState={snapshot.isAuthenticated ? "logged-in" : "logged-out"}
        properties={properties}
      />
    </FavoritesBoundary>
  );
}
