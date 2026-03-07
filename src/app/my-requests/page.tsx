"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardList, MapPin, Tag, Clock, Plus } from "lucide-react";
import { useLanguage, TranslationKey } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

interface Auction {
  id: number;
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

export default function MyRequestsPage() {
  const { t, lang } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/my-requests")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setAuctions(data);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

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

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">{t("loading")}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex items-center gap-2.5 mb-1">
            <ClipboardList className="w-6 h-6" />
            <h1 className="text-xl sm:text-2xl font-bold">{t("auth.myRequests")}</h1>
          </div>
          <p className="text-cyan-100 text-sm">{user.name}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="text-center py-16 text-gray-400">{t("loading")}</div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">
              {lang === "ar" ? "لا توجد طلبات بعد" : "No requests yet"}
            </p>
            <Link
              href="/auctions/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              {t("auction.newRequest")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {auctions.map((auction) => (
              <Link
                key={auction.id}
                href={`/auctions/${auction.id}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-lg">{categoryIcons[auction.category] || "📋"}</span>
                      <h3 className="font-semibold text-gray-900 text-sm">{auction.title}</h3>
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
                    <p className="text-xs text-gray-500 line-clamp-1 mb-2">{auction.description}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
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
                    </div>
                  </div>
                  <div className="text-center shrink-0">
                    <div className="text-xl font-bold text-cyan-600">{auction.bidCount}</div>
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
