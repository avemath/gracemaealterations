import { siteSettings } from "./siteSettings";
import { homePage } from "./homePage";
import { aboutPage } from "./aboutPage";
import { servicesPage } from "./servicesPage";
import { contactPage } from "./contactPage";
import { service } from "./service";
import { testimonial } from "./testimonial";
import { portfolioItem } from "./portfolioItem";
import { faqItem } from "./faqItem";
import { value } from "./value";

export const schemaTypes = [
  // Singletons (one of each)
  siteSettings,
  homePage,
  aboutPage,
  servicesPage,
  contactPage,
  // Lists
  service,
  testimonial,
  portfolioItem,
  faqItem,
  value,
];
