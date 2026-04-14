import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  // Only one of these should exist (singleton)
  fields: [
    defineField({ name: "ownerName", title: "Your Name", type: "string" }),
    defineField({ name: "businessName", title: "Business Name", type: "string" }),
    defineField({ name: "tagline", title: "Tagline (hero headline)", type: "string" }),
    defineField({ name: "subTagline", title: "Sub-tagline (below headline)", type: "string" }),
    defineField({ name: "email", title: "Contact Email", type: "string" }),
    defineField({ name: "instagram", title: "Instagram Handle (e.g. @gracemae)", type: "string" }),
    defineField({ name: "instagramUrl", title: "Instagram Full URL", type: "url" }),
    defineField({ name: "location", title: "Location (e.g. Pittsburgh, PA)", type: "string" }),
    defineField({ name: "availability", title: "Availability Note", type: "string" }),
    defineField({ name: "responseTime", title: "Response Time Note", type: "string" }),
    defineField({ name: "metaDescription", title: "SEO Meta Description", type: "text", rows: 3 }),
  ],
  preview: { select: { title: "businessName" } },
});
