"use client";

export default function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className="btn-gold" onClick={() => window.print()}>
      {label}
    </button>
  );
}
