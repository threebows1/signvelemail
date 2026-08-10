/**
 * Brand logos for email clients, rendered as inline SVGs so they stay crisp
 * at any size and require no external image hosting.
 * Each component accepts a `size` prop (px) and an optional className.
 */

type LogoProps = { size?: number; className?: string };

const box = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 48 48",
  xmlns: "http://www.w3.org/2000/svg",
});

/** Gmail — white envelope with red M-stroke + blue/yellow flaps. */
export function GmailLogo({ size = 22, className }: LogoProps) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <path fill="#e8eaed" d="M6 13h36v22H6z" />
      <path fill="#4285f4" d="M6 13h36L24 26 6 13z" opacity="0.0" />
      <path fill="#4285f4" d="M6 35V13l6 4.5V35z" />
      <path fill="#34a853" d="M6 35V13l18 13z" opacity="0" />
      <path fill="#ea4335" d="M6 13l18 13L6 35z" opacity="0" />
      <path fill="#fbbc04" d="M24 26l-6-4.5L6 13l12 9z" opacity="0" />
      <path fill="#ea4335" d="M6 13h6v22H6z" opacity="0" />
      <path fill="#4285f4" d="M42 35V13l-6 4.5V35z" />
      <path fill="#ea4335" d="M42 13l-18 13L42 35z" opacity="0" />
      <path fill="#fbbc04" d="M42 13l-18 13 6-4.5z" opacity="0" />
      <path fill="#c5221f" d="M6 13h6v22H6z" opacity="0" />
      <path fill="#ea4335" d="M6 13h36v22H6z" opacity="0" />
      {/* Envelope body */}
      <path fill="#fff" d="M10 15h28v18H10z" />
      <path fill="#f2f2f2" d="M10 15l14 10 14-10z" />
      <path
        fill="none"
        stroke="#ea4335"
        strokeWidth="2.5"
        strokeLinejoin="round"
        d="M11 31V18l13 9.5L37 18v13"
      />
      <path fill="#ea4335" d="M11 18l13 9.5L37 18v13H11z" opacity="0.05" />
    </svg>
  );
}

/** Outlook — blue square with white envelope + O. */
export function OutlookLogo({ size = 22, className }: LogoProps) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <path fill="#0078d4" d="M24 5l18 3.5v31L24 43z" />
      <path fill="#fff" d="M24 5l18 3.5v31L24 43z" opacity="0.12" />
      <rect x="13" y="12" width="22" height="24" rx="2" fill="#fff" />
      <rect x="16" y="15" width="16" height="18" rx="1" fill="#0078d4" />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinejoin="round"
        d="M17 16l7 6 7-6"
      />
      <path fill="#fff" d="M17 16h14v14H17z" opacity="0" />
      <path fill="#0078d4" d="M17 16l7 6 7-6v14H17z" opacity="0.08" />
    </svg>
  );
}

/** Yahoo Mail — purple envelope with Y! */
export function YahooLogo({ size = 22, className }: LogoProps) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <rect x="6" y="13" width="36" height="22" rx="2" fill="#6001d2" />
      <rect x="9" y="16" width="30" height="16" rx="1" fill="#fff" />
      <path
        fill="none"
        stroke="#6001d2"
        strokeWidth="2"
        strokeLinejoin="round"
        d="M9 16l15 11 15-11"
      />
      <text x="24" y="28" textAnchor="middle" fontSize="10" fill="#6001d2" fontWeight="700" fontStyle="italic" fontFamily="Georgia, serif">Y!</text>
    </svg>
  );
}

/** Apple logo. */
export function AppleLogo({ size = 22, className }: LogoProps) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <path
        fill="#000"
        d="M33 25c-.05-4.6 3.76-6.8 3.93-6.9-2.14-3.13-5.47-3.56-6.64-3.6-2.82-.29-5.5 1.66-6.93 1.66-1.43 0-3.63-1.62-5.97-1.58-3.06.04-5.9 1.79-7.48 4.53-3.2 5.55-.82 13.74 1.28 18.23 1.04 2.2 2.28 4.67 3.9 4.57 1.57-.06 2.16-1.01 4.05-1.01 1.89 0 2.43 1.01 4.08.98 1.69-.03 2.75-2.23 3.78-4.45 1.19-2.55 1.68-5.04 1.71-5.17-.04-.02-3.28-1.26-3.31-5z"
      />
      <path
        fill="#000"
        d="M29.2 12.3c.86-1.04 1.44-2.48 1.28-3.92-1.24.05-2.74.83-3.63 1.87-.8.92-1.49 2.4-1.3 3.81 1.38.11 2.79-.7 3.65-1.76z"
      />
    </svg>
  );
}

/** Thunderbird — blue circle with envelope. */
export function ThunderbirdLogo({ size = 22, className }: LogoProps) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="19" fill="#0a84ff" />
      <rect x="11" y="18" width="26" height="16" rx="2" fill="#fff" />
      <path
        fill="none"
        stroke="#0a84ff"
        strokeWidth="2"
        strokeLinejoin="round"
        d="M12 19l12 9 12-9"
      />
      <path fill="#0a84ff" d="M12 19l12 9 12-9v15H12z" opacity="0.08" />
    </svg>
  );
}

/** iOS Mail — gradient blue envelope. */
export function IosMailLogo({ size = 22, className }: LogoProps) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ios-mail-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5ac8fa" />
          <stop offset="1" stopColor="#1d9bf0" />
        </linearGradient>
      </defs>
      <rect x="6" y="10" width="36" height="28" rx="5" fill="url(#ios-mail-grad)" />
      <rect x="9" y="13" width="30" height="22" rx="2" fill="#fff" />
      <path
        fill="none"
        stroke="#1d9bf0"
        strokeWidth="2"
        strokeLinejoin="round"
        d="M10 15l14 10 14-10"
      />
      <path fill="#1d9bf0" d="M10 15l14 10 14-10v18H10z" opacity="0.06" />
    </svg>
  );
}
