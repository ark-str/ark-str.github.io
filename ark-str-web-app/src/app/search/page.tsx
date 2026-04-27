import { Suspense } from "react";
import { SearchOverview } from "@/features/search/ui/search-overview";

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchOverview />
    </Suspense>
  );
}
