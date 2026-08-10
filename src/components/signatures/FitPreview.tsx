import { useEffect, useRef, useState } from "react";

/**
 * Scales its children down so they always fit inside the parent box.
 * Keeps every card in a grid visually balanced regardless of signature height.
 */
export function FitPreview({
  children,
  className,
  max = 1,
  padding = 16,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  padding?: number;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(max);

  useEffect(() => {
    const box = boxRef.current;
    const inner = innerRef.current;
    if (!box || !inner) return;

    const measure = () => {
      const bw = box.clientWidth - padding * 2;
      const bh = box.clientHeight - padding * 2;
      const iw = inner.scrollWidth;
      const ih = inner.scrollHeight;
      if (bw <= 0 || bh <= 0 || iw <= 0 || ih <= 0) return;
      setScale(Math.min(max, bw / iw, bh / ih));
    };

    measure();
    const t = setTimeout(measure, 250);
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(inner);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [max, padding, children]);

  return (
    <div ref={boxRef} className={`relative flex items-center justify-center overflow-hidden ${className ?? ""}`}>
      <div
        ref={innerRef}
        style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
        className="shrink-0"
      >
        {children}
      </div>
    </div>
  );
}
