# Changelog

Newest first. Grace facing notes live in `site/content/FOR-GRACE.md`.

## Site upgrade, follow-ups

- `docs: handoff checklist for Grace`: plain language handoff covering what changed, every number still to fill in with its Studio location, the drafts awaiting review, and how to reopen bridal.
- `fix: policies gated behind published`: /policies 404s until the singleton is published, and is kept out of the sitemap, the footer and the contact small print until then. Draft markers are stripped from every string on the way to a template.
- `test: Playwright accessibility and keyboard pass`: axe across six routes at two widths plus a keyboard suite. Caught three real defects: filter pills at 2.1:1 contrast, a lightbox that closed itself on Enter, and 9,612 SVG path measurements in one task that Lighthouse recorded as a 9.5 second long task.
- `feat: CSS-driven reveals, visible without JS`: scroll reveals move from Framer to CSS plus one IntersectionObserver, armed by a class an inline script adds, so the server HTML and the no-JS experience are fully visible.

## Site upgrade, parts one to six

- `feat: guides, case studies and landing pages (draft content)`: guide, bustleStyle and landingPage types, case study fields on portfolio items, the routes that render them, and eleven seeded drafts that stay invisible until published.
- `feat: services restructure, branching contact, credentialed testimonials, footer, policies`: price tables and timelines per service, a three way contact form with a honeypot and rate limiting, optional credential fields on testimonials, a four column footer, and the policies page.
- `fix: metadata merge, sitemap, structured data, image loader`: per page titles, canonicals and OG images, app/sitemap.ts and app/robots.ts in place of next-sitemap, one JSON-LD graph, and a custom image loader so images are compressed once rather than twice.
- `feat: two-lane availability CTAs and unified copy`: one helper decides every call to action from siteSettings, so nothing offers a booking that is not open. One canonical availability paragraph and one response time sentence.
- `fix: WCAG contrast, focus, skip link, dialogs`: the gold_ink token for text on light surfaces, focus outlines, a skip link, focus traps on the menu and lightbox, and the typography scale. Found and fixed a silent Tailwind issue where @apply was dropping the button text colour entirely.
- `fix: visible SSR, reduced motion, sticky bar`: pages server rendered invisible until hydration; now fully visible. Reduced motion respected, custom cursor and scroll bar removed, hero image rendered once instead of twice.

## Earlier

- `fix: clearer hero face, sharper services hero, swapped studio photos`
- `fix: About hero label contrast, red houndstooth caption, OG tagline`
- `chore: updated About portrait`
- `fix: legible top banner, pointer-accurate cursor, corrected captions`
- `feat: specific portfolio captions, bridal-first order, featured items`
- `fix: per-page metadata, SSR stat value, stale scaffold`
- `feat: photographic OG image`
- `feat: per-service availability and bridal waitlist`
- `feat: hotspot-aware images, about portrait, service card backgrounds`
- `feat: upload new site imagery to Sanity`
- `fix: darken top banner so the name and nav links stay legible`
- `chore: image prep script and source assets`
