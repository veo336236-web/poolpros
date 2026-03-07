"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Send, Upload, X, FileText, Image as ImageIcon, LogIn } from "lucide-react";
import Link from "next/link";
import { useLanguage, TranslationKey } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

const categories = ["pool", "fountain", "fish"] as const;
const governorates = ["Hawalli", "Capital", "Farwaniya", "Ahmadi", "Jahra", "Mubarak Al-Kabeer"] as const;

export default function NewAuctionPage() {
  const { t, lang } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    governorate: "",
    budget: "",
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert(lang === "ar" ? "يرجى اختيار صورة أو ملف PDF فقط" : "Please select an image or PDF file only");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(lang === "ar" ? "حجم الملف يجب أن يكون أقل من 5 ميجابايت" : "File size must be under 5MB");
      return;
    }

    setSelectedFile(file);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.fileName) {
        setUploadedFileName(data.fileName);
      }
    } catch {
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadedFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fileName: uploadedFileName }),
      });

      if (res.ok) {
        router.push("/auctions?success=1");
      }
    } catch {
      // error handled by UI
    } finally {
      setLoading(false);
    }
  };

  const isImage = selectedFile?.type.startsWith("image/");

  // Show login prompt if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-cyan-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t("auth.loginRequired")}</h2>
          <p className="text-sm text-gray-500 mb-6">
            {lang === "ar"
              ? "يجب تسجيل الدخول لتقديم طلب مزاد"
              : "You need to login to submit an auction request"}
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/login"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg transition-all"
            >
              {t("auth.login")}
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
            >
              {t("auth.register")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">{t("loading")}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/auctions"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-cyan-600 mb-6 transition-colors"
        >
          <ArrowRight className={`w-4 h-4 ${lang === "en" ? "rotate-180" : ""}`} />
          {t("auction.title")}
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("auction.submitRequest")}</h1>
          <p className="text-gray-500 text-sm mb-6">{t("auction.submitRequestDesc")}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("auction.category")} *
                </label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="">{t("auction.selectCategory")}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`auction.${cat}` as TranslationKey)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("auction.governorate")} *
                </label>
                <select
                  required
                  value={form.governorate}
                  onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="">{t("auction.selectGov")}</option>
                  {governorates.map((gov) => (
                    <option key={gov} value={gov}>
                      {t(`gov.${gov}` as TranslationKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("auction.projectTitle")} *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("auction.description")} *
              </label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("auction.budget")}
              </label>
              <div className="flex" dir="ltr">
                <span className="inline-flex items-center px-3 rounded-s-xl border border-e-0 border-gray-200 bg-gray-50 text-sm text-gray-500">
                  KWD
                </span>
                <input
                  type="text"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  placeholder="e.g. 500 - 1000"
                  className="w-full px-4 py-2.5 rounded-e-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("auction.file")}
              </label>
              {!selectedFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-cyan-400 hover:bg-cyan-50/30 transition-all group"
                >
                  <Upload className="w-8 h-8 text-gray-300 group-hover:text-cyan-500 mx-auto mb-2 transition-colors" />
                  <p className="text-sm text-gray-500 group-hover:text-cyan-600">
                    {lang === "ar" ? "اضغط لرفع ملف" : "Click to upload a file"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{t("auction.fileHint")}</p>
                </button>
              ) : (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-gray-50">
                  {isImage ? (
                    <ImageIcon className="w-8 h-8 text-cyan-500 shrink-0" />
                  ) : (
                    <FileText className="w-8 h-8 text-red-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400">
                      {(selectedFile.size / 1024).toFixed(0)} KB
                      {uploading && ` - ${t("auction.uploading")}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? t("auction.submitting") : t("auction.submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
