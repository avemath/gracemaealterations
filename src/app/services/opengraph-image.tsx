import { ogCard, OG_SIZE } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Grace Mae Alterations, Pittsburgh bridal alterations and tailoring";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({
    headline: "Alterations & prices",
    tagline: "Hems, bustles, bodice work and everyday tailoring in Pittsburgh.",
  });
}
