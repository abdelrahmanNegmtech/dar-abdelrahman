import { getOwnerPayoutPageData } from "@/features/payouts/data/payout-queries";
import PayoutsPage from "./payouts-page";

export default async function Page() {
  const data = await getOwnerPayoutPageData();
  return <PayoutsPage {...data} />;
}
