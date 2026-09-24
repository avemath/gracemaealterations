import { NextRequest, NextResponse } from "next/server";
import { getResend, CONTACT_EMAIL, FROM_EMAIL } from "@/lib/resend";

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  serviceType?: string;
  eventDate?: string;
  garmentDetails?: string;
  referralSource?: string;
  isWaitlist?: boolean;
  /** e.g. "early 2027" — when the waitlisted service reopens. */
  reopensLabel?: string;
  attachments?: { filename: string; content: string }[];
  // Bridal-specific
  fabricNotes?: string;
  dressSizeOrdered?: string;
  currentStreetSize?: string;
  alterationsNeeded?: string[];
  shoesUndergarments?: string;
  // Tailoring-specific
  garmentType?: string;
  tailoringAlterations?: string[];
  // Shared
  currentSize?: string;
}

const SERVICE_LABELS: Record<string, string> = {
  bridal: "Bridal Alteration",
  tailoring: "Everyday Tailoring",
  custom: "Custom Work",
  unsure: "Not Sure Yet",
};

const REFERRAL_LABELS: Record<string, string> = {
  google: "Google Search",
  instagram: "Instagram",
  wordofmouth: "Word of Mouth",
  other: "Other",
};

const BRIDAL_ALTERATION_LABELS: Record<string, string> = {
  hem: "Hem (standard / cathedral / horsehair)",
  bustle: "Bustle addition",
  bodice_waist: "Bodice / Waist adjustment",
  corset_conversion: "Corset back conversion",
  straps_sleeves: "Straps / Sleeves",
  neckline: "Neckline modification",
  cups_boning: "Cups / Boning",
  lace_beading: "Lace / Beading work",
  other: "Other (see notes)",
};

const TAILORING_ALTERATION_LABELS: Record<string, string> = {
  hem: "Hem",
  take_in: "Take in",
  let_out: "Let out",
  sleeve: "Sleeve length / taper",
  waist: "Waist / Seat adjustment",
  zipper: "Zipper repair / replacement",
  other: "Other (see notes)",
};

const SHOES_LABELS: Record<string, string> = {
  yes: "Yes — have both",
  shoes_only: "Shoes only",
  not_yet: "Not yet / still deciding",
};

const GARMENT_TYPE_LABELS: Record<string, string> = {
  pants: "Pants / Trousers",
  dress: "Dress",
  skirt: "Skirt",
  jacket: "Jacket / Blazer",
  shirt: "Shirt / Blouse",
  other: "Other",
};

// ── Helpers ───────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
      <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;margin:0 0 16px;">${title}</p>
      ${content}
    </div>`;
}

function whatToBringHtml(serviceType?: string): string {
  const lists: Record<string, string[]> = {
    bridal: [
      "Your wedding dress",
      "The shoes you plan to wear on your wedding day — heel height directly affects hem length",
      "Any undergarments, shapewear, or a strapless bra you plan to wear with the gown",
      "Any accessories you'd like to try on with the dress",
    ],
    tailoring: [
      "The garment(s) you need altered",
      "Shoes you plan to wear, if a hem adjustment is involved",
    ],
    custom: [
      "The garment(s) needing work",
      "Any reference photos or inspiration images",
      "Care tag information if the garment is vintage or delicate",
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
  let body: ContactPayload;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const serviceLabel = body.serviceType
    ? (SERVICE_LABELS[body.serviceType] ?? body.serviceType)
    : "Not specified";
  const referralLabel = body.referralSource
    ? (REFERRAL_LABELS[body.referralSource] ?? body.referralSource)
    : "Not specified";

  // ── Email to Grace ────────────────────────────────────────

  const bridalSection =
    body.serviceType === "bridal" &&
    (body.fabricNotes || body.dressSizeOrdered || body.currentStreetSize ||
      body.alterationsNeeded?.length || body.shoesUndergarments)
      ? section(
          "Dress Details",
          `<table style="width:100%;border-collapse:collapse;">
            ${body.fabricNotes ? row("Fabric / Construction", escapeHtml(body.fabricNotes)) : ""}
            ${body.dressSizeOrdered ? row("Size Ordered", escapeHtml(body.dressSizeOrdered)) : ""}
            ${body.currentStreetSize ? row("Current Street Size", escapeHtml(body.currentStreetSize)) : ""}
            ${
              body.alterationsNeeded?.length
                ? row(
                    "Alterations Needed",
                    escapeHtml(
                      body.alterationsNeeded
                        .map((a) => BRIDAL_ALTERATION_LABELS[a] ?? a)
                        .join(", ")
                    )
                  )
                : ""
            }
            ${
              body.shoesUndergarments
                ? row("Shoes & Undergarments", escapeHtml(SHOES_LABELS[body.shoesUndergarments] ?? body.shoesUndergarments))
                : ""
            }
          </table>`
        )
      : "";

  const tailoringSection =
    body.serviceType === "tailoring" &&
    (body.garmentType || body.currentSize || body.tailoringAlterations?.length)
      ? section(
          "Garment Details",
          `<table style="width:100%;border-collapse:collapse;">
            ${body.garmentType ? row("Garment Type", escapeHtml(GARMENT_TYPE_LABELS[body.garmentType] ?? body.garmentType)) : ""}
            ${body.currentSize ? row("Current Size", escapeHtml(body.currentSize)) : ""}
            ${
              body.tailoringAlterations?.length
                ? row(
                    "Alterations Needed",
                    escapeHtml(
                      body.tailoringAlterations
                        .map((a) => TAILORING_ALTERATION_LABELS[a] ?? a)
                        .join(", ")
                    )
                  )
                : ""
            }
          </table>`
        )
      : "";

  const customSection =
    body.serviceType === "custom" && body.currentSize
      ? section(
          "Project Details",
          `<table style="width:100%;border-collapse:collapse;">
            ${row("Approximate Size", escapeHtml(body.currentSize))}
          </table>`
        )
      : "";

  const garmentNotesSection = body.garmentDetails?.trim()
    ? section(
        "Notes",
        `<p style="font-size:15px;line-height:1.7;color:#1C1C1C;margin:0;white-space:pre-wrap;">${escapeHtml(body.garmentDetails)}</p>`
      )
    : "";

  const graceEmail = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1C1C1C;">
      <div style="border-top:3px solid #C9A84C;padding:32px 0 16px;">
        <h1 style="font-size:28px;font-weight:400;font-style:italic;margin:0 0 8px;">
          ${body.isWaitlist ? "New Waitlist Request" : "New Alteration Request"}
        </h1>
        <p style="font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#888;margin:0;">
          Via gracemaealterations.com
        </p>
      </div>

      <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
        <table style="width:100%;border-collapse:collapse;">
          ${row("Name", escapeHtml(body.name))}
          ${row("Email", `<a href="mailto:${escapeHtml(body.email)}" style="color:#C9A84C;">${escapeHtml(body.email)}</a>`)}
          ${body.phone ? row("Phone", escapeHtml(body.phone)) : ""}
          ${row("Service", escapeHtml(serviceLabel))}
          ${body.eventDate ? row("Event Date", escapeHtml(body.eventDate)) : ""}
          ${row("Referral", escapeHtml(referralLabel))}
        </table>
      </div>

      ${bridalSection}
      ${tailoringSection}
      ${customSection}
      ${garmentNotesSection}

      <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
        <a href="mailto:${escapeHtml(body.email)}" style="display:inline-block;background:#C9A84C;color:#FAF7F2;text-decoration:none;padding:14px 28px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">
          Reply to ${escapeHtml(body.name)}
        </a>
      </div>
    </div>`;

  // ── Confirmation email to client ──────────────────────────

  // "bridal waitlist" reads better than a bare "waitlist" when we know which
  // service is closed.
  const waitlistServiceWord =
    body.serviceType === "bridal" ? "bridal " : body.serviceType === "custom" ? "custom work " : "";

  const waitlistIntro = body.reopensLabel
    ? `Hi ${escapeHtml(body.name)}, you're on my ${waitlistServiceWord}waitlist. I'll reach out in order as dates open for ${escapeHtml(body.reopensLabel)}.`
    : `Hi ${escapeHtml(body.name)}, your request has been received and you're on my waitlist. I'll reach out as soon as a spot opens up.`;

  const confirmationEmail = body.isWaitlist
    ? `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1C1C1C;">
        <div style="border-top:3px solid #C9A84C;padding:32px 0 16px;">
          <h1 style="font-size:26px;font-weight:400;font-style:italic;margin:0 0 8px;">You're on my waitlist.</h1>
          <p style="font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#888;margin:0;">Grace Mae Alterations · Pittsburgh, PA</p>
        </div>
        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:15px;line-height:1.7;color:#1C1C1C;margin:0 0 12px;">
            ${waitlistIntro}
          </p>
          <p style="font-size:15px;line-height:1.7;color:#555;margin:0;">
            In the meantime, feel free to reply to this email with any questions.
          </p>
        </div>
        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:14px;font-style:italic;color:#1C1C1C;margin:0 0 4px;">Grace Mae</p>
          <p style="font-size:12px;color:#999;margin:0;">Grace Mae Alterations · Pittsburgh, PA · By appointment only</p>
        </div>
      </div>`
    : `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1C1C1C;">
        <div style="border-top:3px solid #C9A84C;padding:32px 0 16px;">
          <h1 style="font-size:26px;font-weight:400;font-style:italic;margin:0 0 8px;">Your request was received.</h1>
          <p style="font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#888;margin:0;">Grace Mae Alterations · Pittsburgh, PA</p>
        </div>

        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:15px;line-height:1.7;color:#1C1C1C;margin:0;">
            Hi ${escapeHtml(body.name)}, thank you for reaching out. I've received your request and will be in touch within 24 hours to discuss your garment and schedule a consultation.
          </p>
        </div>

        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;margin:0 0 16px;">What Happens Next</p>
          <ol style="font-size:14px;line-height:1.9;color:#555;padding-left:20px;margin:0;">
            <li>I'll review your request and reach out to schedule your first fitting.</li>
            <li>At the consultation we'll look at the garment together, discuss the alterations, and I'll give you a quote and realistic timeline.</li>
            <li>Alterations begin after the fitting and a deposit. I'll keep you updated along the way.</li>
          </ol>
        </div>

        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;margin:0 0 16px;">What to Bring to Your First Fitting</p>
          ${whatToBringHtml(body.serviceType)}
        </div>

        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:14px;line-height:1.7;color:#555;margin:0;">
            Questions in the meantime? Reply to this email or reach me at
            <a href="mailto:${escapeHtml(CONTACT_EMAIL)}" style="color:#C9A84C;">${escapeHtml(CONTACT_EMAIL)}</a>.
          </p>
        </div>

        <div style="border-top:1px solid #E8E0D8;padding:24px 0;">
          <p style="font-size:15px;font-style:italic;color:#1C1C1C;margin:0 0 4px;">Grace Mae</p>
          <p style="font-size:12px;color:#999;margin:0;">Grace Mae Alterations · Pittsburgh, PA · By appointment only</p>
        </div>
      </div>`;

  // Build attachments
  const emailAttachments = (body.attachments ?? [])
    .filter((a) => a.filename && a.content)
    .map((a) => {
      const base64 = a.content.includes(",") ? a.content.split(",")[1] : a.content;
      return { filename: a.filename, content: Buffer.from(base64, "base64") };
    });

  try {
    const resend = getResend();

    // 1. Email to Grace (with attachments)
    const { error: graceError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: CONTACT_EMAIL,
      replyTo: body.email,
      subject: body.isWaitlist
        ? `Waitlist: ${body.name} — ${serviceLabel}`
        : `New Request: ${body.name} — ${serviceLabel}`,
      html: graceEmail,
      ...(emailAttachments.length > 0 && { attachments: emailAttachments }),
    });

    if (graceError) {
      console.error("Resend error (grace):", graceError);
      return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }

    // 2. Confirmation email to client (no attachments)
    await resend.emails.send({
      from: FROM_EMAIL,
      to: body.email,
      replyTo: CONTACT_EMAIL,
      subject: body.isWaitlist
        ? `You're on my waitlist — Grace Mae Alterations`
        : `Your request was received — Grace Mae Alterations`,
      html: confirmationEmail,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
