"use client";

import { useState } from "react";
import {
  CONFIDENCE_LABEL,
  type Confidence,
  type PhotoCheckResult,
} from "@/lib/photoCheck";
import { BRIDAL_ALTERATION_LABELS } from "@/lib/contactOptions";

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
}: Props) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [checkedPhotos, setCheckedPhotos] = useState("");
  const photosKey = photos.join("|").length + ":" + photos.length;
  const stale = state.kind === "done" && checkedPhotos !== photosKey;

  const run = async () => {
    setState({ kind: "checking" });
    try {
      const res = await fetch("/api/photo-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: photos.slice(0, 3), serviceType }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.result) {
        setState({ kind: "error", message: data.error ?? "The check isn't available right now. Your request will still send." });
        onResult(null);
        return;
      }
      setCheckedPhotos(photosKey);
      setState({ kind: "done", result: data.result });
      onResult(data.result);
      onIncludedChange(true);
    } catch {
      setState({ kind: "error", message: "The check isn't available right now. Your request will still send." });
      onResult(null);
    }
  };

  if (photos.length === 0) return null;

  return (
    <div className="mt-4 border border-blush bg-white/40 p-5" aria-live="polite">
      {(state.kind === "idle" || state.kind === "error" || stale) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <button type="button" onClick={run} className="btn-outline shrink-0">
            {stale ? "Check the new photos" : "Check my photos"}
          </button>
          <p className="font-jost text-charcoal/75 text-xs leading-[1.65]">
            Optional. A quick automated read of what the photos show (the garment, the likely
            fabric, visible details) to help you describe it. It never quotes or recommends
            work; Grace does that in person. The first three photos go to an AI service
            (Anthropic) for the check; this site keeps nothing until you send the form.
          </p>
        </div>
      )}

      {state.kind === "checking" && (
        <p className="font-jost text-charcoal/75 text-sm flex items-center gap-3" role="status">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-gold border-t-transparent animate-spin motion-reduce:animate-none" aria-hidden="true" />
          Looking at {photos.length > 3 ? "the first three photos" : photos.length === 1 ? "your photo" : "your photos"}…
        </p>
      )}

      {state.kind === "error" && (
        <p className="mt-3 font-jost text-charcoal/75 text-xs" role="status">
          {state.message}
        </p>
      )}

      {state.kind === "done" && !stale && <Result
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
  result,
  serviceType,
  alterationsNeeded,
  onToggleAlteration,
  included,
  onIncludedChange,
}: {
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
        <p className="font-jost font-medium text-charcoal text-sm">The check couldn&rsquo;t read these photos.</p>
        {result.note && <p className="font-jost text-charcoal/75 text-sm mt-1">{result.note}</p>}
        <p className="font-jost text-charcoal/75 text-xs mt-2">
          A full-length photo of the garment in good light works best. Or just send them; Grace will look herself.
        </p>
      </div>
    );
  }

  const rows: { label: string; value: React.ReactNode }[] = [];
  if (result.garment.type)
    rows.push({ label: "Garment", value: <Sure c={result.garment.confidence}>{result.garment.type}</Sure> });
  if (result.silhouette) rows.push({ label: "Shape", value: result.silhouette });
  if (result.fabrics.length)
    rows.push({
      label: "Fabric",
      value: (
        <ul className="space-y-1.5">
          {result.fabrics.map((f, i) => (
            <li key={i}>
              <Sure c={f.confidence}>{f.name}</Sure>
              {f.cues && <span className="block text-charcoal/75 text-xs mt-0.5">{f.cues}</span>}
            </li>
          ))}
        </ul>
      ),
    });
  if (result.layers) rows.push({ label: "Layers", value: result.layers });
  if (result.details.length) rows.push({ label: "Details", value: <Lines items={result.details} /> });
  if (result.closure) rows.push({ label: "Closure", value: result.closure });
  if (result.train !== "not visible" && result.train !== "none")
    rows.push({ label: "Train", value: <span className="capitalize">{result.train}</span> });
  if (result.fitObservations.length)
    rows.push({ label: "How it sits", value: <Lines items={result.fitObservations} /> });

  const suggestions = serviceType === "bridal" ? result.checklist : [];

  return (
    <div>
      <p className="font-jost font-medium text-charcoal text-xs tracking-[0.18em] uppercase">What the photos show</p>
      {result.note && <p className="font-jost text-charcoal/75 text-xs mt-1">{result.note}</p>}

      <dl className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[6.5rem_1fr] gap-3 font-jost text-sm">
            <dt className="text-charcoal/75">{row.label}</dt>
            <dd className="text-charcoal">{row.value}</dd>
          </div>
        ))}
      </dl>

      {suggestions.length > 0 && (
        <div className="mt-5 border-t border-blush pt-4">
          <p className="font-jost text-charcoal/75 text-xs mb-2">
            Related to what&rsquo;s visible. Tap any that match what you want:
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
                    {BRIDAL_ALTERATION_LABELS[s.id] ?? s.id}
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
          <span className="font-medium text-charcoal">Photos can&rsquo;t show:</span>{" "}
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
          Send this with my request
          <span className="block text-charcoal/75 text-xs mt-0.5">
            Anything wrong? Untick it, or say so in your notes. It&rsquo;s a starting point, not a quote.
          </span>
        </span>
      </label>
    </div>
  );
}

function Sure({ c, children }: { c: Confidence; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-baseline gap-2 flex-wrap">
      <span>{children}</span>
      <span className="inline-flex items-center gap-1.5 text-[0.7rem] text-charcoal/75">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${CONFIDENCE_DOT[c]}`} aria-hidden="true" />
        {CONFIDENCE_LABEL[c]}
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
