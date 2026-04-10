import { defineField, defineType } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "heroImage",
      title: "Hero Portrait Image",
      type: "image",
      description: "Portrait photo of you — at your sewing machine, holding fabric, or a headshot. Best ratio: 3:4 (portrait).",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt Text (describe the image for accessibility)", type: "string" }),
      ],
    }),
    defineField({
      name: "trustStats",
      title: "Trust Bar Stats",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "value", title: "Value (e.g. 7+)", type: "string" }),
            defineField({ name: "label", title: "Label (e.g. Years Experience)", type: "string" }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
    }),
  ],
  preview: { select: { title: "_type", media: "heroImage" }, prepare: () => ({ title: "Home Page" }) },
});
