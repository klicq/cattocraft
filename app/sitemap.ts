import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { localePath } from "@/lib/locale";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
  const paths = ["/", "/shop", "/how-to-order", "/contact", ...getProducts().map(product => `/products/${product.slug}`)];
  return paths.flatMap(path => (["en", "it"] as const).map(locale => ({
    url: new URL(localePath(path, locale), base).href,
    alternates: { languages: { en: new URL(localePath(path, "en"), base).href, it: new URL(localePath(path, "it"), base).href } },
  })));
}
