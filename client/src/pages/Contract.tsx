import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import content from "@/content/poc.ar.json";
import { trpc } from "@/lib/trpc";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { ArrowRight, Download, FileCheck2, FileText, Loader2, Printer, ShieldCheck } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";

export default function Contract() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/contract/:token");
  const token = params?.token ?? "";
  const order = trpc.poc.getOrder.useQuery({ token }, { enabled: Boolean(token) });
  const contract = trpc.poc.getContract.useQuery({ token }, { enabled: Boolean(token), retry: false });
  const create = trpc.poc.createContract.useMutation({ onSuccess: () => void contract.refetch() });
  const documentRef = useRef<HTMLDivElement>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const returnToSuccess = () => setLocation(`/success/${token}`);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    create.mutate({ token, details: { customerName: String(form.get("name")), email: String(form.get("email")), phone: String(form.get("phone")), taxCard: String(form.get("taxCard") ?? ""), nationalId: String(form.get("nationalId") ?? ""), commercialRegister: String(form.get("commercialRegister") ?? ""), address: String(form.get("address") ?? "") } });
  };

  const exportPdf = async (openForPrint = false) => {
    if (!documentRef.current || !contract.data) return;
    setPdfBusy(true);
    try {
      const pages = Array.from(documentRef.current.querySelectorAll<HTMLElement>(".pdf-page"));
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      for (let index = 0; index < pages.length; index += 1) {
        const canvas = await html2canvas(pages[index], { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false, windowWidth: pages[index].scrollWidth });
        if (index > 0) pdf.addPage("a4", "portrait");
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297, undefined, "FAST");
      }
      if (openForPrint) {
        const url = URL.createObjectURL(pdf.output("blob"));
        window.open(url, "_blank", "noopener,noreferrer");
        window.setTimeout(() => URL.revokeObjectURL(url), 30000);
      } else {
        pdf.save(`${contract.data.contractNumber}.pdf`);
      }
    } finally { setPdfBusy(false); }
  };

  if (order.isLoading || contract.isLoading) return <div className="grid min-h-screen place-items-center">جارٍ فتح بيانات العقد…</div>;
  if (order.error || !order.data) return <div className="grid min-h-screen place-items-center p-6 text-center">تعذر العثور على الطلب. ارجع إلى صفحة الدفع التجريبي وافتح رابط العقد من جديد.</div>;
  if (order.data.status !== "PAID_DEMO") return <div className="grid min-h-screen place-items-center p-6 text-center">العقد متاح بعد اعتماد الدفع التجريبي فقط.</div>;
  if (contract.error) return <div className="grid min-h-screen place-items-center p-6 text-center">تعذر فتح العقد الآن. أعد المحاولة بعد لحظات.</div>;

  if (contract.data) return (
    <div className="min-h-screen bg-[#ECECF7] py-5 md:py-8">
      <div className="container">
        <div className="mb-5 flex flex-col gap-4 rounded-[1.8rem] border border-[#4046B5]/12 bg-white p-4 shadow-[0_20px_50px_-38px_#4046B5] md:flex-row md:items-center md:justify-between md:p-5">
          <div className="flex items-center gap-3"><Button variant="outline" onClick={returnToSuccess} className="h-10 rounded-xl border-[#4046B5]/18 bg-[#fbfbff] text-[#4046B5] hover:bg-[#EDEEF9]"><ArrowRight className="ml-2 h-4 w-4"/>العودة لتأكيد الدفع</Button><div className="hidden h-8 w-px bg-[#4046B5]/12 md:block"/><p className="text-xs font-bold text-[#61627a]">احتفظ بالنسخة بعد تنزيلها ضمن سجلاتك</p></div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1b875e]"><ShieldCheck className="h-4 w-4"/>تم اعتماد الدفع التجريبي</div>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[1fr_18rem]">
          <section className="overflow-hidden rounded-[2rem] border border-[#4046B5]/12 bg-white shadow-[0_26px_70px_-50px_#07081A]">
            <div className="flex flex-col gap-5 border-b border-[#4046B5]/10 bg-gradient-to-l from-[#0B0B22] to-[#272d82] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
              <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#dfe1ff]"><FileCheck2 className="h-7 w-7"/></span><div><p className="text-xs font-bold tracking-[.14em] text-[#c8cbff]">عقد اشتراك موفوتر</p><h1 className="mt-1 font-[Inter] text-xl font-extrabold" dir="ltr">{contract.data.contractNumber}</h1></div></div>
              <div className="flex flex-wrap gap-3"><Button disabled={pdfBusy} onClick={() => void exportPdf(true)} variant="outline" className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white hover:text-[#4046B5]"><Printer className="ml-2 h-4 w-4"/>معاينة PDF</Button><Button disabled={pdfBusy} onClick={() => void exportPdf(false)} className="rounded-xl bg-white text-[#4046B5] hover:bg-[#EDEEF9]">{pdfBusy ? <Loader2 className="ml-2 h-4 w-4 animate-spin"/> : <Download className="ml-2 h-4 w-4"/>}تنزيل PDF</Button></div>
            </div>
            <div className="bg-[#dfe1ed] p-3 md:p-6"><div className="max-h-[74vh] overflow-auto rounded-[1.35rem] border border-[#c9ccdb] bg-[#cfd2df] p-2 md:p-4"><div ref={documentRef} className="contract-document mx-auto w-fit" dangerouslySetInnerHTML={{ __html: contract.data.html }}/></div></div>
          </section>

          <aside className="rounded-[1.7rem] border border-[#4046B5]/12 bg-white p-5 shadow-[0_20px_50px_-42px_#4046B5] xl:sticky xl:top-28">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EDEEF9] text-[#4046B5]"><FileText className="h-5 w-5"/></span>
            <h2 className="mt-4 text-lg font-extrabold">خطواتك بعد العقد</h2>
            <div className="mt-5 space-y-4 border-r border-[#4046B5]/15 pr-4"><div><p className="text-xs font-bold text-[#4046B5]">01 · راجع النسخة</p><p className="mt-1 text-xs leading-6 text-[#606178]">تأكد من بيانات العقد قبل الاحتفاظ به.</p></div><div><p className="text-xs font-bold text-[#4046B5]">02 · نزّل PDF</p><p className="mt-1 text-xs leading-6 text-[#606178]">احتفظ بالنسخة في ملفاتك أو اطبعها عند الحاجة.</p></div><div><p className="text-xs font-bold text-[#4046B5]">03 · ارجع للخطوة السابقة</p><p className="mt-1 text-xs leading-6 text-[#606178]">زر الرجوع يعيدك لتأكيد الدفع دون فقدان رقم العقد.</p></div></div>
            <Button onClick={returnToSuccess} variant="outline" className="mt-6 w-full rounded-xl border-[#4046B5]/20 text-[#4046B5] hover:bg-[#EDEEF9]"><ArrowRight className="ml-2 h-4 w-4"/>العودة لتأكيد الدفع</Button>
          </aside>
        </div>
      </div>
    </div>
  );

  return <div className="min-h-screen bg-[#fbfbff] py-6 md:py-10"><div className="container max-w-3xl"><Button variant="outline" onClick={returnToSuccess} className="mb-5 rounded-xl border-[#4046B5]/18 text-[#4046B5] hover:bg-[#EDEEF9]"><ArrowRight className="ml-2 h-4 w-4"/>العودة لتأكيد الدفع</Button><div className="rounded-[2rem] border border-[#4046B5]/10 bg-white p-7 shadow-[0_24px_60px_-42px_#4046B5] md:p-10"><p className="mof-eyebrow">العقد بعد الدفع التجريبي</p><h1 className="mt-4 text-3xl font-extrabold">{content.contract.title}</h1><p className="mt-4 leading-8 text-[#5b5c72]">{content.contract.body}</p><form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2"><div className="grid gap-2 sm:col-span-2"><Label htmlFor="contract-name">{content.checkout.name}</Label><Input id="contract-name" name="name" defaultValue={order.data.customerName} required/></div><div className="grid gap-2"><Label htmlFor="contract-email">{content.checkout.email}</Label><Input id="contract-email" name="email" defaultValue="" type="email" required dir="ltr"/></div><div className="grid gap-2"><Label htmlFor="contract-phone">{content.checkout.phone}</Label><Input id="contract-phone" name="phone" type="tel" required dir="ltr"/></div><div className="grid gap-2"><Label htmlFor="tax-card">{content.contract.taxCard}</Label><Input id="tax-card" name="taxCard"/></div><div className="grid gap-2"><Label htmlFor="national-id">{content.contract.nationalId}</Label><Input id="national-id" name="nationalId"/></div><div className="grid gap-2 sm:col-span-2"><Label htmlFor="commercial">{content.contract.commercialRegister}</Label><Input id="commercial" name="commercialRegister"/></div><div className="grid gap-2 sm:col-span-2"><Label htmlFor="address">{content.contract.address}</Label><Textarea id="address" name="address"/></div><Button type="submit" disabled={create.isPending} className="sm:col-span-2 h-13 rounded-xl bg-[#4046B5]">{create.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin"/>}{content.contract.create}</Button>{create.error && <p className="sm:col-span-2 text-sm text-destructive">{create.error.message}</p>}</form></div></div></div>;
}
