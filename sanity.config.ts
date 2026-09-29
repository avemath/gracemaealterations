import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";
import { StartHere } from "./sanity/components/StartHere";

const SINGLETONS = new Set(["siteSettings", "homePage", "aboutPage", "servicesPage", "contactPage", "portfolioPage", "policies", "siteText", "formsText", "toolsText"]);
const SINGLETON_ACTIONS = new Set(["publish", "discardChanges", "restore"]);

export default defineConfig({
  name: "gracemae-alterations",
  title: "Grace Mae Alterations",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",

  // Keep the sign-in as a token in this browser rather than a sanity.io cookie,
  // so the Studio can prove who is asking when it calls this site's own
  // routes (the care notes drafting checks it).
  auth: { loginMethod: "token" },

  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Start here")
              .id("startHere")
              .child(S.component(StartHere).title("Start here")),

            S.divider(),

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

            S.listItem()
              .title("Policies")
              .id("policies")
              .child(S.document().schemaType("policies").documentId("policies")),

            // ── WORDS AROUND THE SITE ─────────────────────────
            S.listItem()
              .title("Words around the site")
              .id("words")
              .child(
                S.list()
                  .title("Words around the site")
                  .items([
                    S.listItem()
                      .title("Site-wide words")
                      .id("siteText")
                      .child(S.document().schemaType("siteText").documentId("siteText")),
                    S.listItem()
                      .title("Contact form & emails")
                      .id("formsText")
                      .child(S.document().schemaType("formsText").documentId("formsText")),
                    S.listItem()
                      .title("Guides & tools")
                      .id("toolsText")
                      .child(S.document().schemaType("toolsText").documentId("toolsText")),
                  ])
              ),

            // ── CARE CARDS (one per finished garment) ────────
            S.listItem()
              .title("Care Cards")
              .id("careCards")
              .child(
                S.documentTypeList("careCard")
                  .title("Care Cards")
                  .defaultOrdering([{ field: "completedOn", direction: "desc" }])
              ),

            S.divider(),

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
              .title("Guides")
              .id("guides")
              .child(S.documentTypeList("guide").title("Guides")),

            S.listItem()
              .title("Bustle Styles")
              .id("bustleStyles")
              .child(S.documentTypeList("bustleStyle").title("Bustle Styles")),

            S.listItem()
              .title("Landing Pages")
              .id("landingPages")
              .child(S.documentTypeList("landingPage").title("Landing Pages")),

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
