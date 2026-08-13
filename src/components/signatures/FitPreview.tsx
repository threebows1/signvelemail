import { useEffect, useRef, useState } from "react";

function readCssMaxHeight(px: number | undefined, el: HTMLElement | null) {
  if (px !== undefined) return px;
  if (typeof window === "undefined" || !el) return undefined;
  const raw = window.getComputedStyle(el).maxHeight;
  if (!raw || raw === "none") return undefined;
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

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
  maxHeight,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  padding?: number;
  shrinkWrap?: boolean;
  maxHeight?: number;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(max);
  const [boxHeight, setBoxHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const box = boxRef.current;
    const inner = innerRef.current;
    if (!box || !inner) return;

    const measure = () => {
      const iw = inner.scrollWidth;
      const ih = inner.scrollHeight;
      if (iw <= 0 || ih <= 0) return;

      if (shrinkWrap) {
        const bw = box.clientWidth - padding * 2;
        const cssMax = readCssMaxHeight(maxHeight, box);
        const widthScale = bw / iw;
        let nextScale = Math.min(max, widthScale);
        let scaledHeight = ih * nextScale;
        if (cssMax && scaledHeight > cssMax) {
          nextScale = cssMax / ih;
          scaledHeight = cssMax;
        }
        setScale(nextScale);
        setBoxHeight(scaledHeight);
      } else {
        const bw = box.clientWidth - padding * 2;
        const bh = box.clientHeight - padding * 2;
        if (bw <= 0 || bh <= 0) return;
        setScale(Math.min(max, bw / iw, bh / ih));
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
  }, [max, padding, children, shrinkWrap, maxHeight]);

  return (
    <div
      ref={boxRef}
      className={`relative flex ${shrinkWrap ? "items-start" : "items-center"} justify-center overflow-hidden ${className ?? ""}`}
      style={shrinkWrap ? { height: boxHeight } : undefined}
    >
      <div
        ref={innerRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: shrinkWrap ? "top center" : "center center",
        }}
        className="shrink-0"
      >
        {children}
      </div>
    </div>
  );
}
