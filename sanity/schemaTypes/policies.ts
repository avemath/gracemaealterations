import { defineField, defineType } from "sanity";

export const policies = defineType({
  name: "policies",
  title: "Policies",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Page heading",
      type: "string",
      initialValue: "Policies",
    }),
    defineField({
      name: "intro",
      title: "Intro line",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "published",
      title: "Published",
      description: "Off until the draft copy has been reviewed. While off, /policies is not on the site and the footer link is hidden.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "heading", title: "Heading", type: "string" },
            {
              name: "body",
              title: "Body",
              type: "array",
              of: [{ type: "block", styles: [{ title: "Normal", value: "normal" }] }],
            },
          ],
          preview: {
    select: { title: "heading", published: "published" },
    prepare: ({ title, published }) => ({
      title: title ?? "Policies",
      subtitle: published ? "Published" : "Draft, not on the site",
    }),
  },
        },
      ],
    }),
  ],
  preview: { select: { title: "heading" } },
});
