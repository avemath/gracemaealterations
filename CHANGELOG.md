# Changelog

Newest first. Grace facing notes live in `site/content/FOR-GRACE.md`.

## Price list removed, September 2026

- `feat: drop the itemised price list from services`: the "See typical prices" list under each service had no prices in it, so every row read "quoted at fitting". Every garment is priced at the fitting, so the list is gone and each service shows only its price range, note and typical timeline. The Studio field is hidden, not deleted, so nothing is lost.

## Second audit, September 2026

- `fix: second audit follow-ups`:
  - One bridal timeline everywhere: the first fitting is 8 to 12 weeks before the wedding, and getting in touch 3 to 6 months ahead leaves room for it. The FAQ, the services page and the timing line in Grace's enquiry emails now agree (the email used to call 8 to 12 weeks "tight").
  - The availability line reads "Bridal waitlist open for early 2027" instead of repeating "By appointment", which the footer and contact page already say.
  - On phones: portfolio captions are always shown over a soft gradient (they were hover only, so phones never saw them), the contact form comes before the contact details, and the hero pill puts each lane on its own line.
  - The faint "01, 02, 03" step numbers are drawn with CSS, so contrast checkers skip them and the axe tests no longer need an exclusion.
  - The About eyebrow is ivory with a stronger shadow, readable over the photo. Footer links and the "Learn more" and "Read Grace's story" links are bigger tap targets.
  - The Sanity client no longer ships to the browser (the image URL helper builds without it), the About and Services hero photos load first, and the page connects to the image CDN early.
  - Bridal party requests get their own button on the services page, and the home bridal card says "Waitlist for early 2027".
  - `npm run copy:fixes` fixes four grammar slips in the live copy, including the half sentence the dash tidy left in the tailoring description.
  - CI on `main` no longer cancels an older commit's run when two merges land close together.

## Type and stats bar, September 2026

- `revert: Georgia and system sans, big gold stats bar`: Cormorant Garamond and Jost were live for a few hours and read as too thin and hard to read, so the site goes back to what visitors always saw: Georgia headings and the system sans-serif body, now set on purpose and with no web fonts downloaded. The home page gets back its large stats bar (B.S. Fashion Design, 500+ garments altered, Pittsburgh, PA), in gold_dark, with the garment count ticking up as it scrolls in. The small four-item trust strip it replaced is gone.


- `fix: brand fonts finally load; tighter mobile hero; honest count-up`:
  - Since April, `globals.css` redefined `--font-cormorant` and `--font-jost` on `:root` with the plain family names. That overrode the names next/font generates, so no brand font ever matched and every heading fell back to Georgia (Times on phones without it). Cormorant Garamond and Jost now load.
  - The mobile hero no longer forces the copy block to a full screen of height, which had left half a screen of empty ivory between the portrait and the headline.
  - The trust strip's count-up keeps the real figure when it is already on screen at load, skips the animation under reduced motion, and always gives screen readers the real number.
  - `npm run copy:tidy-dashes` takes the 21 em dashes out of the live Sanity copy, choosing a full stop or a comma for each.


- `feat: branded icons, light share cards, triage-ready enquiry emails`:
  - The favicon was still the stock Vercel triangle from the starter template. It is now a gold Cormorant "G" on near-black, with a 512 px app icon and an Apple touch icon, all rebuilt by `scripts/make-icons.mjs`.
  - Share cards are re-encoded from PNG to JPEG, about 960 KB down to about 78 KB, so WhatsApp and iMessage show them. The eyebrow uses gold_ink.
  - Fixed a regression where every page shared the home card: a default image in `pageMetadata` overrode each route's own `opengraph-image`.
  - Grace's notification email now shows readable dates and a timing line (for example "36 weeks away. Early: first fitting ideally between Dec 12 and Mar 13"). Tight dates get a RUSH subject prefix.
  - The portfolio's "Read the case study" link is no longer nested inside the photo button, and the hover caption also shows on keyboard focus.
  - Verified end to end on production: one real submission per branch, all delivered.


- `fix: contact form keeps focus, resizes photos, restores bridal intake`: the live form dropped every character after the first (the field component was declared inside render, so each keystroke remounted the input). Vercel logs show 76 visits to /contact and no submissions in the previous 30 days. Photos are now resized in the browser so five of them fit under Vercel's 4.5 MB request limit. The bridal branch has a short optional intake again. Dead API paths removed.
- `fix: reveals for late-mounted content, contrast, performance, tidy`: filtering the portfolio remounted the grid, and the new tiles were never revealed, so they stayed invisible. RevealObserver now watches for elements added after load. Scanning with reduced motion exposed contrast failures that had been hidden behind opacity 0: 70% gold labels and 45% ivory body copy on near-black. Before/after slider images are priority (portfolio LCP), grid images get real `sizes`, lqip is gone from the grid query, and ProcessSteps is its own chunk. RevealText, RevealImage and TestimonialsSection are removed, and the content.ts fallbacks are back in step with Sanity. The scrolled navbar used #C9A84C text on ivory (about 2.2:1) and now uses gold_ink. FAQ answers are always in the server HTML. /guides is noindex until a guide is published, /studio is noindex, pages without their own share image fall back to the home one, and the site sends nosniff, Referrer-Policy, X-Frame-Options and Permissions-Policy headers without X-Powered-By.
- `ci: GitHub Actions, reveal and visual tests`: lint, build and Playwright on every push and PR. There are new specs for scroll reveals, reduced motion, no-JS rendering, and full-page captures of the five main routes at 390 and 1440.

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
