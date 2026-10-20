"use client";

import { useLinkStatus } from "next/link";

/** Tiny spinner shown on a nav link while its page is loading. Must render inside <Link>. */
export function NavPending() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-brand-600 border-t-transparent transition-opacity ${pending ? "animate-spin opacity-100" : "opacity-0"}`}
    />
  );
}
