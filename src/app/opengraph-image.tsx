import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Grace Mae Alterations — Pittsburgh Bridal Alterations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Try to load Cormorant Garamond Italic for the headline
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
          background: "#FAF7F2",
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        {/* Left gold accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "6px",
            background: "#C9A84C",
          }}
        />

        {/* Top label */}
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: "14px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#C9A84C",
            marginBottom: "32px",
            marginLeft: "2px",
          }}
        >
          Pittsburgh, PA · Bridal &amp; Clothing Alterations
        </div>

        {/* Main headline */}
        <div
          style={{
            fontFamily: fontData ? "Cormorant" : "Georgia, serif",
            fontStyle: "italic",
            fontSize: "118px",
            color: "#1C1C1C",
            lineHeight: 0.88,
            marginBottom: "36px",
            letterSpacing: "-0.01em",
          }}
        >
          Grace Mae
        </div>

        {/* Gold rule */}
        <div
          style={{
            width: "56px",
            height: "2px",
            background: "#C9A84C",
            marginBottom: "28px",
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: "24px",
            color: "rgba(28,28,28,0.5)",
            letterSpacing: "0.02em",
            flex: 1,
          }}
        >
          Sewn with precision.
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #E8E0D8",
            paddingTop: "28px",
          }}
        >
          <div
            style={{
              fontFamily: "sans-serif",
              fontSize: "18px",
              color: "rgba(28,28,28,0.35)",
              letterSpacing: "0.08em",
            }}
          >
            gracemaealterations.com
          </div>
          <div
            style={{
              fontFamily: "sans-serif",
              fontSize: "13px",
              color: "#C9A84C",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            By Appointment Only
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
