import { defineField, defineType } from "sanity";

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  fields: [
    defineField({
      name: "image",
      title: "Contact Page Image",
      description: "Photo shown beside the contact form. Workspace, sewing table, fabric close-up, or a warm candid. Square ratio preferred.",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
    }),
  ],
  preview: { prepare: () => ({ title: "Contact Page" }) },
});
