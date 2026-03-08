"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, SearchX, Loader2 } from "lucide-react";
import ProviderCard from "@/components/ProviderCard";
import FilterSidebar from "@/components/FilterSidebar";
import { providers as hardcodedProviders } from "@/lib/data";
import { Provider, ServiceType } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";

export default function ExploreClient() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") as
    | "pool"
    | "fountain"
    | "fish"
    | null;

  const [allProviders, setAllProviders] = useState<Provider[]>(hardcodedProviders);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [maxPrice, setMaxPrice] = useState(250);
  const [governorate, setGovernorate] = useState("All Areas");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch providers from API (hardcoded + database partners)
  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch("/api/providers");
        if (res.ok) {
          const data = await res.json();
          setAllProviders(data);
        }
      } catch {
        // Keep hardcoded providers as fallback
      } finally {
        setLoadingProviders(false);
      }
    }
    fetchProviders();
  }, []);

  const handleServiceToggle = (service: ServiceType) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleReset = () => {
    setSelectedServices([]);
    setMaxPrice(250);
    setGovernorate("All Areas");
  };

  const filteredProviders = useMemo(() => {
    return allProviders.filter((p) => {
      if (categoryParam && p.category !== categoryParam) return false;
      if (maxPrice < 250 && p.basePrice > maxPrice) return false;
      if (governorate !== "All Areas" && p.governorate !== governorate)
        return false;
      return true;
    });
  }, [allProviders, categoryParam, maxPrice, governorate]);

  const activeFilterCount =
    selectedServices.length +
    (maxPrice < 250 ? 1 : 0) +
    (governorate !== "All Areas" ? 1 : 0);

  const categoryLabel =
    categoryParam === "pool"
      ? t("explore.poolServices")
      : categoryParam === "fountain"
      ? t("explore.fountainServices")
      : categoryParam === "fish"
      ? t("explore.fishServices")
      : t("explore.allServices");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {categoryLabel}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filteredProviders.length}{" "}
            {filteredProviders.length !== 1
              ? t("explore.providers")
              : t("explore.provider")}{" "}
            {t("explore.providersFound")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* Mobile filter toggle */}
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="lg:hidden flex items-center justify-between gap-2 px-4 py-3 w-full bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-4"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            {t("explore.filters")}
          </div>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-600 text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex flex-col lg:flex-row gap-5 sm:gap-6">
          {/* Sidebar */}
          <div
            className={`lg:w-72 flex-shrink-0 ${
              mobileFiltersOpen ? "block" : "hidden lg:block"
            }`}
          >
            <div className="lg:sticky lg:top-[5.5rem]">
              <FilterSidebar
                selectedServices={selectedServices}
                maxPrice={maxPrice}
                governorate={governorate}
                onServiceToggle={handleServiceToggle}
                onMaxPriceChange={setMaxPrice}
                onGovernorateChange={setGovernorate}
                onReset={handleReset}
              />
            </div>
          </div>

          {/* Results grid */}
          <div className="flex-1">
            {loadingProviders ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
              </div>
            ) : filteredProviders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchX className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {t("explore.noProviders")}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {t("explore.noProvidersDesc")}
                </p>
                <button
                  onClick={handleReset}
                  className="px-5 py-2 text-sm font-medium text-cyan-600 border border-cyan-200 rounded-xl hover:bg-cyan-50 transition-colors"
                >
                  {t("explore.resetFilters")}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProviders.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
