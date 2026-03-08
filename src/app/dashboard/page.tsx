"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Plus,
  Trash2,
  Gavel,
  MapPin,
  Tag,
  Clock,
  X,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  User,
  Phone,
  FileText,
  CheckCheck,
} from "lucide-react";
import { useLanguage, TranslationKey } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: string;
  createdAt: string;
}

interface Auction {
  id: number;
  customerName: string;
  category: string;
  title: string;
  description: string;
  governorate: string;
  budget: string;
  status: string;
  createdAt: string;
  bidCount: number;
}

interface BookingRow {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  preferredDate: string;
  notes: string;
  status: string;
  rejectionReason: string;
  createdAt: string;
  updatedAt: string;
}

const mainCategories = ["pool", "fountain", "fish"] as const;
const subCategories = ["maintenance", "cleaning", "repairs", "equipment", "supplies", "addons", "design"] as const;

export default function DashboardPage() {
  const { t, lang } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"products" | "bookings" | "auctions">("bookings");
  const [products, setProducts] = useState<Product[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    mainCategory: "",
    subCategory: "",
    price: "",
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "partner")) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "partner") {
      Promise.all([
        fetch("/api/partner/products").then((r) => r.json()),
        fetch("/api/auctions").then((r) => r.json()),
        fetch("/api/bookings").then((r) => r.json()),
      ]).then(([prods, aucs, bks]) => {
        if (Array.isArray(prods)) setProducts(prods);
        if (Array.isArray(aucs)) setAuctions(aucs);
        if (Array.isArray(bks)) setBookings(bks);
        setLoading(false);
      });
    }
  }, [user]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/partner/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: `${form.mainCategory}:${form.subCategory}`,
          price: form.price,
        }),
      });
      if (res.ok) {
        setForm({ title: "", description: "", mainCategory: "", subCategory: "", price: "" });
        setShowForm(false);
        const prods = await fetch("/api/partner/products").then((r) => r.json());
        if (Array.isArray(prods)) setProducts(prods);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch("/api/partner/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleBookingAction = async (bookingId: number, status: string, reason?: string) => {
    try {
      await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status, rejectionReason: reason }),
      });
      setBookings(bookings.map((b) =>
        b.id === bookingId ? { ...b, status, rejectionReason: reason || "" } : b
      ));
      setRejectingId(null);
      setRejectionReason("");
    } catch (err) {
      console.error("Booking action error:", err);
    }
  };

  const getCategoryLabel = (cat: string) => {
    if (cat.includes(":")) {
      const [main, sub] = cat.split(":");
      const mainLabel = t(`pcat.${main}` as TranslationKey);
      const subLabel = t(`psub.${sub}` as TranslationKey);
      return `${mainLabel} - ${subLabel}`;
    }
    if (cat === "pool") return t("auction.pool");
    if (cat === "fountain") return t("auction.fountain");
    if (cat === "fish") return t("auction.fish");
    return cat;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === "ar" ? "ar-KW" : "en-KW", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      completed: "bg-blue-50 text-blue-700 border-blue-200",
      cancelled: "bg-gray-50 text-gray-500 border-gray-200",
    };
    const statusKey = `booking.${status}` as TranslationKey;
    return (
      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${styles[status] || styles.pending}`}>
        {t(statusKey)}
      </span>
    );
  };

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">{t("loading")}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex items-center gap-2.5 mb-1">
            <LayoutDashboard className="w-6 h-6" />
            <h1 className="text-xl sm:text-2xl font-bold">{t("partner.dashboard")}</h1>
          </div>
          <p className="text-cyan-100 text-sm">
            {user.businessName || user.name}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setTab("bookings")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
              tab === "bookings"
                ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
            }`}
          >
            <CalendarCheck className="w-4 h-4 inline-block me-1.5" />
            {t("booking.bookingRequests")}
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -end-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("products")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === "products"
                ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
            }`}
          >
            <Package className="w-4 h-4 inline-block me-1.5" />
            {t("partner.myProducts")}
          </button>
          <button
            onClick={() => setTab("auctions")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === "auctions"
                ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
            }`}
          >
            <Gavel className="w-4 h-4 inline-block me-1.5" />
            {t("partner.auctionRequests")}
          </button>
        </div>

        {/* Bookings Tab */}
        {tab === "bookings" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {t("booking.bookingRequests")}
            </h2>
            {loading ? (
              <div className="text-center py-12 text-gray-400">{t("loading")}</div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{t("booking.noBookings")}</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${
                      booking.status === "pending"
                        ? "border-amber-200 bg-amber-50/30"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {booking.serviceName}
                          </h3>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {booking.customerName}
                      </div>
                      <div className="flex items-center gap-1.5" dir="ltr">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        +965{booking.customerPhone}
                      </div>
                      {booking.preferredDate && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(booking.preferredDate)}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {t("booking.requestedOn")} {formatDate(booking.createdAt)}
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="flex items-start gap-1.5 text-xs text-gray-500 mb-3 bg-gray-50 rounded-lg p-2.5">
                        <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                        {booking.notes}
                      </div>
                    )}

                    {booking.status === "rejected" && booking.rejectionReason && (
                      <div className="text-xs text-red-600 bg-red-50 rounded-lg p-2.5 mb-3">
                        {t("booking.rejectReason")}: {booking.rejectionReason}
                      </div>
                    )}

                    {/* Action buttons */}
                    {booking.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBookingAction(booking.id, "confirmed")}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all active:scale-[0.97]"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {t("booking.approve")}
                        </button>
                        <button
                          onClick={() => setRejectingId(booking.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-xl transition-all active:scale-[0.97]"
                        >
                          <XCircle className="w-4 h-4" />
                          {t("booking.reject")}
                        </button>
                      </div>
                    )}

                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => handleBookingAction(booking.id, "completed")}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl transition-all active:scale-[0.97]"
                      >
                        <CheckCheck className="w-4 h-4" />
                        {t("booking.markComplete")}
                      </button>
                    )}

                    {/* Rejection reason modal */}
                    {rejectingId === booking.id && (
                      <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200">
                        <label className="block text-xs font-medium text-red-700 mb-1.5">
                          {t("booking.rejectReason")}
                        </label>
                        <textarea
                          rows={2}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder={t("booking.rejectReasonPlaceholder")}
                          className="w-full px-3 py-2 rounded-lg border border-red-200 text-sm resize-none focus:ring-2 focus:ring-red-300 focus:border-transparent"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleBookingAction(booking.id, "rejected", rejectionReason)}
                            className="px-4 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all"
                          >
                            {t("booking.reject")}
                          </button>
                          <button
                            onClick={() => { setRejectingId(null); setRejectionReason(""); }}
                            className="px-4 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-all"
                          >
                            {lang === "ar" ? "إلغاء" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {tab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{t("partner.myProducts")}</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm
                  ? lang === "ar" ? "إلغاء" : "Cancel"
                  : t("partner.addProduct")}
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-2xl shadow-sm border border-cyan-100 p-6 mb-6">
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t("partner.productTitle")} *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t("partner.productCategory")} *
                      </label>
                      <select
                        required
                        value={form.mainCategory}
                        onChange={(e) => setForm({ ...form, mainCategory: e.target.value, subCategory: "" })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm bg-white"
                      >
                        <option value="">{t("partner.selectMain")}</option>
                        {mainCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {t(`pcat.${cat}` as TranslationKey)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t("partner.subCategory")} *
                      </label>
                      <select
                        required
                        value={form.subCategory}
                        onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                        disabled={!form.mainCategory}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm bg-white disabled:opacity-50"
                      >
                        <option value="">{t("partner.selectSub")}</option>
                        {subCategories.map((sub) => (
                          <option key={sub} value={sub}>
                            {t(`psub.${sub}` as TranslationKey)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t("partner.productPrice")}
                    </label>
                    <div className="flex" dir="ltr">
                      <span className="inline-flex items-center px-3 rounded-s-xl border border-e-0 border-gray-200 bg-gray-50 text-sm text-gray-500">
                        KWD
                      </span>
                      <input
                        type="text"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-e-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t("partner.productDesc")}
                    </label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg transition-all disabled:opacity-60"
                  >
                    {saving ? "..." : t("partner.save")}
                  </button>
                </form>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-gray-400">{t("loading")}</div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{t("partner.noProducts")}</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">
                        {product.title}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          {getCategoryLabel(product.category)}
                        </span>
                        {product.price && (
                          <span dir="ltr" className="font-medium text-gray-500">
                            KWD {product.price}
                          </span>
                        )}
                        <span>{formatDate(product.createdAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Auctions Tab */}
        {tab === "auctions" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {t("partner.auctionRequests")}
            </h2>
            {loading ? (
              <div className="text-center py-12 text-gray-400">{t("loading")}</div>
            ) : auctions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{t("auction.noAuctions")}</p>
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
                          <h3 className="font-semibold text-gray-900 text-sm">
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
                        <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                          {auction.description}
                        </p>
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
                          {auction.budget && (
                            <span dir="ltr" className="font-medium text-gray-500">
                              KWD {auction.budget}
                            </span>
                          )}
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
        )}
      </div>
    </div>
  );
}
