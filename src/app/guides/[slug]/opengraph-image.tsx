import { ogCard, OG_SIZE } from "@/lib/og";
import { getGuide } from "@/lib/sanity.queries";

export const runtime = "nodejs";
export const alt = "A guide from Grace Mae Alterations, Pittsburgh";
export const size = OG_SIZE;
export const contentType = "image/jpeg";

/** Each guide shares with its own title, so a link sent to a bridesmaid says what it is. */
export default async function Image({ params }: { params: { slug: string } }) {
  const guide = await getGuide(params.slug).catch(() => null);
  return ogCard({
    label: "Guides",
    headline: guide?.title ?? "Guides",
    tagline: "Plain answers from a Pittsburgh bridal seamstress.",
  });
}
