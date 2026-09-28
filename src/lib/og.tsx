import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const OG_SIZE = { width: 1200, height: 630 };

const IVORY = "#FAF7F2";
const CHARCOAL = "#1C1C1C";
const GOLD = "#C9A84C";

/** Pull one Google font file out of the CSS the API returns. */
async function loadFont(family: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    }).then((r) => r.text());
    const match = css.match(/src:\s*url\(([^)]+)\)/);
    return match?.[1] ? await fetch(match[1]).then((r) => r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

interface OgCard {
  /** Gold eyebrow above the headline. */
  label?: string;
  /** Italic serif headline. */
  headline: string;
  /** One sans line under the rule. */
  tagline?: string;
}

/**
 * The shared social card: the silk-and-lace photograph with a left-aligned
 * text block. Every route renders the same frame with its own headline.
 */
export async function ogCard({
  label = "Pittsburgh Bridal Alterations",
  headline,
  tagline = "Sewn with precision. Every stitch tailored to you.",
}: OgCard) {
  let background: string | null = null;
  try {
    const file = readFileSync(join(process.cwd(), "public", "og-bg.jpg"));
    background = `data:image/jpeg;base64,${file.toString("base64")}`;
  } catch {
    // Fall back to the flat ivory card
  }

  const [serif, sans] = await Promise.all([
    loadFont("Cormorant+Garamond:ital,wght@1,400"),
    loadFont("Jost:wght@300"),
  ]);

  // satori needs at least one font. If Google Fonts is unreachable, serve the
  // photograph on its own rather than throwing during the build.
  if (!serif && !sans && background) {
    const bytes = readFileSync(join(process.cwd(), "public", "og-bg.jpg"));
    return new Response(new Uint8Array(bytes), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600" },
    });
  }

  // Long headlines need to step down a size to stay on two lines.
  const fontSize = headline.length > 26 ? 68 : headline.length > 16 ? 88 : 112;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: IVORY, display: "flex", position: "relative" }}>
        {background && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={background}
            alt=""
            width={OG_SIZE.width}
            height={OG_SIZE.height}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "62%",
            background:
              "linear-gradient(to right, rgba(250,247,242,0.95) 0%, rgba(250,247,242,0.88) 55%, rgba(250,247,242,0) 100%)",
          }}
        />

        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "6px", background: GOLD }} />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "60%",
            height: "100%",
            padding: "72px 0 72px 80px",
          }}
        >
          <div
            style={{
              fontFamily: sans ? "Jost" : "sans-serif",
              fontSize: "14px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: GOLD,
              marginBottom: "26px",
            }}
          >
            {label}
          </div>

          <div
            style={{
              fontFamily: serif ? "Cormorant" : "Georgia, serif",
              fontStyle: "italic",
              fontSize: `${fontSize}px`,
              color: CHARCOAL,
              lineHeight: 1.04,
              letterSpacing: "-0.01em",
              marginBottom: "30px",
            }}
          >
            {headline}
          </div>

          <div style={{ width: "56px", height: "2px", background: GOLD, marginBottom: "26px" }} />

          <div
            style={{
              fontFamily: sans ? "Jost" : "sans-serif",
              fontSize: "20px",
              color: "rgba(28,28,28,0.62)",
              letterSpacing: "0.02em",
              lineHeight: 1.45,
              maxWidth: "560px",
            }}
          >
            {tagline}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        ...(serif ? [{ name: "Cormorant", data: serif, style: "italic" as const }] : []),
        ...(sans ? [{ name: "Jost", data: sans, weight: 300 as const, style: "normal" as const }] : []),
      ],
    }
  );
}
