import { SettingsPage } from "@/features/traveler/components/SettingsPage";
import { getSettingsData } from "@/features/traveler/data/queries";

export default async function TravelerSettingsRoute() {
  const data = await getSettingsData();
  return <SettingsPage profile={data.profile} settings={data.settings} />;
}
