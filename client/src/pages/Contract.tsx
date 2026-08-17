import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import content from "@/content/poc.ar.json";
import { trpc } from "@/lib/trpc";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download, FileCheck2, Loader2, Printer } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { useRoute } from "wouter";

export default function Contract() {
  const [, params] = useRoute("/contract/:token");
  const token = params?.token ?? "";
  const order = trpc.poc.getOrder.useQuery({ token }, { enabled: Boolean(token) });
  const contract = trpc.poc.getContract.useQuery({ token }, { enabled: Boolean(token), retry: false });
  const create = trpc.poc.createContract.useMutation({ onSuccess: () => void contract.refetch() });
  const documentRef = useRef<HTMLDivElement>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

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
    <div className="min-h-screen bg-[#ECECF7] py-8 md:py-12">
      <div className="container">
        <div className="mb-7 flex flex-col items-center justify-between gap-4 rounded-3xl bg-[#090A20] p-6 text-center text-white md:flex-row md:text-right">
          <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#c8cbff]"><FileCheck2 className="h-7 w-7"/></span><div><p className="text-xs font-bold text-[#c8cbff]">العقد جاهز كمخرج PDF</p><h1 className="mt-1 font-[Inter] text-xl font-extrabold" dir="ltr">{contract.data.contractNumber}</h1></div></div>
          <div className="flex flex-wrap justify-center gap-3"><Button disabled={pdfBusy} onClick={() => void exportPdf(true)} variant="outline" className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white hover:text-[#4046B5]"><Printer className="ml-2 h-4 w-4"/>معاينة PDF</Button><Button disabled={pdfBusy} onClick={() => void exportPdf(false)} className="rounded-xl bg-white text-[#4046B5] hover:bg-[#EDEEF9]">{pdfBusy ? <Loader2 className="ml-2 h-4 w-4 animate-spin"/> : <Download className="ml-2 h-4 w-4"/>}تنزيل PDF</Button></div>
        </div>
        <div className="overflow-auto rounded-2xl bg-[#dfe1ed] p-3 md:p-6"><div ref={documentRef} className="contract-document mx-auto w-fit" dangerouslySetInnerHTML={{ __html: contract.data.html }}/></div>
      </div>
    </div>
  );

  return <div className="min-h-screen bg-[#fbfbff] py-10"><div className="container max-w-3xl"><div className="rounded-[2rem] border border-[#4046B5]/10 bg-white p-7 md:p-10"><p className="mof-eyebrow">العقد بعد الدفع التجريبي</p><h1 className="mt-4 text-3xl font-extrabold">{content.contract.title}</h1><p className="mt-4 leading-8 text-[#5b5c72]">{content.contract.body}</p><form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2"><div className="grid gap-2 sm:col-span-2"><Label htmlFor="contract-name">{content.checkout.name}</Label><Input id="contract-name" name="name" defaultValue={order.data.customerName} required/></div><div className="grid gap-2"><Label htmlFor="contract-email">{content.checkout.email}</Label><Input id="contract-email" name="email" defaultValue="" type="email" required dir="ltr"/></div><div className="grid gap-2"><Label htmlFor="contract-phone">{content.checkout.phone}</Label><Input id="contract-phone" name="phone" type="tel" required dir="ltr"/></div><div className="grid gap-2"><Label htmlFor="tax-card">{content.contract.taxCard}</Label><Input id="tax-card" name="taxCard"/></div><div className="grid gap-2"><Label htmlFor="national-id">{content.contract.nationalId}</Label><Input id="national-id" name="nationalId"/></div><div className="grid gap-2 sm:col-span-2"><Label htmlFor="commercial">{content.contract.commercialRegister}</Label><Input id="commercial" name="commercialRegister"/></div><div className="grid gap-2 sm:col-span-2"><Label htmlFor="address">{content.contract.address}</Label><Textarea id="address" name="address"/></div><Button type="submit" disabled={create.isPending} className="sm:col-span-2 h-13 rounded-xl bg-[#4046B5]">{create.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin"/>}{content.contract.create}</Button>{create.error && <p className="sm:col-span-2 text-sm text-destructive">{create.error.message}</p>}</form></div></div></div>;
}
