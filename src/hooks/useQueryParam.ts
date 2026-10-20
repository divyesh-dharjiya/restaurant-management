"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Read/write one URL query parameter without a router navigation.
 * Unlike `useSearchParams`, this keeps the page fully static (no Suspense
 * bail-out) and updating it is instant. Back/forward buttons are respected.
 */
export function useQueryParam(name: string) {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const read = () => setValue(new URLSearchParams(window.location.search).get(name));
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [name]);

  const update = useCallback(
    (next: string | null) => {
      const url = new URL(window.location.href);
      if (next) url.searchParams.set(name, next);
      else url.searchParams.delete(name);
      // Next.js syncs its router with native history calls.
      window.history.replaceState(window.history.state, "", url);
      setValue(next);
    },
    [name],
  );

  return [value, update] as const;
}
