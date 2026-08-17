import content from "@/content/poc.ar.json";
import { getPocContext, usePocTracking } from "@/hooks/usePocTracking";
import { ADDONS, formatEgp, PLANS } from "@shared/poc";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Check, LockKeyhole } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

export default function Checkout() {
  const [location, setLocation] = useLocation();
  const track = usePocTracking();
  const search = useMemo(() => new URLSearchParams(location.split("?")[1] ?? ""), [location]);
  const [planSku, setPlanSku] = useState(search.get("plan") ?? sessionStorage.getItem("mof_selected_plan") ?? "professional");
  const [persona] = useState<"firm" | "company">((search.get("persona") as "firm" | "company") ?? "firm");
  const [cycle, setCycle] = useState<"annual" | "monthly">("annual");
  const [addons, setAddons] = useState<string[]>([]);
  const quote = trpc.poc.quote.useQuery({ planSku, addonSkus: addons, billingCycle: cycle });
  const createOrder = trpc.poc.createOrder.useMutation();
  const plan = PLANS.find(item => item.sku === planSku);

  useEffect(() => { track("checkout_started", { persona, uiContext: "checkout" }); }, [track, persona]);
  const toggleAddon = (sku: string) => setAddons(current => current.includes(sku) ? current.filter(item => item !== sku) : [...current, sku]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const context = getPocContext();
    createOrder.mutate({ visitorId: context.visitorId, persona, name: String(form.get("name")), email: String(form.get("email")), phone: String(form.get("phone")), planSku, addonSkus: addons, billingCycle: cycle }, { onSuccess: result => setLocation(`/demo-payment/${result.paymentToken}`) });
  };

  return <div className="min-h-screen bg-[#fbfbff] py-8 md:py-14"><div className="container">
    <div className="mb-9 flex items-center justify-between"><a href="/" className="flex items-center"><img src="/manus-storage/mofawtar-wordmark_74721d27.png" alt="مفوتر" className="h-9"/></a><a href="/" className="flex items-center gap-2 text-sm font-bold text-[#4046B5]"><ArrowRight className="h-4 w-4"/>{content.checkout.back}</a></div>
    <div className="grid gap-7 lg:grid-cols-[1fr_.78fr]">
      <form onSubmit={submit} className="rounded-[2rem] border border-[#4046B5]/10 bg-white p-6 md:p-9">
        <p className="mof-eyebrow">{content.checkout.eyebrow}</p><h1 className="mt-4 text-3xl font-extrabold">{content.checkout.title}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[#5b5c72]">{content.checkout.body}</p>
        <section className="mt-9"><h2 className="text-lg font-extrabold">بيانات التواصل</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="customer-name">{content.checkout.name}</Label><Input id="customer-name" name="name" required/></div><div className="grid gap-2"><Label htmlFor="customer-phone">{content.checkout.phone}</Label><Input id="customer-phone" name="phone" required dir="ltr" inputMode="tel"/></div><div className="grid gap-2 sm:col-span-2"><Label htmlFor="customer-email">{content.checkout.email}</Label><Input id="customer-email" name="email" type="email" required dir="ltr"/></div></div></section>
        <section className="mt-9"><div className="flex items-end justify-between"><h2 className="text-lg font-extrabold">اختر باقتك</h2><span className="text-xs text-[#64657a]">{persona === "firm" ? "تجربة مكتب محاسبة" : "تجربة شركة"}</span></div><RadioGroup value={planSku} onValueChange={setPlanSku} className="mt-4 grid gap-3">{PLANS.slice(0, 3).map(item => <label key={item.sku} className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${planSku === item.sku ? "border-[#4046B5] bg-[#ECECF7]" : "border-[#4046B5]/12"}`}><div className="flex items-center gap-3"><RadioGroupItem value={item.sku}/><div><p className="font-extrabold">{item.name}</p><p className="text-xs text-[#64657a]">{item.files}</p></div></div><span className="font-[Inter] text-sm font-bold" dir="ltr">{formatEgp(item.annualPiastres)}</span></label>)}</RadioGroup></section>
        <section className="mt-9"><h2 className="text-lg font-extrabold">{content.checkout.cycle}</h2><div className="mt-4 flex gap-3"><button type="button" onClick={() => setCycle("annual")} className={`rounded-xl border px-5 py-3 text-sm font-bold ${cycle === "annual" ? "border-[#4046B5] bg-[#4046B5] text-white" : "border-[#4046B5]/12"}`}>{content.pricing.annual}</button><button type="button" onClick={() => setCycle("monthly")} className={`rounded-xl border px-5 py-3 text-sm font-bold ${cycle === "monthly" ? "border-[#4046B5] bg-[#4046B5] text-white" : "border-[#4046B5]/12"}`}>{content.pricing.monthly}</button></div></section>
        <section className="mt-9"><h2 className="text-lg font-extrabold">{content.checkout.addons}</h2><p className="mt-2 text-xs text-[#64657a]">اختر فقط ما تحتاجه؛ سيظهر أثره في الإجمالي فورًا.</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{ADDONS.map(item => <label key={item.sku} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#4046B5]/10 p-3 text-sm"><Checkbox checked={addons.includes(item.sku)} onCheckedChange={() => toggleAddon(item.sku)}/><span className="flex-1 font-bold">{item.name}</span><span className="font-[Inter] text-xs text-[#64657a]">{formatEgp(cycle === "annual" ? item.annualPiastres : Math.round(item.annualPiastres / 12))}</span></label>)}</div></section>
        <Button type="submit" disabled={createOrder.isPending || !quote.data} className="mt-10 h-13 w-full rounded-xl bg-[#4046B5] text-base hover:bg-[#343aa0]">{content.checkout.payment}<LockKeyhole className="mr-2 h-4 w-4"/></Button>{createOrder.error && <p className="mt-3 text-sm text-destructive">{createOrder.error.message}</p>}
      </form>
      <aside className="h-fit rounded-[2rem] border border-[#4046B5]/10 bg-[#07081A] p-6 text-white lg:sticky lg:top-8"><p className="text-xs font-bold tracking-[.18em] text-[#bfc2ff]">{content.checkout.summary}</p><div className="mt-7 border-b border-white/10 pb-6"><p className="text-xl font-extrabold">{plan?.name}</p><p className="mt-2 text-sm text-white/60">{plan?.description}</p></div><div className="space-y-4 py-6 text-sm"><div className="flex justify-between"><span className="text-white/65">{content.checkout.subtotal}</span><strong dir="ltr">{quote.data ? formatEgp(quote.data.subtotalPiastres) : "…"}</strong></div><div className="flex justify-between"><span className="text-white/65">{content.checkout.discount}</span><strong dir="ltr" className="text-[#c6c9ff]">-{quote.data ? formatEgp(quote.data.discountPiastres) : "…"}</strong></div><div className="flex justify-between"><span className="text-white/65">{content.checkout.vat}</span><strong dir="ltr">{quote.data ? formatEgp(quote.data.vatPiastres) : "…"}</strong></div></div><div className="rounded-2xl bg-white/10 p-4"><div className="flex items-end justify-between"><span className="font-bold">{content.checkout.total}</span><strong className="font-[Inter] text-2xl" dir="ltr">{quote.data ? formatEgp(quote.data.totalPiastres) : "…"}</strong></div></div><p className="mt-5 flex items-center gap-2 text-xs leading-6 text-white/55"><Check className="h-4 w-4 text-[#bfc2ff]"/>سيظهر العرض التجريبي بوضوح قبل الاعتماد.</p></aside>
    </div>
  </div></div>;
}
