import { fetchSingleton } from "@/lib/sanity.queries";
import { TEXT_SPECS, type TextArea, type TextSpec } from "./specs";

/** The wording for one area: every field, with Studio edits over the originals. */
export type Text<A extends TextArea> = Record<keyof (typeof TEXT_SPECS)[A]["fields"], string>;

export function textDefaults<A extends TextArea>(area: A): Text<A> {
  const spec = TEXT_SPECS[area] as TextSpec;
  return Object.fromEntries(Object.entries(spec.fields).map(([key, field]) => [key, field.default])) as Text<A>;
}

/**
 * Reads one area's wording from the Studio. Any field left empty (or a
 * document that doesn't exist yet) falls back to the original wording, so the
 * site never shows a blank.
 */
export async function getText<A extends TextArea>(area: A): Promise<Text<A>> {
  const spec = TEXT_SPECS[area] as TextSpec;
  const defaults = textDefaults(area);
  const doc = await fetchSingleton<Record<string, unknown>>(spec.id).catch(() => null);
  if (!doc) return defaults;
  const merged = { ...defaults } as Record<string, string>;
  for (const key of Object.keys(spec.fields)) {
    const value = doc[key];
    if (typeof value === "string" && value.trim()) merged[key] = value.trim();
  }
  return merged as Text<A>;
}

export { fill } from "./fill";
