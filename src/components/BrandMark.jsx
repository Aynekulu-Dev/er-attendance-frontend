import React from "react";

// Ethiopia Reads' signature mark: the tree-and-reader logo. Used wherever
// the brand needs to be recognizable at a glance (kiosk header, admin
// header, login). The source art (public/ethiopia-reads-mark.png) is the
// official logo, square-padded with a transparent background so it drops
// into any size cleanly.
export default function BrandMark({ size = 40, className = "" }) {
  return (
    <div
      className={`flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/ethiopia-reads-mark.png"
        alt="Ethiopia Reads"
        width={size}
        height={size}
        className="w-full h-full object-contain"
      />
    </div>
  );
}