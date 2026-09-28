import { NextRequest, NextResponse } from "next/server";
import { getResend, CONTACT_EMAIL, FROM_EMAIL } from "@/lib/resend";
import {
  BRIDAL_ALTERATION_LABELS,
  SHOES_UNDERGARMENT_LABELS,
} from "@/lib/contactOptions";
import { sanitizePhotoCheck, photoCheckLines } from "@/lib/photoCheck";

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
  /** e.g. "early 2027", when the waitlisted service reopens. */
  reopensLabel?: string;
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
// Five submissions per IP per hour. This is per instance, not a shared store,
// which is enough to stop casual flooding of the inbox.
const RATE_LIMIT = 5;
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
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
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

function whatToBringHtml(serviceType?: string): string {
  const lists: Record<string, string[]> = {
    bridal: [
      "Your wedding dress",
      "The shoes you plan to wear on your wedding day, since heel height sets the hem length",
      "Any undergarments, shapewear, or a strapless bra you plan to wear with the gown",
      "Any accessories you'd like to try on with the dress",
    ],
    tailoring: [
      "The garment(s) you need altered",
      "Shoes you plan to wear, if a hem adjustment is involved",
    ],
    party: [
      "Each garment, labelled with who will wear it",
      "The shoes each person plans to wear, if hems are involved",
      "Anyone being fitted, or a date when they can come in",
    ],
  };
  const items = lists[serviceType ?? ""] ?? [
    "The garment(s) you need altered",
    "Shoes if a hem adjustment is involved",
  ];
  return `<ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;color:#555;">${items
    .map((i) => `<li>${i}</li>`)
    .join("")}</ul>`;
}

// ── Route handler ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let raw: ContactPayload;

  try {
    raw = await req.json();
  } catch {
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
  const reopensLabel = clean(raw.reopensLabel).slice(0, 100);
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
                      alterationsNeeded.map((a) => BRIDAL_ALTERATION_LABELS[a] ?? a).join(", ")
                    )
                  )
                : ""
            }
            ${
              shoesUndergarments
                ? row(
                    "Shoes & Undergarments",
                    escapeHtml(SHOES_UNDERGARMENT_LABELS[shoesUndergarments] ?? shoesUndergarments)
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

  const waitlistServiceWord = serviceType === "bridal" ? "bridal " : "";

  const waitlistIntro = reopensLabel
    ? `Hi ${escapeHtml(name)}, you're on my ${waitlistServiceWord}waitlist. I'll reach out in order as dates open for ${escapeHtml(reopensLabel)}.`
    : `Hi ${escapeHtml(name)}, your request has been received and you're on my waitlist. I'll reach out as soon as a spot opens up.`;

  const signOff = `
        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:15px;font-style:italic;color:#1C1C1C;margin:0 0 4px;">Grace Mae</p>
          <p style="font-size:12px;color:#767676;margin:0;">Grace Mae Alterations · Pittsburgh, PA · By appointment only</p>
        </div>`;

  const confirmationEmail = isWaitlist
    ? `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1C1C1C;">
        <div style="border-top:3px solid ${GOLD};padding:32px 0 16px;">
          <h1 style="font-size:26px;font-weight:400;font-style:italic;margin:0 0 8px;">You're on my waitlist.</h1>
          <p style="font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#767676;margin:0;">Grace Mae Alterations · Pittsburgh, PA</p>
        </div>
        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:15px;line-height:1.7;color:#1C1C1C;margin:0 0 12px;">
            ${waitlistIntro}
          </p>
          <p style="font-size:15px;line-height:1.7;color:#555;margin:0;">
            In the meantime, feel free to reply to this email with any questions.
          </p>
        </div>
        ${signOff}
      </div>`
    : `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1C1C1C;">
        <div style="border-top:3px solid ${GOLD};padding:32px 0 16px;">
          <h1 style="font-size:26px;font-weight:400;font-style:italic;margin:0 0 8px;">Your request was received.</h1>
          <p style="font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#767676;margin:0;">Grace Mae Alterations · Pittsburgh, PA</p>
        </div>

        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:15px;line-height:1.7;color:#1C1C1C;margin:0;">
            Hi ${escapeHtml(name)}, thank you for reaching out. I've received your request, and I read every message myself. I'll reply as soon as I can.
          </p>
        </div>

        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${GOLD_INK};margin:0 0 16px;">What Happens Next</p>
          <ol style="font-size:14px;line-height:1.9;color:#555;padding-left:20px;margin:0;">
            <li>I'll review your request and reach out to schedule your first fitting.</li>
            <li>At the fitting we'll look at the garment together, talk through the alterations, and I'll give you a quote and a realistic timeline.</li>
            <li>Alterations begin after the fitting and a deposit. I'll keep you updated along the way.</li>
          </ol>
        </div>

        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${GOLD_INK};margin:0 0 16px;">What to Bring to Your First Fitting</p>
          ${whatToBringHtml(serviceType)}
        </div>

        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:14px;line-height:1.7;color:#555;margin:0;">
            Questions in the meantime? Reply to this email or reach me at
            <a href="mailto:${escapeHtml(CONTACT_EMAIL)}" style="color:${GOLD_INK};">${escapeHtml(CONTACT_EMAIL)}</a>.
          </p>
        </div>
        ${signOff}
      </div>`;

  // Build attachments
  const emailAttachments = (Array.isArray(raw.attachments) ? raw.attachments : [])
    .slice(0, MAX_ATTACHMENTS)
    .filter((a) => typeof a?.filename === "string" && typeof a?.content === "string" && a.content)
    .map((a) => {
      const base64 = a.content.includes(",") ? a.content.split(",")[1] : a.content;
      return {
        filename: a.filename.replace(/[^\w.\- ]+/g, "_").slice(0, 100) || "photo.jpg",
        content: Buffer.from(base64, "base64"),
      };
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
      subject: isWaitlist
        ? "You're on my waitlist · Grace Mae Alterations"
        : "Your request was received · Grace Mae Alterations",
      html: confirmationEmail,
    });
    if (clientError) console.error("Resend error (client confirmation):", clientError);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
