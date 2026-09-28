import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { PHOTO_CHECK_SCHEMA, sanitizePhotoCheck } from "@/lib/photoCheck";
import { BRIDAL_ALTERATIONS } from "@/lib/contactOptions";

// Vision with a short, low-effort read usually lands in 5 to 15 seconds.
export const maxDuration = 60;
export const runtime = "nodejs";

const MODEL = "claude-opus-5-5";
const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type MediaType = (typeof MEDIA_TYPES)[number];

// ── Abuse limits ─────────────────────────────────────────────────────────────
// Each check costs a few cents, so: six per connection per hour, only from this
// site's own pages, and nothing at all unless the key is configured. The
// Origin header can be faked by a script, so there is also a ceiling on all
// checks per hour, and the Anthropic key should carry its own spend limit.
const RATE_LIMIT = 6;
const HOURLY_CEILING = 60;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();
let all: number[] = [];

function rateLimited(ip: string): boolean {
  const now = Date.now();
  all = all.filter((t) => now - t < RATE_WINDOW_MS);
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT || all.length >= HOURLY_CEILING) return true;
  recent.push(now);
  all.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

function allowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname;
    return (
      host === "gracemaealterations.com" ||
      host === "www.gracemaealterations.com" ||
      host === "localhost" ||
      host === "127.0.0.1" ||
      // This project's own previews only, not every site on vercel.app.
      /^site-[a-z0-9-]+-averymatherne-2588s-projects\.vercel\.app$/.test(host)
    );
  } catch {
    return false;
  }
}

// ── The instructions ─────────────────────────────────────────────────────────

const SYSTEM = `You look at photos a customer has attached to an alterations request for Grace Mae, a bridal seamstress in Pittsburgh. Your only job is to describe what is visible, so the customer can name their garment and fabric correctly before Grace sees it. Grace decides everything else in person.

Rules:
- Describe, don't advise. Say what you can see. Never recommend alterations, never say what the garment needs or should have, never give prices or timelines, and never offer opinions on style, taste or quality. No compliments, no criticism.
- Never comment on the person wearing it: not their body, size, shape, age or looks. Fit observations are about the garment only, stated neutrally, and only when it is being worn. For example: "The hem rests on the floor at the front", "The top edge of the bodice stands away from the body". If it is on a hanger or a dress form, leave fitObservations empty.
- Be honest about certainty. Fabric is hard to identify from a photo, so give the likely fabric with a confidence and the visual cues behind it (sheen, drape, texture, transparency, weave). Use "high" only when it is unmistakable, such as a visible lace pattern. Fiber content can never be confirmed from a photo, so never claim it.
- Use everyday garment words a customer would recognize: satin, crepe, chiffon, tulle, organza, lace, mikado, charmeuse, velvet, sequins, jersey knit, wool suiting, denim, cotton shirting, and so on.
- details: visible embellishment and construction only, such as "Lace appliqué along the hem", "Covered buttons down the back", "Horsehair edge on the hem".
- checklist: include an id only when something visible relates to it, with a factual reason that points at what is seen. For example, a train resting on the floor relates to "bustle"; a hem pooling at the feet relates to "hem". Returning none is fine. Never include an item just because it is common.
- cannotTell: two to four short things the photos cannot show that matter for the work, such as fiber content, how many layers are under the skirt, or how much seam allowance there is.
- If the photos do not clearly show a garment (only a face, a screen, text, or something unrelated), set usable to false, say why in one short sentence in note, and leave the other fields empty.
- Keep note empty unless something needs saying, such as "Only the front of the dress is shown".
- Plain, calm and short. US spelling. No em dashes. Each list item under 20 words.`;

function serviceLine(serviceType: string): string {
  const options = BRIDAL_ALTERATIONS.filter((o) => o.id !== "unsure")
    .map((o) => `${o.id} (${o.label})`)
    .join(", ");
  if (serviceType === "bridal") {
    return `The customer chose bridal. Checklist ids you may use: ${options}.`;
  }
  return "The customer chose tailoring or a bridal party garment. Leave checklist empty.";
}

function parseDataUrl(dataUrl: unknown): { media_type: MediaType; data: string } | null {
  if (typeof dataUrl !== "string") return null;
  const match = dataUrl.match(/^data:(image\/[a-z+.-]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  const mediaType = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  if (!MEDIA_TYPES.includes(mediaType as MediaType)) return null;
  if (Math.floor((match[2].length * 3) / 4) > MAX_PHOTO_BYTES) return null;
  return { media_type: mediaType as MediaType, data: match[2] };
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "The photo check is not switched on." }, { status: 503 });
  }
  if (!allowedOrigin(req.headers.get("origin"))) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "That's a lot of checks for one hour. Send the request as it is, and Grace will look at the photos herself." },
      { status: 429 }
    );
  }

  let body: { photos?: unknown; serviceType?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const photos = (Array.isArray(body.photos) ? body.photos : [])
    .slice(0, MAX_PHOTOS)
    .map((p) => parseDataUrl(p))
    .filter((p): p is NonNullable<typeof p> => p !== null);
  if (photos.length === 0) {
    return NextResponse.json(
      { error: "Those photos can't be checked. JPG or PNG photos work best." },
      { status: 400 }
    );
  }
  const serviceType = typeof body.serviceType === "string" ? body.serviceType : "";

  const client = new Anthropic({ timeout: 50_000, maxRetries: 0 });

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 8000,
      // If a safety classifier declines, Anthropic re-runs the request on its
      // recommended fallback model instead of returning a refusal.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        // A description, not a hard problem: low effort keeps it quick and cheap.
        effort: "low",
        format: { type: "json_schema", schema: PHOTO_CHECK_SCHEMA as unknown as Record<string, unknown> },
      },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            ...photos.map((p) => ({
              type: "image" as const,
              source: { type: "base64" as const, media_type: p.media_type, data: p.data },
            })),
            {
              type: "text" as const,
              text: `${serviceLine(serviceType)}\n\nDescribe what ${
                photos.length === 1 ? "this photo shows" : `these ${photos.length} photos show`
              }.`,
            },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "The check couldn't read these photos. Send them as they are and Grace will look herself." },
        { status: 422 }
      );
    }
    const text = response.content.find((b) => b.type === "text");
    if (response.stop_reason === "max_tokens" || !text || text.type !== "text") {
      return NextResponse.json({ error: "The check didn't finish. Please try again." }, { status: 502 });
    }

    const result = sanitizePhotoCheck(JSON.parse(text.text));
    if (!result) {
      return NextResponse.json({ error: "The check didn't finish. Please try again." }, { status: 502 });
    }
    if (serviceType !== "bridal") result.checklist = [];
    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "The check is busy right now. Please try again in a minute." }, { status: 503 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error("photo-check: API error", error.status, error.message);
    } else {
      console.error("photo-check: failed", error);
    }
    return NextResponse.json({ error: "The check isn't available right now. Your request will still send." }, { status: 502 });
  }
}
