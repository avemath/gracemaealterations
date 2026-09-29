# Changelog

Newest first. Grace facing notes live in `site/content/FOR-GRACE.md`.

## Ready when Grace is, September 2026

- `feat: "Gowns I've worked on"`: a designers and brands list on each Service, shown under that service once filled in.
- `feat: "Where fittings happen"` on the About page: photos of the room and short details (where, parking, guests, kids and pets), hidden until there is at least one photo or detail.
- `feat: "Needed by" on tailoring requests`, shown in Grace's email as Needed By.
- `seo: image sitemap` at /image-sitemap.xml, listed in robots.txt, so Google Images can find the portfolio.

## Bustle helper on care cards, September 2026

- `feat: "How to bustle your dress" on care pages`: a care card can hold the gown's bustle style, train length, number of points, step-by-step notes and a short video. The care page then shows the bustle drawing locked to that style (with that many points), the steps and the video, and the printed card adds "Scan it for how to bustle your dress, too." All of its wording is in Contact form & emails.

## Lighter pages, guide share cards and tool insight, September 2026

- `perf: animation library loads only what the site uses` (LazyMotion + domAnimation): about 25 KB less JavaScript on the home, services, portfolio, about and contact pages (home 165 kB to 140 kB first load).
- `feat: every guide shares with its own card`, and the share cards now use Gelasio (a close cousin of the site's Georgia) and a plain sans instead of Cormorant and Jost.
- `feat: see which tools get used`: Vercel Analytics events for the bustle and hem explorers (which style or break), the Your dates calculator (what kind of date, and calendar downloads), a fully packed fitting bag, and the photo check.

## Every word editable in the Studio, September 2026

- `feat: words around the site`: three new Studio documents, Site-wide words (131 fields), Contact form & emails (171) and Guides & tools (133), hold the wording that used to be written into the code: buttons and labels, header, footer and sticky buttons, the home, services, portfolio, about, landing, policies and 404 pages, the contact form, photo check, confirmation emails and care pages, and the guides' tools (Your dates, fitting bag, bustle and trouser hem explorers, calendar file). Each field starts with the original wording, shows it underneath, and falls back to it when left empty. The Studio schema, the site's fallbacks and the seed script all come from one spec per area (`src/lib/text/specs`), so they can't drift apart; `tests/wording.spec.ts` checks the specs.
- `feat: the trouser hem guide is a Studio guide`, and each service picks its own "Helpful guides".
- `feat: Studio helpers`: a Start here page, "Open preview" going to the page each document appears on, and warnings (never blocking) for em dashes and missing {placeholders}.
- `feat: instant updates`: `/api/revalidate` refreshes the site the moment something is published, once a signed Sanity webhook and `SANITY_REVALIDATE_SECRET` are set up.
- Run `npm run content:text` once to fill the new documents with today's wording (and create the trouser hem guide). It never overwrites anything already changed.

## Guides, honest dates and prices, September 2026

- `feat: "Your dates" calculator` on the timing guide: enter a wedding date and see when each fitting falls, with an honest one-line read (good timing, plenty of time, due now, under eight weeks, or before bridal reopens) and an "Add these to my calendar" file. The date stays on that device.
- `feat: date-aware bridal form`: the contact form gives the same honest note as soon as a bride enters her date. If it is under eight weeks away or before bridal reopens, the button says "Ask about my date" and her confirmation email says Grace will tell her honestly whether she can fit it in, with a referral if not, instead of "you're on my waitlist".
- `feat: trouser hem guide` at /guides/trouser-hem-length: a drawing of no, quarter, half and full break over a dress shoe, sneaker or heel, slim, straight or wide leg, and a slanted hem, with notes in Grace's voice.
- `change: guides live on the Guides page`: the bustle explorer moved off the services page to the bustle guide, and each service lists its guides underneath (bridal: timing, bustles, what to bring; tailoring: trouser hems).
- `change: prices at current rates`: bridal $300 to $900+ (2026 US brides typically pay $300 to $800, more for full or complex work), tailoring $25 to $175, home page "from $25". Live in Sanity once `npm run copy:fixes` runs, along with the copy polish below.
- `fix: second audit`:
  - Text can no longer stay invisible if scripts fail: the fade-in only arms once it's running, after showing what's already on screen (this also stops holding back the portfolio's first image).
  - A Sanity outage no longer caches placeholder boxes: reads retry, then fail so the last good page stays up; friendly error pages added.
  - Unknown root paths are proper 404s. Unpublished-page 404s no longer render blank without JavaScript.
  - The stitch timeline measures its path in small idle slices and skips phones, removing the home page's slowest task. Hero parallax stays still for reduced motion.
  - Phones: the sticky button matches the page (the waitlist on bridal pages, with tailoring as a quiet link; a party request on the bridal party page), focus is never hidden under the sticky bars, and the bar steps aside on very short screens. Desktop shows one floating button instead of two stacked over the text.
  - Contact form: links like "Send a bridal party request" land on the form, photos can be removed on phones, the photo button shows keyboard focus, name and email are marked required with length limits, placeholders are darker.
  - High-contrast mode shows which option is chosen; hover colors pass contrast; portfolio filters are proper toggle buttons with a spoken count; the testimonial carousel announces changes.
  - Guides print cleanly, the site has a web app manifest and theme color, the About portrait keeps her face in frame, the availability pill no longer wraps awkwardly, and "All work" in the portfolio leads with bridal.
- `copy`: "What I do" instead of "What's included in every fitting", hem types (plain, lace-edged, horsehair), "a real quote for your garment", a rush answer that no longer contradicts the waitlist, "The alterations" for step 4, "By appointment / One client at a time" instead of "Proudly local", sentence-case headings, a plainer portfolio line.

## Fitting bag checklist and audit fixes, September 2026

- `feat: the what-to-bring guide is a fitting bag checklist`: each item gets a small line drawing (shoes, hanger, veil, camera, two people) and a box to tick while packing, with "3 of 5 packed" and "All packed. See you at the fitting." Ticks stay on that phone only. The words still come from the guide in the Studio.
- `fix: audit`:
  - Care notes drafting only works for people signed in to the Studio: the Studio sends the editor's own Sanity token and the route checks it with Sanity before drafting. The Studio now keeps its sign-in as a token in the browser, so Grace signs in once more.
  - The photo check accepts this project's own previews only (not every vercel.app site) and has an hourly ceiling on all checks; neither AI route retries past the function's time limit.
  - The contact confirmation email only greets by a plain first name and takes the waitlist date from Sanity, so it can't be used to send someone else's message from Grace's address. Attachments must really be JPEG, PNG or WebP photos. A malformed request is a 400, not a crash, and "days away" is counted from today in Pittsburgh.
  - Sanity reads can use a server-only read token (`SANITY_API_READ_TOKEN`) so the dataset can be made private, and always read published content.
  - Next's own image optimizer is off (every image is served by Sanity's CDN), a light Content-Security-Policy is added, and structured data is escaped.
  - The Sanity client no longer loads in visitors' browsers.
  - Contact form: a failed submit takes you to the first field that needs fixing. Mobile menu: Tab reaches the close button. Portfolio lightbox: focus stays inside at the first and last photo. Before/after slider: the page scrolls normally on phones.
  - Landing pages published after a deploy appear without a redeploy, the sitemap lists only allowed ones, the footer links them, and their descriptions no longer stop mid-word. Unpublished policies no longer claim a canonical URL.
  - The footer's bottom links are easier to tap and include Guides. The bustle explorer's caption says "Bustling" during the move, and a choice made in the first moment isn't overridden by the autoplay. The bustle guide no longer repeats every style twice.
  - Removed 24 one-off scripts from the repo root (two of them would overwrite live content with old copy), an unused lightbox and unused fonts; em dashes out of the seed script and a portfolio caption.

## Bustle explorer shows the pull, September 2026

- `feat: bustle explorer shows which way the fabric is pulled`:
  - A side view sits beside the back view (phones switch between them). From the side you see the loop lift off the floor and travel up the outside to the hip hook (American), the fabric roll down the back and tuck under to a tie inside (French), the cord gather the train up the back into swags (Austrian), the train fold under at the hem (ballroom), and the train unhook at the waist (detachable).
  - Every pickup point travels along a gold arrow that shows only the way still to go; hooks are solid dots, hidden ties dashed rings, and the part tucked inside the skirt is drawn as a see-through outline.
  - A three-step caption says what is happening at each moment, and the move is slower so it can be followed.

## Care cards, September 2026

- `feat: care cards with QR codes and drafted care notes`:
  - A new Care Cards list in the Studio. Grace fills in the garment, fabric and what she did, presses "Draft care notes" for a first version in her voice (conservative advice for that fabric, no promises, prices or stain recipes), edits it, publishes, and presses "Print the card".
  - The card is business-card size, one side, with a QR code; printing hides everything else on the page and a dashed line marks where to trim.
  - The QR opens `/care/<code>`: "Caring for your wedding gown", the date, the before and after slider when both photos are there, what was done, the care notes, and "If you loved how it turned out" with the Google review button (once the review link is in Site Settings), an Instagram tag and a link back to the contact form.
  - Codes are random and unguessable, pages are noindex and out of the sitemap, unknown codes are a plain 404, and switching "Page is live" off takes a page down.

## Photo check, September 2026

- `feat: optional photo check on the contact form`:
  - After attaching photos, a customer can press "Check my photos" for a quick, factual read of what they show: the garment, the likely fabric with how sure it is and why (sheen, drape, texture), layers, visible details and closures, train length, and neutral observations of how the garment sits. It also lists what photos can't show, such as fiber content.
  - It describes, never advises: no suggested work, prices or dates, no opinions on style, and nothing about the person wearing it. On bridal requests it can point at checklist items that relate to something visible; the customer taps the ones that match.
  - The customer chooses whether it goes with the request. Grace sees it in her email under "Photo Check", labelled as automated.
  - Uses the Anthropic API with structured output, so the answer always has the same shape, and server-side refusal fallback. Six checks per connection per hour, same-site requests only, up to three photos. Hidden entirely until `ANTHROPIC_API_KEY` is set.

## Bustle explorer and the sewn timeline, September 2026

- `feat: interactive bustle explorer; the phone timeline is sewn`:
  - A drawing of a gown from the back, on the services page (right after bridal) and at the top of the bustle guide. Pick American, French, Austrian, ballroom or a detachable train, and a sweep, chapel or cathedral train, then bustle it: the train lifts into that style. A slider moves it by hand. Gold dots are hooks on top, dashed rings are ties underneath. It plays once when it comes into view, never under reduced motion, and the drawing's accessible name always says which style and whether it is bustled.
  - The copy for each style comes from the Studio's Bustle Styles once they are published, and falls back to the same wording until then.
  - On phones, the process timeline is now sewn: a running stitch follows the scroll, a needle leads it, and each step's dot fills in as the thread passes it.

## Cleanup and drafts, September 2026

- `chore: price leftovers out, Google links in Studio, drafts ready to publish`:
  - The hidden "Three real gowns, three real quotes" block and the bustle "Price from" boxes are gone from the site and hidden in Studio, in line with quoting every garment at the fitting.
  - The footer's "Leave a Google review" link read from a blank constant in the code, and Studio had no field for it, so it could never appear. Site Settings now has a Google Business Profile link and a Google review link. The profile link also goes into the structured data, so Google ties the site to the profile.
  - `npm run content:publish` puts the three guides, five bustle styles and two landing pages live after review. It takes out the [DRAFT] markers and fixes what the review found: British spellings, and a promised referral Grace may not be able to give. Policies stay off until Grace confirms them.
  - FOR-GRACE has a short "Only you can do these" list.

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
