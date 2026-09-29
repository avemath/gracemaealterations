import { test, expect } from "@playwright/test";

/** Publishing in the Studio refreshes the site through this hook; strangers can't trigger it. */
test("the instant-update hook refuses unsigned calls", async ({ request }) => {
  const res = await request.post("/api/revalidate", { data: { _type: "siteSettings" } });
  // 503 when instant updates aren't configured; 401 when they are.
  expect([401, 503]).toContain(res.status());
});
