import { defineField, defineType } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero Section" },
    { name: "trust", title: "Trust Bar" },
    { name: "services", title: "Services Preview" },
    { name: "portfolio", title: "Portfolio Preview" },
    { name: "about", title: "About Teaser" },
    { name: "process", title: "What to Expect" },
    { name: "testimonials", title: "Testimonials" },
    { name: "cta", title: "CTA Banner" },
  ],
  fields: [
    // ── Hero ────────────────────────────────────────────────────
    defineField({
      name: "heroImage",
      title: "Hero Portrait Image",
      group: "hero",
      type: "image",
      description: "Portrait photo of you — at your sewing machine, holding fabric, or a headshot. Best ratio: 3:4 (portrait).",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt Text", type: "string" }),
      ],
    }),
    defineField({
      name: "heroSectionLabel",
      title: "Hero — Section Label",
      description: "Small uppercase label above the headline. e.g. 'Pittsburgh Bridal Alterations'",
      group: "hero",
      type: "string",
      initialValue: "Pittsburgh Bridal Alterations",
    }),
    defineField({
      name: "heroCredentialText",
      title: "Hero — Credential Body Text",
      description: "Italic line below the sub-tagline that establishes your background.",
      group: "hero",
      type: "text",
      rows: 2,
      initialValue:
        "Precision bridal alterations by a formally trained designer and former Lead Alterations Specialist at David's Bridal.",
    }),

    // ── Trust Bar ───────────────────────────────────────────────
    defineField({
      name: "trustStats",
      title: "Trust Bar Stats",
      group: "trust",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "value", title: "Value (e.g. 500+)", type: "string" }),
            defineField({ name: "label", title: "Label (e.g. Garments Altered)", type: "string" }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
      initialValue: [
        { _key: "ts0", value: "B.S. Fashion Design", label: "Indiana University of PA" },
        { _key: "ts1", value: "500+", label: "Garments Altered" },
        { _key: "ts2", value: "Pittsburgh, PA", label: "Proudly Local" },
      ],
    }),

    // ── Services Preview ────────────────────────────────────────
    defineField({
      name: "servicesLabel",
      title: "Services Section — Label",
      group: "services",
      type: "string",
      initialValue: "What I Do",
    }),
    defineField({
      name: "servicesHeading",
      title: "Services Section — Heading",
      group: "services",
      type: "string",
      initialValue: "Services",
    }),

    // ── Portfolio Preview ────────────────────────────────────────
    defineField({
      name: "portfolioLabel",
      title: "Portfolio Section — Label",
      group: "portfolio",
      type: "string",
      initialValue: "Selected Work",
    }),
    defineField({
      name: "portfolioHeading",
      title: "Portfolio Section — Heading",
      group: "portfolio",
      type: "string",
      initialValue: "The Work",
    }),

    // ── About Teaser ────────────────────────────────────────────
    defineField({
      name: "aboutTeaserLabel",
      title: "About Teaser — Section Label",
      group: "about",
      type: "string",
      initialValue: "The Seamstress",
    }),

    // ── Testimonials ────────────────────────────────────────────
    defineField({
      name: "testimonialsLabel",
      title: "Testimonials — Section Label",
      group: "testimonials",
      type: "string",
      initialValue: "Kind Words",
    }),
    defineField({
      name: "testimonialsHeading",
      title: "Testimonials — Heading",
      group: "testimonials",
      type: "string",
      initialValue: "What clients say",
    }),

    // ── What to Expect (Process Steps) ─────────────────────────
    defineField({
      name: "processLabel",
      title: "Process Section — Label",
      group: "process",
      type: "string",
      initialValue: "No Surprises",
    }),
    defineField({
      name: "processHeading",
      title: "Process Section — Heading",
      group: "process",
      type: "string",
      initialValue: "What to Expect",
    }),
    defineField({
      name: "processCTA",
      title: "Process Section — CTA Text",
      description: "Small line above the 'Book a Consultation' button at the bottom of this section.",
      group: "process",
      type: "string",
      initialValue: "Ready to begin?",
    }),
    defineField({
      name: "processSteps",
      title: "Process Steps",
      description: "The numbered steps in the 'What to Expect' section. Default is 6 steps.",
      group: "process",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Step Title", type: "string" }),
            defineField({
              name: "body",
              title: "Step Description",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "note",
              title: "Badge Label (optional)",
              description: "Short badge shown next to the step title, e.g. 'Bridal'. Leave blank for none.",
              type: "string",
            }),
          ],
          preview: { select: { title: "title", subtitle: "body" } },
        },
      ],
      initialValue: [
        { _key: "ps0", title: "Reach Out",        body: "Fill out the contact form with a few details about your garment. I respond to every inquiry within 24 hours." },
        { _key: "ps1", title: "Free Consultation", body: "We look at the garment together. I assess what needs to be done and give you an honest, itemized quote. No commitment required." },
        { _key: "ps2", title: "First Fitting",     body: "I pin and mark every adjustment directly on you, so we both see exactly what changes before a single seam is cut." },
        { _key: "ps3", title: "The Work",          body: "I complete your alterations with full attention. For complex bridal gowns this may involve multiple stages of careful work." },
        { _key: "ps4", title: "Progress Check",    body: "For intricate bridal alterations, we do a mid-point fitting to verify fit and make fine adjustments before final finishing.", note: "Bridal" },
        { _key: "ps5", title: "Pickup",            body: "Your garment is finished, pressed, and ready. We do a final try-on together — we don't say goodbye until it's perfect." },
      ],
    }),

    // ── CTA Banner ──────────────────────────────────────────────
    defineField({
      name: "ctaHeadline",
      title: "CTA Banner — Headline",
      group: "cta",
      type: "string",
      initialValue: "Your dress deserves to fit perfectly.",
    }),
    defineField({
      name: "ctaSubhead",
      title: "CTA Banner — Subheadline",
      group: "cta",
      type: "string",
      initialValue: "Book a consultation in Pittsburgh today.",
    }),
    defineField({
      name: "ctaButton",
      title: "CTA Banner — Button Label",
      group: "cta",
      type: "string",
      initialValue: "Get in Touch",
    }),
  ],
  preview: { prepare: () => ({ title: "Home Page" }) },
});
