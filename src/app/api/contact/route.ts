import { NextRequest, NextResponse } from "next/server";
import { getResend, CONTACT_EMAIL, FROM_EMAIL } from "@/lib/resend";
import { bridalAlterationLabels, shoesUndergarmentLabels } from "@/lib/contactOptions";
import { sanitizePhotoCheck, photoCheckLines } from "@/lib/photoCheck";
import { getMergedSite } from "@/lib/sanity.queries";
import { dateFit, parseDateInput } from "@/lib/bridalDates";
import { getText, textDefaults, fill, type Text } from "@/lib/text";

interface ContactPayload {
  name: string;
  email: string;
  serviceType?: string;
  eventDate?: string;
  garmentDetails?: string;
  referralSource?: string;
  isWaitlist?: boolean;
  /** Honeypot: any value means a bot filled it in. */
  company?: string;
  attachments?: { filename: string; content: string }[];
  // Bridal
  dressDesigner?: string;
  dressArrival?: string;
  venue?: string;
  dressSizeOrdered?: string;
  currentStreetSize?: string;
  alterationsNeeded?: string[];
  shoesUndergarments?: string;
  // Bridal party
  garmentCount?: string;
  /** The AI photo check, when the client chose to send it along. */
  photoCheck?: unknown;
}

// ── Simple in-memory rate limit ──────────────────────────────────────────────
// Five submissions per IP per hour, and a ceiling on all submissions per hour,
// since each one also emails the address typed in. This is per instance, not
// a shared store, which is enough to stop casual flooding.
const RATE_LIMIT = 5;
const HOURLY_CEILING = 40;
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

/**
 * The confirmation goes to whatever address was typed in, so it must not carry
 * anything a stranger could use to send their own message from Grace's
 * address: only a plain first name, or no name at all.
 */
function greetingName(name: string): string {
  const first = name.split(/\s+/)[0] ?? "";
  return /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’-]{0,29}$/.test(first) ? first : "";
}

/** Only real photos go through: the file's first bytes must be a JPEG, PNG or WebP. */
function photoType(buf: Buffer): "jpg" | "png" | "webp" | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

const SERVICE_LABELS: Record<string, string> = {
  bridal: "Bridal",
  tailoring: "Tailoring or repair",
  party: "Bridal party or special occasion",
  unsure: "Not specified",
};

// Gold #C9A84C fails contrast as text on white; email text uses gold_ink.
const GOLD = "#C9A84C";
const GOLD_INK = "#7A5F1E";

/** Caps every free-text field so a bot cannot post a novel into Grace's inbox. */
const MAX_TEXT = 5000;
const MAX_ATTACHMENTS = 5;

// ── Helpers ───────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_TEXT) : "";
}

// ── Dates ──────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

/** "2027-06-12" from a date input, as a UTC midnight Date. */
function parseDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** A date input as "Sat, Jun 12, 2027", or the raw text if it is not a date. */
function readableDate(value: string): string {
  const d = parseDate(value);
  return d ? formatDate(d) : value;
}

/**
 * One line so Grace can triage without date maths. Matches the Services page:
 * the first bridal fitting is usually 8 to 12 weeks before the wedding, and
 * anything under 8 weeks is a rush.
 */
function timingNote(value: string, serviceType: string, now = new Date()): { text: string; rush: boolean } | null {
  const date = parseDate(value);
  if (!date) return null;
  // "Today" in Pittsburgh, so an evening request doesn't count from tomorrow.
  const [y, mo, d] = now.toLocaleDateString("en-CA", { timeZone: "America/New_York" }).split("-").map(Number);
  const today = Date.UTC(y, mo - 1, d);
  const days = Math.round((date.getTime() - today) / DAY_MS);
  if (days < 0) return { text: "This date has already passed. Worth checking with them.", rush: false };

  const weeks = Math.floor(days / 7);
  const away = weeks === 0 ? `${days} day${days === 1 ? "" : "s"} away` : `${weeks} week${weeks === 1 ? "" : "s"} away`;

  if (serviceType === "bridal") {
    const from = formatDate(new Date(date.getTime() - 12 * 7 * DAY_MS));
    const to = formatDate(new Date(date.getTime() - 8 * 7 * DAY_MS));
    if (weeks > 26) return { text: `${away}. Early: first fitting around ${from} to ${to}.`, rush: false };
    if (weeks > 12) return { text: `${away}. Good timing: first fitting around ${from} to ${to}.`, rush: false };
    if (weeks >= 8) return { text: `${away}. The first fitting is due now.`, rush: false };
    return { text: `${away}. Rush timeline.`, rush: true };
  }
  if (weeks < 3) return { text: `${away}. Rush timeline.`, rush: true };
  return { text: `${away}.`, rush: false };
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:8px 0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#999;width:160px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;font-size:15px;color:#1C1C1C;">${value}</td>
    </tr>`;
}

function section(title: string, content: string) {
  return `
    <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
      <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${GOLD_INK};margin:0 0 16px;">${title}</p>
      ${content}
    </div>`;
}

/** A Studio list written one item per line, as escaped <li>s. */
function listItems(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join("");
}

function whatToBringHtml(text: Text<"forms">, serviceType?: string): string {
  const lists: Record<string, string> = {
    bridal: text.confirmBringBridal,
    tailoring: text.confirmBringTailoring,
    party: text.confirmBringParty,
  };
  const items = lists[serviceType ?? ""] ?? text.confirmBringOther;
  return `<ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;color:#555;">${listItems(items)}</ul>`;
}

// ── Route handler ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let raw: ContactPayload;

  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Bots fill the hidden field in; accept and drop so they get no signal.
  if (clean(raw.company) !== "") {
    return NextResponse.json({ ok: true });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const name = clean(raw.name).slice(0, 200);
  const email = clean(raw.email).slice(0, 320);
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const serviceType = clean(raw.serviceType);
  const isWaitlist = raw.isWaitlist === true;
  // From Sanity, not the browser, since it goes into the confirmation email.
  // If the Studio can't be reached the request still goes through, in the
  // original wording.
  const [reopensLabel, text] = await Promise.all([
    isWaitlist ? getMergedSite().then((s) => s.reopensLabel ?? "", () => "") : "",
    getText("forms").catch(() => textDefaults("forms")),
  ]);
  // Studio wording goes into HTML, so it is escaped like anything a client typed.
  const html = (template: string, vars: Record<string, string> = {}) => fill(escapeHtml(template), vars);
  const alterationLabels = bridalAlterationLabels(text);
  const shoesLabels = shoesUndergarmentLabels(text);
  const hi = greetingName(name);
  const hello = hi ? html(text.confirmGreeting, { name: escapeHtml(hi) }) : html(text.confirmGreetingNoName);
  const eventDate = clean(raw.eventDate);
  const garmentDetails = clean(raw.garmentDetails);
  const referral = clean(raw.referralSource).slice(0, 100);
  const dressDesigner = clean(raw.dressDesigner);
  const dressArrival = clean(raw.dressArrival);
  const venue = clean(raw.venue);
  const dressSizeOrdered = clean(raw.dressSizeOrdered).slice(0, 50);
  const currentStreetSize = clean(raw.currentStreetSize).slice(0, 50);
  const shoesUndergarments = clean(raw.shoesUndergarments);
  const garmentCount = clean(raw.garmentCount).slice(0, 20);
  const timing = eventDate ? timingNote(eventDate, serviceType) : null;
  // A waitlisted bride whose date is under eight weeks away, or before bridal
  // reopens, asked about her date rather than joining the queue, so her
  // confirmation says that instead of "you're on my waitlist".
  const weddingDate = isWaitlist && serviceType === "bridal" ? parseDateInput(eventDate) : null;
  const fitKind = weddingDate
    ? dateFit(weddingDate, { limitedMode: true, bridalWaitlisted: true, reopensLabel }).kind
    : null;
  const askedAboutDate = fitKind === "rush" || fitKind === "beforeReopen";
  const alterationsNeeded = Array.isArray(raw.alterationsNeeded)
    ? raw.alterationsNeeded.map(clean).filter(Boolean).slice(0, 20)
    : [];

  const baseLabel = SERVICE_LABELS[serviceType] ?? "Not specified";
  const serviceLabel = isWaitlist && serviceType === "bridal" ? `${baseLabel} (waitlist)` : baseLabel;

  // ── Email to Grace ────────────────────────────────────────

  const bridalSection =
    serviceType === "bridal" &&
    (dressDesigner || dressArrival || venue || dressSizeOrdered || currentStreetSize ||
      alterationsNeeded.length || shoesUndergarments)
      ? section(
          "The Dress",
          `<table style="width:100%;border-collapse:collapse;">
            ${dressDesigner ? row("Designer / Shop", escapeHtml(dressDesigner)) : ""}
            ${dressArrival ? row("Dress Arrives", escapeHtml(readableDate(dressArrival))) : ""}
            ${venue ? row("Venue", escapeHtml(venue)) : ""}
            ${dressSizeOrdered ? row("Size Ordered", escapeHtml(dressSizeOrdered)) : ""}
            ${currentStreetSize ? row("Street Size", escapeHtml(currentStreetSize)) : ""}
            ${
              alterationsNeeded.length
                ? row(
                    "Thinks It Needs",
                    escapeHtml(
                      alterationsNeeded.map((a) => alterationLabels[a] ?? a).join(", ")
                    )
                  )
                : ""
            }
            ${
              shoesUndergarments
                ? row(
                    "Shoes & Undergarments",
                    escapeHtml(shoesLabels[shoesUndergarments] ?? shoesUndergarments)
                  )
                : ""
            }
          </table>`
        )
      : "";

  const partySection =
    serviceType === "party" && garmentCount
      ? section(
          "Bridal Party",
          `<table style="width:100%;border-collapse:collapse;">
            ${row("Garments", escapeHtml(garmentCount))}
          </table>`
        )
      : "";

  const photoCheck = sanitizePhotoCheck(raw.photoCheck);
  const photoCheckSection =
    photoCheck?.usable && photoCheckLines(photoCheck).length
      ? section(
          "Photo Check",
          `<p style="font-size:12px;color:#767676;margin:0 0 12px;">An automated read of their photos, which they chose to include. A starting point, not a diagnosis.</p>
          <table style="width:100%;border-collapse:collapse;">
            ${photoCheckLines(photoCheck)
              .map(([label, value]) => row(escapeHtml(label), escapeHtml(value)))
              .join("")}
          </table>`
        )
      : "";

  const garmentNotesSection = garmentDetails
    ? section(
        "Notes",
        `<p style="font-size:15px;line-height:1.7;color:#1C1C1C;margin:0;white-space:pre-wrap;">${escapeHtml(garmentDetails)}</p>`
      )
    : "";

  const graceEmail = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1C1C1C;">
      <div style="border-top:3px solid ${GOLD};padding:32px 0 16px;">
        <h1 style="font-size:28px;font-weight:400;font-style:italic;margin:0 0 8px;">
          ${isWaitlist ? "New Waitlist Request" : "New Alteration Request"}
        </h1>
        <p style="font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#767676;margin:0;">
          Via gracemaealterations.com
        </p>
      </div>

      <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
        <table style="width:100%;border-collapse:collapse;">
          ${row("Name", escapeHtml(name))}
          ${row("Email", `<a href="mailto:${escapeHtml(email)}" style="color:${GOLD_INK};">${escapeHtml(email)}</a>`)}
          ${row("Service", escapeHtml(serviceLabel))}
          ${eventDate ? row(serviceType === "bridal" ? "Wedding Date" : "Event Date", escapeHtml(readableDate(eventDate))) : ""}
          ${timing ? row("Timing", `<span style="color:${timing.rush ? "#9B1C1C" : "#1C1C1C"};">${escapeHtml(timing.text)}</span>`) : ""}
          ${row("Found Me Via", escapeHtml(referral || "Not specified"))}
        </table>
      </div>

      ${bridalSection}
      ${partySection}
      ${garmentNotesSection}
      ${photoCheckSection}

      <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
        <a href="mailto:${escapeHtml(email)}" style="display:inline-block;background:${GOLD_INK};color:#FAF7F2;text-decoration:none;padding:14px 28px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">
          Reply to ${escapeHtml(name)}
        </a>
      </div>
    </div>`;

  // ── Confirmation email to client ──────────────────────────

  const reopens = { reopens: escapeHtml(reopensLabel) };
  const waitlistIntro = `${hello} ${
    askedAboutDate
      ? html(text.confirmDateIntro)
      : reopensLabel
      ? html(serviceType === "bridal" ? text.confirmWaitlistIntroBridal : text.confirmWaitlistIntroReopens, reopens)
      : html(text.confirmWaitlistIntro)
  }`;

  const signOff = `
        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:15px;font-style:italic;color:#1C1C1C;margin:0 0 4px;">${html(text.confirmSignName)}</p>
          <p style="font-size:12px;color:#767676;margin:0;">${html(text.confirmSignLine)}</p>
        </div>`;
  const tagline = `<p style="font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#767676;margin:0;">${html(text.confirmTagline)}</p>`;

  const confirmationEmail = isWaitlist
    ? `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1C1C1C;">
        <div style="border-top:3px solid ${GOLD};padding:32px 0 16px;">
          <h1 style="font-size:26px;font-weight:400;font-style:italic;margin:0 0 8px;">${html(askedAboutDate ? text.confirmDateHeading : text.confirmWaitlistHeading)}</h1>
          ${tagline}
        </div>
        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:15px;line-height:1.7;color:#1C1C1C;margin:0 0 12px;">
            ${waitlistIntro}
          </p>
          <p style="font-size:15px;line-height:1.7;color:#555;margin:0;">
            ${html(text.confirmWaitlistMeantime)}
          </p>
        </div>
        ${signOff}
      </div>`
    : `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1C1C1C;">
        <div style="border-top:3px solid ${GOLD};padding:32px 0 16px;">
          <h1 style="font-size:26px;font-weight:400;font-style:italic;margin:0 0 8px;">${html(text.confirmHeading)}</h1>
          ${tagline}
        </div>

        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:15px;line-height:1.7;color:#1C1C1C;margin:0;">
            ${hello} ${html(text.confirmIntro)}
          </p>
        </div>

        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${GOLD_INK};margin:0 0 16px;">${html(text.confirmNextHeading)}</p>
          <ol style="font-size:14px;line-height:1.9;color:#555;padding-left:20px;margin:0;">${listItems(text.confirmNextSteps)}</ol>
        </div>

        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${GOLD_INK};margin:0 0 16px;">${html(text.confirmBringHeading)}</p>
          ${whatToBringHtml(text, serviceType)}
        </div>

        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:14px;line-height:1.7;color:#555;margin:0;">
            ${html(text.confirmQuestions, {
              email: `<a href="mailto:${escapeHtml(CONTACT_EMAIL)}" style="color:${GOLD_INK};">${escapeHtml(CONTACT_EMAIL)}</a>`,
            })}
          </p>
        </div>
        ${signOff}
      </div>`;

  // Build attachments
  const emailAttachments = (Array.isArray(raw.attachments) ? raw.attachments : [])
    .slice(0, MAX_ATTACHMENTS)
    .filter((a) => typeof a?.filename === "string" && typeof a?.content === "string" && a.content)
    .flatMap((a, i) => {
      const base64 = a.content.includes(",") ? a.content.split(",")[1] : a.content;
      const content = Buffer.from(base64, "base64");
      const type = photoType(content);
      if (!type) return [];
      const stem = a.filename.replace(/\.[^.]*$/, "").replace(/[^\w\- ]+/g, "_").slice(0, 80) || `photo-${i + 1}`;
      return [{ filename: `${stem}.${type}`, content }];
    });

  try {
    const resend = getResend();

    // 1. Email to Grace (with attachments). This is the one that matters.
    const { error: graceError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `${timing?.rush ? "RUSH · " : ""}${isWaitlist ? "Waitlist" : "New request"}: ${name}, ${serviceLabel}${
        eventDate ? `, ${readableDate(eventDate)}` : ""
      }`,
      html: graceEmail,
      ...(emailAttachments.length > 0 && { attachments: emailAttachments }),
    });

    if (graceError) {
      console.error("Resend error (grace):", graceError);
      return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }

    // 2. Confirmation email to client (no attachments). Grace already has the
    // request, so a failure here is logged rather than shown as an error.
    const { error: clientError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: CONTACT_EMAIL,
      subject: askedAboutDate ? text.confirmDateSubject : isWaitlist ? text.confirmWaitlistSubject : text.confirmSubject,
      html: confirmationEmail,
    });
    if (clientError) console.error("Resend error (client confirmation):", clientError);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
