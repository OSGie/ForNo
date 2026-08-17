import content from "@/content/poc.ar.json";
import { formatEgp } from "@shared/poc";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRoute, useLocation } from "wouter";

export default function DemoPayment() {
  const [, params] = useRoute("/demo-payment/:token"); const [, setLocation] = useLocation(); const token = params?.token ?? "";
  const session = trpc.poc.getPaymentSession.useQuery({ token }, { enabled: Boolean(token) });
  const approve = trpc.poc.approveDemoPayment.useMutation({ onSuccess: result => setLocation(`/payment-processing/${result.paymentToken}`) });
  if (session.isLoading) return <div className="grid min-h-screen place-items-center text-[#4046B5]">جارٍ فتح رابط الدفع التجريبي…</div>;
  if (!session.data) return <div className="grid min-h-screen place-items-center p-6 text-center">رابط الدفع التجريبي غير صالح أو انتهت صلاحيته.</div>;
  return <div className="min-h-screen bg-[#ECECF7] p-4 md:p-10"><div className="mx-auto max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_-35px_#141651]"><header className="flex items-center justify-between border-b border-[#4046B5]/10 p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ECECF7] text-[#4046B5]"><LockKeyhole className="h-5 w-5"/></span><div><p className="font-extrabold">{content.payment.title}</p><p className="mt-1 text-xs text-[#64657a]">موفوتر — رابط تجريبي مستقل</p></div></div><ShieldCheck className="h-5 w-5 text-[#4046B5]"/></header><div className="p-7"><p className="leading-8 text-[#5b5c72]">{content.payment.body}</p><div className="mt-7 rounded-2xl bg-[#07081A] p-5 text-white"><p className="text-xs text-white/60">{content.payment.amount}</p><p className="mt-2 font-[Inter] text-3xl font-bold" dir="ltr">{formatEgp(session.data.totalPiastres)}</p><p className="mt-1 text-sm font-bold">{session.data.planName}</p></div><div className="mt-6 rounded-xl border border-[#4046B5]/12 p-4 text-xs leading-6 text-[#5b5c72]">{content.payment.secure}</div><Button onClick={() => approve.mutate({ token })} disabled={approve.isPending || session.data.status === "PAID_DEMO"} className="mt-7 h-13 w-full rounded-xl bg-[#4046B5] text-base hover:bg-[#343aa0]">{approve.isPending ? "جارٍ الاعتماد…" : content.payment.approve}<ArrowLeft className="mr-2 h-4 w-4"/></Button>{approve.error && <p className="mt-3 text-sm text-destructive">{approve.error.message}</p>}<p className="mt-5 flex items-center justify-center gap-2 text-xs text-[#64657a]"><CheckCircle2 className="h-4 w-4 text-[#4046B5]"/>لا يتم تحصيل أي مبلغ في هذه التجربة.</p></div></div></div>;
}
