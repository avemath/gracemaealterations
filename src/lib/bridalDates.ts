/**
 * Bridal fitting dates, counted back from the wedding.
 *
 * Pure date maths with no React, so the "Your dates" calculator and the
 * contact form can share one set of rules. Every Date here is a local
 * calendar date at midnight: "2027-06-12" means June 12 wherever the browser
 * is, never 11pm on June 11 because of a UTC offset. "Today" is taken in
 * Pittsburgh, so an evening visit elsewhere doesn't count from tomorrow.
 */

export interface TimelineStep {
  weeksOut: string;
  title: string;
}

export interface WeeksRange {
  from: number;
  /** Infinity for an open-ended step like "12+ weeks". */
  to: number;
}

export interface FittingWindow {
  /** The step title, trimmed to the part before any colon. */
  title: string;
  weeksOut: string;
  from: Date;
  to: Date;
  /** True for a "12+ weeks" style step: read it as "by `to`". from equals to. */
  openEnded: boolean;
}

export type FitKind = "past" | "rush" | "beforeReopen" | "tight" | "good" | "early";

export interface DateFit {
  kind: FitKind;
  /** Whole weeks until the wedding (negative once it has passed). */
  weeksAway: number;
  /** The usual first fitting window: 12 to 8 weeks before the wedding. */
  firstFitting: { from: Date; to: Date };
  /** When bridal reopens, parsed from the label, or null. */
  reopens: Date | null;
}

export interface DateFitOptions {
  limitedMode: boolean;
  bridalWaitlisted: boolean;
  reopensLabel: string;
  now?: Date;
}

const TIME_ZONE = "America/New_York";
const DAY_MS = 24 * 60 * 60 * 1000;

/** Bridal first fitting: 12 to 8 weeks before. Under 8 weeks is a rush. */
export const FIRST_FITTING_WEEKS: WeeksRange = { from: 8, to: 12 };

/** Used when the guide has no timeline steps in Sanity. */
export const DEFAULT_STEPS: TimelineStep[] = [
  { weeksOut: "12+ weeks", title: "Book your first fitting" },
  { weeksOut: "8 to 12 weeks", title: "First fitting" },
  { weeksOut: "4 to 6 weeks", title: "Progress fitting" },
  { weeksOut: "2 to 3 weeks", title: "Final fitting and bustle lesson" },
  { weeksOut: "Wedding week", title: "Pickup, pressed and ready" },
];

// ── Calendar dates ────────────────────────────────────────────

/** "YYYY-MM-DD" (a date input's value) as a local calendar date, or null. */
export function parseDateInput(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  date.setFullYear(y); // years below 100 would otherwise map to 19xx
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

/** A local calendar date back to "YYYY-MM-DD". */
export function toDateInput(date: Date): string {
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(date.getFullYear(), 4)}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

/** Today's date in Pittsburgh, as a local calendar date. */
export function todayInPittsburgh(now: Date = new Date()): Date {
  const parts = now.toLocaleDateString("en-CA", { timeZone: TIME_ZONE }).split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

/** Moves a calendar date by whole days, safe across daylight saving changes. */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Whole calendar days from a to b. */
export function daysBetween(a: Date, b: Date): number {
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((ub - ua) / DAY_MS);
}

/** "Oct 18, 2026" */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** "Oct 18 to Nov 15, 2026", or with both years when they differ. */
export function formatRange(from: Date, to: Date): string {
  if (daysBetween(from, to) === 0) return formatDate(to);
  if (from.getFullYear() === to.getFullYear()) {
    const short = from.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${short} to ${formatDate(to)}`;
  }
  return `${formatDate(from)} to ${formatDate(to)}`;
}

// ── Labels from Sanity ────────────────────────────────────────

const SEASONS: [RegExp, number][] = [
  [/\b(early|start|beginning)\b/, 0],
  [/\bspring\b/, 2],
  [/\b(mid|middle|summer)\b/, 5],
  [/\b(fall|autumn)\b/, 8],
  [/\b(late|end|winter)\b/, 9],
];

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/**
 * Best-effort reading of a reopen label: "early 2027" is Jan 1, "spring" Mar 1,
 * "mid" or "summer" Jun 1, "fall" or "autumn" Sep 1, "late" or "winter" Oct 1,
 * "March 2027" Mar 1, a bare "2027" Jan 1. Null when there is no year.
 */
export function reopensAt(label: string): Date | null {
  const text = (label ?? "").toLowerCase();
  const year = text.match(/\b(\d{4})\b/);
  if (!year) return null;

  let month = 0;
  const named = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\b/);
  if (named) {
    month = MONTHS.indexOf(named[1].slice(0, 3));
  } else {
    const season = SEASONS.find(([re]) => re.test(text));
    if (season) month = season[1];
  }
  return new Date(Number(year[1]), month, 1);
}

/**
 * Reads a step's "weeks out" label: "8 to 12 weeks" is {8, 12}, "12+ weeks"
 * is {12, Infinity}, "6 weeks" is {6, 6}, "Wedding week" is {0, 1}.
 * Months count as about four and a third weeks. Null when unreadable.
 */
export function weeksRange(text: string): WeeksRange | null {
  const t = (text ?? "").toLowerCase().trim();
  if (!t) return null;
  if (/wedding\s+week|week\s+of/.test(t)) return { from: 0, to: 1 };
  if (/wedding\s+day|day\s+of/.test(t)) return { from: 0, to: 0 };

  const unit = /month/.test(t) ? 52 / 12 : /week|wk/.test(t) ? 1 : null;
  if (unit === null) return null;
  const scale = (n: number) => Math.round(n * unit);

  const range = t.match(/(\d+(?:\.\d+)?)\s*(?:to|-|\u2013|\u2014|or)\s*(\d+(?:\.\d+)?)/);
  if (range) {
    const [a, b] = [scale(Number(range[1])), scale(Number(range[2]))];
    return { from: Math.min(a, b), to: Math.max(a, b) };
  }
  const plus = t.match(/(\d+(?:\.\d+)?)\s*\+|(?:more than|over|at least)\s*(\d+(?:\.\d+)?)/);
  if (plus) return { from: scale(Number(plus[1] ?? plus[2])), to: Infinity };
  const single = t.match(/(\d+(?:\.\d+)?)/);
  if (single) {
    const n = scale(Number(single[1]));
    return { from: n, to: n };
  }
  return null;
}

// ── The plan ──────────────────────────────────────────────────

/**
 * The guide's timeline as real dates, earliest first. Steps that can't be
 * read are left out; with no readable steps at all, the default timeline is
 * used. An open-ended step ("12+ weeks") becomes a single "by" date.
 */
export function fittingPlan(wedding: Date, steps?: TimelineStep[] | null): FittingWindow[] {
  const build = (list: TimelineStep[]) =>
    list
      .map((step) => ({ step, range: weeksRange(step.weeksOut) }))
      .filter((s): s is { step: TimelineStep; range: WeeksRange } => s.range !== null)
      .map(({ step, range }): FittingWindow => {
        const openEnded = !Number.isFinite(range.to);
        const to = addDays(wedding, -range.from * 7);
        const from = openEnded ? to : addDays(wedding, -range.to * 7);
        const title = (step.title ?? "").split(":")[0].trim() || step.weeksOut;
        return { title, weeksOut: step.weeksOut, from, to, openEnded };
      })
      .sort((a, b) => a.from.getTime() - b.from.getTime() || a.to.getTime() - b.to.getTime());

  const plan = steps?.length ? build(steps) : [];
  return plan.length ? plan : build(DEFAULT_STEPS);
}

/**
 * How a wedding date sits against the usual timeline and bridal availability.
 *
 * past: the date has gone. rush: under 8 weeks. beforeReopen: bridal is
 * waitlisted and the whole first fitting window falls before it reopens.
 * tight: 8 to 12 weeks out, or the window straddles the reopen date.
 * good: 13 to 26 weeks. early: more than 26 weeks.
 */
export function dateFit(wedding: Date, opts: DateFitOptions): DateFit {
  const today = todayInPittsburgh(opts.now);
  const days = daysBetween(today, wedding);
  const weeksAway = Math.floor(days / 7);
  const firstFitting = {
    from: addDays(wedding, -FIRST_FITTING_WEEKS.to * 7),
    to: addDays(wedding, -FIRST_FITTING_WEEKS.from * 7),
  };
  const reopens = reopensAt(opts.reopensLabel);
  const result = (kind: FitKind): DateFit => ({ kind, weeksAway, firstFitting, reopens });

  if (days < 0) return result("past");
  if (weeksAway < FIRST_FITTING_WEEKS.from) return result("rush");

  if (opts.limitedMode && opts.bridalWaitlisted && reopens && reopens > today) {
    if (firstFitting.to < reopens) return result("beforeReopen");
    if (firstFitting.from < reopens) return result("tight");
  }

  if (weeksAway <= FIRST_FITTING_WEEKS.to) return result("tight");
  if (weeksAway <= 26) return result("good");
  return result("early");
}

// ── Calendar file ─────────────────────────────────────────────

function icsDate(date: Date): string {
  return toDateInput(date).replace(/-/g, "");
}

function icsStamp(now: Date): string {
  return now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function icsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Folds lines longer than 75 octets, as RFC 5545 asks. */
function fold(line: string): string {
  const bytes = new TextEncoder();
  if (bytes.encode(line).length <= 75) return line;
  const out: string[] = [];
  let current = "";
  for (const ch of line) {
    const limit = out.length === 0 ? 75 : 74; // continuation lines start with a space
    if (bytes.encode(current + ch).length > limit) {
      out.push(current);
      current = ch;
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out.join("\r\n ");
}

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "step";
}

/**
 * An .ics calendar with an all-day event on the day each window opens (or the
 * "by" date for an open-ended step), plus the wedding day itself.
 */
export function icsFor(plan: FittingWindow[], weddingDate: Date, now: Date = new Date()): string {
  const stamp = icsStamp(now);
  const wedding = icsDate(weddingDate);

  const event = (day: Date, summary: string, description: string, key: string) => [
    "BEGIN:VEVENT",
    `UID:${wedding}-${key}@gracemaealterations.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${icsDate(day)}`,
    `DTEND;VALUE=DATE:${icsDate(addDays(day, 1))}`,
    `SUMMARY:${icsText(summary)}`,
    `DESCRIPTION:${icsText(description)}`,
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
  ];

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Grace Mae Alterations//Your dates//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Wedding dress fittings",
    ...plan.flatMap((w, i) =>
      w.openEnded
        ? event(w.to, `${w.title} by today`, `Aim to have this done by ${formatDate(w.to)}. Timeline from gracemaealterations.com`, `${i}-${slug(w.title)}`)
        : event(
            w.from,
            `${w.title} window opens`,
            `${w.title}: ${formatRange(w.from, w.to)}. Timeline from gracemaealterations.com`,
            `${i}-${slug(w.title)}`
          )
    ),
    ...event(weddingDate, "Wedding day", "Congratulations!", "wedding"),
    "END:VCALENDAR",
  ];

  return lines.map(fold).join("\r\n") + "\r\n";
}
