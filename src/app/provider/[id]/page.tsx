"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Star,
  MapPin,
  Phone,
  Briefcase,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { getProviderById, getServicesByProviderId } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";

export default function ProviderPage() {
  const { t, lang } = useLanguage();
  const params = useParams();
  const provider = getProviderById(params.id as string);

  if (!provider) {
    notFound();
  }

  const services = getServicesByProviderId(provider.id);
  const initials = provider.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  const BackArrow = lang === "ar" ? ArrowRight : ArrowLeft;
  const description = lang === "ar" ? provider.descriptionAr : provider.description;
  const location = lang === "ar" ? provider.locationAr : provider.location;

  const whatsappUrl = `https://wa.me/${provider.whatsappNumber}?text=${encodeURIComponent(
    t("provider.whatsappMessage")
  )}`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-cyan-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20 sm:pb-24">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-sm text-cyan-100 hover:text-white transition-colors mb-6"
          >
            <BackArrow className="w-4 h-4" />
            {t("provider.back")}
          </Link>

          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <span className="text-3xl sm:text-4xl font-bold text-white">
                {initials}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {provider.name}
                </h1>
                {provider.isVerified && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                    <BadgeCheck className="w-4 h-4 text-cyan-200" />
                    <span className="text-xs font-semibold text-cyan-100">
                      {t("provider.verified")}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span className="text-sm font-semibold text-white">
                    {provider.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-cyan-200">
                    ({provider.reviewCount} {t("provider.reviews")})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-cyan-200">
                  <MapPin className="w-3.5 h-3.5" />
                  {location}
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-5 mt-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm text-cyan-100">
                  <Briefcase className="w-4 h-4 text-cyan-300" />
                  {provider.yearsInBusiness} {t("provider.yearsInBusiness")}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-cyan-100">
                  <Calendar className="w-4 h-4 text-cyan-300" />
                  {provider.completedJobs.toLocaleString()} {t("provider.jobsCompleted")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content card area — overlaps hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 pb-12 space-y-5">
        {/* About */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            {t("provider.aboutUs")}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Services */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("provider.ourServices")}
          </h2>
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-xl bg-slate-50 border border-gray-100 hover:border-cyan-200 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {lang === "ar" ? service.nameAr : service.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {lang === "ar" ? service.descriptionAr : service.description}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <span className="text-lg font-bold text-cyan-600">
                    {lang === "ar" ? service.priceDisplayAr : service.priceDisplay}
                  </span>
                  <a
                    href={`https://wa.me/${provider.whatsappNumber}?text=${encodeURIComponent(
                      lang === "ar"
                        ? `مرحباً، أريد حجز خدمة: ${service.nameAr} من ${provider.name}`
                        : `Hi, I'd like to book: ${service.name} from ${provider.name}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-lg hover:shadow-md hover:shadow-cyan-500/25 active:scale-[0.97] transition-all whitespace-nowrap text-center"
                  >
                    {t("provider.bookNow")}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("provider.getInTouch")}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#25D366] rounded-xl hover:bg-[#20bd5a] shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              {t("provider.whatsapp")}
            </a>
            <a
              href={`tel:+${provider.whatsappNumber}`}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-xl hover:bg-cyan-100 active:scale-[0.98] transition-all"
            >
              <Phone className="w-5 h-5" />
              {t("provider.callNow")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
