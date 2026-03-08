"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  X,
  CheckCircle2,
} from "lucide-react";
import { getProviderById, getServicesByProviderId } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

export default function ProviderPage() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const provider = getProviderById(params.id as string);

  const [bookingService, setBookingService] = useState<{
    id: string;
    name: string;
    nameAr: string;
  } | null>(null);
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

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

  const handleBookNow = (service: { id: string; name: string; nameAr: string }) => {
    if (!user) {
      router.push("/login");
      return;
    }
    setBookingService(service);
    setBookingSuccess(false);
    setPreferredDate("");
    setNotes("");
  };

  const handleSubmitBooking = async () => {
    if (!bookingService || !user) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: provider.id,
          providerName: provider.name,
          serviceId: bookingService.id,
          serviceName: lang === "ar" ? bookingService.nameAr : bookingService.name,
          preferredDate,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBookingSuccess(true);
      }
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* Content */}
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
                  <button
                    onClick={() => handleBookNow(service)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-lg hover:shadow-md hover:shadow-cyan-500/25 active:scale-[0.97] transition-all whitespace-nowrap text-center"
                  >
                    {t("provider.bookNow")}
                  </button>
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

      {/* Booking Modal */}
      {bookingService && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {bookingSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {t("booking.success")}
                  </h3>
                  <button
                    onClick={() => setBookingService(null)}
                    className="mt-4 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg transition-all"
                  >
                    {lang === "ar" ? "حسناً" : "OK"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-gray-900">
                      {t("booking.bookService")}
                    </h3>
                    <button
                      onClick={() => setBookingService(null)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Service info */}
                  <div className="p-3 bg-cyan-50 rounded-xl mb-4">
                    <p className="text-sm font-semibold text-cyan-800">
                      {lang === "ar" ? bookingService.nameAr : bookingService.name}
                    </p>
                    <p className="text-xs text-cyan-600 mt-0.5">{provider.name}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t("booking.preferredDate")}
                      </label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t("booking.notes")}
                      </label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t("booking.notesPlaceholder")}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm resize-none"
                      />
                    </div>

                    <button
                      onClick={handleSubmitBooking}
                      disabled={submitting}
                      className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-[0.98] disabled:opacity-60"
                    >
                      {submitting ? t("booking.submitting") : t("booking.submit")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
