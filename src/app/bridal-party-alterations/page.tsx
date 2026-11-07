import { LandingPage, landingMetadata } from "../_landing/LandingPage";

// A landing page: see src/app/_landing/LandingPage.tsx for why each one is its own route.
export const revalidate = 60;

const SLUG = "bridal-party-alterations";

export function generateMetadata() {
  return landingMetadata(SLUG);
}

export default function Page() {
  return <LandingPage slug={SLUG} />;
}
