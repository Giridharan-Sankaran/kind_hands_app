// src/components/illustrations/ToteMark.jsx
// The one signature visual element in the app: a tote bag with a heart,
// standing in for the doorstep handoff at the center of what Kind Hands
// does. Used sparingly — the auth screens, empty states, and the nav mark.
import React from "react";

export default function ToteMark({ size = 64, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Kind Hands"
    >
      <path
        d="M38 46 C38 28 47 18 60 18 C73 18 82 28 82 46"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        className="text-pine"
      />
      <path
        d="M26 46 H94 L88 98 C87.3 103.5 82.7 108 77 108 H43 C37.3 108 32.7 103.5 32 98 L26 46 Z"
        fill="currentColor"
        className="text-pine"
      />
      <path
        d="M60 86 C48 76 42 69 42 61 C42 55 47 51 52 51 C56 51 59 53 60 57 C61 53 64 51 68 51 C73 51 78 55 78 61 C78 69 72 76 60 86 Z"
        fill="currentColor"
        className="text-marigold"
      />
    </svg>
  );
}
