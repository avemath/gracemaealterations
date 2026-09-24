import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  // Only one of these should exist (singleton)
  fields: [
    defineField({ name: "ownerName", title: "Your Name", type: "string", initialValue: "Grace Mae" }),
    defineField({ name: "businessName", title: "Business Name", type: "string", initialValue: "Grace Mae Alterations" }),
    defineField({ name: "tagline", title: "Tagline (hero headline)", type: "string", initialValue: "Sewn with precision." }),
    defineField({ name: "subTagline", title: "Sub-tagline (below headline)", type: "string", initialValue: "Every stitch tailored to you — and only you." }),
    defineField({ name: "email", title: "Contact Email", type: "string", initialValue: "inquiries@gracemaealterations.com" }),
    defineField({ name: "instagram", title: "Instagram Handle (e.g. @gracemae)", type: "string", initialValue: "@gracemaealterations" }),
    defineField({ name: "instagramUrl", title: "Instagram Full URL", type: "url", initialValue: "https://instagram.com/gracemaealterations" }),
    defineField({ name: "location", title: "Location (e.g. Pittsburgh, PA)", type: "string", initialValue: "Pittsburgh, PA" }),
    defineField({ name: "availability", title: "Availability Note", type: "string", initialValue: "Available by Appointment" }),
    defineField({ name: "responseTime", title: "Response Time Note", type: "string", initialValue: "I respond to all inquiries within 24 hours." }),
    defineField({
      name: "bookingNote",
      title: "Hero Booking Note",
      description: "Availability signal shown in the homepage hero (e.g. 'Now scheduling Spring & Summer 2026 consultations'). Keep it short.",
      type: "string",
      initialValue: "Now scheduling Spring & Summer 2026 consultations",
    }),
    defineField({
      name: "metaDescription",
      title: "SEO Meta Description",
      type: "text",
      rows: 3,
      initialValue:
        "Expert bridal and clothing alterations in Pittsburgh, PA. Grace Mae offers precision tailoring, wedding dress alterations, and custom work by appointment. Honest timelines. Exceptional craft.",
    }),
    defineField({
      name: "isAcceptingClients",
      title: "Currently Accepting New Clients?",
      description: "Turn off when fully booked — the contact form switches to 'Waitlist' mode automatically.",
      type: "boolean",
      initialValue: true,
    }),
    // ── Limited availability (per service) ──────────────────────────────────
    defineField({
      name: "limitedMode",
      title: "Limited availability mode",
      description: "On when you're open for some services but not others. The switch above stays on; only the services listed below go to a waitlist.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "waitlistServices",
      title: "Services on waitlist",
      description: "These services show a waitlist notice and switch the contact form into waitlist mode. Everything else books normally.",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Bridal", value: "bridal" },
          { title: "Everyday Tailoring", value: "tailoring" },
          { title: "Custom & Repairs", value: "custom" },
        ],
      },
    }),
    defineField({
      name: "reopensLabel",
      title: "When waitlisted services reopen, e.g. early 2027",
      type: "string",
    }),
    defineField({
      name: "limitedNote",
      title: "Short availability line shown under hero and on contact page",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Business Phone / Text Number",
      description: "Optional. Displayed on the contact page as a call-or-text option.",
      type: "string",
    }),
  ],
  preview: { select: { title: "businessName" } },
});
