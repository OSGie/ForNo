import { describe, expect, it } from "vitest";
import claims from "./claims.ar.json";
import layout from "./layout.ar.json";

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
});
