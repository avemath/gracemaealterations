import type { Text } from "@/lib/text";

type ToolsText = Text<"tools">;

/**
 * Just the Guides & tools fields whose names start with `prefix` ("bustle",
 * "hem", "date", "bag"). Each tool runs in the browser, so whatever the page
 * hands it is written into the page; this keeps that to the tool's own words
 * rather than every guide's.
 */
export function toolText<P extends string>(text: ToolsText, prefix: P) {
  return Object.fromEntries(Object.entries(text).filter(([key]) => key.startsWith(prefix))) as Pick<
    ToolsText,
    Extract<keyof ToolsText, `${P}${string}`>
  >;
}
