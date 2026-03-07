"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Star,
  Package,
  Tag,
  Send,
  LogIn,
} from "lucide-react";
import { useLanguage, TranslationKey } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

interface Partner {
  id: number;
  name: string;
  businessName: string;
  phone: string;
  createdAt: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: string;
}

export default function PartnerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState({ count: 0, average: 0 });
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewMsg, setReviewMsg] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/partners?id=${id}`).then((r) => r.json()),
      fetch(`/api/reviews?partnerId=${id}`).then((r) => r.json()),
    ]).then(([partnerData, reviewData]) => {
      if (partnerData.partner) setPartner(partnerData.partner);
      if (partnerData.products) setProducts(partnerData.products);
      if (partnerData.reviewStats) setReviewStats(partnerData.reviewStats);
      if (reviewData.reviews) setReviews(reviewData.reviews);
      if (reviewData.stats) setReviewStats(reviewData.stats);
      // Check if current user already reviewed
      if (user && reviewData.reviews) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const found = reviewData.reviews.some((r: any) => r.userId === user.id);
        setHasReviewed(found);
      }
      setLoading(false);
    });
  }, [id, user]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setReviewMsg("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId: parseInt(id), ...reviewForm }),
      });

      const data = await res.json();
      if (res.ok) {
        setReviewMsg(t("review.thankYou"));
        setShowReviewForm(false);
        setHasReviewed(true);
        // Refresh reviews
        const reviewData = await fetch(`/api/reviews?partnerId=${id}`).then((r) => r.json());
        if (reviewData.reviews) setReviews(reviewData.reviews);
        if (reviewData.stats) setReviewStats(reviewData.stats);
      } else if (data.error === "Already reviewed") {
        setReviewMsg(t("review.alreadyReviewed"));
        setHasReviewed(true);
      }
    } catch {
      // handled
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    if (cat.includes(":")) {
      const [main, sub] = cat.split(":");
      const mainLabel = t(`pcat.${main}` as TranslationKey);
      const subLabel = t(`psub.${sub}` as TranslationKey);
      return `${mainLabel} - ${subLabel}`;
    }
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

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-0.5" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => setReviewForm({ ...reviewForm, rating: star }) : undefined}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">{t("loading")}</div>;
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Partner not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-cyan-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-20 sm:pb-24">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-cyan-100 hover:text-white transition-colors mb-6"
          >
            <ArrowRight className={`w-4 h-4 ${lang === "en" ? "rotate-180" : ""}`} />
            {t("nav.home")}
          </Link>

          <div className="flex items-start gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <span className="text-3xl sm:text-4xl font-bold text-white">
                {(partner.businessName || partner.name).charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {partner.businessName || partner.name}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1" dir="ltr">
                  <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span className="text-sm font-semibold text-white">
                    {reviewStats.average.toFixed(1)}
                  </span>
                  <span className="text-sm text-cyan-200">
                    ({reviewStats.count} {reviewStats.count === 1 ? t("provider.reviews") : t("provider.reviews")})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-cyan-200 flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  {products.length} {lang === "ar" ? "منتج/خدمة" : "products/services"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-12 pb-12 space-y-5">
        {/* Products */}
        {products.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("partner.myProducts")}
            </h2>
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-slate-50 border border-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">{product.title}</h3>
                    {product.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{product.description}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Tag className="w-3 h-3" />
                      {getCategoryLabel(product.category)}
                    </span>
                  </div>
                  {product.price && (
                    <span className="text-lg font-bold text-cyan-600 shrink-0" dir="ltr">
                      KWD {product.price}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("review.title")} ({reviewStats.count})
            </h2>
            {user && !hasReviewed && user.id !== partner.id && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5" />
                {t("review.writeReview")}
              </button>
            )}
          </div>

          {/* Success message */}
          {reviewMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
              {reviewMsg}
            </div>
          )}

          {/* Login prompt */}
          {!user && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500 mb-2">{t("review.loginToReview")}</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
              >
                <LogIn className="w-4 h-4" />
                {t("auth.login")}
              </Link>
            </div>
          )}

          {/* Review form */}
          {showReviewForm && (
            <div className="mb-5 p-4 border border-cyan-100 rounded-xl bg-cyan-50/30">
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("review.rating")} *
                  </label>
                  {renderStars(reviewForm.rating, true)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("review.comment")}
                  </label>
                  <textarea
                    rows={3}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? t("review.submitting") : t("review.submit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    {lang === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">{t("review.noReviews")}</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 rounded-xl bg-slate-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                        {review.reviewerName.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{review.reviewerName}</span>
                        <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
