import { describe, expect, it } from "vitest";
import { PLANS } from "@shared/poc";
import claims from "./claims.ar.json";
import layout from "./layout.ar.json";
import sales from "./sales.ar.json";

describe("محتوى قسم الفيديو التوضيحي", () => {
  it("يحتوي على أربع لقطات تشغيلية مميزة وزر ديمو واضح", () => {
    expect(layout.demo.booking).toBe("احجز ديمو 15 دقيقة مع مختص");
    expect(layout.demo.tabs).toHaveLength(4);
    expect(layout.demo.tabs.map(tab => tab.id)).toEqual(["files", "vat", "form41", "permissions"]);
    expect(layout.demo.tabs.every(tab => tab.label && tab.title && tab.body && tab.metric && tab.detail)).toBe(true);
  });

  it("يعرض لمسار مكتب المحاسبة تحديات العمل اليدوي الأربع وخاتمة الحل", () => {
    expect(layout.firm.pain.title).toContain("آخر الشهر");
    expect(layout.firm.pain.items).toHaveLength(4);
    expect(layout.firm.pain.items.map(item => item.label)).toEqual(["دخول متكرر", "بحث مرهق", "تجميع يدوي", "صلاحيات غائبة"]);
    expect(layout.firm.value.title).toContain("محتاج نظام منظم");
  });

  it("يفصل قدرات المنتج المتاحة عن المخطط لها ويحفظ رسائلها ضمن سجل الادعاءات", () => {
    expect(layout.capabilities.items.map(item => item.id)).toEqual(["reader", "sender", "payroll", "firms"]);
    expect(layout.capabilities.items.map(item => item.status)).toEqual(["available", "special", "coming", "coming"]);
    expect(Object.values(claims.capabilities).every(claim => claim.isPlaceholder && claim.body)).toBe(true);
  });

  it("يعرض لوحة إصدار توضيحية بأربع حالات مستندات دون الادعاء بتفعيل تكامل PayTabs", () => {
    expect(claims.issuance.isPlaceholder).toBe(true);
    expect(claims.issuance.compliance).toBe("متوافق مع متطلبات مصلحة الضرائب المصرية");
    expect(claims.issuance.documents.map(document => document.status)).toEqual(["مقبول", "تنبيه", "مجدولة", "إلغاء"]);
    expect(claims.issuance.benefits.at(-1)).toContain("مرحلة لاحقة");
  });

  it("يوضح رحلة ما بعد الاشتراك في ثلاث خطوات دون تقديم وسائل الدفع كتكاملات مفعلة", () => {
    expect(claims.onboarding.isPlaceholder).toBe(true);
    expect(claims.onboarding.steps.map(step => step.number)).toEqual(["01", "02", "03"]);
    expect(claims.onboarding.steps.at(-1)?.title).toBe("صدّر أول تقرير");
    expect(claims.onboarding.paymentNote).toContain("رابط تجريبي");
  });

  it("يعرض هدية حاسبة المرتبات بعد جمع البريد والهاتف مع رابط الأداة المعتمد", () => {
    expect(sales.leadMagnet.email).toBeTruthy();
    expect(sales.leadMagnet.phone).toBeTruthy();
    expect(sales.leadMagnet.url).toBe("https://mofawtar.com/tax-calculator-2/");
  });

  it("يحسب قيمة الملف الشهرية لباقات المكاتب من السعر والسعة الفعليين", () => {
    const monthlyFileCost = (sku: string) => {
      const plan = PLANS.find(item => item.sku === sku);
      if (!plan) throw new Error("missing plan");
      return (plan.annualPiastres / 100) / plan.fileCount / 12;
    };
    expect(monthlyFileCost("professional")).toBeCloseTo(4.1666, 3);
    expect(monthlyFileCost("expert")).toBeCloseTo(3.3333, 3);
    expect(monthlyFileCost("elite")).toBeCloseTo(2.0833, 3);
    expect(sales.pricing.body).toContain("14 يومًا وفق الشروط");
  });

  it("يفصل رسائل الـHero لمكاتب المحاسبة عن مسار المحاسب أو الشركة", () => {
    expect(sales.firm.title).toContain("آخر الشهر");
    expect(sales.company.title).toContain("الفواتير والتقارير");
    expect(sales.firm.secondary).toContain("النظام");
    expect(sales.company.secondary).toContain("حاسبة المرتبات");
    expect(sales.firm.visual.title).not.toBe(sales.company.visual.title);
  });

  it("يوفر فوتر موفوتر بيانات الموقع والروابط والتواصل القابلة للتحرير", () => {
    expect(layout.footer.address).toContain("المقطم");
    expect(layout.footer.quickLinks.map(link => link.id)).toContain("pricing");
    expect(layout.footer.social).toHaveLength(3);
    expect(layout.footer.contacts.map(contact => contact.kind)).toEqual(["phone", "phone", "email"]);
    expect(layout.footer.legal).toContain("سياسة الخصوصية");
  });

  it("يعرض لكل شخصية شريط قرار مختصر يقود مباشرة إلى اختيار الباقة", () => {
    expect(sales.decision.firm.items).toHaveLength(3);
    expect(sales.decision.company.items).toHaveLength(3);
    expect(sales.decision.firm.cta).toContain("المكتب");
    expect(sales.decision.company.cta).toContain("باقتك");
    expect(sales.decision.firm.title).not.toBe(sales.decision.company.title);
  });
});
