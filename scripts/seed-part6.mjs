/**
 * seed-part6.mjs
 * Seeds the guides, bustle styles and landing pages as DRAFTS.
 *
 *   node scripts/seed-part6.mjs
 *
 * Every document is created with published: false and every paragraph is
 * prefixed [DRAFT], so none of it reaches the site until Grace reviews it in
 * Studio and flips Published on. Prices are left null.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
let env = {};
try {
  const raw = readFileSync(resolve(__dirname, "../.env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
} catch {
  // fall back to process.env
}

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = env.SANITY_API_TOKEN ?? process.env.SANITY_API_TOKEN;

if (!token) {
  console.error("\n❌  SANITY_API_TOKEN is not set.\n");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false });

const blocks = (paragraphs, prefix) =>
  paragraphs.map((text, i) => ({
    _key: `${prefix}-b${i}`,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: `${prefix}-b${i}-s`, _type: "span", text: `[DRAFT] ${text}`, marks: [] }],
  }));

const steps = (rows, prefix) =>
  rows.map(([weeksOut, title, detail], i) => ({
    _key: `${prefix}-s${i}`,
    _type: "object",
    weeksOut,
    title,
    detail: `[DRAFT] ${detail}`,
  }));

// ── Guides ───────────────────────────────────────────────────────────────────

const GUIDES = [
  {
    _id: "guide-alterations-timeline",
    title: "When to start wedding dress alterations",
    slug: "wedding-dress-alterations-timeline",
    order: 1,
    summary:
      "[DRAFT] How far ahead to book, what happens at each fitting, and what to do if your dress arrives late.",
    body: blocks(
      [
        "Most gowns need three fittings, and each one needs time in between for the sewing itself. That is why I ask for the first fitting eight to twelve weeks before the wedding. It is not padding. It is the time the work actually takes.",
        "Booking early does not mean starting early. Bodies change in the months before a wedding, and a dress fitted too soon has to be fitted again. What booking early buys you is a place in the schedule, so the fittings land where they should.",
        "If your dress arrives late, tell me the day you know. I can often still do it, but the order of the work changes and some things get simplified. The worst version of this is finding out with two weeks left, when the only honest answer may be no.",
        "Bring your shoes and the undergarments you plan to wear to every fitting. Hem length depends entirely on the shoes, and the bodice fit depends on what is underneath. Without them I am guessing, and guessing is how a dress ends up wrong.",
      ],
      "timeline"
    ),
    timelineSteps: steps(
      [
        ["12+ weeks", "Book your first fitting", "Get on the schedule as soon as the dress is ordered, even if it has not arrived."],
        ["8 to 12 weeks", "First fitting: bring your shoes and undergarments", "We pin the hem, mark the bodice, and decide on the bustle."],
        ["4 to 6 weeks", "Progress fitting", "You try on the altered gown and we correct anything that has shifted."],
        ["2 to 3 weeks", "Final fitting and bustle lesson", "Bring whoever will bustle you on the day so they can practise."],
        ["Wedding week", "Pickup, pressed and ready", "The gown is steamed and bagged, ready to go."],
      ],
      "timeline"
    ),
  },
  {
    _id: "guide-bustle-types",
    title: "Wedding dress bustle types, explained",
    slug: "wedding-dress-bustle-types",
    order: 2,
    summary:
      "[DRAFT] American, French, Austrian, ballroom and detachable trains: what each one does and which skirts they suit.",
    body: blocks(
      [
        "A bustle is how your train comes up off the floor after the ceremony so you can walk and dance without carrying it. There is no single correct type. The right one depends on the weight of the skirt, the length of the train, and what the back of the dress looks like.",
        "I decide the bustle at the first fitting, with the dress on you, because a style that works beautifully on one skirt will drag or bunch on another. If you have a preference, tell me, and I will tell you honestly whether the dress will take it.",
        "Whoever is bustling you on the day should come to the final fitting. It takes five minutes to learn and it is much easier in a quiet room than in a hallway at the reception.",
      ],
      "bustle"
    ),
    timelineSteps: [],
  },
  {
    _id: "guide-what-to-bring",
    title: "What to bring to your wedding dress fitting",
    slug: "what-to-bring-to-your-wedding-dress-fitting",
    order: 3,
    summary: "[DRAFT] A short list. Bring these and the fitting takes half the time.",
    body: blocks(
      [
        "The shoes you will actually wear. Not similar shoes, the real ones. Hem length is measured from the floor with your shoes on, and half an inch of heel changes it.",
        "The undergarments and any shapewear you plan to wear. The bodice is fitted over them, so a different bra on the day means a different fit on the day.",
        "Your veil and belt or sash, if you have them. I want to see how they sit with the dress while there is still time to adjust anything.",
        "A photo of the venue floor, if you have one. Grass, gravel and cobblestone all change how short the hem should be.",
        "For the final fitting, bring the person who will bustle you. They learn it once, in a calm room, and then they know it.",
      ],
      "bring"
    ),
    timelineSteps: [],
  },
];

// ── Bustle styles ────────────────────────────────────────────────────────────

const BUSTLE_STYLES = [
  ["bustle-american", "American", "american", "Over-bustle, pickup bustle", "2 to 7 points",
   "Most skirts. It is the workhorse and the one I use most often.",
   "Works on almost anything. Heavy satins hold the folds crisply; very soft chiffon can look limp."],
  ["bustle-french", "French", "french", "Under-bustle, Victorian bustle", "2 to 5 points",
   "Skirts where you want the train to disappear underneath rather than sit on top.",
   "Lovely on lace and layered tulle. Needs enough structure underneath to carry the weight."],
  ["bustle-austrian", "Austrian", "austrian", "Ruched bustle, gathered bustle", "One continuous gather",
   "Simple skirts with no beading down the centre back seam.",
   "Draws the train up on a drawstring. Best on lighter fabrics; heavy satin fights it."],
  ["bustle-ballroom", "Ballroom", "ballroom", "Floor-length bustle", "3 to 9 points",
   "Formal gowns where you want the hem to sit level all the way round after bustling.",
   "Takes the most points and the most time, and it is worth it on a long cathedral train."],
  ["bustle-detachable", "Detachable train", "detachable-train", "Removable train, convertible train",
   "Not applicable", "Gowns designed for it, or where a bustle would be too heavy.",
   "The train comes off entirely at the reception. Needs to be planned, not retrofitted to any dress."],
];

// ── Landing pages ────────────────────────────────────────────────────────────

const LANDING_PAGES = [
  {
    _id: "landing-davids-bridal",
    title: "David's Bridal dress alterations in Pittsburgh",
    slug: "david-s-bridal-dress-alterations",
    intro:
      "[DRAFT] I spent a year as Lead Alterations Specialist at David's Bridal. I know how their gowns are built, where the seam allowance is, and which bustles work on which skirts.",
    sections: [
      {
        heading: "What that year taught me",
        body:
          "[DRAFT] I fitted a lot of gowns from the same small set of patterns, which means I know before the dress is on you where the seam allowance runs out, which linings will fight a hem, and how the beading is anchored. That is not a sales pitch, it is just pattern recognition from repetition.",
      },
      {
        heading: "Bringing a David's Bridal gown to me",
        body:
          "[DRAFT] You do not have to have your alterations done where you bought the dress. Bring the gown, your shoes and your undergarments, and I will quote the work itemized in writing before anything is cut.",
      },
      {
        heading: "Timing",
        body:
          "[DRAFT] Bridal fittings reopen in early 2027 and I am keeping a waitlist now. If your date is sooner, tell me anyway and I will give you an honest answer, plus a referral if I cannot take it.",
      },
    ],
  },
  {
    _id: "landing-bridal-party",
    title: "Bridal party alterations",
    slug: "bridal-party-alterations",
    intro:
      "[DRAFT] Bridesmaids, mothers, flower girls: one point of contact, one pickup day, and quotes itemized per garment.",
    sections: [
      {
        heading: "How it works",
        body:
          "[DRAFT] Send me the number of garments and the date. We schedule fittings close together where we can, and everything is finished for a single pickup so nobody is chasing dresses the week of the wedding.",
      },
      {
        heading: "What it usually involves",
        body:
          "[DRAFT] Hems, straps, waists taken in, and the occasional zipper or corset back repair. Most bridesmaid dresses need two of those, not all four.",
      },
      {
        heading: "Cost",
        body:
          "[DRAFT] Each garment is quoted on its own so nobody pays for work on someone else's dress. You get the list in writing before I start.",
      },
    ],
  },
];

// ── Run ──────────────────────────────────────────────────────────────────────

async function createIfMissing(doc, label) {
  const existing = await client.getDocument(doc._id);
  if (existing) {
    await client.patch(doc._id).set(doc).commit();
    console.log(`  ↻ updated  ${label.padEnd(46)} ${doc._id}`);
  } else {
    await client.createOrReplace(doc);
    console.log(`  ✓ created  ${label.padEnd(46)} ${doc._id}`);
  }
}

console.log(`\n📚  Seeding Part 6 drafts (${projectId}/${dataset})\n`);

console.log("Guides (published: false)");
for (const guide of GUIDES) {
  await createIfMissing(
    {
      _type: "guide",
      published: false,
      ...guide,
      slug: { _type: "slug", current: guide.slug },
    },
    guide.title
  );
}

console.log("\nBustle styles (published: false)");
for (const [id, name, slug, alsoCalled, typicalPoints, bestFor, fabricNotes] of BUSTLE_STYLES) {
  await createIfMissing(
    {
      _id: id,
      _type: "bustleStyle",
      name,
      slug: { _type: "slug", current: slug },
      alsoCalled,
      typicalPoints,
      bestFor: `[DRAFT] ${bestFor}`,
      fabricNotes: `[DRAFT] ${fabricNotes}`,
      priceFrom: null,
      published: false,
      order: BUSTLE_STYLES.findIndex((b) => b[0] === id) + 1,
    },
    name
  );
}

console.log("\nLanding pages (published: false)");
for (const page of LANDING_PAGES) {
  await createIfMissing(
    {
      _type: "landingPage",
      published: false,
      ...page,
      slug: { _type: "slug", current: page.slug },
      sections: page.sections.map((section, i) => ({ _key: `s${i}`, _type: "object", ...section })),
    },
    page.title
  );
}

console.log(
  "\n✅  All seeded as drafts. Nothing renders until Published is switched on in Studio.\n" +
    "    Studio paths: Content > Guides, Content > Bustle Styles, Content > Landing Pages\n"
);
