import { ReportsAnalyticsPage } from "@/features/reports/reports-analytics-page";
import { getAdminReportsPageData } from "@/features/admin/data/admin-reports-queries";

export default async function AdminReports() {
  const pageData = await getAdminReportsPageData();
  return <ReportsAnalyticsPage pageData={pageData} />;
}
