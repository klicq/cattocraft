import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartProvider from "@/components/CartContext";
import { getCartProducts } from "@/lib/products";
import LocaleProvider from "@/components/LocaleContext";
import { isLocale, text } from "@/lib/locale";
import "@/styles/variables.css";
import "../globals.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const language = isLocale(locale) ? locale : "en";
  const indexing = process.env.SITE_INDEXING_ENABLED === "true" && process.env.VERCEL_ENV !== "preview";
  return {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")),
  title: "CattoCraft",
  description: text(language, "Handmade art from a little studio with a resident cat.", "Piccole creazioni artigianali da un atelier con un gatto di casa."),
  robots: { index: indexing, follow: indexing },
  };
}

// English has concrete public routes; this segment only serves Italian.
export const dynamicParams = false;
export function generateStaticParams() { return [{ locale: "it" }]; }

export default async function RootLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale}>
      <body id="top">
        <a className="skip-link" href="#main-content">{text(locale, "Skip to content", "Vai al contenuto")}</a>
        <LocaleProvider locale={locale}>
        <CartProvider catalog={getCartProducts(locale)}>
        <Navbar />
        <main id="main-content" className="site-content" tabIndex={-1}>{children}</main>
        <Footer locale={locale} />
        </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
