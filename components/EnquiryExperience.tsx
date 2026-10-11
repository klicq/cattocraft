"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useCart } from "./CartContext";
import CartItemList from "./CartItemList";
import EmptyCart from "./EmptyCart";
import { CatSeal, EnvelopeCat, PawPrint, Sparkle } from "./StudioMarks";
import {
  buildEnquiryPayload, emptyEnquiryFields, localDate, summarizeEnquiry, validateEnquiry,
  type EnquiryErrors, type EnquiryFields, type EnquiryPayload,
} from "@/lib/enquiry";
import { text, localePath, translateError } from "@/lib/locale";
import { useLocale } from "./LocaleContext";
import styles from "./EnquiryExperience.module.css";

const italianFields: Record<Exclude<keyof EnquiryFields, "notes">, { label: string; placeholder?: string; helper?: string }> = {
  name: { label: "Il tuo nome", placeholder: "Il nome sulle tue lettere" },
  email: { label: "Indirizzo email", placeholder: "tu@esempio.it" },
  phone: { label: "Numero di telefono", placeholder: "Il tuo numero, con prefisso internazionale", helper: "Lasciaci il numero se desideri parlare della tua richiesta con il nostro team." },
  country: { label: "Paese di consegna", placeholder: "Dove invieremmo i tuoi piccoli tesori?" },
  cityRegion: { label: "Città / regione", placeholder: "Qualche dettaglio in più sulla destinazione" },
  postalCode: { label: "Codice postale", placeholder: "Se lo conosci" },
  desiredArrivalDate: { label: "Data di arrivo desiderata", helper: "Indicaci la data che preferisci; confermeremo insieme i tempi." },
};

const fields: { id: Exclude<keyof EnquiryFields, "notes">; label: string; placeholder?: string; required?: boolean; type?: string; autoComplete?: string; wide?: boolean; helper?: string }[] = [
  { id: "name", label: "Your name", placeholder: "The name on your letters", required: true, autoComplete: "name", wide: true },
  { id: "email", label: "Email address", placeholder: "you@example.com", required: true, type: "email", autoComplete: "email", wide: true },
  { id: "phone", label: "Phone number", placeholder: "Your number, including country code", type: "tel", autoComplete: "tel", wide: true, helper: "Share your number if you’d like our team to call about your enquiry." },
  { id: "country", label: "Shipping country", placeholder: "Where would we send your pieces?", required: true, autoComplete: "country-name", wide: true },
  { id: "cityRegion", label: "City / region", placeholder: "A little more about where you are", required: true, autoComplete: "address-level2" },
  { id: "postalCode", label: "Postal code", placeholder: "If you know it", autoComplete: "postal-code" },
  { id: "desiredArrivalDate", label: "Hoping for it by", type: "date", helper: "Share your preferred date; we’ll confirm timing together." },
];

function makeReference() {
  const suffix = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8).toUpperCase()
    : Math.random().toString(36).slice(2, 10).toUpperCase();
  return `CATTO-${suffix}`;
}

export default function EnquiryExperience() {
  const locale = useLocale();
  const t = (en: string, it: string) => text(locale, en, it);
  const localizedFields = fields.map((field) => ({ ...field, label: t(field.label, italianFields[field.id].label), placeholder: field.placeholder ? t(field.placeholder, italianFields[field.id].placeholder ?? field.placeholder) : undefined, helper: field.helper ? t(field.helper, italianFields[field.id].helper ?? field.helper) : undefined }));
  const { items, catalog, ready, storageWarning, updateQuantity, removeItem } = useCart();
  const [details, setDetails] = useState<EnquiryFields>(emptyEnquiryFields);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [preview, setPreview] = useState<EnquiryPayload | null>(null);
  const submitted = useRef(false);
  const moveFocus = useRef(false);
  const formHeading = useRef<HTMLHeadingElement>(null);
  const previewHeading = useRef<HTMLHeadingElement>(null);
  const summary = summarizeEnquiry(items);

  useEffect(() => {
    if (!moveFocus.current) return;
    const heading = preview ? previewHeading.current : formHeading.current;
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    moveFocus.current = false;
  }, [preview]);

  function updateField(id: keyof EnquiryFields, value: string) {
    setDetails((current) => ({ ...current, [id]: value }));
    if (errors[id]) setErrors((current) => ({ ...current, [id]: undefined }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || !items.length || submitted.current) return;
    const nextErrors = validateEnquiry(details);
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0] as keyof EnquiryFields | undefined;
    if (firstError) {
      document.getElementById(firstError)?.focus();
      return;
    }
    const payload = { ...buildEnquiryPayload(details, items, makeReference(), new Date().toISOString()), locale };
    submitted.current = true;
    // Mock submission: keep the complete itemized payload ready for later delivery integration.
    if (process.env.NODE_ENV === "development") console.log("CattoCraft mock enquiry", payload);
    moveFocus.current = true;
    setPreview(payload);
  }

  function editNote() {
    submitted.current = false;
    moveFocus.current = true;
    setPreview(null);
  }

  return <div className={styles.page}>
    <header className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}><PawPrint /> {t("YOUR LITTLE COLLECTION", "LA TUA PICCOLA COLLEZIONE")} <span> / {t("A NOTE TO THE STUDIO", "UN MESSAGGIO ALLO STUDIO")}</span></p>
        <h1>{preview ? <>{t("A little note.", "Un piccolo messaggio.")}<br /><em>{t("A lovely beginning.", "Un bell’inizio.")}</em></> : <>{t("A little hello.", "Un piccolo saluto.")}<br /><em>{t("A lot of possibility.", "Tante possibilità.")}</em></>}</h1>
        <p>{preview
          ? t("Your favourites, your wishes, and the start of a personal conversation with CattoCraft.", "I tuoi preferiti, i tuoi desideri e l’inizio di una conversazione personale con CattoCraft.")
          : t("Tuck your favourites into a note, tell us where they may wander, and we’ll take it from there.", "Raccogli i tuoi preferiti in un messaggio, raccontaci dove potrebbero arrivare e al resto penseremo insieme.")}</p>
      </div>
      <div className={styles.heroStamp}><CatSeal /><span>{t("MADE WITH CARE", "FATTO CON CURA")}<br />{t("& A LITTLE PURR", "E QUALCHE FUSA")}</span></div>
    </header>

    {preview ? <section className={styles.preview} aria-live="polite" aria-labelledby="enquiry-preview-heading">
      <div className={styles.previewArt}><EnvelopeCat /></div>
      <div className={styles.previewCopy}>
        <p className={styles.eyebrow}>{t("A NOTE FROM THE STUDIO CAT", "UN MESSAGGIO DAL GATTO DELLO STUDIO")}</p>
        <h2 id="enquiry-preview-heading" ref={previewHeading} tabIndex={-1}>{t("All tucked into", "Tutto custodito in")} <em>{t("an envelope.", "una busta.")}</em></h2>
        <p><strong>{t("Thank you. Your enquiry is in our paws.", "Grazie. La tua richiesta è nelle nostre zampette.")}</strong> {t("We’ll be in touch by email to talk through your chosen pieces, availability, and a quote made just for you. Until then, keep a little room for something lovely.", "Ti scriveremo via email per parlare dei pezzi scelti, della disponibilità e di un preventivo su misura. Nel frattempo, lascia un piccolo spazio a qualcosa di bello.")}</p>
        <dl><div><dt>{t("Your enquiry reference", "Il riferimento della tua richiesta")}</dt><dd>{preview.reference}</dd></div><div><dt>{t("We’ll write to", "Ti scriveremo a")}</dt><dd>{preview.customer.email}</dd></div>{preview.customer.phone && <div><dt>{t("Your phone", "Il tuo telefono")}</dt><dd>{preview.customer.phone}</dd></div>}<div><dt>{t("Selected pieces", "Articoli scelti")}</dt><dd>{preview.summary.quantity}</dd></div></dl>
        <div className={styles.previewActions}>
          <button type="button" onClick={editNote} className={styles.primaryAction}>{t("Edit your note", "Modifica il messaggio")} <span aria-hidden="true">↗</span></button>
          <Link href={localePath("/shop", locale)} className={styles.textLink}>{t("Keep browsing", "Continua a esplorare")}</Link>
        </div>
      </div>
    </section> : <>
      <div className={styles.progress} aria-label={t("Enquiry steps", "Le tappe della richiesta")}><span>01 <b>{t("Find your pieces", "Scegli i tuoi tesori")}</b></span><span className={styles.progressLine} /><span>02 <b>{t("Write your note", "Scrivi il messaggio")}</b></span><span className={styles.progressLine} /><span>03 <b>{t("Hear from us", "Ricevi la nostra risposta")}</b></span></div>
      <div className={styles.columns}>
        <section className={styles.review} aria-labelledby="review-heading">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>01 / {t("THE PIECES", "I PICCOLI TESORI")}</p><h2 id="review-heading">{t("Your little", "La tua piccola")} <em>{t("collection.", "collezione.")}</em></h2></div><Sparkle /></div>
          {!ready ? <p className={styles.loading} role="status">{t("Waking up your basket…", "Il tuo cestino si sta svegliando…")}</p> : items.length === 0 ? <EmptyCart /> : <>
            <p className={styles.reviewIntro}>{t("A final peek at the pieces that caught your eye. Adjust anything before you write to us.", "Un ultimo sguardo agli articoli che ti hanno conquistato. Puoi modificare tutto prima di scriverci.")}</p>
            <CartItemList items={items} catalog={catalog} onRemove={removeItem} onUpdateQuantity={updateQuantity} />
            <div className={styles.estimate}>
              <div><span>{summary.totals.length > 0 ? t("Estimated item subtotal", "Subtotale stimato degli articoli") : t(`${summary.quantity} ${summary.quantity === 1 ? "piece" : "pieces"} in your note`, `${summary.quantity} ${summary.quantity === 1 ? "articolo" : "articoli"} nel tuo messaggio`)}</span><span>{summary.totals.length === 0 ? t("Prices confirmed personally", "Prezzi concordati personalmente") : summary.totals.map((total) => `${total.startingFrom ? t("From ", "Da ") : ""}${new Intl.NumberFormat(locale, { style: "currency", currency: total.currency }).format(total.amount)}`).join(" + ")}</span></div>
              {summary.unquotedQuantity > 0 && <p>{t(`${summary.unquotedQuantity} ${summary.unquotedQuantity === 1 ? "piece will" : "pieces will"} receive a personal quote. We’ll share the complete pricing with you.`, `Per ${summary.unquotedQuantity} ${summary.unquotedQuantity === 1 ? "articolo" : "articoli"} prepareremo un preventivo su misura. Ti comunicheremo tutti i prezzi.`)}</p>}
              <p>{t("Your quote will bring together your chosen pieces, delivery, and any agreed custom details, with personal guidance from our team.", "Il preventivo comprenderà gli articoli scelti, la consegna e le personalizzazioni concordate, con l’attenzione personale del nostro team.")}</p>
            </div>
            <Link href={localePath("/shop", locale)} className={styles.addMore}>← {t("Find another little treasure", "Trova un altro piccolo tesoro")}</Link>
          </>}
          {storageWarning && <p role="status" className={styles.warning}>{translateError(storageWarning, locale)}</p>}
        </section>

        <section className={styles.formPanel} aria-labelledby="form-heading">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>02 / {t("A NOTE FROM YOU", "UN TUO MESSAGGIO")}</p><h2 id="form-heading" ref={formHeading} tabIndex={-1}>{t("Tell us", "Raccontaci")} <em>{t("a little.", "qualcosa di te.")}</em></h2></div><span className={styles.formPaw}><PawPrint /></span></div>
          <p className={styles.formIntro}>{t("Share a few details about yourself and your plans. We’ll give your collection personal attention and prepare a quote around what matters to you.", "Raccontaci qualcosa di te e dei tuoi progetti. Dedicheremo alla tua collezione un’attenzione personale e prepareremo un preventivo intorno a ciò che conta per te.")}</p>
          <form onSubmit={submit} noValidate>
            <div className={styles.formFields}>
              {localizedFields.map((field) => <div key={field.id} className={styles.field} data-wide={field.wide}>
                <label htmlFor={field.id}>{field.label}{field.required && <span className={styles.required}> *</span>}{!field.required && <span className={styles.optional}> {t("OPTIONAL", "FACOLTATIVO")}</span>}</label>
                <input id={field.id} name={field.id} type={field.type ?? "text"} value={details[field.id]} onChange={(event) => updateField(field.id, event.target.value)} placeholder={field.placeholder} autoComplete={field.autoComplete} min={field.id === "desiredArrivalDate" ? localDate() : undefined} required={field.required} aria-invalid={!!errors[field.id]} aria-describedby={[field.helper && `${field.id}-help`, errors[field.id] && `${field.id}-error`].filter(Boolean).join(" ") || undefined} disabled={!ready || !items.length} />
                {field.helper && <span id={`${field.id}-help`} className={styles.helper}>{field.helper}</span>}
                {errors[field.id] && <span id={`${field.id}-error`} className={styles.error}>{translateError(errors[field.id] ?? "", locale)}</span>}
              </div>)}
              <div className={`${styles.field} ${styles.notesField}`}>
                <label htmlFor="notes">{t("Anything you’d like us to know?", "C’è qualcosa che vorresti dirci?")} <span className={styles.optional}>{t("OPTIONAL", "FACOLTATIVO")}</span></label>
                <textarea id="notes" name="notes" rows={5} maxLength={2000} value={details.notes} onChange={(event) => updateField("notes", event.target.value)} placeholder={t("A special gift, your organization, a larger quantity, or a budget you’d like us to work with…", "Un regalo speciale, la tua organizzazione, una quantità maggiore o il budget che hai in mente…")} aria-invalid={!!errors.notes} aria-describedby={errors.notes ? "notes-error" : undefined} disabled={!ready || !items.length} />
                {errors.notes && <span id="notes-error" className={styles.error}>{translateError(errors.notes, locale)}</span>}
              </div>
            </div>
            <div className={styles.sendArea}>
              <div className={styles.sendNote}><CatSeal /><p>{t("A real person, a thoughtful reply, and a little studio care.", "Una persona vera, una risposta attenta e un po’ della cura del nostro studio.")}</p></div>
              <button type="submit" disabled={!ready || !items.length} className={styles.primaryAction}>{t("Send Enquiry", "Invia la richiesta")} <span aria-hidden="true">↗</span></button>
              <p className={styles.disclosure}>{t("Begin your personal studio consultation. We’ll review your collection, confirm availability, and prepare a custom quote with delivery and the next steps, all agreed together.", "Inizia la tua consulenza personale con lo studio. Rivedremo la collezione, confermeremo la disponibilità e prepareremo un preventivo su misura con consegna e prossimi passi, concordando tutto insieme.")}</p>
              <p className={styles.privacyNote}>{t("A little patience, a thoughtful reply. Your collection stays saved while we talk through the details.", "Un po’ di pazienza, una risposta attenta. La tua collezione resta salvata mentre definiamo insieme i dettagli.")}</p>
            </div>
          </form>
        </section>
      </div>
    </>}
  </div>;
}
