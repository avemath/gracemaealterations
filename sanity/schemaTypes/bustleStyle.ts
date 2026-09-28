import { defineField, defineType } from "sanity";

export const bustleStyle = defineType({
  name: "bustleStyle",
  title: "Bustle Style",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" } }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    }),
    defineField({ name: "alsoCalled", title: "Also called", type: "string" }),
    defineField({ name: "typicalPoints", title: "Typical points", type: "string" }),
    defineField({ name: "bestFor", title: "Best for", type: "text", rows: 2 }),
    defineField({ name: "fabricNotes", title: "Fabric notes", type: "text", rows: 2 }),
    defineField({
      name: "priceFrom",
      title: "Price from (USD)",
      type: "number",
      // Not shown on the site: every garment is quoted at the fitting.
      // Hidden rather than removed so old values don't appear as unknown fields.
      hidden: true,
    }),
    defineField({ name: "published", title: "Published", type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "Display order", type: "number" }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", published: "published" },
    prepare: ({ title, published }) => ({ title, subtitle: published ? "Published" : "Draft" }),
  },
});
