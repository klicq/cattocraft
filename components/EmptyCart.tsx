"use client";

import Link from "next/link";
import { localePath, text } from "@/lib/locale";
import { useLocale } from "./LocaleContext";
import { SleepingCat } from "./StudioMarks";
import styles from "./EmptyCart.module.css";

export default function EmptyCart({ onBrowse }: { onBrowse?: () => void }) {
  const locale = useLocale();
  return <div className={styles.empty}>
    <div className={styles.cat}><SleepingCat /></div>
    <p className={styles.eyebrow}>{text(locale, "NOTHING HERE BUT A LITTLE CATNAP", "QUI C’È SOLTANTO UN PISOLINO")}</p>
    <h2>{text(locale, "Your collection", "La tua selezione")}<br /><em>{text(locale, "is dreaming of company.", "sogna un po’ di compagnia.")}</em></h2>
    <p>{text(locale, "Your basket is enjoying a little catnap. Find a piece you love to get started.", "La tua selezione si sta concedendo un pisolino. Trova una creazione che ami per iniziare.")}</p>
    <Link href={localePath("/shop", locale)} onClick={onBrowse} className={styles.browse}>{text(locale, "Find a little treasure", "Trova un piccolo tesoro")} <span aria-hidden="true">↗</span></Link>
  </div>;
}
