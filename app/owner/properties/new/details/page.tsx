import { redirect } from "next/navigation";
import { createOwnerDraftProperty } from "@/features/properties/data/owner-property-actions";

export default async function Page() {
  const result = await createOwnerDraftProperty();

  if (!result.ok) {
    redirect("/owner/properties");
  }

  redirect(`/owner/properties/${result.data.propertyId}/edit`);
}
