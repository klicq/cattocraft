"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCartPrice, lineKey, productLimit, type CartLine } from "@/lib/cart";
import type { CartProduct } from "@/lib/products";
import { text, localePath } from "@/lib/locale";
import { useLocale } from "./LocaleContext";
import styles from "./CartItemList.module.css";

export default function CartItemList({ items, catalog, onRemove, onUpdateQuantity, onNavigate, compact = false }: {
  items: CartLine[]; catalog: CartProduct[]; onRemove: (key: string) => void;
  onUpdateQuantity: (key: string, quantity: number) => boolean; onNavigate?: () => void; compact?: boolean;
}) {
  const locale = useLocale();
  const t = (en: string, it: string) => text(locale, en, it);
  return <ul className={styles.items} data-compact={compact}>{items.map((item) => {
    const product = catalog.find(({ id }) => id === item.productId);
    if (!product) return null;
    const key = lineKey(item);
    const otherQuantity = items.filter((line) => line.productId === item.productId && lineKey(line) !== key).reduce((sum, line) => sum + line.quantity, 0);
    const limit = productLimit(product) - otherQuantity;
    const optionsLabel = item.selectedOptions.map((option) => product.options.find(({ id }) => id === option.id)?.values.find(({ id }) => id === option.valueId)?.label ?? option.valueLabel).join(" · ");
    const title = product.name;
    const price = formatCartPrice(item.price, locale);
    return <li key={key} className={styles.item}>
      <Link href={localePath(`/products/${item.slug}`, locale)} onClick={onNavigate} className={styles.imageLink} tabIndex={-1} aria-hidden="true"><Image src={item.image.src} alt="" width={104} height={110} sizes="104px" className={styles.image} /></Link>
      <div className={styles.itemBody}>
        <Link href={localePath(`/products/${item.slug}`, locale)} onClick={onNavigate} className={styles.name}>{title}</Link>
        <p className={styles.options}>{optionsLabel}</p>
        <p className={styles.price}>{price}{item.price.status !== "on-enquiry" && t(" each", " ciascuno")}</p>
        {item.notes && <p className={styles.notes}><span>{t("For the maker:", "Per chi crea:")}</span> {item.notes}</p>}
        <div className={styles.actions}>
          <div className={styles.quantity} role="group" aria-label={t(`Quantity for ${title}, ${optionsLabel}`, `Quantità di ${title}, ${optionsLabel}`)}>
            <button type="button" onClick={() => onUpdateQuantity(key, item.quantity - 1)} disabled={item.quantity <= 1} aria-label={t(`Decrease quantity of ${title}`, `Riduci la quantità di ${title}`)}>−</button>
            <output aria-label={t("Quantity", "Quantità")}>{item.quantity}</output>
            <button type="button" onClick={() => onUpdateQuantity(key, item.quantity + 1)} disabled={item.quantity >= limit} aria-label={t(`Increase quantity of ${title}`, `Aumenta la quantità di ${title}`)}>+</button>
          </div>
          <button type="button" className={styles.remove} onClick={() => onRemove(key)} aria-label={t(`Remove ${title}, ${optionsLabel}`, `Rimuovi ${title}, ${optionsLabel}`)}>{t("Remove", "Rimuovi")}</button>
        </div>
      </div>
    </li>;
  })}</ul>;
}
