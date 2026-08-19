import type { SVGProps } from "react";

/**
 * Refined contact glyphs for signature rows (email, phone, mobile, address, link).
 * Drawn on a 24x24 grid with a single consistent stroke weight so they read
 * cleanly inside small circular badges — much crisper than generic icon sets
 * when scaled down to 12-16px inside a 24px chip.
 */

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
  ...props,
});

export function MailGlyph(props: P) {
  return (
    <svg {...base(props)}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M3.5 7.5 12 13.2l8.5-5.7" />
    </svg>
  );
}

export function PhoneGlyph(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M6.2 3.5h2.6l1.5 3.9-2 1.4a11.4 11.4 0 0 0 5.4 5.4l1.4-2 3.9 1.5v2.6a2.2 2.2 0 0 1-2.4 2.2A16.8 16.8 0 0 1 4 6.1 2.2 2.2 0 0 1 6.2 3.5Z" />
    </svg>
  );
}

export function MobileGlyph(props: P) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.6" />
      <path d="M10.8 18.6h2.4" />
    </svg>
  );
}

export function PinGlyph(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M12 21.5s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="10.2" r="2.6" />
    </svg>
  );
}

export function LinkGlyph(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M10 13.8a4.2 4.2 0 0 0 6 0l2.6-2.6a4.2 4.2 0 0 0-6-6L11.4 6.4" />
      <path d="M14 10.2a4.2 4.2 0 0 0-6 0L5.4 12.8a4.2 4.2 0 0 0 6 6l1.2-1.2" />
    </svg>
  );
}
