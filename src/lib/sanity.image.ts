import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

// Built from the project id and dataset, not from the Sanity client. Client
// components import this file, and passing the client here pulled all of
// @sanity/client (about 47 KB unused) into every visitor's browser bundle.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const builder = /^[a-z0-9-]+$/.test(projectId) ? imageUrlBuilder({ projectId, dataset }) : null;

export function urlFor(source: SanityImageSource) {
  if (!builder) throw new Error("Sanity project id not configured");
  return builder.image(source);
}
