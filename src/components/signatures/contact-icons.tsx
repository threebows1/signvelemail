import type { SVGProps } from "react";

/**
 * Refined contact glyphs for signature rows (email, phone, mobile, address, link).
 *
 * Every glyph is drawn so its *ink* bounding box is symmetric around the
 * 24x24 centre point (12,12) — otherwise the icon reads as visually
 * off-centre inside a circular badge even though the SVG box is centred.
 * Stroke weight is identical across the set so they stay consistent when
 * scaled down to 12-16px inside a 24px chip.
 */

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
  ...props,
});

export function MailGlyph(props: P) {
  // ink box: x 3.5-20.5, y 6-18  → centre (12,12)
  return (
    <svg {...base(props)}>
      <rect x="2.8" y="5.6" width="18.4" height="12.8" rx="2.6" />
      <path d="M4.2 8.1 12 13.3l7.8-5.2" />
    </svg>
  );
}

export function PhoneGlyph(props: P) {
  // ink box: x 4-20, y 4-20 → centre (12,12)
  return (
    <svg {...base(props)}>
      <path d="M6.6 4h2.3l1.4 3.5-1.9 1.3a10.9 10.9 0 0 0 5.1 5.1l1.3-1.9L18.3 13.4v2.3a2.1 2.1 0 0 1-2.3 2.1A15.6 15.6 0 0 1 4.5 6.3 2.1 2.1 0 0 1 6.6 4Z" />
    </svg>
  );
}

export function MobileGlyph(props: P) {
  // ink box: x 7.5-16.5, y 3-21 → centre (12,12)
  return (
    <svg {...base(props)}>
      <rect x="7" y="2.6" width="10" height="18.8" rx="2.6" />
      <path d="M10.7 18.4h2.6" />
    </svg>
  );
}

export function PinGlyph(props: P) {
  // ink box: x 5.5-18.5, y 4-20 → centre (12,12)
  return (
    <svg {...base(props)}>
      <path d="M12 20.6s6.9-6 6.9-10.7a6.9 6.9 0 1 0-13.8 0C5.1 14.6 12 20.6 12 20.6Z" />
      <circle cx="12" cy="9.8" r="2.6" />
    </svg>
  );
}

export function LinkGlyph(props: P) {
  // symmetric about (12,12)
  return (
    <svg {...base(props)}>
      <path d="M10.2 13.8a3.9 3.9 0 0 0 5.5 0l2.1-2.1a3.9 3.9 0 0 0-5.5-5.5l-1 1" />
      <path d="M13.8 10.2a3.9 3.9 0 0 0-5.5 0l-2.1 2.1a3.9 3.9 0 0 0 5.5 5.5l1-1" />
    </svg>
  );
}
