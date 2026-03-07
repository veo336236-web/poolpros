"use client";

import Link from "next/link";
import {
  Waves,
  Sparkles,
  Fish,
  Search,
  ShieldCheck,
  Star,
  Wrench,
  Settings,
  ArrowLeft,
  ArrowRight,
  Users,
  CheckCircle,
  Zap,
  MapPin,
  Gavel,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function Home() {
  const { t, lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  const categories = [
    {
      href: "/explore?category=pool",
      icon: <Waves className="w-8 h-8" />,
      title: t("cat.pools"),
      desc: t("cat.poolsDesc"),
      color: "from-cyan-500 to-blue-600",
      shadow: "shadow-cyan-500/25",
    },
    {
      href: "/explore?category=fountain",
      icon: <Sparkles className="w-8 h-8" />,
      title: t("cat.fountains"),
      desc: t("cat.fountainsDesc"),
      color: "from-teal-500 to-emerald-600",
      shadow: "shadow-teal-500/25",
    },
    {
      href: "/explore?category=fish",
      icon: <Fish className="w-8 h-8" />,
      title: t("cat.fish"),
      desc: t("cat.fishDesc"),
      color: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/25",
    },
    {
      href: "/explore",
      icon: <Settings className="w-8 h-8" />,
      title: t("cat.maintenance"),
      desc: t("cat.maintenanceDesc"),
      color: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/25",
    },
    {
      href: "/explore",
      icon: <Zap className="w-8 h-8" />,
      title: t("cat.equipment"),
      desc: t("cat.equipmentDesc"),
      color: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/25",
    },
    {
      href: "/explore",
      icon: <Wrench className="w-8 h-8" />,
      title: t("cat.repairs"),
      desc: t("cat.repairsDesc"),
      color: "from-rose-500 to-red-600",
      shadow: "shadow-rose-500/25",
    },
  ];

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-700 via-teal-700 to-cyan-900">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-cyan-100 text-sm font-medium mb-6">
            <ShieldCheck className="w-4 h-4" />
            {t("hero.trusted")}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
            {t("hero.title1")}
            <br />
            <span className="bg-gradient-to-r from-cyan-200 to-teal-200 bg-clip-text text-transparent">
              {t("hero.title2")}
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-cyan-100/70 max-w-2xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </div>
      </section>

      {/* ── Service Categories Grid ─────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-10 space-y-4">
        {/* Top 3: Pools, Fountains, Fish */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {categories.slice(0, 3).map((cat, i) => (
            <Link
              key={i}
              href={cat.href}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 p-4 sm:p-5 text-center transition-all duration-200 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-3 text-white shadow-lg ${cat.shadow} group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                {cat.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed hidden sm:block">
                {cat.desc}
              </p>
            </Link>
          ))}
        </div>

        {/* Auctions — featured banner */}
        <Link
          href="/auctions"
          className="group block bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
              <Gavel className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5">
                {t("auction.homeCta")}
              </h3>
              <p className="text-sm text-indigo-100">
                {t("auction.homeDesc")}
              </p>
            </div>
            <Arrow className="w-5 h-5 text-white/60 group-hover:text-white transition-colors shrink-0" />
          </div>
        </Link>

        {/* Bottom 3: Maintenance, Equipment, Repairs */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {categories.slice(3).map((cat, i) => (
            <Link
              key={i}
              href={cat.href}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 p-4 sm:p-5 text-center transition-all duration-200 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-3 text-white shadow-lg ${cat.shadow} group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                {cat.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed hidden sm:block">
                {cat.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {[
            { value: "8+", label: t("stats.providers"), icon: <Users className="w-5 h-5 text-cyan-600" /> },
            { value: "7,600+", label: t("stats.completed"), icon: <CheckCircle className="w-5 h-5 text-cyan-600" /> },
            { value: "4.8", label: t("stats.rating"), icon: <Star className="w-5 h-5 text-cyan-600" /> },
            { value: "6", label: t("stats.areas"), icon: <MapPin className="w-5 h-5 text-cyan-600" /> },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                {stat.icon}
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {stat.value}
                </span>
              </div>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            {t("howItWorks.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
            {[
              {
                icon: <Search className="w-6 h-6 text-cyan-600" />,
                step: "01",
                title: t("howItWorks.step1Title"),
                desc: t("howItWorks.step1Desc"),
              },
              {
                icon: <Star className="w-6 h-6 text-cyan-600" />,
                step: "02",
                title: t("howItWorks.step2Title"),
                desc: t("howItWorks.step2Desc"),
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-cyan-600" />,
                step: "03",
                title: t("howItWorks.step3Title"),
                desc: t("howItWorks.step3Desc"),
              },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="text-5xl font-extrabold text-cyan-100 absolute -top-2 start-1/2 -translate-x-1/2">
                  {item.step}
                </div>
                <div className="relative w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse All CTA ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
        <div className="bg-gradient-to-br from-cyan-600 to-teal-700 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              {lang === "ar" ? "ابدأ الآن" : "Get Started Now"}
            </h2>
            <p className="text-cyan-100/70 mb-6 max-w-lg mx-auto">
              {lang === "ar"
                ? "تصفح جميع مزودي الخدمة واحجز الخدمة التي تحتاجها في دقائق"
                : "Browse all service providers and book the service you need in minutes"}
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-cyan-700 bg-white rounded-xl hover:bg-cyan-50 shadow-lg shadow-black/10 active:scale-[0.98] transition-all"
            >
              {t("hero.browse")}
              <Arrow className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
