// src/components/ui/Card.jsx
import React from "react";

export default function Card({ className = "", as: Comp = "div", ...props }) {
  return (
    <Comp
      className={`rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(30,43,39,0.04),0_8px_24px_-12px_rgba(30,43,39,0.12)] ${className}`}
      {...props}
    />
  );
}
