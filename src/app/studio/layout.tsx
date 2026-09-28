import type { Metadata } from "next";

// The Studio is a login screen for Grace, not a page for search results.
export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
