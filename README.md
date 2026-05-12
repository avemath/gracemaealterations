# Grace Mae Alterations

Marketing website for Grace Mae Alterations — a bridal and clothing alterations business based in Pittsburgh, PA. Built with Next.js 14 and Sanity CMS, deployed on Vercel.

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
| Sitemap | next-sitemap |

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, services overview, portfolio preview, about teaser, testimonials, process steps, CTA |
| `/about` | About — bio, values, pull quote, secondary image |
| `/services` | Services — service cards with pricing ranges |
| `/portfolio` | Portfolio — photo grid with lightbox, before/after slider |
| `/contact` | Contact — inquiry form (bridal, tailoring, custom), waitlist mode |
| `/studio` | Embedded Sanity Studio (content editing) |

## Features

- **Inquiry form** — service-specific fields for bridal, tailoring, and custom work; photo attachment support; waitlist mode when bookings are full
- **Email notifications** — Resend sends a formatted notification to Grace and a confirmation email to the client on every submission
- **Sanity CMS** — all page content and images are editable via the embedded Studio; the app falls back to static `src/data/content.ts` values when Sanity is not configured
- **Portfolio lightbox** — click any portfolio image to open a full-screen lightbox
- **Before/after slider** — drag to reveal before and after on featured transformations
- **Testimonial carousel** — auto-cycling with manual navigation
- **Framer Motion animations** — page transitions, scroll-triggered text and image reveals
- **Custom cursor**, scroll progress bar, sticky mobile and desktop CTAs
- **SEO** — JSON-LD LocalBusiness structured data, OG image, sitemap, robots.txt

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
│   │   ├── sections/      # CTABanner, ProcessSteps, TestimonialsSection
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
├── public/                # Static assets, sitemap, robots.txt
└── sanity.config.ts       # Sanity Studio configuration
```

## Setup and Installation

### Prerequisites
- Node.js 18+
- A Sanity project (free at sanity.io) — optional, app runs without it
- A Resend account for contact form emails

### Install

```sh
cd site
npm install
```

### Environment Variables

Create a `.env.local` file in the `site/` directory:

```env
# Sanity CMS (optional — app falls back to static content without these)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token

# Resend (required for contact form emails)
RESEND_API_KEY=your_resend_api_key

# Email addresses (defaults shown below)
CONTACT_EMAIL=inquiries@gracemaealterations.com
FROM_EMAIL=hello@gracemaealterations.com

# Used by next-sitemap
SITE_URL=https://gracemaealterations.com
```

`NEXT_PUBLIC_*` variables are exposed to the browser. All others are server-side only.

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

The build also runs `next-sitemap` to generate `public/sitemap.xml` and `public/robots.txt`.

## Deployment

The site deploys to Vercel. Set all environment variables in the Vercel project dashboard under **Settings → Environment Variables**.

The `SITE_URL` variable must be set in Vercel for sitemap generation to use the correct domain.
