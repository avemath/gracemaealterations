import { defineField, defineType } from "sanity";

export const value = defineType({
  name: "value",
  title: "Value",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Value Title (e.g. Honest Timelines)", type: "string" }),
    defineField({ name: "description", title: "Description (2 sentences)", type: "text", rows: 3 }),
    defineField({ name: "order", title: "Display Order (1 = first)", type: "number" }),
  ],
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title" } },
});
