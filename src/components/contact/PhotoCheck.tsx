"use client";

import { useEffect, useRef, useState } from "react";
import type { Confidence, PhotoCheckResult } from "@/lib/photoCheck";
import { bridalAlterationLabels, type OptionText } from "@/lib/contactOptions";
import type { Text } from "@/lib/text";

/** Its wording (Studio: Contact form & emails, Photo check), plus the checklist labels. */
export type PhotoCheckText = Pick<Text<"forms">, Extract<keyof Text<"forms">, `pc${string}`>> & OptionText;

type State =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "done"; result: PhotoCheckResult }
  | { kind: "error"; message: string };

interface Props {
  /** Resized photo data URLs, as already attached to the form. */
  photos: string[];
  serviceType: string;
  /** Checklist ids the customer has ticked, and a way to tick more. */
  alterationsNeeded: string[];
  onToggleAlteration: (id: string) => void;
  /** Whether the result goes out with the request. */
  included: boolean;
  onResult: (result: PhotoCheckResult | null) => void;
  onIncludedChange: (included: boolean) => void;
  text: PhotoCheckText;
}

const CONFIDENCE_DOT: Record<Confidence, string> = {
  high: "bg-gold_ink",
  medium: "bg-gold",
  low: "bg-charcoal/25",
};

/**
 * "Check my photos": a quick, factual read of the attached photos. It says
 * what is visible (garment, likely fabric, details) and how sure it is, so the
 * customer can describe their garment accurately. It never suggests work,
 * prices or dates, and the customer decides whether it goes with the request.
 */
export default function PhotoCheck({
  photos,
  serviceType,
  alterationsNeeded,
  onToggleAlteration,
  included,
  onResult,
  onIncludedChange,
  text,
}: Props) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [checkedPhotos, setCheckedPhotos] = useState("");
  const photosKey = photos.map((p) => p.length + p.slice(-24)).join("|");
  const stale = state.kind === "done" && checkedPhotos !== photosKey;
  // The photos as they are now, so a check that comes back after a photo was
  // added or removed is dropped rather than sent about the wrong photos.
  const currentKey = useRef(photosKey);
  useEffect(() => {
    currentKey.current = photosKey;
  }, [photosKey]);

  const run = async () => {
    const askedFor = photosKey;
    setState({ kind: "checking" });
    try {
      const res = await fetch("/api/photo-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: photos.slice(0, 3), serviceType }),
      });
      const data = await res.json().catch(() => ({}));
      if (currentKey.current !== askedFor) {
        setState({ kind: "idle" });
        return;
      }
      if (!res.ok || !data.result) {
        setState({ kind: "error", message: data.error ?? text.pcUnavailable });
        onResult(null);
        return;
      }
      setCheckedPhotos(photosKey);
      setState({ kind: "done", result: data.result });
      onResult(data.result);
      onIncludedChange(true);
    } catch {
      if (currentKey.current !== askedFor) {
        setState({ kind: "idle" });
        return;
      }
      setState({ kind: "error", message: text.pcUnavailable });
      onResult(null);
    }
  };

  if (photos.length === 0) return null;

  return (
    <div className="mt-4 border border-blush bg-white/40 p-5" aria-live="polite">
      {(state.kind === "idle" || state.kind === "error" || stale) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <button type="button" onClick={run} className="btn-outline shrink-0">
            {stale ? text.pcButtonAgain : text.pcButton}
          </button>
          <p className="font-jost text-charcoal/75 text-xs leading-[1.65]">
            {text.pcIntro}{" "}
            {/* Where the photos go is a fact about how this works, not wording,
                so it stays in the code and can't be edited out by mistake. */}
            The first three photos go to an AI service (Anthropic) for the check; this site keeps
            nothing until you send the form.
          </p>
        </div>
      )}

      {state.kind === "checking" && (
        <p className="font-jost text-charcoal/75 text-sm flex items-center gap-3" role="status">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-gold border-t-transparent animate-spin motion-reduce:animate-none" aria-hidden="true" />
          {photos.length > 3 ? text.pcCheckingMany : photos.length === 1 ? text.pcCheckingOne : text.pcCheckingSome}
        </p>
      )}

      {state.kind === "error" && (
        <p className="mt-3 font-jost text-charcoal/75 text-xs" role="status">
          {state.message}
        </p>
      )}

      {state.kind === "done" && !stale && <Result
        text={text}
        result={state.result}
        serviceType={serviceType}
        alterationsNeeded={alterationsNeeded}
        onToggleAlteration={onToggleAlteration}
        included={included}
        onIncludedChange={onIncludedChange}
      />}
    </div>
  );
}

function Result({
  text,
  result,
  serviceType,
  alterationsNeeded,
  onToggleAlteration,
  included,
  onIncludedChange,
}: {
  text: PhotoCheckText;
  result: PhotoCheckResult;
  serviceType: string;
  alterationsNeeded: string[];
  onToggleAlteration: (id: string) => void;
  included: boolean;
  onIncludedChange: (v: boolean) => void;
}) {
  if (!result.usable) {
    return (
      <div>
        <p className="font-jost font-medium text-charcoal text-sm">{text.pcUnreadable}</p>
        {result.note && <p className="font-jost text-charcoal/75 text-sm mt-1">{result.note}</p>}
        <p className="font-jost text-charcoal/75 text-xs mt-2">
          {text.pcUnreadableTip}
        </p>
      </div>
    );
  }

  const sure: Record<Confidence, string> = {
    high: text.pcSureHigh,
    medium: text.pcSureMedium,
    low: text.pcSureLow,
  };
  // Keyed by id, not label, so two rows given the same wording in the Studio
  // still render as two rows.
  const rows: { id: string; label: string; value: React.ReactNode }[] = [];
  if (result.garment.type)
    rows.push({
      id: "garment",
      label: text.pcGarment,
      value: <Sure c={result.garment.confidence} label={sure[result.garment.confidence]}>{result.garment.type}</Sure>,
    });
  if (result.silhouette) rows.push({ id: "shape", label: text.pcShape, value: result.silhouette });
  if (result.fabrics.length)
    rows.push({
      id: "fabric",
      label: text.pcFabric,
      value: (
        <ul className="space-y-1.5">
          {result.fabrics.map((f, i) => (
            <li key={i}>
              <Sure c={f.confidence} label={sure[f.confidence]}>{f.name}</Sure>
              {f.cues && <span className="block text-charcoal/75 text-xs mt-0.5">{f.cues}</span>}
            </li>
          ))}
        </ul>
      ),
    });
  if (result.layers) rows.push({ id: "layers", label: text.pcLayers, value: result.layers });
  if (result.details.length) rows.push({ id: "details", label: text.pcDetails, value: <Lines items={result.details} /> });
  if (result.closure) rows.push({ id: "closure", label: text.pcClosure, value: result.closure });
  if (result.train !== "not visible" && result.train !== "none")
    rows.push({ id: "train", label: text.pcTrain, value: <span className="capitalize">{result.train}</span> });
  if (result.fitObservations.length)
    rows.push({ id: "fit", label: text.pcFit, value: <Lines items={result.fitObservations} /> });

  const suggestions = serviceType === "bridal" ? result.checklist : [];
  const labels = bridalAlterationLabels(text);

  return (
    <div>
      <p className="font-jost font-medium text-charcoal text-xs tracking-[0.18em] uppercase">{text.pcHeading}</p>
      {result.note && <p className="font-jost text-charcoal/75 text-xs mt-1">{result.note}</p>}

      <dl className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[6.5rem_1fr] gap-3 font-jost text-sm">
            <dt className="text-charcoal/75">{row.label}</dt>
            <dd className="text-charcoal">{row.value}</dd>
          </div>
        ))}
      </dl>

      {suggestions.length > 0 && (
        <div className="mt-5 border-t border-blush pt-4">
          <p className="font-jost text-charcoal/75 text-xs mb-2">
            {text.pcSuggest}
          </p>
          <ul className="flex flex-wrap gap-2">
            {suggestions.map((s) => {
              const on = alterationsNeeded.includes(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => onToggleAlteration(s.id)}
                    title={s.reason}
                    className={`font-jost text-xs px-3 py-2 min-h-[36px] border transition-colors duration-200 ${
                      on ? "border-charcoal bg-charcoal text-ivory" : "border-charcoal/25 text-charcoal hover:border-charcoal/60"
                    }`}
                  >
                    {on ? "✓ " : "+ "}
                    {labels[s.id] ?? s.id}
                  </button>
                  <span className="sr-only">. {s.reason}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {result.cannotTell.length > 0 && (
        <p className="mt-5 font-jost text-charcoal/75 text-xs leading-[1.65]">
          <span className="font-medium text-charcoal">{text.pcCannotShow}</span>{" "}
          {result.cannotTell.map((c, i) => (i ? c.charAt(0).toLowerCase() + c.slice(1) : c)).join("; ")}.
        </p>
      )}

      <label className="mt-5 flex items-start gap-3 font-jost text-sm text-charcoal cursor-pointer">
        <input
          type="checkbox"
          checked={included}
          onChange={(e) => onIncludedChange(e.target.checked)}
          className="mt-1 w-4 h-4 accent-[#7A5F1E]"
        />
        <span>
          {text.pcInclude}
          <span className="block text-charcoal/75 text-xs mt-0.5">{text.pcIncludeHint}</span>
        </span>
      </label>
    </div>
  );
}

function Sure({ c, label, children }: { c: Confidence; label: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-baseline gap-2 flex-wrap">
      <span>{children}</span>
      <span className="inline-flex items-center gap-1.5 text-[0.7rem] text-charcoal/75">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${CONFIDENCE_DOT[c]}`} aria-hidden="true" />
        {label}
      </span>
    </span>
  );
}

function Lines({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
