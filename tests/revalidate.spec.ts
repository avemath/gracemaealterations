import { test, expect } from "@playwright/test";
import { createHmac } from "crypto";

/**
 * Publishing in the Studio refreshes the site through this hook; strangers
 * can't trigger it. The signature is made the way Sanity's webhooks make it:
 * HMAC-SHA256 over "<timestamp>.<body>", base64url, sent as "t=…,v1=…".
 */
const secret = process.env.SANITY_REVALIDATE_SECRET;

function sign(body: string, key: string, t = Date.now()) {
  const v1 = createHmac("sha256", key).update(`${t}.${body}`).digest("base64url");
  return `t=${t},v1=${v1}`;
}

test("the instant-update hook refuses unsigned calls", async ({ request }) => {
  const res = await request.post("/api/revalidate", { data: { _type: "siteSettings" } });
  // 503 when instant updates aren't configured; 401 when they are.
  expect([401, 503]).toContain(res.status());
});

test("a correctly signed call refreshes the site; a wrong secret doesn't", async ({ request }, testInfo) => {
  test.skip(!secret, "SANITY_REVALIDATE_SECRET isn't set for this run");
  test.skip(testInfo.project.name !== "desktop", "one width is enough");
  const body = JSON.stringify({ _type: "siteSettings", _id: "siteSettings" });
  const headers = (signature: string) => ({ "content-type": "application/json", "sanity-webhook-signature": signature });

  const ok = await request.post("/api/revalidate", { data: body, headers: headers(sign(body, secret!)) });
  expect(ok.status()).toBe(200);

  const wrong = await request.post("/api/revalidate", { data: body, headers: headers(sign(body, "not-the-secret")) });
  expect(wrong.status()).toBe(401);

  // A retry an hour later still counts; a week-old one doesn't.
  const retry = await request.post("/api/revalidate", { data: body, headers: headers(sign(body, secret!, Date.now() - 3600_000)) });
  expect(retry.status()).toBe(200);
  const stale = await request.post("/api/revalidate", { data: body, headers: headers(sign(body, secret!, Date.now() - 7 * 86400_000)) });
  expect(stale.status()).toBe(401);
});
