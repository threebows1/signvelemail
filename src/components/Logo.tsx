type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  className?: string;
  variant?: "brand" | "onDark";
};

/**
 * Sign Vel brand logo: signature flourish + wordmark.
 * The flourish is a wavy signature stroke with a purple dot terminator,
 * matching the reference prototype.
 */
export function Logo({
  size = 54,
  showWordmark = true,
  wordmarkClassName = "text-xl",
  className = "",
  variant = "brand",
}: LogoProps) {
  const gradId = `signvel-grad-${variant}`;
  const stop1 = variant === "onDark" ? "#FFFFFF" : "#5B2EFF";
  const stop2 = "#00E5A0";
  const dot = variant === "onDark" ? "#C08CEE" : "#9D4EDD";
  const height = size * 0.42;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={height}
        viewBox="0 0 88 37"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="1">
            <stop offset="0" stopColor={stop1} />
            <stop offset="1" stopColor={stop2} />
          </linearGradient>
        </defs>
        <path
          d="M8 22c7-16 12-21 16-19 5 2 3 18 7 19s8-13 13-13 4 13 15 9"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="76" cy="27" r="5" fill={dot} />
      </svg>
      {showWordmark && (
        <span className={`font-bold tracking-tight ${wordmarkClassName}`}>
          Sign<span style={{ color: "#00E5A0" }}>Vel</span>
        </span>
      )}
    </div>
  );
}
