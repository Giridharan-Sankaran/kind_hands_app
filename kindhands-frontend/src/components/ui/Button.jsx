// src/components/ui/Button.jsx
import React from "react";

const VARIANTS = {
  primary: "bg-pine text-white hover:bg-pine-deep",
  accent: "bg-marigold text-ink hover:bg-marigold-deep",
  secondary: "bg-surface text-ink outline outline-1 outline-line hover:bg-paper",
  ghost: "bg-transparent text-ink hover:bg-paper",
  danger: "bg-transparent text-clay hover:bg-clay-light",
};

const SIZES = {
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3.5 text-base",
};

// `as` lets this render as a react-router <Link> (as={Link} to="/x") or a
// plain <a> while still defaulting to a real <button type="button">
// otherwise, so it never accidentally submits a form it happens to sit in.
export default function Button({ variant = "primary", size = "md", as, className = "", ...props }) {
  const Comp = as || "button";
  const typeProps = as ? {} : { type: props.type || "button" };

  return (
    <Comp
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...typeProps}
      {...props}
    />
  );
}
