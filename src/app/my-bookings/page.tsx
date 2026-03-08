"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Loader2,
} from "lucide-react";
import { useLanguage, TranslationKey } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

interface BookingRow {
  id: number;
  serviceName: string;
  providerName: string;
  preferredDate: string;
  notes: string;
  status: string;
  rejectionReason: string;
  createdAt: string;
}

export default function MyBookingsPage() {
  const { t, lang } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);

  const BackArrow = lang === "ar" ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/bookings")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setBookings(data);
          setLoading(false);
        });
    }
  }, [user]);

  const handlePay = async (bookingId: number) => {
    setPayingId(bookingId);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, amount: 5 }), // Default service fee 5 KWD
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setPayingId(null);
    }
  };

  const handleCancel = async (bookingId: number) => {
    try {
      await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: "cancelled" }),
      });
      setBookings(bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "cancelled" } : b
      ));
    } catch (err) {
      console.error("Cancel error:", err);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "confirmed": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "rejected": return <XCircle className="w-5 h-5 text-red-500" />;
      case "completed": return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
      case "cancelled": return <XCircle className="w-5 h-5 text-gray-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      completed: "bg-blue-50 text-blue-700 border-blue-200",
      cancelled: "bg-gray-50 text-gray-500 border-gray-200",
    };
    return styles[status] || styles.pending;
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">{t("loading")}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-cyan-100 hover:text-white transition-colors mb-4"
          >
            <BackArrow className="w-4 h-4" />
            {lang === "ar" ? "الرئيسية" : "Home"}
          </Link>
          <div className="flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6" />
            <h1 className="text-xl sm:text-2xl font-bold">{t("booking.myBookings")}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-400">{t("loading")}</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">{t("booking.noBookings")}</p>
            <Link
              href="/explore"
              className="inline-flex px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg transition-all"
            >
              {lang === "ar" ? "تصفح الخدمات" : "Browse Services"}
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getStatusIcon(booking.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {booking.serviceName}
                      </h3>
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusStyle(booking.status)}`}>
                        {t(`booking.${booking.status}` as TranslationKey)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {t("booking.provider")}: {booking.providerName}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                      {booking.preferredDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(booking.preferredDate)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {t("booking.requestedOn")} {formatDate(booking.createdAt)}
                      </span>
                    </div>

                    {booking.status === "rejected" && booking.rejectionReason && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg p-2.5">
                        {t("booking.rejectReason")}: {booking.rejectionReason}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3">
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => handlePay(booking.id)}
                          disabled={payingId === booking.id}
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-lg hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-60"
                        >
                          {payingId === booking.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5" />
                          )}
                          {lang === "ar" ? "ادفع الآن" : "Pay Now"}
                        </button>
                      )}
                      {booking.status === "pending" && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="px-4 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg transition-all"
                        >
                          {lang === "ar" ? "إلغاء الطلب" : "Cancel Request"}
                        </button>
                      )}
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
