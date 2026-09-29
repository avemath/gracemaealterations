"use client";

/**
 * Last resort, when even the site layout fails. It replaces the whole page,
 * so it carries its own minimal markup and inline styles.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF7F2",
          color: "#1C1C1C",
          fontFamily: "Georgia, serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <main>
          <h1 style={{ fontStyle: "italic", fontWeight: 400, fontSize: "2rem", margin: "0 0 12px" }}>
            Grace Mae Alterations
          </h1>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: "15px", lineHeight: 1.6, margin: "0 0 24px" }}>
            The site didn&rsquo;t load properly. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#7A5F1E",
              color: "#FAF7F2",
              border: 0,
              padding: "14px 28px",
              fontSize: "12px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
