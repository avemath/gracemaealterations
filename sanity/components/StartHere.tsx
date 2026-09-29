import { Box, Card, Heading, Stack, Text } from "@sanity/ui";

const SECTIONS: { title: string; items: [string, string][] }[] = [
  {
    title: "Everyday changes",
    items: [
      ["Taking bridal work or not", "Site Settings: switch the waitlist on or off, and set when bridal reopens (for example \"early 2027\"). Every button and message on the site follows it."],
      ["Prices and what each service includes", "Services: one entry per service, with its price range, the note under it and the list under \"What I do\"."],
      ["Photos of your work", "Portfolio Photos: add a before and after, a caption and a category."],
      ["Reviews", "Testimonials. Add the dress designer, the work and the month if you can: it makes them far more believable."],
      ["After a finished garment", "Care Cards: fill in the garment and what you did, press Draft care notes, then Print the card."],
    ],
  },
  {
    title: "Words on the pages",
    items: [
      ["Page headings and paragraphs", "Home Page, About Page, Services Page, Contact Page, Portfolio Page."],
      ["Buttons, labels and small print", "Words around the site, then Site-wide words."],
      ["The contact form and the emails clients get", "Words around the site, then Contact form & emails."],
      ["The guides' tools (dates, fitting bag, bustle and hem drawings)", "Words around the site, then Guides & tools. The guides' own writing is under Guides."],
      ["Questions and answers", "FAQ."],
    ],
  },
  {
    title: "Good to know",
    items: [
      ["Nothing changes until you press Publish", "Drafts are private. Once published, the site updates within a minute or two."],
      ["Leaving a field empty is safe", "In Words around the site, an empty field goes back to the original wording, which is shown under each box."],
      ["Words in {curly brackets}", "The site fills these in, like {reopens} becoming \"early 2027\". Keep them as they are; the Studio warns you if one goes missing."],
      ["House style", "No em dashes, no phone number, and no promise of how fast you'll reply. The Studio warns about em dashes in the wording fields."],
    ],
  },
];

/** The first thing Grace sees in the Studio: where everything lives. */
export function StartHere() {
  return (
    <Box padding={4} style={{ maxWidth: 760 }}>
      <Stack space={5}>
        <Stack space={3}>
          <Heading size={3}>Start here</Heading>
          <Text muted>Where to change each part of the site.</Text>
        </Stack>
        {SECTIONS.map((section) => (
          <Stack key={section.title} space={3}>
            <Heading as="h2" size={1}>
              {section.title}
            </Heading>
            {section.items.map(([what, where]) => (
              <Card key={what} padding={3} radius={2} border>
                <Stack space={2}>
                  <Text weight="semibold">{what}</Text>
                  <Text size={1} muted>
                    {where}
                  </Text>
                </Stack>
              </Card>
            ))}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
