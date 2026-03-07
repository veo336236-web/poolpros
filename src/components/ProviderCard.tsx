"use client";

import Link from "next/link";
import {
  Star,
  MapPin,
  BadgeCheck,
} from "lucide-react";
import { Provider } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";

interface ProviderCardProps {
  provider: Provider;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const { t, lang } = useLanguage();
  const initials = provider.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  const location = lang === "ar" ? provider.locationAr : provider.location;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden group">
      <div className="flex flex-col sm:flex-row">
        {/* Avatar section */}
        <div className="sm:w-40 h-36 sm:h-auto flex-shrink-0 bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center relative">
          <span className="text-4xl font-bold text-white/90">{initials}</span>
          {provider.isVerified && (
            <div className="absolute top-3 start-3 sm:top-auto sm:bottom-3 sm:start-3">
              <div className="flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                <BadgeCheck className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px] font-semibold text-white">
                  {t("card.verified")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {provider.name}
                </h3>
                {provider.isVerified && (
                  <BadgeCheck className="w-4.5 h-4.5 text-cyan-500 flex-shrink-0 hidden sm:block" />
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {location}
              </div>
            </div>
            <span className="text-lg font-bold text-cyan-600 whitespace-nowrap">
              {provider.basePrice} {t("filter.kwd")}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(provider.rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-200 fill-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {provider.rating.toFixed(1)} ({provider.reviewCount} {t("card.reviews")})
            </span>
          </div>

          {/* Category tag */}
          <div className="mb-4">
            <span className="inline-block px-2.5 py-0.5 text-xs font-medium bg-cyan-50 text-cyan-700 rounded-full">
              {provider.category === "pool" ? t("card.pool") : provider.category === "fountain" ? t("card.fountain") : t("card.fish")}
            </span>
          </div>

          {/* CTA */}
          <div className="mt-auto">
            <Link
              href={`/provider/${provider.id}`}
              className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98] transition-all"
            >
              {t("card.viewProfile")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
