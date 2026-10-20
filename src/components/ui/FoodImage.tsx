"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";

const DEFAULT_SIZES = "(min-width:1536px) 18vw, (min-width:1024px) 24vw, (min-width:640px) 33vw, 50vw";

/** Dish photo with a shimmer behind it while loading and a graceful fallback if missing. Visible as soon as the browser paints it — never gated on JS. */
export function FoodImage({ src, alt, className, sizes = DEFAULT_SIZES, priority }: { src: string; alt: string; className?: string; sizes?: string; priority?: boolean }) {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  // Cached images can finish loading before hydration attaches onLoad, so check on mount too.
  const checkLoaded = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setState("ready");
  }, []);
  return (
    <div className={cn("relative overflow-hidden bg-surface-2", state === "loading" && "skeleton rounded-none", className)}>
      {state === "failed" ? (
        <div className="absolute inset-0 grid place-items-center text-3xl" aria-hidden>🍽️</div>
      ) : (
        <Image
          ref={checkLoaded}
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={70}
          onLoad={() => setState("ready")}
          onError={() => setState("failed")}
          className="object-cover"
        />
      )}
    </div>
  );
}
