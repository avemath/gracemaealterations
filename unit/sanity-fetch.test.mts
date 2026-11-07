// The two cases every Sanity-backed page has to tell apart, against a mocked client:
//   - the read worked and the document doesn't exist: the getter returns null, and the page 404s;
//   - the read failed (network error, Sanity error, or an undefined result): the getter throws,
//     so a revalidation fails and Next.js keeps serving the last good page instead of a 404.
// Run with `npm run test:unit`.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

process.env.SANITY_RETRY_DELAY_MS = "1";

const { setSanityClientForTests } = await import("../src/lib/sanity.client");
const q = await import("../src/lib/sanity.queries");

type Answer = () => Promise<unknown>;
let calls = 0;
function mockClient(answer: Answer) {
  calls = 0;
  setSanityClientForTests({
    fetch: (async () => {
      calls++;
      return answer();
    }) as never,
  });
}

beforeEach(() => setSanityClientForTests(null));

// Each getter behind a page that calls notFound(), and an argument that passes its own checks.
const getters: [string, () => Promise<unknown>][] = [
  ["getLandingPage (/[slug])", () => q.getLandingPage("david-s-bridal-dress-alterations")],
  ["getGuide (/guides/[slug])", () => q.getGuide("trouser-hem-length")],
  ["getCaseStudy (/portfolio/[slug])", () => q.getCaseStudy("some-case-study")],
  ["getCareCard (/care/[code] and its card)", () => q.getCareCard("abc123def")],
  ["getPolicies (/policies)", () => q.getPolicies()],
];

for (const [name, get] of getters) {
  test(`${name}: a document that doesn't exist returns null, so the page 404s`, async () => {
    mockClient(async () => null);
    assert.equal(await get(), null);
    assert.equal(calls, 1, "a clean miss is not retried");
  });

  test(`${name}: a network error throws after retrying, instead of returning null`, async () => {
    mockClient(async () => {
      throw new TypeError("fetch failed");
    });
    await assert.rejects(get(), /fetch failed/);
    assert.equal(calls, 3, "tried three times before giving up");
  });

  test(`${name}: a Sanity error response throws, instead of returning null`, async () => {
    mockClient(async () => {
      throw Object.assign(new Error("Service Unavailable"), { statusCode: 503 });
    });
    await assert.rejects(get(), /Service Unavailable/);
  });

  test(`${name}: an undefined result is a failed read and throws`, async () => {
    mockClient(async () => undefined);
    await assert.rejects(get(), /no result/);
  });

  test(`${name}: a failure that clears on a retry returns the document`, async () => {
    let n = 0;
    mockClient(async () => {
      if (n++ === 0) throw new TypeError("fetch failed");
      return { _id: "doc", slug: "x", title: "Found", sections: [] };
    });
    const doc = (await get()) as { _id?: string } | null;
    assert.equal(doc?._id, "doc");
  });
}

test("a malformed care card code is a missing card (404) and never reaches Sanity", async () => {
  mockClient(async () => {
    throw new Error("should not be called");
  });
  assert.equal(await q.getCareCard("NOT-A-CODE"), null);
  assert.equal(calls, 0);
});

test("with no Sanity project configured, getters return null (local runs without Sanity)", async () => {
  setSanityClientForTests(null);
  assert.equal(await q.getLandingPage("david-s-bridal-dress-alterations"), null);
});
