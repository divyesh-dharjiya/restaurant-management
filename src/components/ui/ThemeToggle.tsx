"use client";

import { Moon, Sun } from "lucide-react";

export const THEME_KEY = "theme";

/** Runs before paint (inlined in <head>) so the saved/system theme never flashes. */
export const themeInitScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;

export function ThemeToggle() {
  const toggle = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  };
  return (
    <button onClick={toggle} className="grid size-9 shrink-0 place-items-center rounded-xl sm:size-10 border border-line bg-surface text-muted transition hover:text-fg" aria-label="Toggle colour theme">
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </button>
  );
}
