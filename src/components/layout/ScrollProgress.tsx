"use client";

import { useState, useEffect } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[999] h-[3px] pointer-events-none bg-gold/10"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gold origin-left"
        style={{ transform: `scaleX(${progress / 100})`, willChange: "transform" }}
      />
    </div>
  );
}
