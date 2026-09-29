import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Called by a Sanity webhook whenever Grace publishes, so her change shows on
 * the site straight away instead of after the next one-minute refresh (which
 * only happens once someone visits, so it could take two visits to appear).
 *
 * The webhook signs each call with SANITY_REVALIDATE_SECRET; anything unsigned
 * or signed with another secret is refused. With no secret configured the
 * route does nothing, and the one-minute refresh keeps working as before.
 */

export const runtime = "nodejs";

const MAX_AGE_MS = 5 * 60 * 1000;

/** Checks Sanity's "t=<ms>,v1=<hmac>" signature over "<t>.<body>". */
function validSignature(header: string | null, body: string, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const i = kv.indexOf("=");
      return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()];
    })
  );
  const t = Number(parts.t);
  const sig = parts.v1;
  if (!Number.isFinite(t) || !sig || Math.abs(Date.now() - t) > MAX_AGE_MS) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${body}`).digest("base64");
  // Sanity sends base64url; compare in one alphabet.
  const norm = (s: string) => s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const a = Buffer.from(norm(expected));
  const b = Buffer.from(norm(sig));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Instant updates aren't switched on." }, { status: 503 });
  }
  const body = await req.text();
  if (!validSignature(req.headers.get("sanity-webhook-signature"), body, secret)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }

  // Wording, services and settings appear on many pages at once, so refresh
  // the whole site rather than guessing which pages a document touches.
  revalidatePath("/", "layout");
  let type = "";
  try {
    type = String((JSON.parse(body) as { _type?: unknown })._type ?? "");
  } catch {
    // The body is only used for the log line.
  }
  console.log(`revalidate: refreshed the site after a ${type || "Studio"} change`);
  return NextResponse.json({ revalidated: true });
}
