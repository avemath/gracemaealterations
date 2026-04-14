import { defineField, defineType } from "sanity";

export const portfolioItem = defineType({
  name: "portfolioItem",
  title: "Portfolio Item",
  type: "document",
  fields: [
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          description: "Describe the photo for accessibility and SEO (e.g. 'Before and after bridal gown hem alteration')",
          type: "string",
        }),
      ],
    }),
    defineField({ name: "label", title: "Label (shown on hover, e.g. Bridal Gown)", type: "string" }),
    defineField({
      name: "type",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Bridal", value: "bridal" },
          { title: "Tailoring", value: "tailoring" },
          { title: "Custom", value: "custom" },
        ],
        layout: "radio",
      },
    }),
    defineField({ name: "order", title: "Display Order (1 = first)", type: "number" }),
  ],
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "label", subtitle: "type", media: "image" },
  },
});
