import site from "./specs/site.json";
import forms from "./specs/forms.json";
import tools from "./specs/tools.json";

/**
 * Every piece of wording Grace can change in the Studio, grouped into three
 * documents. Each spec lists its fields with a title, a note on where it
 * appears, and the original wording, which is:
 *   - what the site shows when the field is left empty,
 *   - the starting value in the Studio, and
 *   - what `npm run content:text` fills in.
 * The Studio schema, the site and the seed script all read these files, so
 * they can never disagree.
 */
export interface TextField {
  title: string;
  group?: string;
  description?: string;
  /** A multi-line box in the Studio instead of a single line. */
  long?: boolean;
  default: string;
}

export interface TextSpec {
  id: string;
  title: string;
  description: string;
  groups: { name: string; title: string }[];
  fields: Record<string, TextField>;
}

export const TEXT_SPECS = { site, forms, tools } as const;
export type TextArea = keyof typeof TEXT_SPECS;
