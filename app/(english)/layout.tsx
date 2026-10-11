import type { ReactNode } from "react";
import StudioLayout, { generateMetadata as studioMetadata } from "../[locale]/layout";

const params = Promise.resolve({ locale: "en" });

export function generateMetadata() {
  return studioMetadata({ params });
}

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return StudioLayout({ children, params });
}
