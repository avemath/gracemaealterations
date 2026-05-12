"use client";

import React from "react";

interface ImagePlaceholderProps {
  label: string;
  aspectRatio?: "portrait" | "landscape" | "square" | "tall" | "custom";
  customRatio?: string; // e.g. "56.25%" for 16:9
  className?: string;
  small?: boolean;
}

const ASPECT_RATIOS = {
  portrait: "133.33%",  // 3:4
  tall: "150%",         // 2:3
  landscape: "56.25%",  // 16:9
  square: "100%",       // 1:1
  custom: "75%",
};

// Scissors SVG icon in gold
const ScissorsIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#C9A84C"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

export default function ImagePlaceholder({
  label,
  aspectRatio = "landscape",
  customRatio,
  className = "",
  small = false,
}: ImagePlaceholderProps) {
  const paddingBottom = customRatio ?? ASPECT_RATIOS[aspectRatio];

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ paddingBottom }}
      role="img"
      aria-label={`Image placeholder: ${label}`}
    >
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3"
        style={{
          background: "linear-gradient(135deg, #F5EFE6 0%, #EDE5D8 100%)",
          border: "1px solid #C9A84C",
        }}
      >
        <ScissorsIcon />
        <div className="text-center px-4">
          <p
            className="font-cormorant text-gold tracking-widest uppercase"
            style={{ fontSize: small ? "0.6rem" : "0.65rem", letterSpacing: "0.2em" }}
          >
            {label}
          </p>
          {!small && (
            <p className="text-charcoal/40 font-jost mt-1" style={{ fontSize: "0.6rem" }}>
              Replace with your photo
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
