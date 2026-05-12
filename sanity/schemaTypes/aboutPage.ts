import { defineField, defineType } from "sanity";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero" },
    { name: "story", title: "Background Story" },
    { name: "values", title: "Values Section" },
    { name: "independence", title: "Why Independent Section" },
    { name: "cta", title: "CTA Banner" },
  ],
  fields: [
    // ── Hero ─────────────────────────────────────────────────────
    defineField({
      name: "heroImage",
      title: "Hero Image (full-bleed banner)",
      description: "Large image at the top of the About page. Ideal: you working at your machine or a professional portrait. Wide/landscape preferred.",
      group: "hero",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
    }),
    defineField({
      name: "heroLabel",
      title: "Hero — Section Label",
      description: "Small uppercase label above your name in the hero. e.g. 'The Seamstress'",
      group: "hero",
      type: "string",
      initialValue: "The Seamstress",
    }),

    // ── Background Story ────────────────────────────────────────
    defineField({
      name: "secondaryImage",
      title: "Story Image (beside background text)",
      description: "Close-up of hands at work, fabric detail, or a candid shot. Portrait ratio (2:3) preferred.",
      group: "story",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
    }),
    defineField({
      name: "storyLabel",
      title: "Story Section — Label",
      group: "story",
      type: "string",
      initialValue: "Background",
    }),
    defineField({
      name: "storyHeading",
      title: "Story Section — Heading",
      group: "story",
      type: "string",
      initialValue: "From the classroom to the fitting room",
    }),
    defineField({
      name: "paragraph1",
      title: "Paragraph 1 — Origin",
      description: "IUP Fashion Design, Costume Shop experience.",
      group: "story",
      type: "text",
      rows: 5,
      initialValue:
        "My path to alterations started at Indiana University of Pennsylvania, where I earned my Bachelor's degree in Fashion and Apparel Design in 2024. Throughout college I worked in the university's Costume Shop as an Alterations Assistant — fitting, pinning, and tailoring costumes for theater and dance productions each season. The work was detailed, deadline-driven, and taught me to handle everything from delicate chiffon to structured performance wear with equal care.",
    }),
    defineField({
      name: "paragraph2",
      title: "Paragraph 2 — Experience",
      description: "David's Bridal, Lead Specialist, going independent.",
      group: "story",
      type: "text",
      rows: 5,
      initialValue:
        "After graduating, I joined David's Bridal as a Lead Alterations Specialist, working directly with brides to make sure their gowns fit perfectly for their wedding day. High-stakes work under real deadlines — it deepened my technical skills and my understanding of what it means to show up for someone during one of the most important moments of their life. When I stepped away to build my own business, I brought that knowledge with me and left behind the volume pressures that kept me from doing the work the way I know it should be done.",
    }),
    defineField({
      name: "paragraph3",
      title: "Paragraph 3 — Philosophy",
      description: "How you work, your values, your Pittsburgh focus.",
      group: "story",
      type: "text",
      rows: 5,
      initialValue:
        "Going independent means every client gets my full attention — not a fraction of it. I work by appointment only, give honest timelines, and take pride in garments that leave here better than they arrived. In 2025 I also completed a Master's degree in Human Resources and Employment Relations — because running a client-first business means being as intentional about the relationship as the craft itself. I'm based in Pittsburgh, and when you bring something to me, you're trusting me with something that matters.",
    }),
    defineField({
      name: "pullQuote",
      title: "Pull Quote",
      description: "Short italic quote shown beside the story image. e.g. 'Deadlines that are real. Craftsmanship that shows.'",
      group: "story",
      type: "string",
      initialValue: "Deadlines that are real. Craftsmanship that shows.",
    }),

    // ── Values ──────────────────────────────────────────────────
    defineField({
      name: "valuesLabel",
      title: "Values Section — Label",
      group: "values",
      type: "string",
      initialValue: "What I Stand By",
    }),
    defineField({
      name: "valuesHeading",
      title: "Values Section — Heading",
      group: "values",
      type: "string",
      initialValue: "My Values",
    }),

    // ── Why Independent ─────────────────────────────────────────
    defineField({
      name: "independenceLabel",
      title: "Why Independent — Section Label",
      group: "independence",
      type: "string",
      initialValue: "Why Independent",
    }),
    defineField({
      name: "independenceHeading",
      title: "Why Independent — Heading",
      group: "independence",
      type: "string",
      initialValue: "Working for myself means working for you.",
    }),
    defineField({
      name: "independenceQuote",
      title: "Why Independent — Quote",
      description: "The extended quote in the dark 'Why Independent' section.",
      group: "independence",
      type: "text",
      rows: 6,
      initialValue:
        "When I worked in a corporate shop, the pressure was to move fast, book more, and never slow down. I got very good at working quickly — but I missed the part of this craft that actually matters: giving a garment the attention it deserves, and giving a client the time to feel comfortable. Going independent let me do both. I don't overbook. I don't rush. And I don't work for a quota. I work for the people who trust me with something that matters to them.",
    }),

    // ── CTA Banner ──────────────────────────────────────────────
    defineField({
      name: "ctaHeadline",
      title: "CTA Banner — Headline",
      group: "cta",
      type: "string",
      initialValue: "Ready to work together?",
    }),
    defineField({
      name: "ctaSubhead",
      title: "CTA Banner — Subheadline",
      group: "cta",
      type: "string",
      initialValue: "Let's talk about your garment.",
    }),
    defineField({
      name: "ctaButton",
      title: "CTA Banner — Button Label",
      group: "cta",
      type: "string",
      initialValue: "Get in Touch",
    }),
  ],
  preview: { prepare: () => ({ title: "About Page" }) },
});
