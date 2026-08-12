import { PropertiesManagementPage } from "@/features/properties/properties-management-page";
import { getAdminPropertiesPageData } from "@/features/admin/data/admin-properties-queries";

export default async function AdminProperties() {
  const pageData = await getAdminPropertiesPageData();
  return <PropertiesManagementPage pageData={pageData} />;
}
