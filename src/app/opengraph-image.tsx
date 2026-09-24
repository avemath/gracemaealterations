import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "Grace Mae Alterations — Pittsburgh Bridal Alterations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const IVORY = "#FAF7F2";
const CHARCOAL = "#1C1C1C";
const GOLD = "#C9A84C";

export default async function Image() {
  // Photographic background: silk on the left, lace and a thimble lower right.
  let background: string | null = null;
  try {
    const file = readFileSync(join(process.cwd(), "public", "og-bg.jpg"));
    background = `data:image/jpeg;base64,${file.toString("base64")}`;
  } catch {
    // Fall back to the flat ivory card
  }

  // Cormorant Garamond Italic for the headline
  let fontData: ArrayBuffer | null = null;
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    ).then((r) => r.text());

    const match = css.match(/src:\s*url\(([^)]+)\)/);
    if (match?.[1]) {
      fontData = await fetch(match[1]).then((r) => r.arrayBuffer());
    }
  } catch {
    // Fall back to system serif
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: IVORY,
          display: "flex",
          position: "relative",
        }}
      >
        {/* Full-bleed photograph */}
        {background && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={background}
            alt=""
            width={size.width}
            height={size.height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Ivory wash behind the text block so the copy stays legible */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "55%",
            background:
              "linear-gradient(to right, rgba(250,247,242,0.95) 0%, rgba(250,247,242,0.88) 55%, rgba(250,247,242,0) 100%)",
          }}
        />

        {/* Left gold accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "6px",
            background: GOLD,
          }}
        />

        {/* Text block over the left 55% */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "55%",
            height: "100%",
            padding: "72px 0 72px 80px",
          }}
        >
          <div
            style={{
              fontFamily: "sans-serif",
              fontSize: "14px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: GOLD,
              marginBottom: "28px",
            }}
          >
            Pittsburgh Bridal Alterations
          </div>

          <div
            style={{
              fontFamily: fontData ? "Cormorant" : "Georgia, serif",
              fontStyle: "italic",
              fontSize: "112px",
              color: CHARCOAL,
              lineHeight: 0.9,
              letterSpacing: "-0.01em",
              marginBottom: "32px",
            }}
          >
            Grace Mae
          </div>

          <div
            style={{
              width: "56px",
              height: "2px",
              background: GOLD,
              marginBottom: "28px",
            }}
          />

          <div
            style={{
              fontFamily: "sans-serif",
              fontSize: "22px",
              color: "rgba(28,28,28,0.62)",
              letterSpacing: "0.02em",
              lineHeight: 1.45,
              maxWidth: "440px",
            }}
          >
            Sewn with precision. Every stitch tailored to you.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "Cormorant", data: fontData, style: "italic" as const }]
        : [],
    }
  );
}
