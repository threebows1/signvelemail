import { useEffect, useRef, useState } from "react";

/**
 * Scales its children down so they always fit inside the parent box.
 * Keeps every card in a grid visually balanced regardless of signature height.
 *
 * `shrinkWrap` collapses the blank space CSS transforms usually leave below
 * scaled content, so the container hugs the scaled signature instead of its
 * original unscaled height. Use it in galleries where cards should only be
 * as tall as their rendered preview.
 */
export function FitPreview({
  children,
  className,
  max = 1,
  padding = 16,
  shrinkWrap = false,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  padding?: number;
  shrinkWrap?: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(max);
  const [marginBottom, setMarginBottom] = useState<number | undefined>(undefined);

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
      const nextScale = Math.min(max, bw / iw, bh / ih);
      setScale(nextScale);
      if (shrinkWrap && nextScale < 1) {
        // Collapse the trailing whitespace created by the CSS transform.
        setMarginBottom(-(ih - ih * nextScale));
      } else {
        setMarginBottom(undefined);
      }
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
  }, [max, padding, children, shrinkWrap]);

  return (
    <div ref={boxRef} className={`relative flex items-center justify-center overflow-hidden ${className ?? ""}`}>
      <div
        ref={innerRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: shrinkWrap ? "top center" : "center center",
          marginBottom,
        }}
        className="shrink-0"
      >
        {children}
      </div>
    </div>
  );
}
