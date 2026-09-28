"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface SiteData {
  siteName: string;
  businessName: string;
  location: string;
  availability: string;
  instagram: string;
  instagramUrl: string;
  limitedMode?: boolean;
  reopensLabel?: string;
}

interface Props {
  children: React.ReactNode;
  site: SiteData;
}

export default function SiteChrome({ children, site }: Props) {
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
      />
      {children}
      <Footer
        siteName={site.siteName}
        businessName={site.businessName}
        location={site.location}
        availability={site.availability}
        instagram={site.instagram}
        instagramUrl={site.instagramUrl}
      />
    </>
  );
}
