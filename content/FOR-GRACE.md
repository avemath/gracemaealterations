# For Grace

Everything below is in the Studio at **gracemaealterations.com/studio**. Nothing here needs code.

---

## What changed on the site

1. The site now says two things at once: tailoring and repairs are open today, and bridal is a waitlist for early 2027. Every button follows one of those two paths, so nobody is invited to book something you cannot take yet.
2. The main button used to say "Book a Consultation" everywhere, even for brides. It now says "Book tailoring or a repair" or "Join the 2027 bridal waitlist", depending on what the person is looking at.
3. Your availability is written once, in one place, and appears everywhere it is needed. If you change that sentence, it changes across the whole site.
4. The contact form asks three questions first: tailoring, bridal waitlist, or bridal party. Then it only shows the fields that matter for that answer. People can attach up to five photos instead of two.
5. Every page now loads with the words already on it. Before, the text was invisible until the page finished loading, which was bad for phones and for Google.
6. The services page shows a price range and a typical timeline for each service. There is no itemised price list: every garment is quoted at the fitting, so the site never promises a number you would have to honour.
7. The portfolio now has a caption under every photo saying what was actually done, instead of the same word repeated.
8. Text and buttons are darker where they need to be, so they pass accessibility standards and are readable in sunlight.
9. There are draft guides, bustle explanations and two extra pages written and waiting. None of them are on the site until you switch them on.
10. There is still no phone number anywhere, by design. The contact form is the only way in.
11. The contact form was broken for a while: typing in any box kept only the first letter. That is fixed. If anyone mentioned they could not get through, this is why.
12. Bridal requests ask a few optional questions again: dress size ordered, usual street size, what they think the dress needs, and whether they have shoes and undergarments yet. The answers appear in your email under "The Dress".
13. Photos people attach are shrunk on their phone before sending, so five photos always go through. They are still plenty sharp to judge a hem.

---

## Numbers you need to fill in

Nothing below shows a made up number today. Each one is blank, and the site quietly hides or rewords itself until you fill it in.

### Three real gowns, three real quotes, 3 rows

At: **Content, then Services Page, then Three real gowns three real quotes**. Each row needs a Gown, the Work done, and a Total. This whole block stays hidden until at least one row has a total, so partial filling is safe.

- Row 1: Gown, Work done, Total
- Row 2: Gown, Work done, Total
- Row 3: Gown, Work done, Total

### Bustle prices, 5 values

Each is at: **Content, then Bustle Styles, then the style, then Price from**.

- American, then Price from
- French, then Price from
- Austrian, then Price from
- Ballroom, then Price from
- Detachable train, then Price from

### Testimonial details, 3 clients

Each is at: **Content, then Testimonials, then the client**. All five boxes are optional, and the line on the site simply skips anything left empty.

- Testimonial 1: Dress designer, Alterations done, Venue, Month married, Photo
- Testimonial 2: Dress designer, Alterations done, Venue, Month married, Photo
- Testimonial 3: Dress designer, Alterations done, Venue, Month married, Photo

---

## Wording to tidy in Studio

Two small things are still live and worth a minute:

- **"I'm currently fully booked."** At **Content, then Contact Page, then Waitlist banner bold**. It only shows if the whole site is ever switched to waitlist, but tailoring is open, so it would say the wrong thing today. Something like "Bookings are paused for now." works in every case.
- **Bustle photo captions.** Two bustle photos in the portfolio share the caption "Bustle set, train secured for the reception", but they are different gowns. At **Content, then Portfolio Items**, give each its own line (the style of bustle, or the gown).

Already sorted, no action needed: the reply-time promise, the "calling ahead" FAQ answer, and the long dashes. The site no longer promises a reply time, and the booking FAQ now follows the availability switch.

---

## Drafts waiting for your review

None of these are on the site. Read the copy, change anything that does not sound like you, then switch **Published** on.

| What | Where in Studio | Switch to flip |
|---|---|---|
| Policies page | Content, then Policies | Published |
| Guide: When to start wedding dress alterations | Content, then Guides | Published |
| Guide: Wedding dress bustle types, explained | Content, then Guides | Published |
| Guide: What to bring to your wedding dress fitting | Content, then Guides | Published |
| Bustle style: American | Content, then Bustle Styles | Published |
| Bustle style: French | Content, then Bustle Styles | Published |
| Bustle style: Austrian | Content, then Bustle Styles | Published |
| Bustle style: Ballroom | Content, then Bustle Styles | Published |
| Bustle style: Detachable train | Content, then Bustle Styles | Published |
| Page: David's Bridal dress alterations in Pittsburgh | Content, then Landing Pages | Published |
| Page: Bridal party alterations | Content, then Landing Pages | Published |

Two notes on these:

- Draft paragraphs are marked **[DRAFT]** so you can see what has not been reviewed. Those markers never appear on the site, even if you publish with them still in place. Please still take them out as you go.
- The "Guides" link only appears in the menu once at least one guide is published. The Policies link in the footer works the same way.

---

## Care cards: a little card that goes home with every finished piece

When you finish a garment, you can send it home with a small printed card. The client scans its QR code and gets a page just for their piece: how to look after it, your before and after, and a button to leave you a Google review. It takes about two minutes.

1. In the Studio, open **Care Cards** and press the **+** to make a new one.
2. Fill in **Garment** (for example "wedding gown") and, if you can, **Fabric** ("silk crepe with a lace overlay") and **What I did**. The client's first name and the photos are optional.
3. Press **Draft care notes**. A first version appears in a few seconds, written as you. Read it and change anything that isn't how you'd say it. You can also just type your own.
4. Press **Publish**.
5. Under **Card link**, press **Print the card**. Print it on heavy cardstock, trim along the dashed line, and tuck it in the garment bag.

Anyone with the card can open that page, but nobody can find it any other way, and Google never sees it. Keep the photos to ones you'd be happy to share. To take a page down, switch **Page is live** off.

"Draft care notes" needs the site's Anthropic key to be set up. Until then the button says so, and you can type the notes yourself.

---

## How to flip bridal back on

When you are ready to take bridal again, you have two choices.

**The simple one, in Studio:** go to **Content, then Site Settings**, and turn **Limited availability mode** off. Clear the **Services on waitlist** list. Then tidy these three lines, which still mention the waitlist:

- Hero Booking Note
- Availability Note
- Short availability line shown under hero and on contact page

**The faster one:** ask me to run `npm run availability:open` from the site folder. That flips the switch and rewrites all three lines back to normal wording in one go, including the two frequently asked questions about bridal reopening. Running `npm run availability:limited` puts it back the way it is now.

Either way the buttons across the site change by themselves. You do not have to hunt for them.

---

## One last thing

If a number or a paragraph is blank, the site hides that piece rather than inventing something. So there is no rush and no risk in filling this in a bit at a time.
