import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Lang } from "@/data/catalog";

type Dict = Record<string, { ar: string; en: string }>;

export const translations: Dict = {
  // nav
  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.map": { ar: "الخريطة", en: "Map" },
  "nav.properties": { ar: "العروض العقارية", en: "Properties" },
  "nav.requestCta": { ar: "اطلب عقارك الآن", en: "Request a Property" },
  "nav.langToggle": { ar: "English", en: "العربية" },

  // hero
  "hero.badge": { ar: "مكتب طوس العقارية", en: "Tawoos Real Estate Office" },
  "hero.title": { ar: "وجهتك الموثوقة للعقارات", en: "Your trusted destination for real estate" },
  "hero.subtitle": {
    ar: "اكتشف أفضل العقارات المتاحة في المملكة العربية السعودية — فلل، أراضٍ، شقق ومشاريع استثمارية مختارة بعناية.",
    en: "Discover the finest properties across Saudi Arabia — villas, land, apartments and carefully curated investment projects.",
  },
  "hero.explore": { ar: "استكشف العروض", en: "Explore Offers" },

  // search
  "search.title": { ar: "ابحث عن عقارك", en: "Find Your Property" },
  "search.desire": { ar: "الغرض", en: "Purpose" },
  "search.city": { ar: "المدينة", en: "City" },
  "search.district": { ar: "الحي", en: "District" },
  "search.usage": { ar: "الاستخدام", en: "Usage" },
  "search.type": { ar: "نوع العقار", en: "Property Type" },
  "search.all": { ar: "الكل", en: "All" },
  "search.forSale": { ar: "للبيع", en: "For Sale" },
  "search.forRent": { ar: "للإيجار", en: "For Rent" },
  "search.allCities": { ar: "كل المدن", en: "All Cities" },
  "search.allDistricts": { ar: "كل الأحياء", en: "All Districts" },
  "search.allTypes": { ar: "كل الأنواع", en: "All Types" },
  "search.allUsages": { ar: "كل الاستخدامات", en: "All Uses" },
  "search.results": { ar: "عقار مطابق", en: "matching properties" },
  "search.reset": { ar: "مسح الفلاتر", en: "Clear filters" },
  "search.filters": { ar: "تصفية", en: "Filters" },

  // map
  "map.title": { ar: "الخريطة العقارية", en: "Property Map" },
  "map.subtitle": { ar: "تصفح العقارات على الخريطة", en: "Browse properties on the map" },

  // properties
  "properties.title": { ar: "العروض العقارية", en: "Property Offers" },
  "properties.subtitle": {
    ar: "اكتشف أحدث العقارات المتاحة للبيع والإيجار في مدن المملكة.",
    en: "Discover the latest properties for sale and rent across Saudi cities.",
  },
  "properties.available": { ar: "متاحة", en: "Available" },
  "properties.sold": { ar: "مباعة", en: "Sold" },
  "properties.soldStamp": { ar: "تم البيع", en: "SOLD" },
  "properties.areaUnit": { ar: "م²", en: "m²" },
  "properties.currency": { ar: "ر.س", en: "SAR" },
  "properties.perYear": { ar: "/ سنوياً", en: "/ yr" },
  "properties.noResults": { ar: "لا توجد عقارات مطابقة حالياً.", en: "No matching properties found." },

  // request form
  "form.title": { ar: "اطلب عقارك الآن", en: "Request Your Property" },
  "form.subtitle": { ar: "املأ النموذج وسنتواصل معك", en: "Fill the form and we will contact you" },
  "form.sectionRequest": { ar: "معلومات الطلب", en: "Request Details" },
  "form.sectionContact": { ar: "معلومات التواصل", en: "Contact Details" },
  "form.desire": { ar: "الرغبة", en: "Purpose" },
  "form.buy": { ar: "شراء", en: "Buy" },
  "form.rent": { ar: "إيجار", en: "Rent" },
  "form.usage": { ar: "نوع العقار", en: "Property Type" },
  "form.product": { ar: "المنتج العقاري", en: "Real Estate Product" },
  "form.region": { ar: "المنطقة", en: "Region" },
  "form.city": { ar: "المدينة", en: "City" },
  "form.budget": { ar: "الميزانية (ر.س)", en: "Budget (SAR)" },
  "form.name": { ar: "الاسم", en: "Name" },
  "form.phone": { ar: "رقم الجوال", en: "Mobile Number" },
  "form.message": { ar: "الرسالة", en: "Message" },
  "form.messagePlaceholder": { ar: "اكتب متطلباتك هنا...", en: "Write your requirements here..." },
  "form.namePlaceholder": { ar: "اسمك الكامل", en: "Your full name" },
  "form.select": { ar: "اختر", en: "Select" },
  "form.submit": { ar: "إرسال الطلب", en: "Submit Request" },
  "form.success": { ar: "تم إرسال طلبك بنجاح! سنتواصل معك قريباً.", en: "Your request was sent successfully! We will contact you soon." },
  "form.errPhone": { ar: "رقم جوال سعودي غير صحيح (يبدأ بـ 5)", en: "Invalid Saudi mobile number (must start with 5)" },
  "form.errName": { ar: "الاسم مطلوب", en: "Name is required" },

  // detail page
  "detail.back": { ar: "العودة للعروض", en: "Back to listings" },
  "detail.overview": { ar: "تفاصيل العقار", en: "Property Details" },
  "detail.ref": { ar: "رقم الإعلان", en: "Reference" },
  "detail.area": { ar: "المساحة", en: "Area" },
  "detail.price": { ar: "السعر", en: "Price" },
  "detail.type": { ar: "نوع العقار", en: "Type" },
  "detail.usage": { ar: "الاستخدام", en: "Usage" },
  "detail.purpose": { ar: "الغرض", en: "Purpose" },
  "detail.city": { ar: "المدينة", en: "City" },
  "detail.district": { ar: "الحي", en: "District" },
  "detail.region": { ar: "المنطقة", en: "Region" },
  "detail.bedrooms": { ar: "غرف النوم", en: "Bedrooms" },
  "detail.bathrooms": { ar: "دورات المياه", en: "Bathrooms" },
  "detail.livingRooms": { ar: "الصالات", en: "Living Rooms" },
  "detail.age": { ar: "عمر العقار", en: "Property Age" },
  "detail.ageNew": { ar: "جديد", en: "New" },
  "detail.years": { ar: "سنوات", en: "years" },
  "detail.street": { ar: "عرض الشارع", en: "Street Width" },
  "detail.meter": { ar: "م", en: "m" },
  "detail.features": { ar: "المميزات", en: "Features" },
  "detail.description": { ar: "الوصف", en: "Description" },
  "detail.locationTitle": { ar: "الموقع على الخريطة", en: "Location on Map" },
  "detail.requestThis": { ar: "استفسر عن هذا العقار", en: "Inquire About This Property" },
  "detail.gallery": { ar: "معرض الصور", en: "Gallery" },
  "detail.closeGallery": { ar: "إغلاق الصورة", en: "Close image" },
  "detail.notFound": { ar: "لم يتم العثور على العقار", en: "Property not found" },
  "detail.descGeneric": {
    ar: "عقار مميز بموقع استراتيجي وتشطيب عالي الجودة، مناسب للسكن أو الاستثمار. تتوفر كافة الخدمات والمرافق القريبة. لمزيد من التفاصيل وحجز المعاينة تواصل معنا عبر زر الاستفسار.",
    en: "A distinguished property in a strategic location with high-quality finishing, ideal for living or investment. All nearby services and facilities are available. Contact us via the inquiry button for more details and to book a viewing.",
  },
  "feature.finishing": { ar: "تشطيب فاخر", en: "Luxury Finishing" },
  "feature.parking": { ar: "مواقف سيارات", en: "Parking" },
  "feature.security": { ar: "أمن وحراسة", en: "Security" },
  "feature.location": { ar: "موقع استراتيجي", en: "Prime Location" },
  "feature.services": { ar: "قرب الخدمات", en: "Near Services" },
  "feature.ac": { ar: "تكييف مركزي", en: "Central A/C" },

  // detail sections (new ordering)
  "detail.sectionBasic": { ar: "المواصفات الأساسية", en: "Basic Specifications" },
  "detail.sectionServices": { ar: "الخدمات", en: "Services" },
  "detail.sectionUsage": { ar: "الاستخدام", en: "Usage" },
  "detail.sectionUnitFeatures": { ar: "مميزات الوحدة", en: "Unit Features" },
  "detail.sectionCharacteristics": { ar: "الخصائص", en: "Characteristics" },
  "detail.sectionAdInfo": { ar: "معلومات الإعلان", en: "Listing Information" },
  "detail.license": { ar: "رقم الرخصة", en: "License No." },
  "detail.streetEast": { ar: "عرض الشارع الشرقي", en: "East Street Width" },
  "detail.streetWest": { ar: "عرض الشارع الغربي", en: "West Street Width" },
  "detail.viewOnMap": { ar: "عرض على الخريطة", en: "View on Map" },
  "detail.similar": { ar: "عقارات مشابهة", en: "Similar Properties" },
  "detail.contactWhatsapp": { ar: "تواصل عبر واتساب", en: "Contact via WhatsApp" },
  "detail.registerInterest": { ar: "تسجيل اهتمام", en: "Register Interest" },
  "service.electricity": { ar: "كهرباء", en: "Electricity" },
  "service.water": { ar: "ماء", en: "Water" },
  "service.sewage": { ar: "صرف صحي", en: "Sewage" },

  // interest dialog
  "interest.title": { ar: "تسجيل اهتمام", en: "Register Interest" },
  "interest.subtitle": { ar: "أدخل بياناتك وسيتواصل معك فريقنا.", en: "Enter your details and our team will contact you." },
  "interest.submit": { ar: "إرسال", en: "Send" },
  "interest.success": { ar: "تم تسجيل اهتمامك بنجاح! سنتواصل معك قريباً.", en: "Your interest has been registered! We will contact you soon." },

  // map page
  "map.viewOffer": { ar: "تفاصيل العرض", en: "View Offer" },
  "map.pageTitle": { ar: "خريطة العروض العقارية", en: "Properties Map" },
  "map.pageSubtitle": {
    ar: "تصفّح جميع عروض مكتب طوس العقارية على الخريطة واضغط على أي موقع لعرض تفاصيله.",
    en: "Browse all Tawoos Real Estate Office offers on the map and click any marker to view its details.",
  },

  // whatsapp / footer
  "whatsapp.label": { ar: "تواصل عبر واتساب", en: "Chat on WhatsApp" },
  "footer.rights": { ar: "جميع الحقوق محفوظة.", en: "All rights reserved." },
  "footer.contactTitle": { ar: "تواصل معنا", en: "Contact Us" },
  "footer.email": { ar: "البريد الرسمي", en: "Official Email" },
  "footer.phone": { ar: "رقم الهاتف", en: "Phone Number" },
  "footer.soon": { ar: "يُضاف لاحقاً", en: "Coming soon" },

  // first-visit tour
  "tour.skip": { ar: "تخطي", en: "Skip" },
  "tour.next": { ar: "التالي", en: "Next" },
  "tour.back": { ar: "السابق", en: "Back" },
  "tour.done": { ar: "إنهاء الجولة", en: "Finish tour" },
  "tour.step": { ar: "الخطوة", en: "Step" },
  "tour.lastSlide": { ar: "الشريحة الأخيرة", en: "Last slide" },
  "tour.finishTitle": { ar: "أصبحت جاهزاً", en: "You’re all set" },
  "tour.finishBody": {
    ar: "هذه آخر شريحة في الجولة. يمكنك الآن تصفح العروض، طلب عقار، أو التواصل مع فريق مكتب طوس العقارية في أي وقت.",
    en: "This is the last slide. You can now browse listings, request a property, or contact the Tawoos Real Estate Office team anytime.",
  },
  "tour.welcomeTitle": { ar: "مرحباً بك في مكتب طوس العقارية", en: "Welcome to Tawoos Real Estate Office" },
  "tour.welcomeBody": {
    ar: "جولة سريعة تعرفك بأهم أجزاء الموقع: البحث، العروض، طلب عقار، والتواصل.",
    en: "A short tour of search, listings, property requests, and contact.",
  },
  "tour.searchTitle": { ar: "ابحث عن عقارك", en: "Find a property" },
  "tour.searchBody": {
    ar: "اختر للبيع أو للإيجار، ثم اضغط أيقونة التصفية لتحديد المدينة ونوع العقار.",
    en: "Choose for sale or rent, then tap the filter icon to set city and property type.",
  },
  "tour.listingsTitle": { ar: "تصفّح العروض", en: "Browse listings" },
  "tour.listingsBody": {
    ar: "اضغط أي عرض لرؤية الصور والتفاصيل والسعر، أو سجّل اهتمامك مباشرة.",
    en: "Open any listing for photos, details and price, or register your interest.",
  },
  "tour.requestTitle": { ar: "اطلب عقارك", en: "Request a property" },
  "tour.requestBody": {
    ar: "إذا لم تجد طلبك، أرسل مواصفاتك وسيتواصل معك الفريق.",
    en: "If you don’t find what you need, send your requirements and the team will contact you.",
  },
  "tour.whatsappTitle": { ar: "تواصل فوري", en: "Chat instantly" },
  "tour.whatsappBody": {
    ar: "زر واتساب للتواصل المباشر مع فريق مكتب طوس العقارية في أي وقت.",
    en: "Use WhatsApp to reach the Tawoos Real Estate Office team anytime.",
  },
};

interface LanguageContextValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang]);

  const value: LanguageContextValue = {
    lang,
    dir: lang === "ar" ? "rtl" : "ltr",
    setLang,
    toggle: () => setLang(lang === "ar" ? "en" : "ar"),
    t: (key: string) => translations[key]?.[lang] ?? key,
  };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
