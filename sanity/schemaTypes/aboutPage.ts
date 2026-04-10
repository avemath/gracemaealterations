import { defineField, defineType } from "sanity";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    defineField({
      name: "heroImage",
      title: "Hero Image (full-bleed banner)",
      description: "Large image at the top of the About page. Ideal: you working at your machine or a professional portrait. Wide/landscape preferred.",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
    }),
    defineField({
      name: "secondaryImage",
      title: "Secondary Image (beside story text)",
      description: "Close-up of hands at work, fabric detail, or a candid shot. Portrait ratio (2:3) preferred.",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
    }),
    defineField({
      name: "pullQuote",
      title: "Pull Quote",
      description: "Short, punchy quote that appears in italic. e.g. 'Deadlines that are real. Craftsmanship that shows.'",
      type: "string",
    }),
    defineField({
      name: "paragraph1",
      title: "Paragraph 1 — Origin",
      description: "Where your love of sewing came from. Personal, warm, origin story.",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "paragraph2",
      title: "Paragraph 2 — Experience",
      description: "Your professional background (David's Bridal, etc.) and why you went independent.",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "paragraph3",
      title: "Paragraph 3 — Philosophy",
      description: "How you work, your values, your Pittsburgh focus.",
      type: "text",
      rows: 5,
    }),
  ],
  preview: { prepare: () => ({ title: "About Page" }) },
});
