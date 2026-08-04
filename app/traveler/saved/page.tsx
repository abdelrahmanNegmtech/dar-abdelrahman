import { SavedPropertiesPage } from "@/features/traveler/components/SavedPropertiesPage";
import { getSavedPropertiesData } from "@/features/traveler/data/queries";

export default async function TravelerSavedRoute() {
  const data = await getSavedPropertiesData();
  return <SavedPropertiesPage properties={data.properties} />;
}
