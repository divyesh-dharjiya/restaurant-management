import type { Metadata } from "next";

/** Metadata for staff-only screens: titled, but kept out of search results. */
export const privatePage = (title: string): Metadata => ({ title, robots: { index: false, follow: false } });
