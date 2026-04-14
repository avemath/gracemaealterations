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
    defineField({ name: "order", title: "Display Order (1 = first)", type: "number" }),
  ],
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "priceRange" } },
});
