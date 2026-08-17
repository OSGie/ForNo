export type Persona = "firm" | "company";

export type Plan = {
  sku: string;
  name: string;
  description: string;
  annualPiastres: number;
  files: string;
  recommended?: boolean;
};

export type Addon = {
  sku: string;
  name: string;
  annualPiastres: number;
};

export const PLANS: Plan[] = [
  { sku: "founder", name: "رواد الأعمال", description: "لإدارة ملف واحد في بداية التحول الرقمي.", annualPiastres: 25000, files: "ملف واحد" },
  { sku: "professional", name: "باقة المحترف", description: "لفرق العمل التي تدير أكثر من ملف بثقة.", annualPiastres: 50000, files: "10 ملفات", recommended: true },
  { sku: "special", name: "الباقة الخاصة", description: "سعة نقاط أعلى للعمليات المتخصصة.", annualPiastres: 85000, files: "ملف واحد" },
  { sku: "expert", name: "باقة الخبير", description: "للمكاتب التي تريد تنظيمًا أوسع للملفات.", annualPiastres: 100000, files: "25 ملفًا" },
  { sku: "consultant", name: "باقة الاستشاري", description: "لإدارة محافظ عملاء متنامية.", annualPiastres: 180000, files: "50 ملفًا" },
  { sku: "elite", name: "باقة النخبة", description: "للمكاتب ذات حجم تشغيل كبير.", annualPiastres: 250000, files: "100 ملف" },
];

export const ADDONS: Addon[] = [
  { sku: "points", name: "شحن 9600 نقطة", annualPiastres: 60000 },
  { sku: "pos", name: "جهاز POS إضافي", annualPiastres: 50000 },
  { sku: "user", name: "مستخدم إضافي", annualPiastres: 5000 },
];

export const PROMO = {
  campaignId: "august-annual-2026",
  title: "خصم 10% على الاشتراك السنوي",
  subtitle: "فعّل خطتك قبل نهاية الشهر واستفد من العرض الحصري.",
  deadlineIso: "2026-08-31T23:59:59+03:00",
  discountBps: 1000,
  eligibleBillingCycle: "annual" as const,
};

export const ANALYTICS_DEMO_CONFIG = {
  status: "TEST" as const,
  gtmId: "GTM-DEMO-MOFAWTAR",
  ga4Id: "G-DEMO-MOFAWTAR",
  metaPixelId: "000000000000000",
};

export function isCampaignActive(now = new Date()) {
  return now.getTime() < new Date(PROMO.deadlineIso).getTime();
}

export function calculateQuote(planSku: string, addonSkus: string[], billingCycle: "annual" | "monthly" = "annual", now = new Date()) {
  const plan = PLANS.find(item => item.sku === planSku);
  if (!plan) throw new Error("Unknown plan");
  const chosenAddons = ADDONS.filter(item => addonSkus.includes(item.sku));
  const planPrice = billingCycle === "monthly" ? Math.round(plan.annualPiastres / 12) : plan.annualPiastres;
  const addonPrice = chosenAddons.reduce((sum, item) => sum + (billingCycle === "monthly" ? Math.round(item.annualPiastres / 12) : item.annualPiastres), 0);
  const subtotalPiastres = planPrice + addonPrice;
  const discountPiastres = billingCycle === PROMO.eligibleBillingCycle && isCampaignActive(now)
    ? Math.floor((subtotalPiastres * PROMO.discountBps) / 10000)
    : 0;
  const taxablePiastres = subtotalPiastres - discountPiastres;
  const vatPiastres = Math.round((taxablePiastres * 14) / 100);
  return {
    plan,
    addons: chosenAddons,
    billingCycle,
    subtotalPiastres,
    discountPiastres,
    vatPiastres,
    totalPiastres: taxablePiastres + vatPiastres,
    campaignId: discountPiastres > 0 ? PROMO.campaignId : null,
  };
}

export function formatEgp(piastres: number) {
  return new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 2 }).format(piastres / 100);
}
