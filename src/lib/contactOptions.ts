/**
 * Option lists shared by the contact form and /api/contact, so the labels
 * Grace reads in her email always match what the client ticked.
 */

export const BRIDAL_ALTERATIONS = [
  { id: "hem", label: "Hem" },
  { id: "bustle", label: "Bustle" },
  { id: "bodice", label: "Take in bodice or sides" },
  { id: "cups", label: "Add bra cups" },
  { id: "corset", label: "Corset-back conversion" },
  { id: "straps", label: "Straps or sleeves" },
  { id: "neckline", label: "Neckline" },
  { id: "lace_beading", label: "Lace or beading repair" },
  { id: "unsure", label: "Not sure yet" },
] as const;

export const SHOES_UNDERGARMENTS = [
  { id: "both", label: "Yes, I have both" },
  { id: "shoes_only", label: "Shoes only" },
  { id: "not_yet", label: "Not yet" },
] as const;

export const BRIDAL_ALTERATION_LABELS: Record<string, string> = Object.fromEntries(
  BRIDAL_ALTERATIONS.map((o) => [o.id, o.label])
);

export const SHOES_UNDERGARMENT_LABELS: Record<string, string> = Object.fromEntries(
  SHOES_UNDERGARMENTS.map((o) => [o.id, o.label])
);

/** Photos, after in-browser resizing. Keeps the JSON body under Vercel's 4.5 MB. */
export const MAX_PHOTOS = 5;
export const MAX_PHOTO_TOTAL_BYTES = 3 * 1024 * 1024;
