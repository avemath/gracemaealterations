import { Resend } from "resend";

// Lazily initialized — not created at module load so the build doesn't
// throw when RESEND_API_KEY isn't present in Vercel's build environment.
export function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set.");
  return new Resend(key);
}

export const CONTACT_EMAIL =
  process.env.CONTACT_EMAIL ?? "gracematherne@gmail.com";

export const FROM_EMAIL =
  process.env.FROM_EMAIL ?? "hello@gracemaealterations.com";
