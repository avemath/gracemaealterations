"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import {
  dateFit,
  daysBetween,
  fittingPlan,
  formatDate,
  formatRange,
  icsFor,
  parseDateInput,
  statusText,
  todayInPittsburgh,
  type TimelineStep,
} from "@/lib/bridalDates";
import { fill } from "@/lib/text/fill";
import type { Text } from "@/lib/text";

/**
 * The calculator's wording from the Studio (Guides & tools): the date
 * messages it shares with the contact form, and its own "dates" fields.
 */
export type DatesText = Pick<Text<"tools">, Extract<keyof Text<"tools">, `date${string}`>>;

interface Props {
  steps?: TimelineStep[] | null;
  limitedMode: boolean;
  bridalWaitlisted: boolean;
  reopensLabel: string;
  text: DatesText;
}

const STORAGE_KEY = "gm-wedding-date";

function countdown(days: number, text: DatesText): string {
  if (days === 0) return text.datesCountdownToday;
  if (days === 1) return text.datesCountdownOneDay;
  if (days < 14) return fill(text.datesCountdownDays, { days });
  return fill(text.datesCountdownWeeks, { weeks: Math.floor(days / 7) });
}

/**
 * "Your dates": the timeline guide counted back from a real wedding date,
 * with an honest read on whether it fits and a calendar file to keep.
 * The date is remembered on this device only, as a convenience.
 */
export default function FittingDates({ steps, limitedMode, bridalWaitlisted, reopensLabel, text }: Props) {
  const inputId = useId();
  const hintId = useId();
  const [value, setValue] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && parseDateInput(saved)) setValue(saved);
    } catch {
      /* private mode or blocked storage: start empty */
    }
  }, []);

  const onChange = (next: string) => {
    setValue(next);
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, next);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  // A date input reports "0002-..." while the year is being typed; wait for a real one.
  const parsed = parseDateInput(value);
  const wedding = parsed && parsed.getFullYear() >= 2000 ? parsed : null;

  const result = wedding ? compute(wedding) : null;
  function compute(date: Date) {
    const fit = dateFit(date, { limitedMode, bridalWaitlisted, reopensLabel });
    return {
      wedding: date,
      today: todayInPittsburgh(),
      fit,
      plan: fit.kind === "past" ? [] : fittingPlan(date, steps),
    };
  }

  const waitlisted = limitedMode && bridalWaitlisted;
  const cta =
    waitlisted && result && result.fit.kind !== "rush" && result.fit.kind !== "beforeReopen"
      ? text.datesCtaWaitlist
      : waitlisted
        ? text.datesCtaAsk
        : text.datesCtaBook;

  const download = () => {
    if (!result) return;
    const blob = new Blob([icsFor(result.plan, result.wedding, new Date(), text)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wedding-fittings.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="border border-blush bg-white/50" data-testid="fitting-dates">
      <div className="px-5 sm:px-7 pt-6 pb-6 border-b border-blush">
        <p className="font-jost font-medium text-gold_ink text-xs tracking-[0.22em] uppercase">{text.datesLabel}</p>
        <h2 className="font-cormorant italic text-charcoal text-2xl sm:text-[1.75rem] leading-snug mt-2">
          {text.datesHeading}
        </h2>
        <p id={hintId} className="font-jost text-charcoal/75 text-sm leading-[1.65] mt-1 max-w-[55ch]">
          {text.datesIntro}
        </p>

        <div className="mt-5">
          <label htmlFor={inputId} className="block font-jost font-medium text-charcoal text-xs tracking-[0.22em] uppercase mb-2">
            {text.datesInputLabel}
          </label>
          <input
            id={inputId}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-describedby={hintId}
            data-testid="fit-date-input"
            className="w-full sm:w-64 min-h-[44px] border border-charcoal/30 bg-ivory px-3 py-2 font-jost text-base text-charcoal transition-colors hover:border-charcoal/60 focus-visible:border-charcoal"
          />
        </div>
      </div>

      <div aria-live="polite" data-testid="fit-status">
        {result && (
          <div className="px-5 sm:px-7 pt-6">
            {result.fit.kind !== "past" && (
              <p className="font-jost font-medium text-gold_ink text-xs tracking-[0.22em] uppercase mb-2">
                {countdown(daysBetween(result.today, result.wedding), text)}
              </p>
            )}
            <p className="font-cormorant italic text-charcoal text-xl leading-snug max-w-[55ch]">
              {statusText(result.fit, waitlisted, reopensLabel, text)}
            </p>
          </div>
        )}
      </div>

      {result && result.plan.length > 0 && (
        <div className="px-5 sm:px-7 pt-6 pb-7">
          <ol className="relative" data-testid="fit-plan" aria-label={text.datesPlanLabel}>
            {result.plan.map((w, i) => {
              const passed = daysBetween(result.today, w.to) < 0;
              const now = !passed && !w.openEnded && daysBetween(result.today, w.from) <= 0;
              const when = w.openEnded ? fill(text.datesByDate, { date: formatDate(w.to) }) : formatRange(w.from, w.to);
              return (
                <li key={i} className="relative pl-7 pb-5">
                  <span
                    aria-hidden="true"
                    className="absolute left-[5px] top-3 bottom-0 w-px bg-gold/70"
                  />
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-[0.45rem] w-[11px] h-[11px] rounded-full border ${
                      passed
                        ? "border-charcoal/30 bg-ivory"
                        : now
                          ? "border-gold_ink bg-gold_ink"
                          : "border-gold_ink bg-ivory"
                    }`}
                  />
                  <p className={`font-cormorant italic text-lg leading-snug ${passed ? "text-charcoal/[.65]" : "text-charcoal"}`}>
                    {w.title}
                    {now && (
                      <span className="not-italic font-jost font-medium text-gold_ink text-[0.6875rem] tracking-[0.18em] uppercase ml-2 align-middle">
                        {text.datesNow}
                      </span>
                    )}
                  </p>
                  <p className={`font-jost text-sm leading-[1.65] ${passed ? "text-charcoal/[.65]" : "text-charcoal/75"}`}>
                    {when}
                    {passed && <span className="sr-only"> {text.datesPassedSpoken}</span>}
                    {passed && <span aria-hidden="true"> · {text.datesPassed}</span>}
                  </p>
                </li>
              );
            })}
            <li className="relative pl-7">
              <span
                aria-hidden="true"
                className="absolute left-[-1px] top-[0.35rem] w-[13px] h-[13px] rotate-45 border border-gold_ink bg-gold_ink"
              />
              <p className="font-cormorant italic text-charcoal text-lg leading-snug">{text.datesWedding}</p>
              <p className="font-jost text-charcoal/75 text-sm leading-[1.65]">{formatDate(result.wedding)}</p>
            </li>
          </ol>

          <div className="mt-7 flex flex-col sm:flex-row sm:flex-wrap gap-3">
            <Link href="/contact?service=bridal" className="btn-gold" data-testid="fit-cta">
              {cta}
            </Link>
            <button type="button" onClick={download} className="btn-outline" data-testid="fit-ics">
              {text.datesCalendarButton}
            </button>
          </div>
        </div>
      )}

      {result?.fit.kind === "past" && <div className="pb-6" />}
      {!result && (
        <p className="px-5 sm:px-7 py-5 font-jost text-charcoal/[.65] text-sm">
          {text.datesPrivacy}
        </p>
      )}
    </div>
  );
}
