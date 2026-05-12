import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "quote", title: "Quote (no quotation marks needed)", type: "text", rows: 4 }),
    defineField({ name: "name", title: "Client Name (first name + last initial is fine)", type: "string" }),
    defineField({ name: "occasion", title: "Occasion (e.g. Wedding, June 2024)", type: "string" }),
    defineField({ name: "order", title: "Display Order (1 = first)", type: "number" }),
  ],
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "occasion" } },
});
