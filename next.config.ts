import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { qualities: [75, 85] },
  async headers() {
    return [{
      source: "/art/products/:asset*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }];
  },
  async redirects() {
    return [{ source: "/en/:path*", destination: "/:path*", permanent: true }];
  },
};

export default nextConfig;
