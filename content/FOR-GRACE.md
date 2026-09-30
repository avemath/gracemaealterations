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
14. The bustle guide has an interactive bustle drawing: brides pick American, French, Austrian, ballroom or a detachable train and watch the train lift into it. It ends by saying you choose the bustle at the first fitting, so it never commits you to a style.
15. Each service on the services page now lists its guides underneath (bridal: timing, bustles, what to bring; tailoring: trouser hem length), and the guides themselves live on the Guides page.
16. The price ranges are now $300 to $900+ for bridal and $25 to $175 for tailoring, in line with what brides and clients pay in 2026. Every garment is still quoted at the fitting.
17. The timing guide has a "Your dates" calculator: a bride enters her wedding date and sees when each fitting falls, with an honest note if her date is before bridal reopens, and can add the dates to her calendar. The contact form gives the same honest note as soon as she enters her date.
18. There is a new trouser hem guide with a drawing that shows no break, quarter, half and full break over different shoes.
19. Once it is switched on, people who attach photos can press **Check my photos**. It tells them what the photos show: the kind of garment, the likely fabric (and how sure it is), visible details like buttons or lace, and the train length. It never suggests work, prices or dates, and it never comments on the person. If they choose to send it along, it appears in your email under **Photo Check**, clearly marked as automated. Treat it as their description of the dress, not a diagnosis.

20. **Almost every word on the site is now yours to change.** In the Studio, open **Start here** for a map of where everything lives. The small print (buttons, labels, the contact form, the emails clients get, the guides' tools) is under **Words around the site**, in three documents: Site-wide words, Contact form & emails, and Guides & tools. Each box starts with today's wording and shows the original underneath, so you can always put it back. Leaving a box empty uses the original.
21. Words in {curly brackets}, like {reopens} or {name}, are filled in by the site. Keep them as they are. The Studio warns you (without stopping you) if one goes missing, or if an em dash sneaks in.
22. The trouser hem guide's writing is now an ordinary guide under **Guides**, like the others, and each service can choose which guides it lists underneath it (**Services**, then the service, then **Helpful guides**).
23. In any document's menu, **Open preview** opens the page it appears on. Once you publish, the site updates within a minute or two (instantly, once Avery switches on instant updates).

24. **Care cards can teach the bustle.** On a bridal care card, open **How to bustle it (bridal only)**: pick the bustle style and train length, add the number of points, write the steps one per line, and, if you like, upload a short phone video of you bustling it at the final fitting. The care page then shows "How to bustle your dress" with the drawing set to her style, your steps and your video, and the printed card says to scan it for the bustle too. Her maid of honor can pull it up at the reception.

25. **Three things that appear as soon as you fill them in** (until then, nothing shows):
    - **Gowns I've worked on**: at **Services**, then Bridal Alterations, add designers and brands you've altered (Maggie Sottero, Allure, David's Bridal...). They show under the bridal service and help brides who search for their designer.
    - **Where fittings happen**: at **About Page**, the "Where Fittings Happen" tab. One to three photos of the room and mirror, plus short details like Where (your neighborhood, not your address), Parking, Guests and Kids and pets.
    - Tailoring requests now have an optional **Needed by** date, shown in your email.

26. The David's Bridal page now ends with one line of small print: "Grace Mae Alterations is independent and not affiliated with David's Bridal." It's there so nobody mistakes the page for an official partner. You can change it in the Studio under the page's **Small print** box, and any other landing page can have its own line the same way.
27. Every page title in a browser tab or Google result now ends in "| Grace Mae". If you type a title in the Studio with a different ending, like "| Grace Mae | Pittsburgh", the site tidies it for you.

---

## Only you can do these

In rough order of how much they help.

### 1. Set up your Google Business Profile

This is what puts you on Google Maps and in "seamstress near me" searches, and it is where reviews live. Go to **business.google.com**, choose a service-area business (so your home address is never shown), set the area to Pittsburgh, and verify it. Then, in Studio, at **Content, then Site Settings**:

- **Google Business Profile link**: on your profile, Share, then Copy link.
- **Google review link**: on your profile, Ask for reviews, then copy the link. The "Leave a Google review" link appears in the footer as soon as this is filled in.

### 2. Read the policies and confirm them

At **Content, then Policies**. The deposit, the 48 hour cancellation window, rush fees, the pickup window and the "if something I sewed doesn't hold, I fix it at no charge" guarantee are all written as a starting point, not as your rules. Change anything that isn't how you work, then either switch **Published** on or ask Avery to run `npm run content:publish -- --policies`.

### 3. More photos of you at work

The portraits are you: the home and contact photos now, and the About photo from college. A few more real photos would still help more than anything else on the site: your hands pinning a hem, the fitting mirror, a bustle being done. Add them at **Content, then Home Page** and **Content, then Portfolio Items**. Before and after pairs work best taken from the same spot and angle.

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
