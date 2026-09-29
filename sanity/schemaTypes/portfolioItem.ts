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
    defineField({
      name: "caption",
      title: "Caption: what was done, e.g. 'French bustle, 5 points, cathedral hem'",
      description: "The specific work in this photo. Shown under the label on hover and in the lightbox, this is what proves the expertise.",
      type: "string",
    }),
    defineField({
      name: "featured",
      title: "Show in home page preview",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "slug", title: "Slug (for the case study page)", type: "slug", options: { source: "label" } }),
    defineField({ name: "caseStudy", title: "Has a case study page", type: "boolean", initialValue: false }),
    defineField({ name: "designer", title: "Designer", type: "string" }),
    defineField({ name: "silhouette", title: "Silhouette", type: "string" }),
    defineField({ name: "alterations", title: "Alterations", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "fittings", title: "Number of fittings", type: "number" }),
    defineField({ name: "weeks", title: "Weeks from first fitting to pickup", type: "number" }),
    defineField({ name: "venue", title: "Venue", type: "string" }),
    defineField({ name: "testimonial", title: "Testimonial", type: "reference", to: [{ type: "testimonial" }] }),
    defineField({
      name: "beforeImage",
      title: "Before",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    }),
    defineField({
      name: "afterImage",
      title: "After",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", title: "Alt text", type: "string" }],
        },
      ],
    }),
    defineField({ name: "order", title: "Display Order (1 = first)", type: "number" }),
  ],
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "label", caption: "caption", type: "type", media: "image" },
    prepare: ({ title, caption, type, media }) => ({
      title,
      subtitle: caption || type,
      media,
    }),
  },
});
