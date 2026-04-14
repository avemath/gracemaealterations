import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";

const SINGLETONS = new Set(["siteSettings", "homePage", "aboutPage", "servicesPage", "contactPage"]);
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
            S.listItem().title("Site Settings").child(
              S.document().schemaType("siteSettings").documentId("siteSettings")
            ),
            S.listItem().title("Home Page").child(
              S.document().schemaType("homePage").documentId("homePage")
            ),
            S.listItem().title("About Page").child(
              S.document().schemaType("aboutPage").documentId("aboutPage")
            ),
            S.listItem().title("Services Page").child(
              S.document().schemaType("servicesPage").documentId("servicesPage")
            ),
            S.listItem().title("Contact Page").child(
              S.document().schemaType("contactPage").documentId("contactPage")
            ),
            S.divider(),
            S.listItem().title("Services").schemaType("service").child(
              S.documentTypeList("service").title("Services").defaultOrdering([{ field: "order", direction: "asc" }])
            ),
            S.listItem().title("Portfolio Photos").schemaType("portfolioItem").child(
              S.documentTypeList("portfolioItem").title("Portfolio").defaultOrdering([{ field: "order", direction: "asc" }])
            ),
            S.listItem().title("Testimonials").schemaType("testimonial").child(
              S.documentTypeList("testimonial").title("Testimonials").defaultOrdering([{ field: "order", direction: "asc" }])
            ),
            S.listItem().title("FAQ").schemaType("faqItem").child(
              S.documentTypeList("faqItem").title("FAQ Items").defaultOrdering([{ field: "order", direction: "asc" }])
            ),
            S.listItem().title("Values").schemaType("value").child(
              S.documentTypeList("value").title("Values").defaultOrdering([{ field: "order", direction: "asc" }])
            ),
          ]),
    }),
    visionTool(),
  ],

  schema: { types: schemaTypes },

  document: {
    actions: (prev, { schemaType }) =>
      SINGLETONS.has(schemaType)
        ? prev.filter(({ action }) => action && SINGLETON_ACTIONS.has(action))
        : prev,
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === "global") {
        return prev.filter(({ templateId }) => !SINGLETONS.has(templateId));
      }
      return prev;
    },
  },
});
