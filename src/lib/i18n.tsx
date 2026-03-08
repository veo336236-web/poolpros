"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "ar" | "en";

const translations = {
  // Navbar
  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.pools": { ar: "أحواض السباحة", en: "Swimming Pools" },
  "nav.fountains": { ar: "النوافير", en: "Fountains" },
  "nav.fish": { ar: "أحواض الأسماك", en: "Fish Pools" },
  "nav.listBusiness": { ar: "كن شريكنا", en: "Become a Partner" },

  // Hero
  "hero.trusted": {
    ar: "موثوق من قبل أكثر من 1,200 صاحب منزل في الكويت",
    en: "Trusted by 1,200+ homeowners in Kuwait",
  },
  "hero.title1": { ar: "ماذا تحتاج", en: "What do you need" },
  "hero.title2": { ar: "من مساعدة اليوم؟", en: "help with today?" },
  "hero.subtitle": {
    ar: "تواصل مع متخصصين موثقين في أحواض السباحة والنوافير وأحواض الأسماك في الكويت.",
    en: "Connect with verified pool, fountain, and fish pool professionals across Kuwait.",
  },
  "hero.browse": { ar: "تصفح", en: "Browse" },

  // Service Categories (homepage grid)
  "cat.pools": { ar: "أحواض السباحة", en: "Swimming Pools" },
  "cat.poolsDesc": {
    ar: "تنظيف، صيانة، إصلاح وتركيب",
    en: "Cleaning, maintenance, repair & installation",
  },
  "cat.fountains": { ar: "النوافير", en: "Fountains" },
  "cat.fountainsDesc": {
    ar: "تصميم، تركيب، تنظيف وإصلاح",
    en: "Design, installation, cleaning & repair",
  },
  "cat.fish": { ar: "أحواض الأسماك", en: "Fish Pools" },
  "cat.fishDesc": {
    ar: "تركيب، صيانة، تنظيف وتوريد",
    en: "Setup, maintenance, cleaning & supply",
  },
  "cat.maintenance": { ar: "عقود الصيانة", en: "Maintenance Contracts" },
  "cat.maintenanceDesc": {
    ar: "خطط صيانة أسبوعية وشهرية وسنوية",
    en: "Weekly, monthly & annual maintenance plans",
  },
  "cat.equipment": { ar: "المعدات والقطع", en: "Equipment & Parts" },
  "cat.equipmentDesc": {
    ar: "مضخات، فلاتر، مبردات وإضاءة",
    en: "Pumps, filters, chillers & lighting",
  },
  "cat.repairs": { ar: "الإصلاحات", en: "Repairs" },
  "cat.repairsDesc": {
    ar: "إصلاح التسريبات، البلاط والتجديد",
    en: "Leak fixing, tile repair & renovation",
  },

  // How It Works
  "howItWorks.title": { ar: "كيف يعمل", en: "How It Works" },
  "howItWorks.step1Title": { ar: "اختر خدمة", en: "Choose a Service" },
  "howItWorks.step1Desc": {
    ar: "اختر فئة وتصفح مزودي الخدمة بالقرب منك.",
    en: "Pick a category and browse providers near you.",
  },
  "howItWorks.step2Title": { ar: "قارن واختر", en: "Compare & Decide" },
  "howItWorks.step2Desc": {
    ar: "اقرأ التقييمات، قارن الأسعار، وتحقق من التصنيفات.",
    en: "Read reviews, compare prices, and check ratings.",
  },
  "howItWorks.step3Title": { ar: "احجز بثقة", en: "Book with Confidence" },
  "howItWorks.step3Desc": {
    ar: "احجز مع متخصصين موثقين وادفع بأمان.",
    en: "Book verified professionals and pay securely.",
  },

  // Stats
  "stats.providers": { ar: "مزود خدمة", en: "Service Providers" },
  "stats.completed": { ar: "عمل مكتمل", en: "Completed Jobs" },
  "stats.rating": { ar: "تقييم العملاء", en: "Customer Rating" },
  "stats.areas": { ar: "مناطق التغطية", en: "Coverage Areas" },

  // Footer
  "footer.rights": {
    ar: "© 2026 بول بروز الكويت. جميع الحقوق محفوظة.",
    en: "© 2026 PoolPros Kuwait. All rights reserved.",
  },
  "footer.about": {
    ar: "المنصة الرائدة لخدمات أحواض السباحة والنوافير وأحواض الأسماك في الكويت",
    en: "Kuwait's leading platform for pool, fountain & fish pool services",
  },
  "footer.services": { ar: "الخدمات", en: "Services" },
  "footer.company": { ar: "الشركة", en: "Company" },
  "footer.aboutUs": { ar: "من نحن", en: "About Us" },
  "footer.contact": { ar: "تواصل معنا", en: "Contact Us" },

  // Explore
  "explore.poolServices": {
    ar: "خدمات أحواض السباحة",
    en: "Swimming Pool Services",
  },
  "explore.fountainServices": { ar: "خدمات النوافير", en: "Fountain Services" },
  "explore.fishServices": { ar: "خدمات أحواض الأسماك", en: "Fish Pool Services" },
  "explore.allServices": { ar: "جميع الخدمات", en: "All Services" },
  "explore.providersFound": {
    ar: "في الكويت",
    en: "found in Kuwait",
  },
  "explore.provider": { ar: "مزود خدمة", en: "provider" },
  "explore.providers": { ar: "مزودي خدمة", en: "providers" },
  "explore.filters": { ar: "فلاتر", en: "Filters" },
  "explore.noProviders": {
    ar: "لم يتم العثور على مزودين",
    en: "No providers found",
  },
  "explore.noProvidersDesc": {
    ar: "حاول تعديل الفلاتر لرؤية المزيد من النتائج.",
    en: "Try adjusting your filters to see more results.",
  },
  "explore.resetFilters": {
    ar: "إعادة تعيين الفلاتر",
    en: "Reset Filters",
  },

  // Filter Sidebar
  "filter.title": { ar: "فلاتر", en: "Filters" },
  "filter.reset": { ar: "إعادة تعيين", en: "Reset" },
  "filter.serviceType": { ar: "نوع الخدمة", en: "Service Type" },
  "filter.maxPrice": { ar: "الحد الأقصى للسعر", en: "Max Price" },
  "filter.governorate": { ar: "المحافظة / المنطقة", en: "Governorate / Area" },
  "filter.kwd": { ar: "د.ك", en: "KWD" },

  // Service Types
  "serviceType.construction": { ar: "الإنشاء", en: "Construction" },
  "serviceType.maintenance": { ar: "الصيانة", en: "Maintenance" },
  "serviceType.equipment": { ar: "المعدات", en: "Equipment" },
  "serviceType.supplies": { ar: "المستلزمات", en: "Supplies" },
  "serviceType.repairs": { ar: "الإصلاحات", en: "Repairs" },
  "serviceType.add-ons": { ar: "الإضافات", en: "Add-ons" },

  // Governorates
  "gov.All Areas": { ar: "جميع المناطق", en: "All Areas" },
  "gov.Hawalli": { ar: "حولي", en: "Hawalli" },
  "gov.Capital": { ar: "العاصمة", en: "Capital" },
  "gov.Farwaniya": { ar: "الفروانية", en: "Farwaniya" },
  "gov.Ahmadi": { ar: "الأحمدي", en: "Ahmadi" },
  "gov.Jahra": { ar: "الجهراء", en: "Jahra" },
  "gov.Mubarak Al-Kabeer": { ar: "مبارك الكبير", en: "Mubarak Al-Kabeer" },

  // Provider Card
  "card.verified": { ar: "موثق", en: "Verified" },
  "card.pool": { ar: "حوض سباحة", en: "Swimming Pool" },
  "card.fountain": { ar: "نافورة", en: "Fountain" },
  "card.fish": { ar: "حوض أسماك", en: "Fish Pool" },
  "card.reviews": { ar: "تقييم", en: "reviews" },
  "card.viewProfile": { ar: "عرض الخدمات والمنتجات", en: "View Services & Products" },

  // Provider Detail
  "provider.back": { ar: "العودة للنتائج", en: "Back to results" },
  "provider.verified": { ar: "موثق", en: "Verified" },
  "provider.reviews": { ar: "تقييم", en: "reviews" },
  "provider.yearsInBusiness": { ar: "سنة في العمل", en: "years in business" },
  "provider.jobsCompleted": { ar: "عمل مكتمل", en: "jobs completed" },
  "provider.aboutUs": { ar: "من نحن", en: "About Us" },
  "provider.ourServices": { ar: "خدماتنا", en: "Our Services" },
  "provider.bookNow": { ar: "احجز الآن", en: "Book Now" },
  "provider.getInTouch": { ar: "تواصل معنا", en: "Get in Touch" },
  "provider.whatsapp": { ar: "تواصل عبر واتساب", en: "Contact via WhatsApp" },
  "provider.callNow": { ar: "اتصل الآن", en: "Call Now" },
  "provider.whatsappMessage": {
    ar: "مرحباً، وجدتكم على بول بروز الكويت. أود الاستفسار عن خدماتكم.",
    en: "Hi, I found you on PoolPros Kuwait. I'd like to inquire about your services.",
  },

  // Loading
  "loading": { ar: "جار التحميل...", en: "Loading..." },

  // Auctions
  "nav.auctions": { ar: "المزادات", en: "Auctions" },
  "auction.title": { ar: "طلبات المزادات", en: "Auction Requests" },
  "auction.subtitle": {
    ar: "قدّم طلبك واحصل على أفضل العروض من مزودي الخدمة",
    en: "Submit your request and get the best offers from service providers",
  },
  "auction.newRequest": { ar: "طلب جديد", en: "New Request" },
  "auction.submitRequest": { ar: "تقديم طلب مزاد", en: "Submit Auction Request" },
  "auction.submitRequestDesc": {
    ar: "اوصف مشروعك واحصل على عروض تنافسية من مزودي الخدمة",
    en: "Describe your project and get competitive offers from service providers",
  },
  "auction.yourName": { ar: "الاسم الكامل", en: "Full Name" },
  "auction.phone": { ar: "رقم الهاتف", en: "Phone Number" },
  "auction.category": { ar: "نوع الخدمة", en: "Service Type" },
  "auction.projectTitle": { ar: "عنوان المشروع", en: "Project Title" },
  "auction.description": { ar: "وصف المشروع", en: "Project Description" },
  "auction.governorate": { ar: "المحافظة", en: "Governorate" },
  "auction.budget": { ar: "الميزانية التقريبية", en: "Approximate Budget" },
  "auction.submit": { ar: "إرسال الطلب", en: "Submit Request" },
  "auction.submitting": { ar: "جار الإرسال...", en: "Submitting..." },
  "auction.success": {
    ar: "تم تقديم طلبك بنجاح! سيتواصل معك مزودو الخدمة قريباً.",
    en: "Your request has been submitted! Service providers will contact you soon.",
  },
  "auction.bids": { ar: "عرض", en: "bid" },
  "auction.bidsPlural": { ar: "عروض", en: "bids" },
  "auction.noBids": { ar: "لا توجد عروض بعد", en: "No bids yet" },
  "auction.submitBid": { ar: "تقديم عرض", en: "Submit Bid" },
  "auction.providerName": { ar: "اسم مزود الخدمة", en: "Provider Name" },
  "auction.price": { ar: "السعر (د.ك)", en: "Price (KWD)" },
  "auction.bidDescription": { ar: "تفاصيل العرض", en: "Bid Details" },
  "auction.duration": { ar: "مدة التنفيذ", en: "Duration" },
  "auction.open": { ar: "مفتوح", en: "Open" },
  "auction.closed": { ar: "مغلق", en: "Closed" },
  "auction.noAuctions": { ar: "لا توجد طلبات مزادات حالياً", en: "No auction requests yet" },
  "auction.viewBids": { ar: "عرض العروض", en: "View Bids" },
  "auction.selectCategory": { ar: "اختر نوع الخدمة", en: "Select service type" },
  "auction.selectGov": { ar: "اختر المحافظة", en: "Select governorate" },
  "auction.pool": { ar: "إنشاء حمام سباحة", en: "Build Swimming Pool" },
  "auction.fountain": { ar: "إنشاء نافورة", en: "Build Fountain" },
  "auction.fish": { ar: "إنشاء حوض أسماك", en: "Build Fish Pool" },
  "auction.file": { ar: "مرفق (صورة أو PDF)", en: "Attachment (Image or PDF)" },
  "auction.fileHint": { ar: "الحد الأقصى 5 ميجابايت - JPG, PNG, PDF", en: "Max 5MB - JPG, PNG, PDF" },
  "auction.uploading": { ar: "جار الرفع...", en: "Uploading..." },
  "auction.heroDesc": {
    ar: "هل تريد إنشاء حمام سباحة أو نافورة أو حوض أسماك؟ قدّم طلبك واحصل على عروض تنافسية من أفضل مزودي الخدمة في الكويت. قارن الأسعار واختر العرض الأنسب لك.",
    en: "Want to build a swimming pool, fountain, or fish pool? Submit your request and get competitive offers from the best service providers in Kuwait. Compare prices and choose the best offer.",
  },
  "auction.howItWorks1": { ar: "قدّم طلبك مع تفاصيل المشروع", en: "Submit your request with project details" },
  "auction.howItWorks2": { ar: "يتنافس مزودو الخدمة لتقديم أفضل عرض", en: "Providers compete to offer the best deal" },
  "auction.howItWorks3": { ar: "قارن العروض واختر الأنسب لك", en: "Compare offers and choose what suits you" },
  "auction.homeCta": { ar: "المزادات", en: "Auctions" },
  "auction.homeDesc": { ar: "قدّم طلبك واحصل على أفضل عروض الأسعار", en: "Submit requests and get the best price offers" },

  // Auth
  "auth.login": { ar: "تسجيل الدخول", en: "Login" },
  "auth.register": { ar: "إنشاء حساب", en: "Create Account" },
  "auth.logout": { ar: "تسجيل الخروج", en: "Logout" },
  "auth.name": { ar: "الاسم الكامل", en: "Full Name" },
  "auth.phone": { ar: "رقم الهاتف", en: "Phone Number" },
  "auth.password": { ar: "كلمة المرور", en: "Password" },
  "auth.confirmPassword": { ar: "تأكيد كلمة المرور", en: "Confirm Password" },
  "auth.loginBtn": { ar: "دخول", en: "Sign In" },
  "auth.registerBtn": { ar: "إنشاء حساب", en: "Sign Up" },
  "auth.noAccount": { ar: "ليس لديك حساب؟", en: "Don't have an account?" },
  "auth.hasAccount": { ar: "لديك حساب بالفعل؟", en: "Already have an account?" },
  "auth.registerAsCustomer": { ar: "عميل", en: "Customer" },
  "auth.registerAsPartner": { ar: "شريك / مزود خدمة", en: "Partner / Provider" },
  "auth.accountType": { ar: "نوع الحساب", en: "Account Type" },
  "auth.businessName": { ar: "اسم الشركة", en: "Business Name" },
  "auth.loginSubtitle": { ar: "سجل دخولك للوصول إلى حسابك", en: "Sign in to access your account" },
  "auth.registerSubtitle": { ar: "أنشئ حسابك للبدء", en: "Create your account to get started" },
  "auth.phoneExists": { ar: "رقم الهاتف مسجل بالفعل", en: "Phone number already registered" },
  "auth.invalidCredentials": { ar: "رقم الهاتف أو كلمة المرور غير صحيحة", en: "Invalid phone or password" },
  "auth.passwordMismatch": { ar: "كلمات المرور غير متطابقة", en: "Passwords do not match" },
  "auth.passwordShort": { ar: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", en: "Password must be at least 6 characters" },
  "auth.myAccount": { ar: "حسابي", en: "My Account" },
  "auth.myRequests": { ar: "طلباتي", en: "My Requests" },
  "auth.loginRequired": { ar: "يجب تسجيل الدخول أولاً", en: "Please login first" },
  "auth.forgotPassword": { ar: "نسيت كلمة المرور؟", en: "Forgot password?" },
  "auth.resetPassword": { ar: "إعادة تعيين كلمة المرور", en: "Reset Password" },
  "auth.resetSubtitle": { ar: "أدخل رقم هاتفك وسنرسل لك رمز التحقق عبر واتساب", en: "Enter your phone number and we'll send a verification code via WhatsApp" },
  "auth.sendCode": { ar: "إرسال الرمز", en: "Send Code" },
  "auth.verifyCode": { ar: "تحقق من الرمز", en: "Verify Code" },
  "auth.otpCode": { ar: "رمز التحقق", en: "Verification Code" },
  "auth.otpSent": { ar: "تم إرسال رمز التحقق إلى واتساب", en: "Verification code sent to WhatsApp" },
  "auth.otpInvalid": { ar: "الرمز غير صحيح", en: "Invalid code" },
  "auth.newPassword": { ar: "كلمة المرور الجديدة", en: "New Password" },
  "auth.resetBtn": { ar: "تغيير كلمة المرور", en: "Change Password" },
  "auth.resetSuccess": { ar: "تم تغيير كلمة المرور بنجاح", en: "Password changed successfully" },
  "auth.verifyPhone": { ar: "تحقق من رقم الهاتف", en: "Verify Phone Number" },
  "auth.codeSentTo": { ar: "تم إرسال الرمز إلى", en: "Code sent to" },
  "auth.resendCode": { ar: "إعادة إرسال الرمز", en: "Resend Code" },
  "auth.backToLogin": { ar: "العودة لتسجيل الدخول", en: "Back to Login" },

  // Partner Dashboard
  "partner.dashboard": { ar: "لوحة التحكم", en: "Dashboard" },
  "partner.myProducts": { ar: "منتجاتي وخدماتي", en: "My Products & Services" },
  "partner.addProduct": { ar: "إضافة منتج/خدمة", en: "Add Product/Service" },
  "partner.productTitle": { ar: "اسم المنتج/الخدمة", en: "Product/Service Name" },
  "partner.productDesc": { ar: "الوصف", en: "Description" },
  "partner.productCategory": { ar: "الفئة الرئيسية", en: "Main Category" },
  "partner.subCategory": { ar: "الفئة الفرعية", en: "Sub Category" },
  "partner.selectMain": { ar: "اختر الفئة الرئيسية", en: "Select main category" },
  "partner.selectSub": { ar: "اختر الفئة الفرعية", en: "Select sub category" },

  // Main categories
  "pcat.pool": { ar: "حمامات سباحة", en: "Swimming Pools" },
  "pcat.fish": { ar: "أحواض أسماك", en: "Fish Pools" },
  "pcat.fountain": { ar: "نوافير", en: "Fountains" },

  // Sub categories (services)
  "psub.maintenance": { ar: "صيانة", en: "Maintenance" },
  "psub.cleaning": { ar: "تنظيف", en: "Cleaning" },
  "psub.repairs": { ar: "إصلاحات", en: "Repairs" },
  "psub.equipment": { ar: "معدات وقطع غيار", en: "Equipment & Parts" },
  "psub.supplies": { ar: "مستلزمات", en: "Supplies" },
  "psub.addons": { ar: "إضافات", en: "Add-ons" },
  "psub.design": { ar: "تصميم", en: "Design" },
  "partner.productPrice": { ar: "السعر", en: "Price" },
  "partner.auctionRequests": { ar: "طلبات المزادات", en: "Auction Requests" },
  "partner.noProducts": { ar: "لا توجد منتجات بعد", en: "No products yet" },
  "partner.deleteProduct": { ar: "حذف", en: "Delete" },
  "partner.save": { ar: "حفظ", en: "Save" },

  // Reviews
  "review.title": { ar: "التقييمات", en: "Reviews" },
  "review.writeReview": { ar: "اكتب تقييم", en: "Write a Review" },
  "review.rating": { ar: "التقييم", en: "Rating" },
  "review.comment": { ar: "تعليقك", en: "Your Comment" },
  "review.submit": { ar: "إرسال التقييم", en: "Submit Review" },
  "review.submitting": { ar: "جار الإرسال...", en: "Submitting..." },
  "review.noReviews": { ar: "لا توجد تقييمات بعد", en: "No reviews yet" },
  "review.loginToReview": { ar: "سجل دخولك لكتابة تقييم", en: "Login to write a review" },
  "review.thankYou": { ar: "شكراً لتقييمك!", en: "Thank you for your review!" },
  "review.alreadyReviewed": { ar: "لقد قمت بتقييم هذا الشريك مسبقاً", en: "You have already reviewed this partner" },

  // Support / WhatsApp
  "support.title": { ar: "دعم بول بروز", en: "PoolPros Support" },
  "support.subtitle": { ar: "نرد عادةً خلال دقائق", en: "We typically reply in minutes" },
  "support.chat": { ar: "محادثة واتساب", en: "WhatsApp Chat" },
  "support.chatDesc": { ar: "تحدث مع فريق الدعم", en: "Chat with our support team" },
  "support.call": { ar: "مكالمة واتساب", en: "WhatsApp Call" },
  "support.callDesc": { ar: "اتصل بنا مباشرة", en: "Call us directly" },
  "support.poweredBy": { ar: "مدعوم بالذكاء الاصطناعي", en: "Powered by AI" },
  "support.pageTitle": { ar: "الدعم والمساعدة", en: "Support & Help" },
  "support.pageSubtitle": { ar: "كيف يمكننا مساعدتك؟", en: "How can we help you?" },
  "support.whatsappTitle": { ar: "تواصل عبر واتساب", en: "Contact via WhatsApp" },
  "support.whatsappDesc": { ar: "أسرع طريقة للتواصل - دعم بالذكاء الاصطناعي متاح 24/7", en: "Fastest way to reach us - AI support available 24/7" },
  "support.callTitle": { ar: "اتصل بنا", en: "Call Us" },
  "support.callBtnDesc": { ar: "مكالمة واتساب مباشرة مع فريق الدعم", en: "Direct WhatsApp call with support team" },
  "support.faq": { ar: "الأسئلة الشائعة", en: "FAQ" },
  "support.faq1q": { ar: "كيف أسجل كمزود خدمة؟", en: "How do I register as a service provider?" },
  "support.faq1a": { ar: "أنشئ حساب شريك من صفحة التسجيل واضف منتجاتك وخدماتك.", en: "Create a partner account from the registration page and add your products and services." },
  "support.faq2q": { ar: "كيف تعمل المزادات؟", en: "How do auctions work?" },
  "support.faq2a": { ar: "قدّم طلبك مع تفاصيل المشروع، ويتنافس مزودو الخدمة لتقديم أفضل عرض.", en: "Submit your request with project details, and providers compete to offer the best deal." },
  "support.faq3q": { ar: "هل الخدمة مجانية؟", en: "Is the service free?" },
  "support.faq3a": { ar: "نعم، التصفح وتقديم الطلبات مجاني تماماً للعملاء.", en: "Yes, browsing and submitting requests is completely free for customers." },
} as const;

export type TranslationKey = keyof typeof translations;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  dir: "rtl" | "ltr";
}

const I18nContext = createContext<I18nContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const t = (key: TranslationKey): string => translations[key][lang];
  const dir = lang === "ar" ? "rtl" : "ltr" as const;

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
