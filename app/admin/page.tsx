import { OverviewPage } from "@/features/overview/overview-page";
import { getAdminOverviewPageData } from "@/features/admin/data/admin-overview-queries";

export default async function AdminOverview() {
  const pageData = await getAdminOverviewPageData();
  return <OverviewPage pageData={pageData} />;
}
