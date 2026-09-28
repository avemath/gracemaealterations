# Grace Mae Alterations

Marketing website for Grace Mae Alterations - a bridal and clothing alterations business based in Pittsburgh, PA. Built with Next.js 14 and Sanity CMS, deployed on Vercel.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, styled-components |
| Animation | Framer Motion |
| CMS | Sanity v3 (embedded Studio at `/studio`) |
| Email | Resend |
| Hosting | Vercel |
| Analytics | Vercel Analytics |
| Sitemap | `app/sitemap.ts` and `app/robots.ts` (built in) |

## Pages

| Route | Description |
|---|---|
| `/` | Home - hero, services overview, portfolio preview, about teaser, testimonials, process steps, CTA |
| `/about` | About - bio, values, pull quote, secondary image |
| `/services` | Services - service cards with pricing ranges |
| `/portfolio` | Portfolio - photo grid with lightbox, before/after slider |
| `/contact` | Contact - inquiry form (bridal, tailoring, custom), waitlist mode |
| `/studio` | Embedded Sanity Studio (content editing) |

## Features

- **Inquiry form** - three branches (tailoring, bridal, bridal party) with a short optional bridal intake; up to five photos, resized in the browser so the request stays under Vercel's 4.5 MB body limit; honeypot and per-instance rate limiting; waitlist mode per service
- **Care cards** - one per finished garment, made in the Studio (Care Cards). "Draft care notes" writes a first version from the garment, fabric and work (Anthropic API, needs `ANTHROPIC_API_KEY`); "Print the card" opens a business-card-size card with a QR code. The code opens `/care/<code>`: care notes, the before and after, and a Google review button once the review link is set. Private by link, noindex, never in the sitemap
- **Photo check** - optional, after photos are attached: an AI read of what the photos show (garment, likely fabric with confidence and visual cues, visible details, train, neutral fit observations, and what photos can't show). It never suggests work, prices or dates, never comments on the person, and on bridal requests only points at checklist items the customer then taps. The customer chooses whether it goes with the request; Grace's email shows it under "Photo Check". Off unless `ANTHROPIC_API_KEY` is set
- **Email notifications** - Resend sends a formatted notification to Grace and a confirmation email to the client on every submission
- **Sanity CMS** - all page content and images are editable via the embedded Studio; the app falls back to static `src/data/content.ts` values when Sanity is not configured
- **Portfolio lightbox** - click any portfolio image to open a full-screen lightbox
- **Before/after slider** - drag to reveal before and after on featured transformations
- **Testimonial carousel** - auto-cycling with manual navigation
- **Scroll reveals** - CSS driven via `data-reveal` and one IntersectionObserver; content is visible without JS and with reduced motion
- Sticky mobile and desktop CTAs
- **SEO** - JSON-LD LocalBusiness structured data, OG image, sitemap, robots.txt

## Project Structure

```
site/
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/contact/   # Contact form API route (Resend)
│   │   ├── about/
│   │   ├── contact/
│   │   ├── portfolio/
│   │   ├── services/
│   │   └── studio/        # Embedded Sanity Studio
│   ├── components/
│   │   ├── layout/        # Navbar, Footer, SiteChrome, CTAs, cursor, transitions
│   │   ├── sections/      # CTABanner, ProcessSteps, ExampleQuotes, InstagramRow
│   │   └── ui/            # Accordion, BeforeAfterSlider, Lightbox, CountUp, etc.
│   ├── data/
│   │   └── content.ts     # Static fallback content (used when Sanity is not configured)
│   └── lib/
│       ├── sanity.client.ts   # Sanity client setup
│       ├── sanity.queries.ts  # GROQ queries + merged data fetchers
│       ├── sanity.image.ts    # Image URL builder
│       └── resend.ts          # Resend client and email config
├── sanity/
│   └── schemaTypes/       # Sanity schema definitions
├── public/                # Static assets
└── sanity.config.ts       # Sanity Studio configuration
```

## Setup and Installation

### Prerequisites
- Node.js 18+
- A Sanity project (free at sanity.io) - optional, app runs without it
- A Resend account for contact form emails

### Install

```sh
cd site
npm install
```

### Environment Variables

Create a `.env.local` file in the `site/` directory:

```env
# Sanity CMS (optional - app falls back to static content without these)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token

# Resend (required for contact form emails)
RESEND_API_KEY=your_resend_api_key

# Anthropic (optional - turns on the photo check on the contact form)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Email addresses (defaults shown below)
CONTACT_EMAIL=inquiries@gracemaealterations.com
FROM_EMAIL=hello@gracemaealterations.com
```

`NEXT_PUBLIC_*` variables are exposed to the browser. All others are server-side only.

**The photo check** only appears when `ANTHROPIC_API_KEY` is set in Vercel (Production and Preview), followed by a redeploy. Without it, the contact form looks exactly as before. Each check reads up to three already-resized photos and costs a few cents. Six checks per connection per hour are allowed, from this site's own pages only. Set a monthly spend limit on the key in the Anthropic console as a backstop.

## Content Scripts

All run from `site/` and need `SANITY_API_TOKEN` in `.env.local`.

| Command | What it does |
|---|---|
| `npm run images` | Prepare and upload in one go |
| `npm run images:prepare` | Copies the source photos into `assets/source-images/`, writes print-quality JPEGs to `assets/prepared/` (git-ignored), splits the service-card triptych, and builds `public/og-bg.jpg` |
| `npm run images:upload` | Uploads `assets/prepared/` to Sanity and points each page field at the right asset with its hotspot. Reuses an asset when one already exists under the same filename, so re-running is free |
| `npm run availability:limited` | Turns on limited availability: bridal goes to a waitlist, tailoring and small repairs stay open, and the hero pill, contact page and FAQ update to match |
| `npm run availability:open` | Reopens everything and restores the normal copy |
| `npm run availability:limited -- --dry-run` | Either availability command with `-- --dry-run` lists exactly which fields would change and writes nothing |
| `npm run portfolio:export` | Resolves the portfolio caption table into `content/portfolio-captions.json` for review |
| `npm run portfolio:apply` | Patches Sanity from that file |
| `node scripts/portfolio-captions.mjs --fetch` | Downloads every portfolio photo to `/tmp/portfolio/` so captions can be matched to the right image |
| `node scripts/seed-sanity.mjs` | Populates a fresh dataset from `src/data/content.ts` |
| `npm run copy:response-time` | Replaces any promised reply time in the three Studio fields that carry it with "I read every message myself and reply as soon as I can." Add `-- --dry-run` to preview |
| `npm run copy:tidy-dashes` | Takes em dashes out of the live Sanity copy, choosing a full stop or a comma for each. Run with `-- --dry-run` first and read the list |
| `npm run content:publish` | Puts the reviewed guides, bustle styles and landing pages live, taking out the [DRAFT] markers. The policies page only goes live with `-- --policies`, once Grace has confirmed it. `-- --unpublish` takes everything back down, and `-- --dry-run` previews |
| `npm run copy:fixes` | Fixes four grammar slips in the live Sanity copy (service and value descriptions). Each fix only touches its exact phrase, so anything reworded since is left alone. Add `-- --dry-run` to preview |
| `node scripts/make-icons.mjs` | Rebuilds the favicon, app icon and Apple touch icon (gold Cormorant "G" on near-black) into `src/app/` |

**Replacing a photo that is already in Sanity:** uploads dedupe on the original
filename, so drop the new file in, then bump that file's entry in the `VERSIONS`
map in `scripts/upload-images.mjs` — otherwise the old asset is silently reused.

**Availability** is per service. `siteSettings.isAcceptingClients` is the older
all-or-nothing switch and should stay on; `limitedMode` plus `waitlistServices`
is what closes bridal while the rest of the site keeps booking.

## Running in Development

```sh
cd site
npm run dev
# → http://localhost:3000
```

The Sanity Studio is available at `http://localhost:3000/studio` when `NEXT_PUBLIC_SANITY_PROJECT_ID` is set.

## Building for Production

```sh
cd site
npm run build
```

`/sitemap.xml` and `/robots.txt` are generated by `src/app/sitemap.ts` and `src/app/robots.ts`. The canonical domain is the `SITE_URL` constant in `src/lib/metadata.ts`, not an environment variable.

## Deployment

The site deploys to Vercel. Set all environment variables in the Vercel project dashboard under **Settings → Environment Variables**.
