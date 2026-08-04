import { Suspense } from "react";
import { SearchExperience } from "@/features/public-marketplace/search/components/SearchExperience";

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchExperience />
    </Suspense>
  );
}
