"use client";

import { useState, type FormEvent } from "react";
import type { Product } from "@/lib/products";
import { useCart } from "./CartContext";
import { BasketIcon, PawPrint } from "./StudioMarks";
import { text, translateError } from "@/lib/locale";
import { useLocale } from "./LocaleContext";
import styles from "./ProductPurchase.module.css";

type PurchaseProduct = Pick<Product, "id" | "name" | "options" | "availability" | "maxQuantity" | "oneOfAKind" | "customization">;

export default function ProductPurchase({ product }: { product: PurchaseProduct }) {
  const locale = useLocale();
  const t = (en: string, it: string) => text(locale, en, it);
  const { addItem, ready, openCart, storageWarning } = useCart();
  const [additionCount, setAdditionCount] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>(() => Object.fromEntries(product.options.filter((option) => option.values.length === 1).map((option) => [option.id, option.values[0].id])));
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const maxQuantity = product.oneOfAKind ? 1 : product.maxQuantity;
  const sold = product.availability === "sold";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (sold) return;
    if (product.options.some((option) => option.required && !selections[option.id])) { setError(t("Choose a finish before adding this little one.", "Scegli una finitura prima di aggiungere questo piccolo tesoro.")); return; }
    const amount = Number(quantity);
    if (!Number.isInteger(amount) || amount < 1 || amount > maxQuantity) { setError(t(`Choose a quantity between 1 and ${maxQuantity}.`, `Scegli una quantità tra 1 e ${maxQuantity}.`)); return; }
    if (!addItem({ productId: product.id, selections, quantity: amount, notes })) {
      setError(t(`Your basket can hold up to ${maxQuantity} of this piece across all finishes. Review your basket before adding more.`, `Il carrello può contenere fino a ${maxQuantity} esemplari di questo articolo, contando tutte le finiture. Controlla il carrello prima di aggiungerne altri.`));
      return;
    }
    setMessage(t(`${amount} ${amount === 1 ? "piece" : "pieces"} added. A lovely little choice.`, `${amount} ${amount === 1 ? "piccolo tesoro aggiunto" : "piccoli tesori aggiunti"}. Una scelta deliziosa.`));
    setAdditionCount((count) => count + 1);
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      {product.options.map((option) => <fieldset key={option.id} className={styles.options} disabled={sold}>
        <legend>{option.label} {option.required && <span className={styles.required}>{t("(required)", "(obbligatorio)")}</span>}</legend>
        <div className={styles.choices}>{option.values.map((value) => <label key={value.id} className={styles.choice}>
          <input type="radio" name={option.id} value={value.id} required={option.required} checked={selections[option.id] === value.id} onChange={() => { setSelections((current) => ({ ...current, [option.id]: value.id })); setMessage(""); setError(""); }} />
          <span className={styles.optionContent}><span className={styles.swatch} style={{ backgroundColor: value.color }} aria-hidden="true" />{value.label}</span>
        </label>)}</div>
        {option.values.length > 1 && <p className={styles.optionNote}>{t(`Photographed in ${option.values[0].label.toLowerCase()}. Other finishes are confirmed with your enquiry.`, `Fotografato nella finitura ${option.values[0].label.toLowerCase()}. Confermeremo le altre finiture insieme alla tua richiesta.`)}</p>}
      </fieldset>)}

      <div className={styles.actionRow}>
        <div className={styles.quantityGroup}>
          <label htmlFor={`quantity-${product.id}`}>{t("Quantity", "Quantità")}</label>
          <div className={styles.quantity}>
            <button type="button" aria-label={t("Decrease quantity", "Riduci la quantità")} disabled={sold || Number(quantity) <= 1} onClick={() => setQuantity(String(Math.max(1, Number(quantity) - 1)))}>−</button>
            <input id={`quantity-${product.id}`} type="number" inputMode="numeric" min={1} max={maxQuantity} step={1} required value={quantity} disabled={sold || product.oneOfAKind} onChange={(event) => { setQuantity(event.target.value); setMessage(""); }} />
            <button type="button" aria-label={t("Increase quantity", "Aumenta la quantità")} disabled={sold || Number(quantity) >= maxQuantity} onClick={() => setQuantity(String(Math.min(maxQuantity, Number(quantity) + 1)))}>+</button>
          </div>
        </div>
        <button type="submit" className={styles.add} disabled={sold || !ready}>
          <BasketIcon /><span>{sold ? t("Already found a home", "Ha già trovato casa") : t("Add to Cart", "Aggiungi al carrello")}</span><span className={styles.addArrow} aria-hidden="true">↗</span>
          {additionCount > 0 && <span key={additionCount} className={styles.addReaction} aria-hidden="true"><span className={styles.warmFlash} /><PawPrint className={styles.pawStamp} /><span className={styles.pawSpark}>✧</span></span>}
        </button>
      </div>
      <p className={styles.notice}>{t("Add this piece to your collection for a personal consultation. We’ll prepare a tailored quote with availability and delivery details, just for you.", "Aggiungi questo articolo alla tua collezione per una consulenza personale. Prepareremo un preventivo su misura, con disponibilità e dettagli di consegna, tutto per te.")}</p>
      <div className={styles.feedbackRow}>
        <p className={styles.feedback} role="status" aria-atomic="true"><span key={additionCount}>{message}</span></p>
        {message && <button type="button" className={styles.viewCart} onClick={openCart}>{t("View cart", "Vedi il carrello")} <span aria-hidden="true">↗</span></button>}
      </div>
      {storageWarning && <p className={styles.error} role="status">{translateError(storageWarning, locale)}</p>}
      {error && <p className={styles.error} role="alert">{error} <button type="button" onClick={openCart}>{t("View cart", "Vedi il carrello")}</button></p>}
      {!sold && <details className={styles.notes}>
        <summary>{t("A note for the maker", "Un messaggio per chi crea")} <span>{t("optional +", "facoltativo +")}</span></summary>
        <label htmlFor={`notes-${product.id}`}>{t("A special detail, a gift, a curious question?", "Un dettaglio speciale, un regalo, una piccola curiosità?")}</label>
        <textarea id={`notes-${product.id}`} rows={3} maxLength={500} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={t("Tell us what you have in mind…", "Raccontaci cosa hai in mente…")} />
        <p>{product.customization.notes} {t("Your note is saved with this piece when you add it.", "Il messaggio viene salvato insieme all’articolo quando lo aggiungi.")}</p>
      </details>}
    </form>
  );
}
