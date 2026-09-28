/**
 * The photo check: an AI read of the customer's garment photos that says what
 * is visible, never what to do about it. Shared by the contact form, the
 * /api/photo-check route and Grace's notification email, so all three agree
 * on the shape.
 */

import { BRIDAL_ALTERATIONS } from "./contactOptions";

export type Confidence = "high" | "medium" | "low";

export const TRAIN_LENGTHS = ["none", "sweep", "chapel", "cathedral", "not visible"] as const;
export type TrainLength = (typeof TRAIN_LENGTHS)[number];

/** Checklist ids the check may point at. "unsure" is the customer's to pick. */
export const CHECKLIST_IDS = BRIDAL_ALTERATIONS.map((o) => o.id).filter((id) => id !== "unsure");

export interface PhotoCheckResult {
  /** False when the photos don't show a garment clearly enough to read. */
  usable: boolean;
  /** Why it isn't usable, or one line of context. Empty when nothing to add. */
  note: string;
  garment: { type: string; confidence: Confidence };
  /** e.g. "A-line", "ball gown", "sheath"; empty when it doesn't apply. */
  silhouette: string;
  fabrics: { name: string; confidence: Confidence; cues: string }[];
  /** e.g. "Several sheer layers over a satin lining"; empty if unclear. */
  layers: string;
  /** Embellishment and construction details that are visible. */
  details: string[];
  closure: string;
  train: TrainLength;
  /** Neutral observations about how the garment sits, if it is being worn. */
  fitObservations: string[];
  /** Checklist items that relate to something visible, with the reason. */
  checklist: { id: string; reason: string }[];
  /** What photos cannot show, so nobody over-trusts the read. */
  cannotTell: string[];
}

const confidence = { type: "string", enum: ["high", "medium", "low"] } as const;

/** JSON schema for structured output. Every field is required, so the shape never varies. */
export const PHOTO_CHECK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "usable",
    "note",
    "garment",
    "silhouette",
    "fabrics",
    "layers",
    "details",
    "closure",
    "train",
    "fitObservations",
    "checklist",
    "cannotTell",
  ],
  properties: {
    usable: { type: "boolean" },
    note: { type: "string" },
    garment: {
      type: "object",
      additionalProperties: false,
      required: ["type", "confidence"],
      properties: { type: { type: "string" }, confidence },
    },
    silhouette: { type: "string" },
    fabrics: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "confidence", "cues"],
        properties: { name: { type: "string" }, confidence, cues: { type: "string" } },
      },
    },
    layers: { type: "string" },
    details: { type: "array", items: { type: "string" } },
    closure: { type: "string" },
    train: { type: "string", enum: [...TRAIN_LENGTHS] },
    fitObservations: { type: "array", items: { type: "string" } },
    checklist: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "reason"],
        properties: { id: { type: "string", enum: CHECKLIST_IDS }, reason: { type: "string" } },
      },
    },
    cannotTell: { type: "array", items: { type: "string" } },
  },
} as const;

// ── Sanitising (the result travels client → /api/contact → email) ─────────────

const str = (v: unknown, max = 200) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").replace(/—/g, ", ").trim().slice(0, max) : "";
const conf = (v: unknown): Confidence => (v === "high" || v === "medium" ? v : "low");
const list = (v: unknown, max = 8, len = 200) =>
  Array.isArray(v) ? v.map((x) => str(x, len)).filter(Boolean).slice(0, max) : [];

/** Coerces anything into a safe PhotoCheckResult, or null if it isn't one. */
export function sanitizePhotoCheck(input: unknown): PhotoCheckResult | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;
  const garment = (r.garment ?? {}) as Record<string, unknown>;
  const train = TRAIN_LENGTHS.includes(r.train as TrainLength) ? (r.train as TrainLength) : "not visible";
  return {
    usable: r.usable === true,
    note: str(r.note, 300),
    garment: { type: str(garment.type, 80), confidence: conf(garment.confidence) },
    silhouette: str(r.silhouette, 80),
    fabrics: Array.isArray(r.fabrics)
      ? r.fabrics
          .map((f) => (f && typeof f === "object" ? (f as Record<string, unknown>) : {}))
          .map((f) => ({ name: str(f.name, 60), confidence: conf(f.confidence), cues: str(f.cues, 200) }))
          .filter((f) => f.name)
          .slice(0, 4)
      : [],
    layers: str(r.layers, 200),
    details: list(r.details),
    closure: str(r.closure, 120),
    train,
    fitObservations: list(r.fitObservations, 6),
    checklist: Array.isArray(r.checklist)
      ? r.checklist
          .map((c) => (c && typeof c === "object" ? (c as Record<string, unknown>) : {}))
          .filter((c) => CHECKLIST_IDS.includes(c.id as (typeof CHECKLIST_IDS)[number]))
          .map((c) => ({ id: c.id as string, reason: str(c.reason, 200) }))
          .slice(0, CHECKLIST_IDS.length)
      : [],
    cannotTell: list(r.cannotTell, 5),
  };
}

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: "Clear in the photos",
  medium: "Likely",
  low: "Hard to tell",
};

/** Plain lines for Grace's email, in the order she would read them. */
export function photoCheckLines(r: PhotoCheckResult): [string, string][] {
  const lines: [string, string][] = [];
  if (r.garment.type) lines.push(["Garment", `${r.garment.type} (${CONFIDENCE_LABEL[r.garment.confidence].toLowerCase()})`]);
  if (r.silhouette) lines.push(["Silhouette", r.silhouette]);
  if (r.fabrics.length)
    lines.push([
      "Fabric",
      r.fabrics.map((f) => `${f.name} (${CONFIDENCE_LABEL[f.confidence].toLowerCase()}${f.cues ? `: ${f.cues}` : ""})`).join("; "),
    ]);
  if (r.layers) lines.push(["Layers", r.layers]);
  if (r.details.length) lines.push(["Details", r.details.join("; ")]);
  if (r.closure) lines.push(["Closure", r.closure]);
  if (r.train !== "not visible" && r.train !== "none") lines.push(["Train", r.train]);
  if (r.fitObservations.length) lines.push(["Fit, as seen", r.fitObservations.join("; ")]);
  if (r.cannotTell.length) lines.push(["Photos can't show", r.cannotTell.join("; ")]);
  return lines;
}
