"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Shown if a page fails to render (for example, Sanity is unreachable the
 * first time a new page is built). Pages that already exist keep serving
 * their last good version, so this is rare.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section
      className="bg-ivory min-h-[80vh] flex flex-col items-center justify-center px-6 py-24 text-center"
      aria-labelledby="error-heading"
    >
      <div className="w-12 h-px bg-gold mx-auto mb-8" aria-hidden="true" />
      <h1 id="error-heading" className="font-cormorant italic text-charcoal text-3xl lg:text-4xl mb-4">
        A thread came loose.
      </h1>
      <p className="font-jost text-charcoal/75 text-sm leading-relaxed max-w-sm mb-10">
        This page didn&rsquo;t load properly. Try again in a moment, or head back to the home page.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button type="button" onClick={reset} className="btn-gold">
          Try again
        </button>
        <Link href="/" className="btn-outline">
          Home
        </Link>
      </div>
    </section>
  );
}
