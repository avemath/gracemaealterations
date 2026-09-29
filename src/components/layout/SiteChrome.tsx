"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import type { TextFor } from "@/lib/cta";

/** The Studio's words for the header, the footer and the menu button. */
export type ChromeText = TextFor<"nav" | "footer" | "cta">;

interface SiteData {
  siteName: string;
  businessName: string;
  location: string;
  availability: string;
  instagram: string;
  instagramUrl: string;
  email: string;
  limitedMode?: boolean;
  reopensLabel?: string;
  googleReviewUrl?: string;
  guides?: { title: string; slug: string }[];
  hasPolicies?: boolean;
}

interface Props {
  children: React.ReactNode;
  site: SiteData;
  text: ChromeText;
}

export default function SiteChrome({ children, site, text }: Props) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");

  if (isStudio) return <>{children}</>;

  return (
    <>
      <Navbar
        siteName={site.siteName}
        businessName={site.businessName}
        limitedMode={site.limitedMode}
        reopensLabel={site.reopensLabel}
        hasGuides={(site.guides?.length ?? 0) > 0}
        text={text}
      />
      {children}
      <Footer
        siteName={site.siteName}
        businessName={site.businessName}
        location={site.location}
        availability={site.availability}
        email={site.email}
        instagram={site.instagram}
        instagramUrl={site.instagramUrl}
        googleReviewUrl={site.googleReviewUrl}
        guides={site.guides}
        hasPolicies={site.hasPolicies}
        text={text}
      />
    </>
  );
}
