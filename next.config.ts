import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  poweredByHeader: false,
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16 only honours listed qualities; anything else silently becomes 75.
    qualities: [70, 75],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  // The staff app moved under /pos when the public home page took "/". Keep old bookmarks working.
  async redirects() {
    return [
      { source: "/table/:path*", destination: "/pos/table/:path*", permanent: true },
      { source: "/bills", destination: "/pos/bills", permanent: true },
      { source: "/dashboard", destination: "/pos/dashboard", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
