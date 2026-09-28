import { ReactNode } from "react";

interface RevealImageProps {
  children: ReactNode;
  className?: string;
  /** Kept for call-site compatibility. */
  delay?: number;
}

/**
 * Was a Framer clip-path wipe. Images are no longer hidden before JS runs, so
 * this is now the overflow-hidden frame only.
 */
export default function RevealImage({ children, className = "" }: RevealImageProps) {
  return <div className={`overflow-hidden ${className}`}>{children}</div>;
}
