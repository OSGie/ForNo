import content from "@/content/poc.ar.json";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";

export default function PaymentProcessing() {
  const [, params] = useRoute("/payment-processing/:token"); const [, setLocation] = useLocation();
  useEffect(() => { const timer = window.setTimeout(() => setLocation(`/success/${params?.token}`), 950); return () => window.clearTimeout(timer); }, [params?.token, setLocation]);
  return <div className="grid min-h-screen place-items-center bg-[#07081A] p-5 text-center text-white"><div><div className="relative mx-auto grid h-20 w-20 place-items-center"><LoaderCircle className="absolute h-20 w-20 animate-spin text-[#bfc2ff]"/><CheckCircle2 className="h-8 w-8"/></div><h1 className="mt-8 text-3xl font-extrabold">{content.payment.processing}</h1><p className="mt-3 text-sm text-white/60">مصدر الحقيقة في النموذج هو الإجراء الخادمي المحلي.</p></div></div>;
}
