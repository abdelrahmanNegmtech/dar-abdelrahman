import { ReviewsPage } from "@/features/traveler/components/ReviewsPage";
import { getReviewsData } from "@/features/traveler/data/queries";

export default async function TravelerReviewsRoute() {
  const data = await getReviewsData();
  return <ReviewsPage {...data} />;
}
