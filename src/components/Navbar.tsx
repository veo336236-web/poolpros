"use client";

import Link from "next/link";
import { useState } from "react";
import { Waves, Menu, X, Globe, LogOut, LayoutDashboard, ClipboardList, LogIn, CalendarCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { t, lang, setLang } = useLanguage();
  const { user, logout } = useAuth();

  const toggleLang = () => setLang(lang === "ar" ? "en" : "ar");

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Pool<span className="text-cyan-600">Pros</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-cyan-600 rounded-lg hover:bg-cyan-50 transition-all"
            >
              {t("nav.home")}
            </Link>
            <Link
              href="/explore?category=pool"
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-cyan-600 rounded-lg hover:bg-cyan-50 transition-all"
            >
              {t("nav.pools")}
            </Link>
            <Link
              href="/explore?category=fountain"
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-cyan-600 rounded-lg hover:bg-cyan-50 transition-all"
            >
              {t("nav.fountains")}
            </Link>
            <Link
              href="/explore?category=fish"
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-cyan-600 rounded-lg hover:bg-cyan-50 transition-all"
            >
              {t("nav.fish")}
            </Link>
            <Link
              href="/auctions"
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-cyan-600 rounded-lg hover:bg-cyan-50 transition-all"
            >
              {t("nav.auctions")}
            </Link>
            <button
              onClick={toggleLang}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-cyan-600 rounded-lg hover:bg-cyan-50 transition-all flex items-center gap-1.5"
            >
              <Globe className="w-4 h-4" />
              {lang === "ar" ? "EN" : "عربي"}
            </button>

            {/* Auth section */}
            {user ? (
              <div className="relative ms-2">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-cyan-600 rounded-lg hover:bg-cyan-50 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </button>

                {profileOpen && (
                  <div className="absolute end-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    {user.role === "partner" && (
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {t("partner.dashboard")}
                      </Link>
                    )}
                    <Link
                      href="/my-bookings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-all"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      {t("booking.myBookings")}
                    </Link>
                    <Link
                      href="/my-requests"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-all"
                    >
                      <ClipboardList className="w-4 h-4" />
                      {t("auth.myRequests")}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all w-full text-start"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("auth.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="ms-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-cyan-600 rounded-lg hover:bg-cyan-50 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                {t("auth.login")}
              </Link>
            )}

            <Link
              href="/list-business"
              className="ms-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-[0.98]"
            >
              {t("nav.listBusiness")}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-1 pt-3">
              <Link href="/" className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all" onClick={() => setMenuOpen(false)}>
                {t("nav.home")}
              </Link>
              <Link href="/explore?category=pool" className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all" onClick={() => setMenuOpen(false)}>
                {t("nav.pools")}
              </Link>
              <Link href="/explore?category=fountain" className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all" onClick={() => setMenuOpen(false)}>
                {t("nav.fountains")}
              </Link>
              <Link href="/explore?category=fish" className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all" onClick={() => setMenuOpen(false)}>
                {t("nav.fish")}
              </Link>
              <Link href="/auctions" className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all" onClick={() => setMenuOpen(false)}>
                {t("nav.auctions")}
              </Link>

              {/* Mobile auth */}
              {user ? (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <div className="px-3 py-2 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  </div>
                  {user.role === "partner" && (
                    <Link href="/dashboard" className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                      <LayoutDashboard className="w-4 h-4" />
                      {t("partner.dashboard")}
                    </Link>
                  )}
                  <Link href="/my-bookings" className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                    <CalendarCheck className="w-4 h-4" />
                    {t("booking.myBookings")}
                  </Link>
                  <Link href="/my-requests" className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                    <ClipboardList className="w-4 h-4" />
                    {t("auth.myRequests")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2 text-start"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("auth.logout")}
                  </button>
                </>
              ) : (
                <Link href="/login" className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                  <LogIn className="w-4 h-4" />
                  {t("auth.login")}
                </Link>
              )}

              <button
                onClick={() => { toggleLang(); setMenuOpen(false); }}
                className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all flex items-center gap-1.5 text-start"
              >
                <Globe className="w-4 h-4" />
                {lang === "ar" ? "English" : "عربي"}
              </button>
              <Link href="/list-business" className="mx-1 mt-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl text-center" onClick={() => setMenuOpen(false)}>
                {t("nav.listBusiness")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
