"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps Tab inside `active` containers (mobile menu, lightbox), closes on
 * Escape, locks body scroll, and returns focus to whatever opened it.
 *
 * Usage:
 *   const ref = useFocusTrap<HTMLDivElement>(isOpen, onClose);
 *   <div ref={ref} role="dialog" aria-modal="true">…</div>
 *
 * `alsoInclude` is a control outside the container that belongs in the loop,
 * such as the menu's own close button in the header.
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  onClose: () => void,
  alsoInclude?: React.RefObject<HTMLElement>
) {
  const containerRef = useRef<T>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    returnFocusTo.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    const inside = () =>
      Array.from(container?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
    const focusables = () => {
      const extra = alsoInclude?.current;
      return extra ? [extra, ...inside()] : inside();
    };

    // Move focus in so the next Tab lands inside the dialog.
    inside()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusTo.current?.focus();
    };
  }, [active, onClose, alsoInclude]);

  return containerRef;
}
