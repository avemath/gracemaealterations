import { defineField, defineType } from "sanity";
import { TEXT_SPECS, type TextSpec } from "../../src/lib/text/specs";

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Gentle checks while Grace types (warnings, never blocking a publish): the
 * site's house style has no em dashes, and a {placeholder} the original
 * wording uses is filled in by the site, so losing or misspelling one would
 * leave a gap or show the braces.
 */
function wordingWarnings(value: unknown, original: string): true | string {
  if (typeof value !== "string" || !value.trim()) return true;
  if (value.includes("—")) return "This has an em dash (—). The site uses commas, colons or full stops instead.";
  const expected = new Set(Array.from(original.matchAll(PLACEHOLDER), (m) => m[1]));
  const used = new Set(Array.from(value.matchAll(PLACEHOLDER), (m) => m[1]));
  const unknown = Array.from(used).filter((p) => !expected.has(p));
  if (unknown.length) {
    return `{${unknown[0]}} isn't something the site can fill in here. It can use: ${
      expected.size ? Array.from(expected, (p) => `{${p}}`).join(", ") : "nothing in curly brackets"
    }.`;
  }
  const missing = Array.from(expected).filter((p) => !used.has(p));
  if (missing.length) {
    return `The original includes {${missing[0]}}, which the site fills in. Leaving it out is fine if that's on purpose.`;
  }
  return true;
}

/**
 * One Studio document per wording area (Site-wide words, Contact form &
 * emails, Guides & tools), built from its spec in src/lib/text/specs. Every
 * field starts with the original wording and shows it below the box, so
 * Grace can always see what an empty field will say.
 */
function textDocument(spec: TextSpec) {
  return defineType({
    name: spec.id,
    title: spec.title,
    type: "document",
    description: spec.description,
    groups: spec.groups.length ? spec.groups : undefined,
    fields: Object.entries(spec.fields).map(([name, field]) =>
      defineField({
        name,
        title: field.title,
        type: field.long ? "text" : "string",
        ...(field.long ? { rows: Math.min(6, Math.max(2, Math.ceil(field.default.length / 70))) } : {}),
        group: field.group,
        initialValue: field.default,
        description: [field.description, `Original: “${field.default}”`].filter(Boolean).join(" "),
        validation: (rule) => rule.custom((value) => wordingWarnings(value, field.default)).warning(),
      })
    ),
    preview: { prepare: () => ({ title: spec.title }) },
  });
}

export const siteText = textDocument(TEXT_SPECS.site as TextSpec);
export const formsText = textDocument(TEXT_SPECS.forms as TextSpec);
export const toolsText = textDocument(TEXT_SPECS.tools as TextSpec);
