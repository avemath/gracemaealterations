import { Resend } from "resend";

// Initialize Resend with your API key from environment variable
// Add RESEND_API_KEY to your .env.local file
export const resend = new Resend(process.env.RESEND_API_KEY);

// The email address that will RECEIVE contact form submissions
// Update this in your .env.local: CONTACT_EMAIL=youremail@example.com
export const CONTACT_EMAIL =
  process.env.CONTACT_EMAIL ?? "hello@gracemaealterations.com";

// The "from" address for Resend — must be a verified domain in Resend dashboard
// During development you can use: onboarding@resend.dev
export const FROM_EMAIL =
  process.env.FROM_EMAIL ?? "onboarding@resend.dev";
