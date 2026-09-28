import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Drafts the care notes for a care card, from the Studio. Grace types the
 * garment, fabric and what she did; this returns a few short sections in her
 * voice, which land in the Studio as ordinary editable text.
 *
 * Only people signed in to this site's Sanity project can use it: the Studio
 * sends the editor's own Sanity token, and the route asks Sanity whether that
 * token belongs to a project member before spending anything. The input is
 * three short strings and the output is care notes only, and there is still
 * a limit of twenty drafts per person per hour.
 */

export const maxDuration = 60;
export const runtime = "nodejs";

const MODEL = "claude-opus-5-5";

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_LIMIT;
}

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
/** Tokens Sanity has confirmed recently, so each draft doesn't need a second round trip. */
const verified = new Map<string, number>();
const VERIFIED_FOR_MS = 10 * 60 * 1000;

/** True when the token belongs to someone with access to this Sanity project. */
async function isProjectMember(token: string): Promise<boolean> {
  if (!PROJECT_ID || !/^[\w.-]{20,400}$/.test(token)) return false;
  const seen = verified.get(token);
  if (seen && Date.now() - seen < VERIFIED_FOR_MS) return true;
  try {
    const res = await fetch(`https://api.sanity.io/v2021-06-07/projects/${PROJECT_ID}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    if (verified.size > 200) verified.clear();
    verified.set(token, Date.now());
    return true;
  } catch {
    return false;
  }
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["sections"],
  properties: {
    sections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "body"],
        properties: { heading: { type: "string" }, body: { type: "string" } },
      },
    },
  },
} as const;

const SYSTEM = `You write the care notes that go home with a finished garment from Grace Mae, a bridal seamstress and tailor in Pittsburgh with a degree in fashion design. The client scans a QR code on a small printed card and reads these on their phone.

Write as Grace, in the first person: warm, calm and practical, like a note from someone who has just spent weeks on their garment. Plain words. US spelling. No em dashes. No exclamation marks.

Return three to five short sections. Each heading is two to five words, in sentence case. Each body is two to four sentences. Choose the sections that matter for this garment and fabric, from ideas like: between now and the day, wearing it, storing it, cleaning, steaming or pressing, the bustle or other new closures (only if the work mentions them), and if something happens.

Be accurate and conservative:
- Base the advice on the fabric given. If no fabric is given, keep it general and say to check the care label.
- Prefer the gentle option. For anything delicate, structured, beaded or bridal, recommend a professional cleaner who specializes in that kind of garment rather than home washing.
- Never promise results, never guarantee anything, and never quote prices or turnaround times.
- Don't give chemical stain-removal recipes. For stains, say to blot, not rub, and take it to a cleaner soon.
- If the work included a bustle, remind them to have whoever will bustle them practice before the day.
- Refer to Grace's own work only as "the alterations" or "what we did"; don't restate the work list.`;

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Drafting isn't switched on yet: the site needs its Anthropic key. You can still type the notes yourself." },
      { status: 503 }
    );
  }
  const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1] ?? "";
  if (!(await isProjectMember(token))) {
    return NextResponse.json(
      { error: "Drafting only works from the Studio while you're signed in. Sign out and back in, then try again." },
      { status: 401 }
    );
  }
  if (rateLimited(token.slice(-24))) {
    return NextResponse.json({ error: "That's a lot of drafts for one hour. Try again a little later." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const garment = clean(body.garment, 60);
  const fabric = clean(body.fabric, 80);
  const workDone = clean(body.workDone, 400);
  if (!garment) {
    return NextResponse.json({ error: "Fill in Garment first." }, { status: 400 });
  }

  const client = new Anthropic({ timeout: 50_000, maxRetries: 0 });
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 8000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> },
      },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            `Garment: ${garment}`,
            `Fabric: ${fabric || "not given"}`,
            `What was done: ${workDone || "not given"}`,
          ].join("\n"),
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({ error: "The draft didn't come through. Try rewording the fabric or work." }, { status: 422 });
    }
    const text = response.content.find((b) => b.type === "text");
    if (response.stop_reason === "max_tokens" || !text || text.type !== "text") {
      return NextResponse.json({ error: "The draft didn't finish. Please try again." }, { status: 502 });
    }
    const parsed = JSON.parse(text.text) as { sections?: { heading?: unknown; body?: unknown }[] };
    const sections = (parsed.sections ?? [])
      .map((s) => ({
        heading: clean(s.heading, 60).replace(/—/g, ", "),
        body: clean(s.body, 700).replace(/\s*—\s*/g, ", "),
      }))
      .filter((s) => s.heading && s.body)
      .slice(0, 6);
    if (sections.length === 0) {
      return NextResponse.json({ error: "The draft came back empty. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ sections });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Busy right now. Try again in a minute." }, { status: 503 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error("care-notes: API error", error.status, error.message);
    } else {
      console.error("care-notes: failed", error);
    }
    return NextResponse.json({ error: "The draft didn't come through. Try again in a minute." }, { status: 502 });
  }
}
