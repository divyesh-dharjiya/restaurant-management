"use client";

import { useEffect, useState } from "react";

/** True once the page has been scrolled past `y` pixels. */
export function useScrollPast(y: number) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > y);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [y]);
  return past;
}
