import { Suspense } from "react";
import { ProfilePage } from "@/features/traveler/components/ProfilePage";
import { getProfileData } from "@/features/traveler/data/queries";

export default async function TravelerProfileRoute() {
  const data = await getProfileData();
  return (
    <Suspense fallback={null}>
      <ProfilePage {...data} />
    </Suspense>
  );
}
