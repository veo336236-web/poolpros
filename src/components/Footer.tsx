"use client";

import Link from "next/link";
import { Waves } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                <Waves className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Pool<span className="text-cyan-400">Pros</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">{t("footer.about")}</p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">{t("footer.services")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/explore?category=pool" className="hover:text-cyan-400 transition-colors">{t("nav.pools")}</Link></li>
              <li><Link href="/explore?category=fountain" className="hover:text-cyan-400 transition-colors">{t("nav.fountains")}</Link></li>
              <li><Link href="/explore?category=fish" className="hover:text-cyan-400 transition-colors">{t("nav.fish")}</Link></li>
              <li><Link href="/explore" className="hover:text-cyan-400 transition-colors">{t("cat.maintenance")}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">{t("footer.company")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">{t("footer.aboutUs")}</Link></li>
              <li><Link href="/list-business" className="hover:text-cyan-400 transition-colors">{t("nav.listBusiness")}</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">{t("footer.contact")}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">{t("footer.contact")}</h4>
            <ul className="space-y-2 text-sm">
              <li dir="ltr" className="text-start">info@poolpros.store</li>
              <li dir="ltr" className="text-start">+965 9477 0839</li>
              <li>{t("gov.Hawalli")}, Kuwait</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center">
          <p className="text-sm">{t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}
