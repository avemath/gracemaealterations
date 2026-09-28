import { ReactNode } from "react";

interface RevealTextProps {
  children: ReactNode;
  className?: string;
  /** Kept for call-site compatibility; staggering is handled by data-reveal. */
  delay?: number;
  onMount?: boolean;
}

/**
 * Was a Framer masked-text reveal. The reveal is now CSS driven via
 * data-reveal, so this is just the overflow-hidden slot the headings sit in.
 */
export default function RevealText({ children, className = "" }: RevealTextProps) {
  return <div className={`overflow-hidden ${className}`}>{children}</div>;
}
