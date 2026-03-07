"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Phone,
  ArrowRight,
  ChevronDown,
  Headphones,
  HelpCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const WHATSAPP_NUMBER = "96594770839";

export default function SupportPage() {
  const { t, lang } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const defaultMessage =
    lang === "ar"
      ? "مرحباً، أحتاج مساعدة من بول بروز الكويت"
      : "Hi, I need help from PoolPros Kuwait";

  const chatUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(defaultMessage)}`;
  const callUrl = `https://wa.me/${WHATSAPP_NUMBER}`;

  const faqs = [
    { q: t("support.faq1q"), a: t("support.faq1a") },
    { q: t("support.faq2q"), a: t("support.faq2a") },
    { q: t("support.faq3q"), a: t("support.faq3a") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#075E54] to-[#128C7E] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-emerald-100 hover:text-white transition-colors mb-6"
          >
            <ArrowRight className={`w-4 h-4 ${lang === "en" ? "rotate-180" : ""}`} />
            {t("nav.home")}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Headphones className="w-7 h-7" />
            <h1 className="text-2xl sm:text-3xl font-bold">{t("support.pageTitle")}</h1>
          </div>
          <p className="text-emerald-100 text-sm sm:text-base">
            {t("support.pageSubtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* WhatsApp Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Chat */}
          <a
            href={chatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#25D366]/30 transition-all p-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#25D366] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {t("support.whatsappTitle")}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t("support.whatsappDesc")}
            </p>
          </a>

          {/* Call */}
          <a
            href={callUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#075E54]/30 transition-all p-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#075E54] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Phone className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {t("support.callTitle")}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t("support.callBtnDesc")}
            </p>
          </a>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <HelpCircle className="w-5 h-5 text-[#075E54]" />
            <h2 className="text-lg font-semibold text-gray-900">{t("support.faq")}</h2>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-start hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
