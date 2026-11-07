import { createClient, type SanityClient } from "@sanity/client";

const VALID_ID = /^[a-z0-9-]+$/;

/**
 * Server-side reads. With SANITY_API_READ_TOKEN set (a Viewer token, server
 * only, never NEXT_PUBLIC), the dataset can be made private, so nobody can
 * list documents such as care cards straight from Sanity's public API. Reads
 * stay on published content either way, so drafts never reach the site.
 */
function getSanityClient(): SanityClient | null {
  const fixtures = getFixtureClient();
  if (fixtures) return fixtures;
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

/**
 * Tests only: with SANITY_FIXTURES set to a JSON file of published documents
 * (tests/fixtures/sanity.json, refreshed by scripts/export-sanity-fixtures.mjs),
 * every query runs locally against that file with groq-js, the same GROQ the
 * site sends to Sanity. CI uses it so a slow or empty Sanity can't fail the
 * end-to-end tests. Never used on Vercel.
 */
function getFixtureClient(): SanityClient | null {
  const file = process.env.SANITY_FIXTURES;
  if (!file || process.env.VERCEL) return null;
  let dataset: unknown[] | null = null;
  const fixtureClient = {
    async fetch(query: string, params: Record<string, unknown> = {}) {
      const [{ readFileSync }, { resolve }, { parse, evaluate }] = await Promise.all([
        import("node:fs"),
        import("node:path"),
        import("groq-js"),
      ]);
      dataset ??= JSON.parse(readFileSync(resolve(process.cwd(), file), "utf8")) as unknown[];
      const value = await evaluate(parse(query, { params }), { dataset, params });
      return value.get();
    },
  };
  return fixtureClient as unknown as SanityClient;
}

export let sanityClient: SanityClient | null = getSanityClient();

/** Unit tests only: swap in a mocked client (null for "no project configured"). */
export function setSanityClientForTests(client: Pick<SanityClient, "fetch"> | null) {
  sanityClient = client as SanityClient | null;
}
