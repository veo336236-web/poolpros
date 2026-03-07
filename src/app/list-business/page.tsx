"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Waves,
  Sparkles,
  Fish,
  CheckCircle2,
  ChevronDown,
  Mail,
  Phone,
  Building2,
  MapPin,
  Hash,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

type Step = 1 | 2 | 3;

export default function ListBusinessPage() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const NextArrow = isAr ? ArrowLeft : ArrowRight;
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    businessName: "",
    category: "",
    email: "",
    phone: "",
    governorate: "",
    branches: "1",
    description: "",
    agreeTerms: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.agreeTerms) {
      setError(isAr ? "يجب الموافقة على الشروط والأحكام" : "You must agree to the terms");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.businessName,
          ownerName: form.email,
          phone: form.phone,
          category: form.category,
          governorate: form.governorate,
          description: `${isAr ? "عدد الفروع" : "Branches"}: ${form.branches}\n${form.description}`,
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError(isAr ? "حدث خطأ. حاول مرة أخرى." : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) return form.businessName && form.category && form.email && form.phone;
    if (step === 2) return form.governorate && form.branches;
    return true;
  };

  const categories = [
    {
      value: "pool",
      icon: <Waves className="w-7 h-7" />,
      label: isAr ? "أحواض السباحة" : "Swimming Pools",
    },
    {
      value: "fountain",
      icon: <Sparkles className="w-7 h-7" />,
      label: isAr ? "النوافير" : "Fountains",
    },
    {
      value: "fish",
      icon: <Fish className="w-7 h-7" />,
      label: isAr ? "أحواض الأسماك" : "Fish Pools",
    },
  ];

  const governorates = [
    { value: "Hawalli", label: isAr ? "حولي" : "Hawalli" },
    { value: "Capital", label: isAr ? "العاصمة" : "Capital" },
    { value: "Farwaniya", label: isAr ? "الفروانية" : "Farwaniya" },
    { value: "Ahmadi", label: isAr ? "الأحمدي" : "Ahmadi" },
    { value: "Jahra", label: isAr ? "الجهراء" : "Jahra" },
    { value: "Mubarak Al-Kabeer", label: isAr ? "مبارك الكبير" : "Mubarak Al-Kabeer" },
  ];

  const categoryLabel = (val: string) => categories.find((c) => c.value === val)?.label || val;

  // ── Step Indicator ─────────────────────────────────────────
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-0 mb-8">
      {[3, 2, 1].map((s, idx) => (
        <div key={s} className="flex items-center" style={{ direction: "rtl" }}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= s
                ? "bg-cyan-600 text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {s}
          </div>
          {idx < 2 && (
            <div
              className={`w-12 h-0.5 transition-all ${
                step > s ? "bg-cyan-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // ── Success State ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {isAr ? "تم إرسال طلبك بنجاح!" : "Application Submitted!"}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {isAr
              ? "شكراً لاهتمامك. سيتواصل معك فريقنا خلال 24 ساعة."
              : "Thank you for your interest. Our team will contact you within 24 hours."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 transition-all"
          >
            {isAr ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 sm:p-8 relative">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {isAr ? "كن شريك بول بروز" : "Become a PoolPros Partner"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAr
              ? "انضم إلى أكبر شبكة خدمات أحواض في الكويت"
              : "Join Kuwait's largest pool services network"}
          </p>
        </div>

        {/* Steps */}
        <StepIndicator />

        {/* ── STEP 1 ──────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Company Name */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                {isAr ? "اسم الشركة" : "Company Name"}
                <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder={isAr ? "اسم النشاط التجاري" : "Business name"}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Service Type - Card Selection */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-3">
                {isAr ? "نوع الخدمة" : "Service Type"}
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.value })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                      form.category === cat.value
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {cat.icon}
                    <span className="text-xs font-medium leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {isAr ? "البريد الإلكتروني" : "Email"}
                <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={isAr ? "example@company.com" : "example@company.com"}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 text-gray-400" />
                {isAr ? "رقم الهاتف" : "Phone Number"}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-3 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 bg-gray-50 shrink-0">
                  <span>KW</span>
                  <span>+965</span>
                </div>
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{8}"
                  maxLength={8}
                  value={form.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                    setForm({ ...form, phone: val });
                  }}
                  placeholder="XXXXXXXX"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Next Button */}
            <button
              type="button"
              disabled={!canGoNext()}
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isAr ? "التالي" : "Next"}
              <NextArrow className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 2 ──────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Governorate / City */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                {isAr ? "المدينة" : "City"}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={form.governorate}
                  onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white appearance-none"
                  style={{ color: form.governorate ? "#111827" : "#9ca3af" }}
                >
                  <option value="">{isAr ? "اختر المدينة" : "Select city"}</option>
                  {governorates.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 end-3 pointer-events-none" />
              </div>
            </div>

            {/* Number of Branches */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4 text-gray-400" />
                {isAr ? "عدد الفروع" : "Number of Branches"}
                <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                min="1"
                value={form.branches}
                onChange={(e) => setForm({ ...form, branches: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                <BackArrow className="w-4 h-4" />
                {isAr ? "رجوع" : "Back"}
              </button>
              <button
                type="button"
                disabled={!canGoNext()}
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isAr ? "التالي" : "Next"}
                <NextArrow className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ──────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Additional Info */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {isAr ? "معلومات إضافية (اختياري)" : "Additional Information (optional)"}
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={
                  isAr
                    ? "أخبرنا المزيد عن عملك والخدمات المقدمة أو أي أسئلة لديك"
                    : "Tell us more about your business, services offered, or any questions"
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Application Summary */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                {isAr ? "ملخص الطلب" : "Application Summary"}
              </h3>
              <div className="space-y-2.5 text-sm">
                {[
                  { label: isAr ? "اسم الشركة:" : "Company:", value: form.businessName },
                  { label: isAr ? "نوع الخدمة:" : "Service:", value: categoryLabel(form.category) },
                  { label: isAr ? "البريد الإلكتروني:" : "Email:", value: form.email },
                  { label: isAr ? "رقم الهاتف:" : "Phone:", value: `+965 ${form.phone}` },
                  {
                    label: isAr ? "المدينة:" : "City:",
                    value: governorates.find((g) => g.value === form.governorate)?.label || form.governorate,
                  },
                  { label: isAr ? "عدد الفروع:" : "Branches:", value: form.branches },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="font-medium text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.agreeTerms}
                onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-600">
                {isAr ? (
                  <>
                    أوافق على{" "}
                    <span className="text-cyan-600 font-medium">الشروط والأحكام</span>
                    {" "}و{" "}
                    <span className="text-cyan-600 font-medium">سياسة الخصوصية</span>
                  </>
                ) : (
                  <>
                    I agree to the{" "}
                    <span className="text-cyan-600 font-medium">Terms & Conditions</span>
                    {" "}and{" "}
                    <span className="text-cyan-600 font-medium">Privacy Policy</span>
                  </>
                )}
              </span>
            </label>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                <BackArrow className="w-4 h-4" />
                {isAr ? "رجوع" : "Back"}
              </button>
              <button
                type="button"
                disabled={loading || !form.agreeTerms}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading
                  ? (isAr ? "جار الإرسال..." : "Submitting...")
                  : (isAr ? "إرسال الطلب" : "Submit Application")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
