"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp" | "newpass">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const BackArrow = lang === "ar" ? ArrowRight : ArrowLeft;

  const sendOtp = async () => {
    setError("");
    if (phone.length !== 8) {
      setError(lang === "ar" ? "أدخل رقم هاتف صحيح" : "Enter a valid phone number");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: `965${phone}`, purpose: "reset" }),
    });
    const data = await res.json();
    if (data.success) {
      setStep("otp");
    } else {
      setError(data.error === "Phone not found"
        ? (lang === "ar" ? "رقم الهاتف غير مسجل" : "Phone number not registered")
        : data.error);
    }
    setLoading(false);
  };

  const verifyAndProceed = async () => {
    setError("");
    if (code.length !== 6) {
      setError(t("auth.otpInvalid"));
      return;
    }
    setStep("newpass");
  };

  const resetPassword = async () => {
    setError("");
    if (newPassword.length < 6) {
      setError(t("auth.passwordShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: `965${phone}`, code, newPassword }),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess(t("auth.resetSuccess"));
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setError(data.error === "Invalid or expired code" ? t("auth.otpInvalid") : data.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t("auth.resetPassword")}</h1>
            <p className="text-sm text-gray-500 mt-1">{t("auth.resetSubtitle")}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
              {success}
            </div>
          )}

          {/* Step 1: Phone */}
          {step === "phone" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("auth.phone")}
                </label>
                <div className="flex" dir="ltr">
                  <span className="inline-flex items-center px-3 rounded-s-xl border border-e-0 border-gray-200 bg-gray-50 text-sm text-gray-500">
                    +965
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{8}"
                    maxLength={8}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    className="w-full px-4 py-2.5 rounded-e-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                    placeholder="XXXXXXXX"
                  />
                </div>
              </div>
              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "..." : t("auth.sendCode")}
              </button>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                {t("auth.codeSentTo")} <strong dir="ltr">+965{phone}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("auth.otpCode")}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="000000"
                  dir="ltr"
                />
              </div>
              <button
                onClick={verifyAndProceed}
                disabled={loading}
                className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {t("auth.verifyCode")}
              </button>
              <button
                onClick={sendOtp}
                className="w-full py-2 text-sm text-cyan-600 hover:underline"
              >
                {t("auth.resendCode")}
              </button>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === "newpass" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("auth.newPassword")}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("auth.confirmPassword")}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                onClick={resetPassword}
                disabled={loading}
                className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "..." : t("auth.resetBtn")}
              </button>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            <Link href="/login" className="text-cyan-600 font-medium hover:underline inline-flex items-center gap-1">
              <BackArrow className="w-3.5 h-3.5" />
              {t("auth.backToLogin")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
