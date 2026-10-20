"use client";

import { useLayoutEffect, useRef, useState } from "react";

/** Tracks an element's width so SVG charts can draw at true pixel size (crisp text, no stretching). */
export function useElementWidth<T extends HTMLElement>(initial = 600) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(initial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Measure before first paint so the chart never flashes at the fallback width…
    setWidth(Math.round(el.getBoundingClientRect().width));
    // …then follow container resizes (rotation, sidebar, window resize).
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}
