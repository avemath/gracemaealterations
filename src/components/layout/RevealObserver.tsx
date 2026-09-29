"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SELECTOR = "[data-reveal]";

/**
 * One shared IntersectionObserver for every [data-reveal] element on the page.
 *
 * The elements are fully visible in the server HTML. This component arms the
 * hidden state (.reveal-armed on <html>) only after showing everything already
 * on screen, so a slow or failed script never leaves text invisible, the first
 * screen never flickers, and its largest image isn't held back until hydration.
 * prefers-reduced-motion opts out in CSS regardless.
 *
 * A MutationObserver picks up elements React mounts after the first pass (the
 * portfolio filter remounts the whole grid, for example). Without it those
 * elements were armed by the CSS but never observed, so they stayed invisible.
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealed = new WeakSet<Element>();

    const show = (el: Element) => {
      revealed.add(el);
      el.classList.add("is-visible");
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          io.unobserve(entry.target);
        }
      },
      // Any overlap counts, once the element is 10% of the screen above the
      // bottom edge. A ratio threshold (it was 0.15) can never be met by an
      // element taller than the screen divided by that ratio: the portfolio
      // grid passed 5,400px and stayed invisible, on phones especially.
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );

    const onScreen = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.9 && r.bottom > 0;
    };

    const track = (el: Element) => {
      if (revealed.has(el) || el.classList.contains("is-visible")) {
        revealed.add(el);
        return;
      }
      // Already seen before the hidden state was armed: keep it shown.
      if (reduced || !document.documentElement.classList.contains("reveal-armed") && onScreen(el)) show(el);
      else io.observe(el);
    };

    const scan = (root: ParentNode) => root.querySelectorAll(SELECTOR).forEach(track);

    scan(document);
    document.documentElement.classList.add("reveal-armed");

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes") {
          // React rewrote className on an element that had already been
          // revealed; put the class back rather than hiding it again.
          const el = m.target as Element;
          if (revealed.has(el) && !el.classList.contains("is-visible")) el.classList.add("is-visible");
          continue;
        }
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(SELECTOR)) track(node);
          scan(node);
        });
      }
    });
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
