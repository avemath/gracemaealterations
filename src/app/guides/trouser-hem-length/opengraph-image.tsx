import { ogCard, OG_SIZE } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Trouser hem length, explained: a guide from Grace Mae Alterations";
export const size = OG_SIZE;
export const contentType = "image/jpeg";

export default async function Image() {
  return ogCard({
    label: "Guides",
    headline: "Trouser hem length, explained",
    tagline: "No break, quarter, half or full, and why the shoes matter.",
  });
}
