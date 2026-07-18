import React from "react";

// Ethiopia Reads' signature mark: an open book. Used wherever the brand
// needs to be recognizable at a glance (kiosk header, admin header, login).
export default function BrandMark({ size = 40, className = "" }) {
  return (
    <div
      className={`rounded-full bg-forest flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 64 64"
        width={size * 0.56}
        height={size * 0.56}
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M32 20c-4.5-3.4-10-4.6-14.5-3.4-1 .27-1.5 1-1.5 1.9v22.6c0 1.2 1.15 2.05 2.3 1.73 4.2-1.15 9.15.02 13 3.17.5.4 1.4.4 1.9 0 3.85-3.15 8.8-4.32 13-3.17 1.15.32 2.3-.53 2.3-1.73V18.5c0-.9-.5-1.63-1.5-1.9-4.5-1.2-10 0-14.5 3.4-.15.11-.35.11-.5 0z"
          stroke="#F5EFDD"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <line x1="32" y1="20" x2="32" y2="46" stroke="#F5EFDD" strokeWidth="2.6" />
      </svg>
    </div>
  );
}
