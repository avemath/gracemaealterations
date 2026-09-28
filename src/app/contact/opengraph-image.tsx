import { ogCard, OG_SIZE } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Grace Mae Alterations, Pittsburgh bridal alterations and tailoring";
export const size = OG_SIZE;
export const contentType = "image/jpeg";

export default async function Image() {
  return ogCard({
    headline: "Let's talk",
    tagline: "Send photos and details. I reply within 2 business days.",
  });
}
