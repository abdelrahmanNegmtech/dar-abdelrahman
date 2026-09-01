import { redirect } from "next/navigation";

export default function OwnerNewPropertyPhotosPage() {
  // Photo uploads require a property-scoped Supabase storage workflow.
  redirect("/owner/properties");
}
