import { describe, expect, it } from "vitest";
import layout from "./layout.ar.json";

describe("محتوى قسم الفيديو التوضيحي", () => {
  it("يحتوي على أربع لقطات تشغيلية مميزة وزر ديمو واضح", () => {
    expect(layout.demo.booking).toBe("احجز ديمو 15 دقيقة مع مختص");
    expect(layout.demo.tabs).toHaveLength(4);
    expect(layout.demo.tabs.map(tab => tab.id)).toEqual(["files", "vat", "form41", "permissions"]);
    expect(layout.demo.tabs.every(tab => tab.label && tab.title && tab.body && tab.metric && tab.detail)).toBe(true);
  });
});
