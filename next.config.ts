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
  async rewrites() {
    return [
      { source: "/", destination: "/en" },
      { source: "/shop", destination: "/en/shop" },
      { source: "/how-to-order", destination: "/en/how-to-order" },
      { source: "/contact", destination: "/en/contact" },
      { source: "/enquiry", destination: "/en/enquiry" },
      { source: "/products/:slug", destination: "/en/products/:slug" },
    ];
  },
};

export default nextConfig;
