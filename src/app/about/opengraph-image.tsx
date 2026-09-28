import { ogCard, OG_SIZE } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Grace Mae Alterations, Pittsburgh bridal alterations and tailoring";
export const size = OG_SIZE;
export const contentType = "image/jpeg";

export default async function Image() {
  return ogCard({
    headline: "Meet Grace",
    tagline: "A formally trained designer, fitting one client at a time.",
  });
}
