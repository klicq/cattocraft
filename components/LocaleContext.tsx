"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/lib/locale";

const LocaleContext = createContext<Locale>("en");
export function useLocale() { return useContext(LocaleContext); }
export default function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
