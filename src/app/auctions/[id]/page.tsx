"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Tag, Clock, Send, User, Phone } from "lucide-react";
import { useLanguage, TranslationKey } from "@/lib/i18n";

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
}

interface Bid {
  id: number;
  providerName: string;
  phone: string;
  price: string;
  description: string;
  duration: string;
  createdAt: string;
}

const categoryIcons: Record<string, string> = {
  pool: "🏊",
  fountain: "⛲",
  fish: "🐠",
};

export default function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, lang } = useLanguage();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBidForm, setShowBidForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bidForm, setBidForm] = useState({
    providerName: "",
    phone: "",
    price: "",
    description: "",
    duration: "",
  });

  const fetchData = () => {
    fetch(`/api/auctions/${id}/bids`)
      .then((r) => r.json())
      .then((data) => {
        if (data.auction) setAuction(data.auction);
        if (data.bids) setBids(data.bids);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/auctions/${id}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bidForm),
      });

      if (res.ok) {
        setBidForm({ providerName: "", phone: "", price: "", description: "", duration: "" });
        setShowBidForm(false);
        fetchData();
      }
    } catch {
      // handled by UI
    } finally {
      setSubmitting(false);
    }
  };

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">{t("loading")}</div>;
  }

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Auction not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/auctions"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-cyan-600 mb-6 transition-colors"
        >
          <ArrowRight className={`w-4 h-4 ${lang === "en" ? "rotate-180" : ""}`} />
          {t("auction.title")}
        </Link>

        {/* Auction details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xl">{categoryIcons[auction.category] || "📋"}</span>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{auction.title}</h1>
            <span
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                auction.status === "open"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {auction.status === "open" ? t("auction.open") : t("auction.closed")}
            </span>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-4">{auction.description}</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-gray-400" />
              {getCategoryLabel(auction.category)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" />
              {t(`gov.${auction.governorate}` as TranslationKey)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              {formatDate(auction.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-400" />
              {auction.customerName}
            </span>
          </div>

          {auction.budget && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg text-sm font-medium" dir="ltr">
              KWD {auction.budget}
            </div>
          )}
        </div>

        {/* Bids section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {t("auction.viewBids")} ({bids.length})
          </h2>
          {auction.status === "open" && (
            <button
              onClick={() => setShowBidForm(!showBidForm)}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {t("auction.submitBid")}
            </button>
          )}
        </div>

        {/* Bid form */}
        {showBidForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-cyan-100 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">{t("auction.submitBid")}</h3>
            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("auction.providerName")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={bidForm.providerName}
                    onChange={(e) => setBidForm({ ...bidForm, providerName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("auction.phone")} *
                  </label>
                  <div className="flex" dir="ltr">
                    <span className="inline-flex items-center px-3 rounded-s-xl border border-e-0 border-gray-200 bg-gray-50 text-sm text-gray-500">
                      +965
                    </span>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      pattern="[0-9]{8}"
                      maxLength={8}
                      value={bidForm.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                        setBidForm({ ...bidForm, phone: val });
                      }}
                      className="w-full px-4 py-2.5 rounded-e-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("auction.price")} *
                  </label>
                  <div className="flex" dir="ltr">
                    <span className="inline-flex items-center px-3 rounded-s-xl border border-e-0 border-gray-200 bg-gray-50 text-sm text-gray-500">
                      KWD
                    </span>
                    <input
                      type="text"
                      required
                      value={bidForm.price}
                      onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-e-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("auction.duration")}
                  </label>
                  <input
                    type="text"
                    value={bidForm.duration}
                    onChange={(e) => setBidForm({ ...bidForm, duration: e.target.value })}
                    placeholder={lang === "ar" ? "مثال: 2 أسبوع" : "e.g. 2 weeks"}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("auction.bidDescription")} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={bidForm.description}
                  onChange={(e) => setBidForm({ ...bidForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg transition-all disabled:opacity-60"
                >
                  {submitting ? t("auction.submitting") : t("auction.submitBid")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBidForm(false)}
                  className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bids list */}
        {bids.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-gray-400 text-sm">{t("auction.noBids")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bids.map((bid) => (
              <div
                key={bid.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">{bid.providerName}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Phone className="w-3 h-3" />
                        <span dir="ltr">+965 {bid.phone}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{bid.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                      {bid.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {bid.duration}
                        </span>
                      )}
                      <span>{formatDate(bid.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-end shrink-0">
                    <div className="text-lg font-bold text-cyan-600" dir="ltr">
                      KWD {bid.price}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
