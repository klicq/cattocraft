"use client";

import Link from "next/link";
import { localePath, text } from "@/lib/locale";
import { useLocale } from "@/components/LocaleContext";

export default function ProductNotFound() {
  const locale = useLocale();
  return <section style={{ width: "min(90%, 800px)", margin: "60px auto" }}><h1>{text(locale, "This little one has wandered off.", "Questo piccolo amico si è allontanato.")}</h1><p>{text(locale, "We couldn’t find that piece in the studio.", "Non abbiamo trovato questa creazione nel laboratorio.")}</p><Link href={localePath("/shop", locale)}>{text(locale, "Back to the collection", "Torna alla collezione")}</Link></section>;
}
