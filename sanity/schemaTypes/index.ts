import { siteSettings } from "./siteSettings";
import { homePage } from "./homePage";
import { aboutPage } from "./aboutPage";
import { servicesPage } from "./servicesPage";
import { contactPage } from "./contactPage";
import { portfolioPage } from "./portfolioPage";
import { policies } from "./policies";
import { service } from "./service";
import { testimonial } from "./testimonial";
import { portfolioItem } from "./portfolioItem";
import { faqItem } from "./faqItem";
import { value } from "./value";
import { guide } from "./guide";
import { bustleStyle } from "./bustleStyle";
import { landingPage } from "./landingPage";
import { careCard } from "./careCard";

export const schemaTypes = [
  // Singletons (one of each)
  siteSettings,
  homePage,
  aboutPage,
  servicesPage,
  contactPage,
  portfolioPage,
  policies,
  // Lists
  service,
  testimonial,
  portfolioItem,
  faqItem,
  value,
  guide,
  bustleStyle,
  landingPage,
  careCard,
];
