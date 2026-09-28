# For Grace

Everything below is in the Studio at **gracemaealterations.com/studio**. Nothing here needs code.

---

## What changed on the site

1. The site now says two things at once: tailoring and repairs are open today, and bridal is a waitlist for early 2027. Every button follows one of those two paths, so nobody is invited to book something you cannot take yet.
2. The main button used to say "Book a Consultation" everywhere, even for brides. It now says "Book tailoring or a repair" or "Join the 2027 bridal waitlist", depending on what the person is looking at.
3. Your availability is written once, in one place, and appears everywhere it is needed. If you change that sentence, it changes across the whole site.
4. The contact form asks three questions first: tailoring, bridal waitlist, or bridal party. Then it only shows the fields that matter for that answer. People can attach up to five photos instead of two.
5. Every page now loads with the words already on it. Before, the text was invisible until the page finished loading, which was bad for phones and for Google.
6. The services page shows a price range and a typical timeline for each service. There is no itemized price list: every garment is quoted at the fitting, so the site never promises a number you would have to honor.
7. The portfolio now has a caption under every photo saying what was actually done, instead of the same word repeated.
8. Text and buttons are darker where they need to be, so they pass accessibility standards and are readable in sunlight.
9. There are draft guides, bustle explanations and two extra pages written and waiting. None of them are on the site until you switch them on.
10. There is still no phone number anywhere, by design. The contact form is the only way in.
11. The contact form was broken for a while: typing in any box kept only the first letter. That is fixed. If anyone mentioned they could not get through, this is why.
12. Bridal requests ask a few optional questions again: dress size ordered, usual street size, what they think the dress needs, and whether they have shoes and undergarments yet. The answers appear in your email under "The Dress".
13. Photos people attach are shrunk on their phone before sending, so five photos always go through. They are still plenty sharp to judge a hem.

---

## Only you can do these

In rough order of how much they help.

### 1. Set up your Google Business Profile

This is what puts you on Google Maps and in "seamstress near me" searches, and it is where reviews live. Go to **business.google.com**, choose a service-area business (so your home address is never shown), set the area to Pittsburgh, and verify it. Then, in Studio, at **Content, then Site Settings**:

- **Google Business Profile link**: on your profile, Share, then Copy link.
- **Google review link**: on your profile, Ask for reviews, then copy the link. The "Leave a Google review" link appears in the footer as soon as this is filled in.

### 2. Read the policies and confirm them

At **Content, then Policies**. The deposit, the 48 hour cancellation window, rush fees, the pickup window and the "if something I sewed doesn't hold, I fix it at no charge" guarantee are all written as a starting point, not as your rules. Change anything that isn't how you work, then either switch **Published** on or ask Avery to run `npm run content:publish -- --policies`.

### 3. Photos that are really you

The About page shows your portrait, but the home and contact pages show a different woman with dark hair. Anyone who meets you at a fitting will notice. Swap those two for photos of you, your hands at work, or the studio, at **Content, then Home Page** and **Content, then Contact Page**.

### 4. Testimonials

Check each one is from your own clients, and that the dates make sense for when you started on your own. The optional details make them far more believable. Each is at **Content, then Testimonials, then the client**, and anything left empty is simply skipped:

- Dress designer, Alterations done, Venue, Month married, Photo

---

## Wording to tidy in Studio

Two small things are still live and worth a minute:

- **"I'm currently fully booked."** At **Content, then Contact Page, then Waitlist banner bold**. It only shows if the whole site is ever switched to waitlist, but tailoring is open, so it would say the wrong thing today. Something like "Bookings are paused for now." works in every case.
- **Bustle photo captions.** Two bustle photos in the portfolio share the caption "Bustle set, train secured for the reception", but they are different gowns. At **Content, then Portfolio Items**, give each its own line (the style of bustle, or the gown).

Already sorted, no action needed: the reply-time promise, the "calling ahead" FAQ answer, and the long dashes. The site no longer promises a reply time, and the booking FAQ now follows the availability switch.

---

## Guides, bustle styles and two extra pages

These were written and waiting. They have been read through for anything that promises a price, a reply time or something you can't do, and tidied. Avery puts them live with `npm run content:publish`, which also takes out the **[DRAFT]** markers. Once they are live:

- A **Guides** column appears in the footer, with the three guides.
- The bustle guide shows the five bustle styles.
- Two new pages go live: **David's Bridal dress alterations in Pittsburgh** and **Bridal party alterations**. They are for Google more than for the menu.

Read them when you have a quiet minute. If anything doesn't sound like you, change it in Studio, or switch **Published** off to take it down. `npm run content:publish -- --unpublish` takes them all down at once.

The policies page is the one exception: it stays off until you have confirmed it (see above).

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
