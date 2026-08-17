import { describe, expect, it } from "vitest";
import { calculateQuote } from "@shared/poc";
import { buildDemoContractHtml, makeContractNumber } from "./poc-contract";

describe("PoC pricing", () => {
  it("calculates annual discount and VAT using integer piastres", () => {
    const quote = calculateQuote("founder", [], "annual", new Date("2026-08-20T10:00:00+03:00"));
    expect(quote.subtotalPiastres).toBe(25000);
    expect(quote.discountPiastres).toBe(2500);
    expect(quote.vatPiastres).toBe(3150);
    expect(quote.totalPiastres).toBe(25650);
  });
  it("does not apply an expired campaign", () => {
    const quote = calculateQuote("founder", [], "annual", new Date("2026-09-02T10:00:00+03:00"));
    expect(quote.discountPiastres).toBe(0);
    expect(quote.totalPiastres).toBe(28500);
  });
});

describe("PoC contract", () => {
  it("creates the prescribed contract numbering format and retains legal text", () => {
    expect(makeContractNumber(42, new Date("2026-08-17T00:00:00Z"))).toBe("MOF-CON-2026-000042");
    const html = buildDemoContractHtml("MOF-CON-2026-000042", { customerName: "شركة اختبار", email: "demo@example.com", phone: "01000000000", planName: "باقة المحترف", packagePrice: "500", vat: "70", discount: "0", total: "570" });
    expect(html).toContain("يحق طلب الاسترداد خلال 14 يوماً وفق الشروط.");
    expect(html).toContain("شركة اختبار");
  });
});
