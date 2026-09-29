"use client";

import { analytics } from "@/lib/analytics";
import { useEffect, useState } from "react";
import { fill } from "@/lib/text/fill";
import type { Text } from "@/lib/text";

/** The checklist's own wording from the Studio (Guides & tools). */
export type ChecklistText = Pick<Text<"tools">, "bagLabel" | "bagCount" | "bagDone">;

export interface ChecklistItem {
  /** The first sentence, shown as the item's title. */
  lead: string;
  /** The rest of the paragraph. */
  rest: string;
}

type IconId = "shoe" | "hanger" | "veil" | "photo" | "people" | "needle";

/** Picks a little drawing from the words in the item, so Grace can edit the copy freely. */
function iconFor(text: string): IconId {
  const t = text.toLowerCase();
  if (/shoe|heel/.test(t)) return "shoe";
  if (/undergarment|shapewear|\bbra\b|slip/.test(t)) return "hanger";
  if (/veil|sash|belt|jewel/.test(t)) return "veil";
  if (/photo|venue|floor/.test(t)) return "photo";
  if (/bustle|person|mother|bridesmaid|friend/.test(t)) return "people";
  return "needle";
}

const ICONS: Record<IconId, React.ReactNode> = {
  shoe: (
    <>
      <path d="M3 18.5c0-3.2 1-6 2.6-7.4 1.4 2.3 3.6 3.6 6.6 4.3l6.4 1.1c1.4.3 2.4 1 2.4 2H3z" />
      <path d="M5 18.5v2.5" />
    </>
  ),
  hanger: (
    <>
      <path d="M12 7.2a1.9 1.9 0 1 1 1.9 1.9c-1 0-1.9.7-1.9 1.7v.6" />
      <path d="M12 11.4 3.4 17c-.8.5-.4 1.5.5 1.5h16.2c.9 0 1.3-1 .5-1.5z" />
    </>
  ),
  veil: (
    <>
      <path d="M8 4h8" />
      <path d="M9.5 4v2M12 4v2M14.5 4v2" />
      <path d="M8.5 6c-2.2 4.6-3.8 9.4-3.2 14.5h13.4c.6-5.1-1-9.9-3.2-14.5" />
      <path d="M12 8.5c-.6 3.8-.6 8 0 12" opacity=".55" />
    </>
  ),
  photo: (
    <>
      <rect x="3" y="7" width="18" height="12.5" rx="1.5" />
      <path d="M8.5 7 10 4.5h4L15.5 7" />
      <circle cx="12" cy="13.2" r="3.4" />
    </>
  ),
  people: (
    <>
      <circle cx="8.5" cy="7.5" r="2.6" />
      <circle cx="16" cy="8.5" r="2.2" />
      <path d="M3.5 20c0-3.6 2.2-6.2 5-6.2s5 2.6 5 6.2" />
      <path d="M13.8 13.9c.7-.4 1.4-.6 2.2-.6 2.4 0 4.4 2.3 4.4 5.5" />
    </>
  ),
  needle: (
    <>
      <path d="M19.5 4.5 7 17" />
      <path d="M17.6 3.8l2.6 2.6" />
      <path d="M7 17c-2.5 2.2-4.2 1.2-3.6-.6.6-1.8 3.6-2 4.6.2.8 1.8-.6 3.6-2.6 3.9" />
    </>
  ),
};

const STORAGE_KEY = "gm-fitting-bag";

/**
 * The "what to bring" guide as a packing list: each thing gets a small line
 * drawing and a box to tick while packing. Ticks are remembered on this
 * device only, as a convenience; nothing is sent anywhere.
 */
export default function FittingChecklist({ items, text }: { items: ChecklistItem[]; text: ChecklistText }) {
  const [packed, setPacked] = useState<boolean[]>(() => items.map(() => false));

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
      if (Array.isArray(saved) && saved.length === items.length) setPacked(saved.map(Boolean));
    } catch {
      /* private mode or blocked storage: start unticked */
    }
  }, [items.length]);

  const toggle = (i: number) =>
    setPacked((prev) => {
      const next = prev.map((v, j) => (j === i ? !v : v));
      if (next.every(Boolean) && !prev.every(Boolean)) analytics.bagPacked();
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });

  const count = packed.filter(Boolean).length;
  const done = count === items.length;

  return (
    <div className="border border-blush bg-white/50" data-testid="fitting-bag">
      <div className="flex items-baseline justify-between gap-4 px-5 sm:px-7 pt-6 pb-4 border-b border-blush">
        <p className="font-jost font-medium text-gold_ink text-xs tracking-[0.22em] uppercase">{text.bagLabel}</p>
        <p className="font-jost text-charcoal/75 text-xs" aria-live="polite" data-testid="bag-count">
          {done ? text.bagDone : fill(text.bagCount, { count, total: items.length })}
        </p>
      </div>

      <ul>
        {items.map((item, i) => {
          const on = packed[i];
          return (
            <li key={i} className="border-b border-blush last:border-b-0">
              <label
                data-packed={on}
                className="group flex items-start gap-4 sm:gap-5 px-5 sm:px-7 py-5 cursor-pointer transition-colors duration-300 hover:bg-blush/25 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold_ink has-[:focus-visible]:-outline-offset-2"
              >
                <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(i)} />

                <span
                  className="shrink-0 grid place-items-center w-11 h-11 rounded-full border border-dashed border-gold_ink/60 text-gold_ink transition-colors duration-300 group-data-[packed=true]:border-solid group-data-[packed=true]:bg-gold_ink group-data-[packed=true]:text-ivory"
                  aria-hidden="true"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    {on ? <path d="M5 12.5l4.5 4.5L19 7.5" strokeWidth="1.8" /> : ICONS[iconFor(item.lead + " " + item.rest)]}
                  </svg>
                </span>

                <span className="min-w-0 pt-0.5">
                  <span className="block font-cormorant italic text-charcoal text-xl leading-snug transition-colors duration-300 group-data-[packed=true]:text-charcoal/60">
                    {item.lead}
                  </span>
                  {item.rest && (
                    <span className="block font-jost text-charcoal/75 text-sm leading-[1.65] mt-1 max-w-[60ch]">
                      {item.rest}
                    </span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
