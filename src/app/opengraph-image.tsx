import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { items } from "@/lib/catalog";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social share card, generated at build time. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg, #064e3b 0%, #047857 55%, #10b981 100%)", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 84, height: 84, borderRadius: 22, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50 }}>🥗</div>
          <div style={{ display: "flex", fontSize: 52, fontWeight: 800 }}>
            Eating<span style={{ color: "#fbbf24" }}>HUB</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>{site.tagline}</div>
          <div style={{ display: "flex", fontSize: 34, opacity: 0.85 }}>{`${items.length}+ dishes · North Indian · Gujarati · South Indian · Jain options`}</div>
        </div>
        <div style={{ display: "flex", alignSelf: "flex-start", background: "#fbbf24", color: "#422006", borderRadius: 999, padding: "10px 26px", fontSize: 28, fontWeight: 700 }}>100% Pure Veg</div>
      </div>
    ),
    size,
  );
}
