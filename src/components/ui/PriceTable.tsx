"use client";

import { useId, useState } from "react";
import type { SanityPriceRow } from "@/lib/sanity.queries";

/** "$120" when a number is set, otherwise an honest placeholder. */
function priceLabel(row: SanityPriceRow): string {
  return typeof row.from === "number" ? `from $${row.from}` : "quoted at fitting";
}

export default function PriceTable({ rows }: { rows: SanityPriceRow[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const panelId = `${id}-prices`;

  if (rows.length === 0) return null;

  return (
    <div className="border-t border-blush">
      <button
        type="button"
        className="w-full flex items-center justify-between py-4 min-h-[44px] text-left group"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-jost font-medium text-charcoal text-xs tracking-[0.22em] uppercase">
          See typical prices
        </span>
        <span
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gold_ink transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" />
            <line x1="0" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
      </button>

      <div id={panelId} className="pb-6" hidden={!open}>
          <table className="w-full">
            <caption className="sr-only">Typical prices</caption>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-blush/70 last:border-0">
                  <th
                    scope="row"
                    className="py-3 pr-4 text-left font-jost font-normal text-sm text-charcoal/75"
                  >
                    {row.item}
                    {row.note && (
                      <span className="block text-charcoal/75 text-xs mt-0.5">{row.note}</span>
                    )}
                  </th>
                  <td className="py-3 text-right font-cormorant font-medium text-charcoal text-lg lining-nums whitespace-nowrap">
                    {priceLabel(row)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        <p className="mt-4 font-jost text-charcoal/75 text-xs leading-[1.65]">
          Every quote is itemized in writing before I cut a thread.
        </p>
      </div>
    </div>
  );
}
