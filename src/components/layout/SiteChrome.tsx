"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";
import CustomCursor from "./CustomCursor";

interface SiteData {
  siteName: string;
  businessName: string;
  location: string;
  availability: string;
  instagram: string;
  instagramUrl: string;
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
      <ScrollProgress />
      <CustomCursor />
      <Navbar siteName={site.siteName} businessName={site.businessName} />
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
