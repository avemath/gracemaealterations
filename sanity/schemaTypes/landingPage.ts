import { defineField, defineType } from "sanity";

export const landingPage = defineType({
  name: "landingPage",
  title: "Landing Page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "intro", title: "Intro", type: "text", rows: 4 }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "heading", title: "Heading", type: "string" },
            { name: "body", title: "Body", type: "text", rows: 5 },
          ],
          preview: { select: { title: "heading" } },
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
    defineField({ name: "published", title: "Published", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "title", published: "published" },
    prepare: ({ title, published }) => ({ title, subtitle: published ? "Published" : "Draft" }),
  },
});
