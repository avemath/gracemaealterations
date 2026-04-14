import { defineField, defineType } from "sanity";

export const servicesPage = defineType({
  name: "servicesPage",
  title: "Services Page",
  type: "document",
  fields: [
    defineField({
      name: "heroImage",
      title: "Services Hero Background Image",
      description: "Wide background image for the services page hero. Fabric, gown detail, or workspace shot works well.",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
    }),
  ],
  preview: { prepare: () => ({ title: "Services Page" }) },
});
