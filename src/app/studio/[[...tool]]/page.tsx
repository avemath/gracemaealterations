"use client";

/**
 * Sanity Studio — embedded at /studio
 *
 * Access is protected by Sanity's own authentication.
 * Visitors who go to /studio will be prompted to log in
 * with a Sanity account. Only project members can access it.
 *
 * To add yourself as a project member:
 *   sanity.io/manage → your project → Members → Invite
 */

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export const dynamic = "force-dynamic";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
