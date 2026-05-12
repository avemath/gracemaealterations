import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";

const SINGLETONS = new Set(["siteSettings", "homePage", "aboutPage", "servicesPage", "contactPage", "portfolioPage"]);
const SINGLETON_ACTIONS = new Set(["publish", "discardChanges", "restore"]);

export default defineConfig({
  name: "gracemae-alterations",
  title: "Grace Mae Alterations",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",

  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            // ── PAGE SETTINGS (one of each) ───────────────────
            S.listItem()
              .title("Site Settings")
              .id("siteSettings")
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),

            S.listItem()
              .title("Home Page")
              .id("homePage")
              .child(S.document().schemaType("homePage").documentId("homePage")),

            S.listItem()
              .title("About Page")
              .id("aboutPage")
              .child(S.document().schemaType("aboutPage").documentId("aboutPage")),

            S.listItem()
              .title("Services Page")
              .id("servicesPage")
              .child(S.document().schemaType("servicesPage").documentId("servicesPage")),

            S.listItem()
              .title("Contact Page")
              .id("contactPage")
              .child(S.document().schemaType("contactPage").documentId("contactPage")),

            S.listItem()
              .title("Portfolio Page")
              .id("portfolioPage")
              .child(S.document().schemaType("portfolioPage").documentId("portfolioPage")),

            // ── CONTENT LISTS ─────────────────────────────────
            S.listItem()
              .title("Services")
              .id("services")
              .child(S.documentTypeList("service").title("Services")),

            S.listItem()
              .title("Portfolio Photos")
              .id("portfolioPhotos")
              .child(S.documentTypeList("portfolioItem").title("Portfolio Photos")),

            S.listItem()
              .title("Testimonials")
              .id("testimonials")
              .child(S.documentTypeList("testimonial").title("Testimonials")),

            S.listItem()
              .title("FAQ")
              .id("faq")
              .child(S.documentTypeList("faqItem").title("FAQ Items")),

            S.listItem()
              .title("Values")
              .id("values")
              .child(S.documentTypeList("value").title("Values")),
          ]),
    }),
    visionTool(),
  ],

  schema: { types: schemaTypes },

  document: {
    // Singletons: only allow publish/discard/restore — no duplicate creation
    actions: (prev, { schemaType }) =>
      SINGLETONS.has(schemaType)
        ? prev.filter(({ action }) => action && SINGLETON_ACTIONS.has(action))
        : prev,
    // Hide singletons from the global "New Document" menu
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter(({ templateId }) => !SINGLETONS.has(templateId))
        : prev,
  },
});
