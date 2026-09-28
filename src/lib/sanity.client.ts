import { createClient } from "@sanity/client";

const VALID_ID = /^[a-z0-9-]+$/;

/**
 * Server-side reads. With SANITY_API_READ_TOKEN set (a Viewer token, server
 * only, never NEXT_PUBLIC), the dataset can be made private, so nobody can
 * list documents such as care cards straight from Sanity's public API. Reads
 * stay on published content either way, so drafts never reach the site.
 */
function getSanityClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
  if (!projectId || !VALID_ID.test(projectId)) return null;
  const token = process.env.SANITY_API_READ_TOKEN || undefined;
  return createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2024-01-01",
    useCdn: true,
    perspective: "published",
    ...(token && { token }),
  });
}

export const sanityClient = getSanityClient();
