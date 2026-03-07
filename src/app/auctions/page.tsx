"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Plus, Gavel, MapPin, Tag, Clock, FileText, Send, Search } from "lucide-react";
import { useLanguage, TranslationKey } from "@/lib/i18n";
import { useSearchParams } from "next/navigation";

interface Auction {
  id: number;
  customerName: string;
  phone: string;
  category: string;
  title: string;
  description: string;
  governorate: string;
  budget: string;
  status: string;
  createdAt: string;
  bidCount: number;
}

const categoryIcons: Record<string, string> = {
  pool: "🏊",
  fountain: "⛲",
  fish: "🐠",
};

function AuctionsContent() {
  const { t, lang } = useLanguage();
  const searchParams = useSearchParams();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const success = searchParams.get("success");

  useEffect(() => {
    fetch("/api/auctions")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAuctions(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const getCategoryLabel = (cat: string) => {
    if (cat === "pool") return t("auction.pool");
    if (cat === "fountain") return t("auction.fountain");
    if (cat === "fish") return t("auction.fish");
    return cat;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === "ar" ? "ar-KW" : "en-KW", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <Gavel className="w-7 h-7" />
                <h1 className="text-2xl sm:text-3xl font-bold">{t("auction.title")}</h1>
              </div>
              <p className="text-cyan-100 text-sm sm:text-base">{t("auction.subtitle")}</p>
            </div>
            <Link
              href="/auctions/new"
              className="px-5 py-2.5 bg-white text-cyan-700 font-semibold text-sm rounded-xl hover:bg-cyan-50 transition-all flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              {t("auction.newRequest")}
            </Link>
          </div>
        </div>
      </div>

      {/* How it works + description */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {t("auction.heroDesc")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-cyan-50/50 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center shrink-0">
                <FileText className="w-4.5 h-4.5 text-cyan-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-cyan-600 block mb-0.5">1</span>
                <p className="text-sm text-gray-700">{t("auction.howItWorks1")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-teal-50/50 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                <Send className="w-4.5 h-4.5 text-teal-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-teal-600 block mb-0.5">2</span>
                <p className="text-sm text-gray-700">{t("auction.howItWorks2")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <Search className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-600 block mb-0.5">3</span>
                <p className="text-sm text-gray-700">{t("auction.howItWorks3")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
            {t("auction.success")}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400">{t("loading")}</div>
        ) : auctions.length === 0 ? null : (
          <div className="grid gap-4">
            {auctions.map((auction) => (
              <Link
                key={auction.id}
                href={`/auctions/${auction.id}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-lg">{categoryIcons[auction.category] || "📋"}</span>
                      <h3 className="font-semibold text-gray-900 text-base truncate">
                        {auction.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          auction.status === "open"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {auction.status === "open" ? t("auction.open") : t("auction.closed")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {auction.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        {getCategoryLabel(auction.category)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {t(`gov.${auction.governorate}` as TranslationKey)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(auction.createdAt)}
                      </span>
                      {auction.budget && (
                        <span dir="ltr" className="text-start font-medium text-gray-500">
                          KWD {auction.budget}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-center shrink-0">
                    <div className="text-2xl font-bold text-cyan-600">{auction.bidCount}</div>
                    <div className="text-xs text-gray-400">
                      {auction.bidCount === 1 ? t("auction.bids") : t("auction.bidsPlural")}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuctionsPage() {
  return (
    <Suspense>
      <AuctionsContent />
    </Suspense>
  );
}
