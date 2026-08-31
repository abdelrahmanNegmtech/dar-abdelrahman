import VerificationPage from "./verification-page";
import { getOwnerVerificationPageData } from "@/features/verification/data/owner-verification-queries";

export default async function Page() {
  const data = await getOwnerVerificationPageData();

  return <VerificationPage data={data} />;
}
