"use client";

import { track } from "@vercel/analytics";

/**
 * Vercel Web Analytics custom events. No cookies, no third party script.
 */
export const analytics = {
  ctaClick: (label: string) => track("cta_click", { label }),
  formStart: (service: string) => track("form_start", { service }),
  formSubmit: (service: string) => track("form_submit", { service }),
  waitlistJoin: (service: string) => track("waitlist_join", { service }),
};
