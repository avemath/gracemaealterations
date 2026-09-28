import { defineField, defineType } from "sanity";

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Service Title", type: "string" }),
    defineField({
      name: "slug",
      title: "URL ID (used for anchor links)",
      type: "slug",
      description: "Click 'Generate' — don't change this after launch.",
      options: { source: "title" },
    }),
    defineField({ name: "icon", title: "Icon Style", type: "string", options: { list: ["bridal", "tailoring", "custom"], layout: "radio" } }),
    defineField({ name: "shortDescription", title: "Short Description (shown on homepage card)", type: "text", rows: 2 }),
    defineField({ name: "description", title: "Full Description (shown on services page)", type: "text", rows: 5 }),
    defineField({
      name: "services",
      title: "Services List (bullet points)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "priceRange", title: "Price Range (e.g. $75 – $450+)", type: "string" }),
    defineField({ name: "priceNote", title: "Price Note (e.g. depending on complexity)", type: "string" }),
    defineField({ name: "freeConsult", title: "Free Consultation Note (leave blank to hide)", type: "string" }),
    defineField({
      name: "cardImage",
      title: "Card Background (home page, dark, low opacity)",
      description: "Dark fabric or detail texture shown behind this service's card on the home page. It sits at low opacity under a gradient, so pick something moody rather than bright.",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
    }),
    defineField({
      name: "priceTable",
      title: "Typical prices",
      // No longer shown on the site: every price is quoted per garment at the
      // fitting. Hidden rather than removed so the old rows don't show up in
      // the Studio as unknown fields.
      hidden: true,
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "item", title: "Item", type: "string" },
            { name: "from", title: "From (USD)", type: "number" },
            { name: "note", title: "Note", type: "string" },
          ],
          preview: { select: { title: "item", subtitle: "from" } },
        },
      ],
    }),
    defineField({
      name: "typicalTimeline",
      title: "Typical timeline",
      description: "One line, e.g. 'Usually within two weeks.'",
      type: "string",
    }),
    defineField({ name: "order", title: "Display Order (1 = first)", type: "number" }),
  ],
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "priceRange" } },
});
