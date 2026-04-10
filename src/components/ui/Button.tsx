import React from "react";
import Link from "next/link";

type Variant = "gold" | "outline" | "outline-ivory";

interface ButtonProps {
  variant?: Variant;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  "aria-label"?: string;
}

const variantClasses: Record<Variant, string> = {
  gold: "btn-gold",
  outline: "btn-outline",
  "outline-ivory": "btn-outline-ivory",
};

export default function Button({
  variant = "gold",
  href,
  onClick,
  children,
  className = "",
  type = "button",
  disabled = false,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const classes = `inline-block ${variantClasses[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
