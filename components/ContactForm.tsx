"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { buildContactPayload, contactTopics, emptyContactFields, validateContact, type ContactErrors, type ContactFields, type ContactPayload } from "@/lib/contact";
import { CatSeal, EnvelopeCat, PawPrint } from "./StudioMarks";
import { text, localePath, translateError } from "@/lib/locale";
import { useLocale } from "./LocaleContext";
import styles from "./ContactForm.module.css";

const italianTopics: Record<ContactFields["topic"], { label: string; hint: string }> = {
  question: { label: "Una piccola domanda", hint: "Chiedici di un articolo, di una finitura o di qualsiasi cosa ti incuriosisca." },
  custom: { label: "Qualcosa di personale", hint: "Raccontaci la tua idea, i colori che preferisci e l’occasione o lo spazio che hai in mente." },
  organization: { label: "Un progetto più grande", hint: "Parlaci della tua organizzazione, degli articoli e delle quantità che cerchi, della destinazione, dei tempi e del budget." },
  hello: { label: "Solo un saluto", hint: "Un pensiero, una presentazione o una piccola storia. Ci farà piacere leggerti." },
};

export default function ContactForm() {
  const locale = useLocale();
  const t = (en: string, it: string) => text(locale, en, it);
  const localizedTopics = contactTopics.map((topic) => ({ ...topic, label: t(topic.label, italianTopics[topic.id].label), hint: t(topic.hint, italianTopics[topic.id].hint) }));
  const [fields, setFields] = useState<ContactFields>(emptyContactFields);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [preview, setPreview] = useState<ContactPayload | null>(null);
  const submitted = useRef(false);
  const moveFocus = useRef(false);
  const formHeading = useRef<HTMLHeadingElement>(null);
  const previewHeading = useRef<HTMLHeadingElement>(null);
  const topic = localizedTopics.find(({ id }) => id === fields.topic) ?? localizedTopics[0];
  const isOrganization = fields.topic === "organization";

  useEffect(() => {
    if (!moveFocus.current) return;
    (preview ? previewHeading.current : formHeading.current)?.focus();
    moveFocus.current = false;
  }, [preview]);

  function update<K extends keyof ContactFields>(key: K, value: ContactFields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitted.current) return;
    const nextErrors = validateContact(fields);
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      document.getElementById(`hello-${firstError}`)?.focus();
      return;
    }
    const suffix = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
    const reference = `CATTO-HELLO-${suffix.toUpperCase()}`;
    const payload = { ...buildContactPayload(fields, reference, new Date().toISOString()), locale };
    submitted.current = true;
    // Mock submission; connect inbox delivery before accepting real customer messages.
    if (process.env.NODE_ENV === "development") console.log("CattoCraft mock contact", payload);
    moveFocus.current = true;
    setPreview(payload);
  }

  function editNote() {
    submitted.current = false;
    moveFocus.current = true;
    setPreview(null);
  }

  return <section className={styles.paper} aria-labelledby={preview ? "hello-preview-heading" : "hello-form-heading"}>
    <div className={styles.paperHeader}><div><span>{t("TO: CATTOCRAFT", "A: CATTOCRAFT")}</span><span>{t("RE: A LOVELY LITTLE CONVERSATION", "OGGETTO: UNA BELLA CHIACCHIERATA")}</span></div><div className={styles.stamp}><CatSeal /><span>{t("WITH CARE", "CON CURA")}</span></div></div>
    {preview ? <div className={styles.preview}>
      <EnvelopeCat className={styles.previewCat} />
      <p className={styles.eyebrow}>{t("A LITTLE HELLO, RECEIVED WITH LOVE", "UN PICCOLO SALUTO, ACCOLTO CON AMORE")}</p>
      <h2 id="hello-preview-heading" ref={previewHeading} tabIndex={-1}>{t("Your note,", "Il tuo messaggio,")}<br /><em>{t("neatly tucked in.", "custodito con cura.")}</em></h2>
      <p>{t("Thank you for writing to CattoCraft. We’ll read your note with care and get back to you by email. Lovely things often begin with a little hello.", "Grazie per aver scritto a CattoCraft. Leggeremo il tuo messaggio con cura e ti risponderemo via email. Le cose belle iniziano spesso con un piccolo saluto.")}</p>
      <dl><div><dt>{t("Your message reference", "Il riferimento del messaggio")}</dt><dd>{preview.reference}</dd></div><div><dt>{t("We’ll write to", "Ti scriveremo a")}</dt><dd>{preview.customer.email}</dd></div><div><dt>{t("Let’s talk about", "Parliamo di")}</dt><dd>{localizedTopics.find(({ id }) => id === preview.topic)?.label}</dd></div></dl>
      <details className={styles.previewNote}><summary>{t("Read your note", "Rileggi il messaggio")} <span aria-hidden="true">+</span></summary><p>{preview.message}</p></details>
      <button type="button" className={styles.send} onClick={editNote}>{t("Back to your note", "Torna al messaggio")} <span aria-hidden="true">↗</span></button>
      <Link href={localePath("/shop", locale)} className={styles.keepBrowsing}>{t("Wander through the collection", "Passeggia tra i nostri piccoli tesori")}</Link>
    </div> : <>
      <div className={styles.formIntroduction}><p className={styles.eyebrow}>{t("FROM YOUR LITTLE CORNER TO OURS", "DAL TUO PICCOLO MONDO AL NOSTRO")}</p><h2 id="hello-form-heading" ref={formHeading} tabIndex={-1}>{t("Your words.", "Le tue parole.")}<br /><em>{t("Our full attention.", "Tutta la nostra attenzione.")}</em></h2><p>{t("A few details, a little note, and the beginning of something lovely.", "Qualche dettaglio, un piccolo messaggio e l’inizio di qualcosa di bello.")}</p></div>
      <form onSubmit={submit} noValidate>
        <fieldset id="hello-topic" className={styles.topics} tabIndex={-1} aria-describedby={errors.topic ? "hello-topic-error" : undefined}>
          <legend>{t("What’s on your mind?", "A cosa stai pensando?")}</legend>
          <div className={styles.topicGrid}>{localizedTopics.map(({ id, label }, index) => <label key={id} className={styles.topic}><input type="radio" name="topic" value={id} checked={fields.topic === id} onChange={() => update("topic", id)} /><span><small aria-hidden="true">0{index + 1}</small>{label}<PawPrint /></span></label>)}</div>
          {errors.topic && <p id="hello-topic-error" className={styles.error}>{translateError(errors.topic, locale)}</p>}
        </fieldset>
        <p className={styles.topicHint} aria-live="polite">{topic.hint}</p>
        {Object.values(errors).some(Boolean) && <p className={styles.errorSummary} role="alert">{t("A little detail needs your attention. Check the highlighted fields below.", "Un piccolo dettaglio richiede la tua attenzione. Controlla i campi evidenziati qui sotto.")}</p>}
        <div className={styles.fields}>
          <div className={styles.field}><label htmlFor="hello-name">{t("Your name", "Il tuo nome")} <span>*</span></label><input id="hello-name" name="name" autoComplete="name" required maxLength={100} placeholder={t("What shall we call you?", "Come ti chiami?")} value={fields.name} onChange={(event) => update("name", event.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "hello-name-error" : undefined} />{errors.name && <p id="hello-name-error" className={styles.error}>{translateError(errors.name, locale)}</p>}</div>
          <div className={styles.field}><label htmlFor="hello-email">{t("Email address", "Indirizzo email")} <span>*</span></label><input id="hello-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder={t("you@example.com", "tu@esempio.it")} value={fields.email} onChange={(event) => update("email", event.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? "hello-email-error" : undefined} />{errors.email && <p id="hello-email-error" className={styles.error}>{translateError(errors.email, locale)}</p>}</div>
          <div className={`${styles.field} ${!isOrganization ? styles.wide : ""}`}><label htmlFor="hello-phone">{t("Phone number", "Numero di telefono")} <small>{t("OPTIONAL", "FACOLTATIVO")}</small></label><input id="hello-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder={t("Include your country code", "Includi il prefisso internazionale")} value={fields.phone} onChange={(event) => update("phone", event.target.value)} aria-invalid={!!errors.phone} aria-describedby={`hello-phone-help${errors.phone ? " hello-phone-error" : ""}`} /><p id="hello-phone-help" className={styles.helper}>{t("If you’d like us to call about your note.", "Se desideri parlarne con noi al telefono.")}</p>{errors.phone && <p id="hello-phone-error" className={styles.error}>{translateError(errors.phone, locale)}</p>}</div>
          {isOrganization && <div className={styles.field}><label htmlFor="hello-organization">{t("Organization", "Organizzazione")} <small>{t("OPTIONAL", "FACOLTATIVO")}</small></label><input id="hello-organization" name="organization" autoComplete="organization" maxLength={150} placeholder={t("School, hospital, or organization", "Scuola, ospedale o organizzazione")} value={fields.organization} onChange={(event) => update("organization", event.target.value)} aria-invalid={!!errors.organization} aria-describedby={errors.organization ? "hello-organization-error" : undefined} />{errors.organization && <p id="hello-organization-error" className={styles.error}>{translateError(errors.organization, locale)}</p>}</div>}
          <div className={`${styles.field} ${styles.wide}`}><label htmlFor="hello-message">{t("Your little note", "Il tuo piccolo messaggio")} <span>*</span></label><textarea id="hello-message" name="message" rows={6} required maxLength={3000} placeholder={isOrganization ? t("Tell us about your project, quantities, destination, and the budget you have in mind…", "Raccontaci il progetto, le quantità, la destinazione e il budget che hai in mente…") : t("Dear little studio, I’ve been thinking…", "Caro piccolo studio, stavo pensando…")} value={fields.message} onChange={(event) => update("message", event.target.value)} aria-invalid={!!errors.message} aria-describedby={`hello-message-count${errors.message ? " hello-message-error" : ""}`} /><div className={styles.messageFooter}><span>{t("Make it as wonderfully you as you like.", "Lascia spazio a tutto ciò che ti rende speciale.")}</span><span id="hello-message-count">{fields.message.length.toLocaleString(locale)} / {(3000).toLocaleString(locale)}</span></div>{errors.message && <p id="hello-message-error" className={styles.error}>{translateError(errors.message, locale)}</p>}</div>
        </div>
        <div className={styles.sendArea}><button type="submit" className={styles.send} aria-describedby="hello-response-note">{t("Send a little hello", "Invia un piccolo saluto")} <span aria-hidden="true">↗</span></button><p id="hello-response-note" className={styles.personalNote}>{t("A real conversation, with real people who care about the little things.", "Una conversazione vera, con persone che hanno a cuore le piccole cose.")}</p><p className={styles.privacy}>{t("A little patience, a thoughtful reply. We’ll give your note the care it deserves.", "Un po’ di pazienza, una risposta attenta. Dedicheremo al tuo messaggio la cura che merita.")}</p></div>
      </form>
    </>}
    <div className={styles.paperSignoff}><span>{t("with care, & a little purr", "con cura e qualche fusa")}</span><PawPrint /></div>
  </section>;
}
