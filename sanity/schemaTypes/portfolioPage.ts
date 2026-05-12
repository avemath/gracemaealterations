import { defineField, defineType } from "sanity";

export const portfolioPage = defineType({
  name: "portfolioPage",
  title: "Portfolio Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero" },
    { name: "featured", title: "Featured Transformation" },
    { name: "cta", title: "CTA Banner" },
  ],
  fields: [
    // ── Hero ─────────────────────────────────────────────────────
    defineField({
      name: "heroLabel",
      title: "Hero — Section Label",
      group: "hero",
      type: "string",
      initialValue: "Selected Work",
    }),
    defineField({
      name: "heroHeading",
      title: "Hero — Heading",
      group: "hero",
      type: "string",
      initialValue: "The Work",
    }),
    defineField({
      name: "heroSubtext",
      title: "Hero — Subtext",
      description: "One sentence shown below the heading in the hero.",
      group: "hero",
      type: "string",
      initialValue: "Each garment is a collaboration between craft and vision.",
    }),

    // ── Featured Transformation ──────────────────────────────────
    defineField({
      name: "featuredSectionLabel",
      title: "Featured Section — Label",
      group: "featured",
      type: "string",
      initialValue: "Featured Transformation",
    }),
    defineField({
      name: "featuredHeading",
      title: "Featured Section — Heading",
      group: "featured",
      type: "string",
      initialValue: "Drag to see the difference.",
    }),
    defineField({
      name: "featuredBody",
      title: "Featured Section — Body Text",
      description: "Short description beside the before/after slider.",
      group: "featured",
      type: "text",
      rows: 4,
      initialValue:
        "Every alteration starts with a garment that almost fits and ends with one that feels made for you. Use the slider to compare the before and after — or scroll down to browse the full portfolio.",
    }),
    defineField({
      name: "featuredLabel",
      title: "Before/After Slider — Label",
      description: "Short label shown on the slider itself (e.g. 'Bridal Gown — Cathedral Hem & Bustle').",
      group: "featured",
      type: "string",
    }),
    defineField({
      name: "featuredDescription",
      title: "Before/After Slider — Description",
      description: "One sentence describing what changed (e.g. 'Hem shortened 4\", custom bustle added, bodice taken in at sides.').",
      group: "featured",
      type: "string",
    }),
    defineField({
      name: "beforeImage",
      title: "Before Image",
      description: "The garment before alterations. Same angle/distance as the After image works best.",
      group: "featured",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
    }),
    defineField({
      name: "afterImage",
      title: "After Image",
      description: "The garment after alterations. Match the angle of the Before image for maximum effect.",
      group: "featured",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
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
  preview: { prepare: () => ({ title: "Portfolio Page" }) },
});
