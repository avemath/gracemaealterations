import { defineField, defineType } from "sanity";
import { CareNotesInput } from "../components/CareNotesInput";
import { CareCodeInput } from "../components/CareCodeInput";

// No 0/o, 1/l/i: the code is read off a printed card now and then.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
function newCode() {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/**
 * A care card: a small printed card that goes home with a finished garment.
 * Its QR code opens a private page with care notes for that garment, the
 * before and after, and a one-tap Google review.
 */
export const careCard = defineType({
  name: "careCard",
  title: "Care Card",
  type: "document",
  fieldsets: [
    {
      name: "bustle",
      title: "How to bustle it (bridal only)",
      description:
        "Fill this in for a gown with a bustle, and the care page gets a \"How to bustle your dress\" section with the drawing set to this style, your steps and your video. Whoever bustles her at the reception can scan the card and follow along. Leave it empty for anything else.",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "garment",
      title: "Garment",
      description: 'What it is, in the client\'s words. For example "wedding gown" or "wool suit jacket".',
      type: "string",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "fabric",
      title: "Fabric",
      description: 'For example "silk crepe with a lace overlay". The care notes are written for this.',
      type: "string",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "workDone",
      title: "What I did",
      description: "One or two lines, shown on the page. Optional.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(400),
    }),
    defineField({
      name: "clientFirstName",
      title: "Client's first name",
      description: 'Optional. Shows as "For Ann" at the top. First name only.',
      type: "string",
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: "completedOn",
      title: "Finished on",
      type: "date",
      initialValue: () => new Date().toISOString().slice(0, 10),
    }),
    defineField({
      name: "careNotes",
      title: "Care notes",
      description:
        'Press "Draft care notes" to have a first version written from the garment, fabric and what you did, then change anything you like.',
      type: "array",
      components: { input: CareNotesInput },
      of: [
        {
          type: "object",
          name: "careSection",
          fields: [
            { name: "heading", title: "Heading", type: "string" },
            { name: "body", title: "Body", type: "text", rows: 4 },
          ],
          preview: { select: { title: "heading", subtitle: "body" } },
        },
      ],
    }),
    defineField({
      name: "beforeImage",
      title: "Before photo",
      description: "Optional. With an after photo too, the page shows a before and after slider.",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    }),
    defineField({
      name: "afterImage",
      title: "After photo",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    }),
    defineField({
      name: "bustleStyle",
      title: "Bustle style",
      type: "string",
      fieldset: "bustle",
      options: {
        list: [
          { title: "American (over-bustle)", value: "american" },
          { title: "French (under-bustle)", value: "french" },
          { title: "Austrian (ruched)", value: "austrian" },
          { title: "Ballroom", value: "ballroom" },
          { title: "Detachable train", value: "detachable-train" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "bustleTrain",
      title: "Train length",
      description: "Sets the drawing. Pick the closest.",
      type: "string",
      fieldset: "bustle",
      options: {
        list: [
          { title: "Sweep", value: "sweep" },
          { title: "Chapel", value: "chapel" },
          { title: "Cathedral", value: "cathedral" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "chapel",
    }),
    defineField({
      name: "bustlePoints",
      title: "Number of points",
      description: "How many hooks, buttons or ties, so the helper knows when they're done.",
      type: "number",
      fieldset: "bustle",
      validation: (rule) => rule.min(1).max(20).integer(),
    }),
    defineField({
      name: "bustleSteps",
      title: "Steps",
      description:
        'One step per line, in order. For example "Find the loop marked 1 under the train" then "Hook it onto button 1 at the back of the waist".',
      type: "text",
      rows: 6,
      fieldset: "bustle",
    }),
    defineField({
      name: "bustleVideo",
      title: "Video",
      description:
        "Optional. A short phone video of you bustling this dress at the final fitting (under a minute is plenty). It plays on the care page.",
      type: "file",
      fieldset: "bustle",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "code",
      title: "Card link",
      description:
        "The private link the QR code opens. It's made for you. The page is hidden from Google, but anyone with the link can see it, so keep photos to ones you'd share.",
      type: "string",
      readOnly: true,
      initialValue: newCode,
      components: { input: CareCodeInput },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "active",
      title: "Page is live",
      description: "Switch off to take the page down. The printed card then shows a polite not-found page.",
      type: "boolean",
      initialValue: true,
    }),
  ],
  orderings: [{ title: "Newest first", name: "completedDesc", by: [{ field: "completedOn", direction: "desc" }] }],
  preview: {
    select: { garment: "garment", name: "clientFirstName", date: "completedOn", media: "afterImage" },
    prepare: ({ garment, name, date, media }) => ({
      title: [name, garment].filter(Boolean).join(", ") || "New care card",
      subtitle: date,
      media,
    }),
  },
});
