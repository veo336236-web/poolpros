"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Home, CalendarCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { Suspense } from "react";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");
    const isTest = searchParams.get("test") === "true";

    if (!paymentId) {
      setStatus("failed");
      return;
    }

    // For test mode, mark as paid
    if (isTest) {
      fetch(`/api/payments/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      }).then(() => setStatus("success")).catch(() => setStatus("success"));
      return;
    }

    // For real Tap payments, check the status
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/payments?id=${paymentId}`);
        const payment = await res.json();
        if (payment?.status === "paid") {
          setStatus("success");
        } else if (payment?.status === "failed" || payment?.status === "cancelled") {
          setStatus("failed");
        } else {
          // Keep checking for a bit
          setTimeout(checkStatus, 2000);
        }
      } catch {
        setStatus("failed");
      }
    };

    checkStatus();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-cyan-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {lang === "ar" ? "جاري التحقق من الدفع..." : "Verifying payment..."}
            </h2>
            <p className="text-sm text-gray-500">
              {lang === "ar" ? "يرجى الانتظار" : "Please wait"}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {lang === "ar" ? "تم الدفع بنجاح!" : "Payment Successful!"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {lang === "ar"
                ? "تم تأكيد حجزك. سيتم التواصل معك قريباً."
                : "Your booking is confirmed. We'll contact you soon."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/my-bookings")}
                className="flex-1 py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" />
                {lang === "ar" ? "حجوزاتي" : "My Bookings"}
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                {lang === "ar" ? "الرئيسية" : "Home"}
              </button>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {lang === "ar" ? "فشل الدفع" : "Payment Failed"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {lang === "ar"
                ? "لم يتم إكمال عملية الدفع. يمكنك المحاولة مرة أخرى."
                : "Payment was not completed. You can try again."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/my-bookings")}
                className="flex-1 py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg transition-all"
              >
                {lang === "ar" ? "حجوزاتي" : "My Bookings"}
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                {lang === "ar" ? "الرئيسية" : "Home"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
