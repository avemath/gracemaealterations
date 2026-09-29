import type { Text } from "@/lib/text";

/**
 * Option lists shared by the contact form, the photo check and /api/contact.
 * What clients see comes from the Studio ("Contact form & emails"), looked up
 * by `key`, and Grace's email uses the same wording, so the labels she reads
 * always match what the client ticked.
 *
 * `label` is the original wording. It stays here for the photo check's
 * instructions to the AI, which describe each id and should not shift when a
 * label is reworded in the Studio.
 */

type FormsText = Text<"forms">;

export const BRIDAL_ALTERATIONS = [
  { id: "hem", key: "optHem", label: "Hem" },
  { id: "bustle", key: "optBustle", label: "Bustle" },
  { id: "bodice", key: "optBodice", label: "Take in bodice or sides" },
  { id: "cups", key: "optCups", label: "Add bra cups" },
  { id: "corset", key: "optCorset", label: "Corset-back conversion" },
  { id: "straps", key: "optStraps", label: "Straps or sleeves" },
  { id: "neckline", key: "optNeckline", label: "Neckline" },
  { id: "lace_beading", key: "optLaceBeading", label: "Lace or beading repair" },
  { id: "unsure", key: "optUnsure", label: "Not sure yet" },
] as const satisfies readonly { id: string; key: keyof FormsText; label: string }[];

export const SHOES_UNDERGARMENTS = [
  { id: "both", key: "optShoesBoth", label: "Yes, I have both" },
  { id: "shoes_only", key: "optShoesOnly", label: "Shoes only" },
  { id: "not_yet", key: "optShoesNotYet", label: "Not yet" },
] as const satisfies readonly { id: string; key: keyof FormsText; label: string }[];

/** The Studio wording the option labels need. */
export type OptionText = Pick<
  FormsText,
  (typeof BRIDAL_ALTERATIONS)[number]["key"] | (typeof SHOES_UNDERGARMENTS)[number]["key"]
>;

/** Checklist id to the label the client sees, e.g. "hem" to "Hem". */
export function bridalAlterationLabels(text: OptionText): Record<string, string> {
  return Object.fromEntries(BRIDAL_ALTERATIONS.map((o) => [o.id, text[o.key]]));
}

export function shoesUndergarmentLabels(text: OptionText): Record<string, string> {
  return Object.fromEntries(SHOES_UNDERGARMENTS.map((o) => [o.id, text[o.key]]));
}

/** Photos, after in-browser resizing. Keeps the JSON body under Vercel's 4.5 MB. */
export const MAX_PHOTOS = 5;
export const MAX_PHOTO_TOTAL_BYTES = 3 * 1024 * 1024;
