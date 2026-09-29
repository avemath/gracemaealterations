import { defineField, defineType } from "sanity";

export const guide = defineType({
  name: "guide",
  title: "Guide",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
    }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      // Headings split a longer guide (like the trouser hem one) into parts.
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading", value: "h2" },
          ],
        },
      ],
    }),
    defineField({
      name: "timelineSteps",
      title: "Timeline steps",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "weeksOut", title: "When", type: "string" },
            { name: "title", title: "Title", type: "string" },
            { name: "detail", title: "Detail", type: "text", rows: 2 },
          ],
          preview: { select: { title: "title", subtitle: "weeksOut" } },
        },
      ],
    }),
    defineField({
      name: "faq",
      title: "Related FAQ items",
      type: "array",
      of: [{ type: "reference", to: [{ type: "faqItem" }] }],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        { name: "title", title: "Title", type: "string" },
        { name: "description", title: "Description", type: "text", rows: 2 },
      ],
    }),
    defineField({
      name: "published",
      title: "Published",
      description: "Off until Grace has reviewed the draft copy.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "order", title: "Display order", type: "number" }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title", published: "published" },
    prepare: ({ title, published }) => ({ title, subtitle: published ? "Published" : "Draft" }),
  },
});
