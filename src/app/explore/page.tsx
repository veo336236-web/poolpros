import { Suspense } from "react";
import ExploreClient from "./ExploreClient";

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gray-400 text-sm">جار التحميل...</div>
        </div>
      }
    >
      <ExploreClient />
    </Suspense>
  );
}
