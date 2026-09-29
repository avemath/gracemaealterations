import { defineField, defineType } from "sanity";

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero" },
    { name: "messages", title: "Status Messages" },
    { name: "image", title: "Sidebar Image" },
  ],
  fields: [
    // ── Hero ─────────────────────────────────────────────────────
    defineField({
      name: "heroLabel",
      title: "Hero: Section Label",
      group: "hero",
      type: "string",
      initialValue: "Get in Touch",
    }),
    defineField({
      name: "heroHeading",
      title: "Hero: Heading",
      group: "hero",
      type: "string",
      initialValue: "Let's Talk About Your Garment",
    }),

    // ── Status Messages ─────────────────────────────────────────
    defineField({
      name: "waitlistBannerBold",
      title: "Waitlist Banner: Bold Opening",
      description: "Shown at the top of the page when the whole site is on a waitlist. Bold portion of the banner text.",
      group: "messages",
      type: "string",
      initialValue: "Bridal fittings are on a waitlist right now.",
    }),
    defineField({
      name: "waitlistBannerText",
      title: "Waitlist Banner: Continuing Text",
      description: "The rest of the waitlist banner message after the bold part.",
      group: "messages",
      type: "string",
      initialValue:
        "Fill out the form below to join my waitlist, I'll reach out as soon as a spot opens up.",
    }),
    defineField({
      name: "successHeading",
      title: "Success State: Heading",
      description: "Large heading shown after the form is submitted successfully.",
      group: "messages",
      type: "string",
      initialValue: "Thank you.",
    }),
    defineField({
      name: "successMessage",
      title: "Success State: Message (normal booking)",
      description: "Body text shown after a regular booking inquiry is submitted.",
      group: "messages",
      type: "text",
      rows: 3,
      initialValue:
        "Your message has been received. Check your inbox: I've sent a confirmation with next steps. I read every message myself and reply as soon as I can.",
    }),
    defineField({
      name: "waitlistSuccessMessage",
      title: "Success State: Message (waitlist)",
      description: "Body text shown after a waitlist submission.",
      group: "messages",
      type: "text",
      rows: 2,
      initialValue: "You're on my waitlist. I'll reach out as soon as a spot opens up.",
    }),

    // ── Sidebar Image ────────────────────────────────────────────
    defineField({
      name: "image",
      title: "Sidebar Image",
      description: "Photo shown beside the contact form. Workspace, sewing table, fabric close-up, or a warm candid. Square ratio preferred.",
      group: "image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
    }),
  ],
  preview: { prepare: () => ({ title: "Contact Page" }) },
});
