import { NextRequest, NextResponse } from "next/server";
import { getResend, CONTACT_EMAIL, FROM_EMAIL } from "@/lib/resend";

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  serviceType?: string;
  eventDate?: string;
  garmentDetails: string;
  referralSource?: string;
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

export async function POST(req: NextRequest) {
  let body: ContactPayload;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Basic server-side validation
  if (!body.name?.trim() || !body.email?.trim() || !body.garmentDetails?.trim()) {
    return NextResponse.json(
      { error: "Name, email, and garment details are required." },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const serviceLabel = body.serviceType
    ? SERVICE_LABELS[body.serviceType] ?? body.serviceType
    : "Not specified";

  const referralLabel = body.referralSource
    ? REFERRAL_LABELS[body.referralSource] ?? body.referralSource
    : "Not specified";

  const htmlBody = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1C1C1C;">
      <div style="border-top: 3px solid #C9A84C; padding: 32px 0 16px;">
        <h1 style="font-size: 28px; font-weight: 400; font-style: italic; margin: 0 0 8px;">
          New Alteration Request
        </h1>
        <p style="font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #888; margin: 0;">
          Via gracemaealterations.com
        </p>
      </div>

      <div style="border-top: 1px solid #E8E0D8; padding: 24px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #999; width: 140px; vertical-align: top;">Name</td>
            <td style="padding: 8px 0; font-size: 15px; color: #1C1C1C;">${escapeHtml(body.name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #999; vertical-align: top;">Email</td>
            <td style="padding: 8px 0; font-size: 15px; color: #1C1C1C;">
              <a href="mailto:${escapeHtml(body.email)}" style="color: #C9A84C;">${escapeHtml(body.email)}</a>
            </td>
          </tr>
          ${body.phone ? `
          <tr>
            <td style="padding: 8px 0; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #999; vertical-align: top;">Phone</td>
            <td style="padding: 8px 0; font-size: 15px; color: #1C1C1C;">${escapeHtml(body.phone)}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 8px 0; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #999; vertical-align: top;">Service</td>
            <td style="padding: 8px 0; font-size: 15px; color: #1C1C1C;">${escapeHtml(serviceLabel)}</td>
          </tr>
          ${body.eventDate ? `
          <tr>
            <td style="padding: 8px 0; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #999; vertical-align: top;">Event Date</td>
            <td style="padding: 8px 0; font-size: 15px; color: #1C1C1C;">${escapeHtml(body.eventDate)}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 8px 0; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #999; vertical-align: top;">Referral</td>
            <td style="padding: 8px 0; font-size: 15px; color: #1C1C1C;">${escapeHtml(referralLabel)}</td>
          </tr>
        </table>
      </div>

      <div style="border-top: 1px solid #E8E0D8; padding: 24px 0;">
        <p style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #999; margin: 0 0 12px;">Garment Details</p>
        <p style="font-size: 15px; line-height: 1.7; color: #1C1C1C; margin: 0; white-space: pre-wrap;">${escapeHtml(body.garmentDetails)}</p>
      </div>

      <div style="border-top: 1px solid #E8E0D8; padding: 24px 0;">
        <a href="mailto:${escapeHtml(body.email)}" style="display: inline-block; background: #C9A84C; color: #FAF7F2; text-decoration: none; padding: 14px 28px; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;">
          Reply to ${escapeHtml(body.name)}
        </a>
      </div>
    </div>
  `;

  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: CONTACT_EMAIL,
      replyTo: body.email,
      subject: `New Request: ${body.name} — ${serviceLabel}`,
      html: htmlBody,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
