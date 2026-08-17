import content from "@/content/poc.ar.json";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useLocation, useRoute } from "wouter";

export default function Success() {
  const [, params] = useRoute("/success/:token"); const [, setLocation] = useLocation(); const token = params?.token ?? ""; const order = trpc.poc.getOrder.useQuery({ token }, { enabled: Boolean(token) });
  if (order.isLoading) return <div className="grid min-h-screen place-items-center">جارٍ تأكيد النتيجة…</div>;
  if (!order.data || order.data.status !== "PAID_DEMO") return <div className="grid min-h-screen place-items-center p-6 text-center">لا يمكن فتح صفحة النجاح قبل اعتماد الدفع التجريبي.</div>;
  return <div className="grid min-h-screen place-items-center bg-[#ECECF7] p-5"><div className="w-full max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-[0_30px_80px_-35px_#141651]"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e6f7ec] text-[#16834b]"><CheckCircle2 className="h-9 w-9"/></span><h1 className="mt-7 text-3xl font-extrabold">{content.payment.successTitle}</h1><p className="mt-4 leading-8 text-[#5b5c72]">{content.payment.successBody}</p><Button onClick={() => setLocation(`/contract/${token}`)} className="mt-8 h-13 rounded-xl bg-[#4046B5] px-7 text-base hover:bg-[#343aa0]">استكمال بيانات العقد<ArrowLeft className="mr-2 h-4 w-4"/></Button></div></div>;
}
