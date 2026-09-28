/**
 * "[DRAFT]" and "[DRAFT, Grace to confirm]" are Studio-only signals: they mark
 * copy nobody has reviewed yet. They belong in the Studio list, never in page
 * output, so every string that reaches a template is stripped on the way.
 */
const DRAFT_PREFIX = /^\s*\[DRAFT[^\]]*\]\s*/i;

export function stripDraft<T extends string | null | undefined>(value: T): T {
  if (typeof value !== "string") return value;
  return value.replace(DRAFT_PREFIX, "") as T;
}

/** Same, applied through a Portable Text tree's span children. */
export function stripDraftBlocks<T>(blocks: T): T {
  if (!Array.isArray(blocks)) return blocks;
  return blocks.map((block) => {
    const b = block as { children?: { text?: string }[] };
    if (!b || !Array.isArray(b.children)) return block;
    return {
      ...b,
      children: b.children.map((child) =>
        typeof child?.text === "string" ? { ...child, text: stripDraft(child.text) } : child
      ),
    };
  }) as T;
}
