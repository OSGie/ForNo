import { trpc } from "@/lib/trpc";
import { useCallback } from "react";

declare global {
  interface Window {
    MofTrack?: { context: () => { visitorId: string; sessionId: string; firstTouch: Record<string, string>; lastTouch: Record<string, string> }; event: (eventName: string, payload?: Record<string, unknown>) => Record<string, unknown> };
    dataLayer?: Array<Record<string, unknown>>;
  }
}

type Consent = { analytics: boolean; marketing: boolean };

const fallbackContext = () => ({ visitorId: "preview-visitor", sessionId: "preview-session", firstTouch: {}, lastTouch: {} });

export function readConsent(): Consent {
  try { return JSON.parse(localStorage.getItem("mof_consent") ?? "{\"analytics\":false,\"marketing\":false}"); } catch { return { analytics: false, marketing: false }; }
}

export function usePocTracking() {
  const { mutate } = trpc.poc.track.useMutation();
  return useCallback((eventName: string, options: { persona?: "firm" | "company" | null; uiContext?: string; properties?: Record<string, unknown> } = {}) => {
    const tracker = window.MofTrack;
    const raw = tracker?.event(eventName, { ui_context: options.uiContext ?? "page", ...(options.properties ?? {}) }) ?? { event_id: `evt_${Date.now()}` };
    const context = tracker?.context() ?? fallbackContext();
    const consent = readConsent();
    mutate({
      eventId: String(raw.event_id), eventName, visitorId: context.visitorId, sessionId: context.sessionId, pagePath: window.location.pathname,
      persona: options.persona ?? null, uiContext: options.uiContext ?? "page", firstTouch: context.firstTouch, lastTouch: context.lastTouch,
      consentAnalytics: consent.analytics, consentMarketing: consent.marketing, properties: options.properties,
    }, { onError: () => undefined });
  }, [mutate]);
}

export function getPocContext() {
  return window.MofTrack?.context() ?? fallbackContext();
}
