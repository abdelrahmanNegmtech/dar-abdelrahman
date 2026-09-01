import { redirect } from "next/navigation";

export default function OwnerLegacyPublishPage() {
  // Publication is available only from a real, property-scoped owner route.
  redirect("/owner/properties");
}
