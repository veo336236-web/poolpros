"use client";

import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { ServiceType, GOVERNORATES } from "@/lib/types";
import { useLanguage, TranslationKey } from "@/lib/i18n";

const SERVICE_TYPE_KEYS: ServiceType[] = [
  "construction",
  "maintenance",
  "equipment",
  "supplies",
  "repairs",
  "add-ons",
];

interface FilterSidebarProps {
  selectedServices: ServiceType[];
  maxPrice: number;
  governorate: string;
  onServiceToggle: (service: ServiceType) => void;
  onMaxPriceChange: (price: number) => void;
  onGovernorateChange: (gov: string) => void;
  onReset: () => void;
}

export default function FilterSidebar({
  selectedServices,
  maxPrice,
  governorate,
  onServiceToggle,
  onMaxPriceChange,
  onGovernorateChange,
  onReset,
}: FilterSidebarProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4.5 h-4.5 text-cyan-600" />
          <h2 className="text-base font-semibold text-gray-900">{t("filter.title")}</h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-cyan-600 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          {t("filter.reset")}
        </button>
      </div>

      {/* Service Type */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {t("filter.serviceType")}
        </h3>
        <div className="space-y-2.5">
          {SERVICE_TYPE_KEYS.map((key) => (
            <label
              key={key}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedServices.includes(key)}
                onChange={() => onServiceToggle(key)}
                className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500/30 cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {t(`serviceType.${key}` as TranslationKey)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Max Price */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {t("filter.maxPrice")}
        </h3>
        <input
          type="range"
          min={5}
          max={250}
          step={5}
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>5 {t("filter.kwd")}</span>
          <span className="text-sm font-semibold text-cyan-600">
            {maxPrice} {t("filter.kwd")}
          </span>
          <span>250 {t("filter.kwd")}</span>
        </div>
      </div>

      {/* Governorate / Area */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {t("filter.governorate")}
        </h3>
        <select
          value={governorate}
          onChange={(e) => onGovernorateChange(e.target.value)}
          className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-all"
        >
          {GOVERNORATES.map((gov) => (
            <option key={gov} value={gov}>
              {t(`gov.${gov}` as TranslationKey)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
