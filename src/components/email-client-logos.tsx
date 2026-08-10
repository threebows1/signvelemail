/**
 * Brand logos for email clients, rendered as inline SVGs so they stay crisp
 * at any size and require no external image hosting.
 * Each component accepts a `size` prop (px) and an optional className.
 */

type LogoProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 48 48",
  xmlns: "http://www.w3.org/2000/svg",
});

export function GmailLogo({ size = 22, className }: LogoProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path fill="#fff" d="M5 12h38v24H5z" />
      <path fill="#4285f4" d="M5 36V12l6 4.5v15z" />
      <path fill="#34a853" d="M5 12l19 14L5 40z" opacity="0" />
      <path fill="#ea4335" d="M5 12l19 14-19 14V12z" opacity="0" />
      <path fill="#4285f4" d="M43 36V12l-6 4.5v15z" opacity="0" />
      <path
        fill="#4285f4"
        d="M5 12h38v24H5z"
        opacity="0"
      />
      {/* Envelope body */}
      <path fill="#fff" d="M9 14h30v20H9z" />
      <path
        fill="#ea4335"
        d="M9 14h30v20H9z M9 14l15 11 15-11"
        stroke="#ea4335"
        strokeWidth="0"
      />
      <path fill="#4285f4" d="M9 14l15 11 15-11v20l-15-11L9 34z" />
      <path fill="#ea4335" d="M9 14l15 11 15-11H9z" />
      <path fill="#fbbc04" d="M9 14v20l15-11z" opacity="0.0" />
      {/* Standard Gmail mark */}
      <path fill="#fff" d="M7 14h34l-17 12L7 14z" />
      <path fill="#4285f4" d="M7 14h6v20L7 30z" />
      <path fill="#ea4335" d="M35 14h6v16l-6 4z" />
      <path fill="#fbbc04" d="M7 30l6 4V14H7z" opacity="0" />
      <path fill="#34a853" d="M41 30l-6 4V14h6z" opacity="0" />
      <path fill="#ea4335" d="M7 14h34v20H7z" opacity="0" />
      <path fill="#fff" d="M10 15.5h28v17H10z" />
      <path fill="#ea4335" d="M10 15.5l14 10.5 14-10.5v17H10z" />
      <path fill="#fff" d="M13 16.5l11 8.5 11-8.5v13H13z" opacity="0" />
      <path fill="#fff" d="M12 17h24v13H12z" />
      <path fill="#ea4335" d="M12 17h24v13H12z" opacity="0" />
      {/* M outline */}
      <path
        fill="none"
        stroke="#ea4335"
        strokeWidth="2.5"
        strokeLinejoin="round"
        d="M12 30V18l12 9 12-9v12"
      />
      <path
        fill="#4285f4"
        d="M12 18l12 9 12-9v12H12z"
        opacity="0"
      />
    </svg>
  );
}

export function OutlookLogo({ size = 22, className }: LogoProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path fill="#0078d4" d="M24 6l16 3v30l-16 3z" />
      <path fill="#fff" d="M24 6l16 3v30l-16 3z" opacity="0.15" />
      <rect x="14" y="13" width="18" height="22" rx="2" fill="#fff" />
      <rect x="16" y="15" width="14" height="18" rx="1" fill="#0078d4" />
      <path
        fill="#fff"
        d="M23 18l-2 4h4l-2 4 4-2v6l4-2-2-4h4l-2-4z"
        opacity="0"
      />
      <path
        fill="#fff"
        d="M23 21h2v6h-2zM26.5 21h2v6h-2zM21.5 21h2v6h-2z"
        opacity="0"
      />
      {/* envelope */}
      <path fill="#fff" d="M17 16h12v16H17z" opacity="0" />
      <path
        fill="#fff"
        stroke="#fff"
        strokeWidth="0"
        d="M16 16h14v14H16z"
      />
      <path
        fill="#0078d4"
        d="M18 18h10v10H18z"
      />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinejoin="round"
        d="M18 18l5 4 5-4"
      />
      <circle cx="34" cy="30" r="6" fill="#fff" />
      <text x="34" y="33" textAnchor="middle" fontSize="7" fill="#0078d4" fontWeight="bold">O</text>
    </svg>
  );
}

export function YahooLogo({ size = 22, className }: LogoProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path
        fill="#6001d2"
        d="M24 8c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 4c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5z"
        opacity="0"
      />
      <path
        fill="#6001d2"
        d="M14 10l6 14-2 6h4l2-6 6-14h-4l-3 8-3-8z"
      />
      <path fill="#6001d2" d="M14 10h4l6 14h-4z" opacity="0" />
      <path
        fill="#6001d2"
        d="M12 10h5l4 10 4-10h5l-7 16h-4z"
      />
      <path fill="none" />
      {/* Yahoo mail envelope */}
      <rect x="8" y="14" width="32" height="20" rx="2" fill="#6001d2" />
      <path fill="#fff" d="M10 16h28v16H10z" />
      <path
        fill="#6001d2"
        d="M10 16l14 10 14-10v16H10z"
        opacity="0"
      />
      <path
        fill="#6001d4"
        d="M10 16l14 10 14-10"
        stroke="#6001d4"
        strokeWidth="2"
        fill="none"
      />
      <text x="24" y="29" textAnchor="middle" fontSize="11" fill="#6001d2" fontWeight="bold" fontStyle="italic">Y!</text>
    </svg>
  );
}

export function AppleLogo({ size = 22, className }: LogoProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
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

export function ThunderbirdLogo({ size = 22, className }: LogoProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="#0a84ff" />
      <path
        fill="#fff"
        d="M24 8c-2 4-2 8 0 12 3-1 5-1 8 0 2 3 2 7 0 10-3 2-7 2-10 0-2-3-2-7 0-10-2-4-2-8 2-12z"
      />
      <path
        fill="#0a84ff"
        d="M24 14c-1 3-1 6 0 9 2-1 4-1 6 0 1 2 1 5 0 7-2 1-5 1-7 0-1-2-1-5 0-7-1-3-1-6 1-9z"
      />
      <circle cx="24" cy="24" r="20" fill="none" stroke="#0a84ff" strokeWidth="0" />
      {/* Envelope overlay */}
      <path fill="#fff" d="M12 20h24v14H12z" />
      <path fill="none" stroke="#0a84ff" strokeWidth="2" strokeLinejoin="round" d="M12 20l12 8 12-8" />
      <path fill="#0a84ff" d="M12 20l12 8 12-8v14H12z" opacity="0.1" />
    </svg>
  );
}

export function IosMailLogo({ size = 22, className }: LogoProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <rect x="6" y="10" width="36" height="28" rx="4" fill="#1d9bf0" />
      <rect x="6" y="10" width="36" height="28" rx="4" fill="url(#iosg)" />
      <defs>
        <linearGradient id="iosg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5ac8fa" />
          <stop offset="1" stopColor="#1d9bf0" />
        </linearGradient>
      </defs>
      <rect x="9" y="13" width="30" height="22" rx="2" fill="#fff" />
      <path
        fill="none"
        stroke="#1d9bf0"
        strokeWidth="2"
        strokeLinejoin="round"
        d="M10 15l14 10 14-10"
      />
      <path fill="#1d9bf0" d="M10 15l14 10 14-10v18H10z" opacity="0.08" />
    </svg>
  );
}
