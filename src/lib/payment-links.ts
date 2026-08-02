import { useEffect, useState } from "react";
import type { PlanId } from "./plan";

/**
 * Owner-configured Stripe Payment Links.
 * The app owner pastes the links here (Settings → Payments) and the pricing page
 * sends buyers straight to Stripe Checkout instead of switching the plan locally.
 */
export type PaymentLinks = {
  dashboardUrl: string;
  starterMonthly: string;
  starterYearly: string;
  growthMonthly: string;
  growthYearly: string;
};

export const STRIPE_DASHBOARD_URL = "https://dashboard.stripe.com/payment-links";

export const DEFAULT_PAYMENT_LINKS: PaymentLinks = {
  dashboardUrl: STRIPE_DASHBOARD_URL,
  starterMonthly: "",
  starterYearly: "",
  growthMonthly: "",
  growthYearly: "",
};

const KEY = "signvel:paymentLinks:v1";
export const PAYMENT_LINKS_EVENT = "signvel:paymentLinks";

export function readPaymentLinks(): PaymentLinks {
  if (typeof window === "undefined") return DEFAULT_PAYMENT_LINKS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PAYMENT_LINKS;
    return { ...DEFAULT_PAYMENT_LINKS, ...(JSON.parse(raw) as Partial<PaymentLinks>) };
  } catch {
    return DEFAULT_PAYMENT_LINKS;
  }
}

export function writePaymentLinks(links: PaymentLinks) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(links));
  window.dispatchEvent(new Event(PAYMENT_LINKS_EVENT));
}

/** Resolve the checkout link for a plan + billing cycle, or "" when not configured. */
export function checkoutUrlFor(links: PaymentLinks, plan: PlanId, cycle: "monthly" | "yearly"): string {
  if (plan === "starter") return (cycle === "yearly" ? links.starterYearly : links.starterMonthly).trim();
  if (plan === "growth") return (cycle === "yearly" ? links.growthYearly : links.growthMonthly).trim();
  return "";
}

export function usePaymentLinks() {
  const [links, setLinks] = useState<PaymentLinks>(DEFAULT_PAYMENT_LINKS);

  useEffect(() => {
    const sync = () => setLinks(readPaymentLinks());
    sync();
    window.addEventListener(PAYMENT_LINKS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PAYMENT_LINKS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return {
    links,
    save: (next: PaymentLinks) => {
      writePaymentLinks(next);
      setLinks(next);
    },
  };
}
