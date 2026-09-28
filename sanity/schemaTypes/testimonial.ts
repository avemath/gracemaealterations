import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "quote", title: "Quote (no quotation marks needed)", type: "text", rows: 4 }),
    defineField({ name: "name", title: "Client Name (first name + last initial is fine)", type: "string" }),
    defineField({ name: "occasion", title: "Occasion (e.g. Wedding, June 2024)", type: "string" }),
    defineField({ name: "dressDesigner", title: "Dress designer", type: "string" }),
    defineField({ name: "alterations", title: "Alterations done", type: "string" }),
    defineField({ name: "venue", title: "Venue", type: "string" }),
    defineField({ name: "month", title: "Month married, e.g. August 2024", type: "string" }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt Text", type: "string" }],
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      options: { list: ["Direct", "Google", "The Knot", "WeddingWire"] },
      initialValue: "Direct",
    }),
    defineField({ name: "order", title: "Display Order (1 = first)", type: "number" }),
  ],
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "occasion" } },
});
