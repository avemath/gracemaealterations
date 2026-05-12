import { createClient } from "next-sanity";

const VALID_ID = /^[a-z0-9-]+$/;

function getSanityClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
  if (!projectId || !VALID_ID.test(projectId)) return null;
  return createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2024-01-01",
    useCdn: true,
  });
}

export const sanityClient = getSanityClient();
