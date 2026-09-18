// src/components/ui/Badge.jsx
import React from "react";

const TONES = {
  pine: "bg-pine-light text-pine",
  marigold: "bg-marigold-light text-marigold-deep",
  moss: "bg-moss-light text-moss",
  clay: "bg-clay-light text-clay",
  neutral: "bg-paper text-ink-muted",
};

export default function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}
