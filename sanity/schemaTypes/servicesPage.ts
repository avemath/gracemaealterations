import { defineField, defineType } from "sanity";

export const servicesPage = defineType({
  name: "servicesPage",
  title: "Services Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero" },
    { name: "pricing", title: "How Pricing Works" },
    { name: "cta", title: "CTA Banner" },
  ],
  fields: [
    // ── Hero ─────────────────────────────────────────────────────
    defineField({
      name: "heroImage",
      title: "Hero Background Image",
      description: "Wide background image for the services page hero. Fabric, gown detail, or workspace shot works well.",
      group: "hero",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
    }),
    defineField({
      name: "heroLabel",
      title: "Hero — Section Label",
      group: "hero",
      type: "string",
      initialValue: "What I Offer",
    }),
    defineField({
      name: "heroHeading",
      title: "Hero — Heading",
      group: "hero",
      type: "string",
      initialValue: "Services",
    }),

    // ── Pricing Section ─────────────────────────────────────────
    defineField({
      name: "pricingLabel",
      title: "Pricing Section — Label",
      group: "pricing",
      type: "string",
      initialValue: "Transparency First",
    }),
    defineField({
      name: "pricingHeading",
      title: "Pricing Section — Heading",
      group: "pricing",
      type: "string",
      initialValue: "How Pricing Works",
    }),
    defineField({
      name: "pricingCards",
      title: "Pricing Cards",
      description: "The three explanation cards in the 'How Pricing Works' section.",
      group: "pricing",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Card Title", type: "string" }),
            defineField({ name: "body", title: "Card Body", type: "text", rows: 3 }),
          ],
          preview: { select: { title: "title", subtitle: "body" } },
        },
      ],
      initialValue: [
        { _key: "pc0", title: "Consultation First", body: "Every project starts with a consultation so I can assess the garment, understand your needs, and give you an accurate quote — not a ballpark." },
        { _key: "pc1", title: "No Surprise Charges", body: "The price I quote is the price you pay. If something unexpected comes up, I'll discuss it with you before proceeding." },
        { _key: "pc2", title: "Complexity & Timeline", body: "Pricing reflects fabric type, alteration complexity, and your timeline. Rush requests may carry an additional fee — always communicated upfront." },
      ],
    }),

    // ── CTA Banner ──────────────────────────────────────────────
    defineField({
      name: "ctaHeadline",
      title: "CTA Banner — Headline",
      group: "cta",
      type: "string",
      initialValue: "Ready to get started?",
    }),
    defineField({
      name: "ctaSubhead",
      title: "CTA Banner — Subheadline",
      group: "cta",
      type: "string",
      initialValue: "Book your consultation — no commitment, just a conversation.",
    }),
    defineField({
      name: "ctaButton",
      title: "CTA Banner — Button Label",
      group: "cta",
      type: "string",
      initialValue: "Book a Consultation",
    }),
  ],
  preview: { prepare: () => ({ title: "Services Page" }) },
});
