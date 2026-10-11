"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { CartLine } from "@/lib/cart";
import type { CartProduct } from "@/lib/products";
import { BasketIcon, Sparkle } from "./StudioMarks";
import CartItemList from "./CartItemList";
import EmptyCart from "./EmptyCart";
import { text, localePath, translateError } from "@/lib/locale";
import { useLocale } from "./LocaleContext";
import styles from "./CartDrawer.module.css";

export default function CartDrawer({ open, onClose, items, catalog, onRemove, onUpdateQuantity, onClear, warning }: {
  open: boolean; onClose: () => void; items: CartLine[]; catalog: CartProduct[];
  onRemove: (key: string) => void; onUpdateQuantity: (key: string, quantity: number) => boolean; onClear: () => void; warning: string;
}) {
  const locale = useLocale();
  const t = (en: string, it: string) => text(locale, en, it);
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element || !open) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!element.open) element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (element.open) element.close();
      if (previousFocus.current?.isConnected) previousFocus.current.focus();
    };
  }, [open]);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return <dialog ref={dialog} className={styles.drawer} aria-labelledby="cart-title" onCancel={onClose} onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={styles.content}>
      <header className={styles.header}>
        <div><p>{t("THE STUDIO BASKET", "IL CESTINO DELLO STUDIO")}</p><h2 id="cart-title">{t("Your little collection", "La tua piccola collezione")}<span className={styles.period}>.</span></h2></div>
        <button type="button" onClick={onClose} aria-label={t("Close cart", "Chiudi il carrello")} className={styles.close}>×</button>
      </header>
      <div className={styles.summary}>
        <p role="status" aria-atomic="true"><BasketIcon /> {t(`${count} ${count === 1 ? "piece" : "pieces"} tucked in.`, `${count} ${count === 1 ? "piccolo tesoro custodito" : "piccoli tesori custoditi"}.`)}</p>
        {items.length > 0 && <button type="button" className={styles.clear} onClick={onClear}>{t("Clear cart", "Svuota il carrello")}</button>}
      </div>

      {items.length === 0 ? <EmptyCart onBrowse={onClose} /> : <CartItemList items={items} catalog={catalog} onRemove={onRemove} onUpdateQuantity={onUpdateQuantity} onNavigate={onClose} compact />}

      <div className={styles.bottom}>
        {warning && <p role="status" className={styles.warning}>{translateError(warning, locale)}</p>}
        {items.length > 0 ? <>
          <p className={styles.reassurance}><Sparkle /> {t("Your favourites begin a personal conversation. Our team will prepare a tailored quote and guide you through the details.", "I tuoi preferiti danno inizio a una conversazione personale. Prepareremo un preventivo su misura e ti accompagneremo in ogni dettaglio.")}</p>
          <Link href={localePath("/enquiry", locale)} onClick={onClose} className={styles.review}>{t("Review & Send Enquiry", "Rivedi e invia la richiesta")} <span aria-hidden="true">↗</span></Link>
          <button type="button" onClick={onClose} className={styles.continue}>{t("Continue browsing", "Continua a esplorare")}</button>
        </> : <button type="button" onClick={onClose} className={styles.continue}>{t("Close for now", "Chiudi per ora")}</button>}
      </div>
    </div>
  </dialog>;
}
