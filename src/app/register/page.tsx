"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Waves, Sparkles, Fish } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const { t, lang } = useLanguage();
  const { register } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer" as "customer" | "partner",
    businessName: "",
    categories: [] as string[],
  });
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError(t("auth.passwordShort"));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    if (form.phone.length !== 8) {
      setError(lang === "ar" ? "أدخل رقم هاتف صحيح" : "Enter a valid phone number");
      return;
    }
    if (form.role === "partner" && form.categories.length === 0) {
      setError(lang === "ar" ? "اختر فئة واحدة على الأقل" : "Select at least one category");
      return;
    }

    setLoading(true);
    // Send OTP to verify phone
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: `965${form.phone}`, purpose: "register" }),
    });
    const data = await res.json();

    if (data.success) {
      setStep("otp");
    } else {
      setError(
        data.error === "Phone already registered"
          ? t("auth.phoneExists")
          : data.error || (lang === "ar" ? "فشل إرسال رمز التحقق" : "Failed to send verification code")
      );
    }
    setLoading(false);
  };

  const doRegister = async () => {
    setLoading(true);
    const result = await register({
      name: form.name,
      phone: form.phone,
      password: form.password,
      role: form.role,
      businessName: form.businessName,
      categories: form.categories.join(","),
    });

    if (result.success) {
      router.push(form.role === "partner" ? "/dashboard" : "/");
    } else {
      setError(
        result.error === "Phone number already registered"
          ? t("auth.phoneExists")
          : result.error || ""
      );
    }
    setLoading(false);
  };

  const handleVerifyAndRegister = async () => {
    setError("");
    if (otpCode.length !== 6) {
      setError(t("auth.otpInvalid"));
      return;
    }

    setLoading(true);

    // Verify OTP first
    const verifyRes = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: `965${form.phone}`, code: otpCode }),
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      setError(t("auth.otpInvalid"));
      setLoading(false);
      return;
    }

    // OTP verified — register account
    await doRegister();
  };

  const resendOtp = async () => {
    setLoading(true);
    await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: `965${form.phone}`, purpose: "register" }),
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t("auth.register")}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {step === "otp" ? t("auth.verifyPhone") : t("auth.registerSubtitle")}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Step 1: Registration Form */}
          {step === "form" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Account type toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("auth.accountType")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: "customer" })}
                    className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                      form.role === "customer"
                        ? "bg-cyan-50 border-cyan-300 text-cyan-700"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {t("auth.registerAsCustomer")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: "partner" })}
                    className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                      form.role === "partner"
                        ? "bg-cyan-50 border-cyan-300 text-cyan-700"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {t("auth.registerAsPartner")}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("auth.name")} *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                />
              </div>

              {form.role === "partner" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t("auth.businessName")} *
                    </label>
                    <input
                      type="text"
                      required={form.role === "partner"}
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {lang === "ar" ? "الفئات *" : "Categories *"}
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                      {lang === "ar" ? "اختر فئة واحدة أو أكثر" : "Select one or more categories"}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "pool", label: lang === "ar" ? "أحواض سباحة" : "Pools", icon: <Waves className="w-5 h-5" /> },
                        { id: "fountain", label: lang === "ar" ? "نوافير" : "Fountains", icon: <Sparkles className="w-5 h-5" /> },
                        { id: "fish", label: lang === "ar" ? "أحواض أسماك" : "Fish Pools", icon: <Fish className="w-5 h-5" /> },
                      ].map((cat) => {
                        const selected = form.categories.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setForm({
                                ...form,
                                categories: selected
                                  ? form.categories.filter((c) => c !== cat.id)
                                  : [...form.categories, cat.id],
                              });
                            }}
                            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-all ${
                              selected
                                ? "bg-cyan-50 border-cyan-300 text-cyan-700"
                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}
                          >
                            {cat.icon}
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("auth.phone")} *
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
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                    className="w-full px-4 py-2.5 rounded-e-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("auth.password")} *
                </label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("auth.confirmPassword")} *
                </label>
                <input
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "..." : t("auth.registerBtn")}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                {t("auth.codeSentTo")} <strong dir="ltr">+965{form.phone}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("auth.otpCode")}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="000000"
                  dir="ltr"
                />
              </div>
              <button
                onClick={handleVerifyAndRegister}
                disabled={loading}
                className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "..." : t("auth.verifyCode")}
              </button>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setStep("form"); setError(""); }}
                  className="text-sm text-gray-500 hover:underline"
                >
                  {lang === "ar" ? "رجوع" : "Back"}
                </button>
                <button
                  onClick={resendOtp}
                  disabled={loading}
                  className="text-sm text-cyan-600 hover:underline disabled:opacity-50"
                >
                  {t("auth.resendCode")}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            {t("auth.hasAccount")}{" "}
            <Link href="/login" className="text-cyan-600 font-medium hover:underline">
              {t("auth.login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
