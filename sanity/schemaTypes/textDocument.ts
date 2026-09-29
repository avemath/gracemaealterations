import { defineField, defineType } from "sanity";
import { TEXT_SPECS, type TextSpec } from "../../src/lib/text/specs";

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
      })
    ),
    preview: { prepare: () => ({ title: spec.title }) },
  });
}

export const siteText = textDocument(TEXT_SPECS.site as TextSpec);
export const formsText = textDocument(TEXT_SPECS.forms as TextSpec);
export const toolsText = textDocument(TEXT_SPECS.tools as TextSpec);
