/**
 * Fills {placeholders} in Studio wording: fill("Hi {name}", { name: "Ann" }).
 * A placeholder with no value is left as written, so a typo shows up on the
 * page rather than silently vanishing.
 */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match
  );
}
