import { DashboardPage } from "@/features/traveler/components/DashboardPage";
import { getDashboardData } from "@/features/traveler/data/queries";

export default async function TravelerDashboardRoute() {
  const data = await getDashboardData();
  return <DashboardPage {...data} />;
}
