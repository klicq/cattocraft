import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { BasketIcon, EnvelopeCat, PawPrint, Sparkle } from "@/components/StudioMarks";
import { asLocale, text, localePath, pageAlternates } from "@/lib/locale";
import styles from "./page.module.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = asLocale((await params).locale);
  return {
    title: text(locale, "Say Hello | CattoCraft", "Un piccolo saluto | CattoCraft"),
    description: text(locale, "A question, a personal piece, or a project for your organization. Start a conversation with our little art studio.", "Una domanda, un pezzo speciale o un progetto per la tua organizzazione. Inizia una conversazione con il nostro piccolo studio d'arte."),
    alternates: pageAlternates("/contact", locale),
  };
}

export default async function ContactPage({ params }: Props) {
  const locale = asLocale((await params).locale);
  const t = (en: string, it: string) => text(locale, en, it);
  return <div className={styles.page}>
    <nav className={styles.breadcrumb} aria-label={t("Breadcrumb", "Percorso di navigazione")}><Link href={localePath("/", locale)}>{t("Home", "Home")}</Link><span aria-hidden="true">/</span><span aria-current="page">{t("Say hello", "Un piccolo saluto")}</span></nav>
    <div className={styles.correspondence}>
      <div className={styles.welcome}>
        <header>
          <p className={styles.eyebrow}><span /> {t("THE STUDIO LETTERBOX", "LA POSTA DELLO STUDIO")}</p>
          <h1>{t("Good things", "Le cose belle")}<br /> {t("start with", "iniziano con")}<br /><em>{t("a little hello.", "un piccolo saluto.")}</em></h1>
          <p className={styles.introduction}>{t("A curious question. An idea taking shape. A project with a whole community in mind. Pull up a chair—we’d love to hear about it.", "Una domanda curiosa. Un'idea che prende forma. Un progetto pensato per un'intera comunità. Accomodati: ci piacerebbe ascoltare la tua storia.")}</p>
        </header>
        <figure className={styles.catCorner}>
          <div className={styles.catArch}><EnvelopeCat /><Sparkle className={styles.cornerSparkle} /></div>
          <figcaption>{t("our correspondence assistant is all ears.", "il nostro assistente alla posta è tutto orecchie.")}</figcaption>
        </figure>
        <aside className={styles.collectionNote} aria-labelledby="collection-note-heading">
          <BasketIcon />
          <div><h2 id="collection-note-heading">{t("Already found your favourites?", "Hai già trovato i tuoi preferiti?")}</h2><p>{t("Send your selected pieces together for a personal quote, with all the lovely details in one place.", "Inviaci i pezzi che hai scelto per un preventivo su misura, con tutti i dettagli raccolti in un unico posto.")}</p><Link href={localePath("/enquiry", locale)}>{t("Review your collection", "Rivedi la tua collezione")} <span aria-hidden="true">↗</span></Link></div>
        </aside>
      </div>
      <ContactForm />
    </div>
    <nav className={styles.helpfulLinks} aria-label={t("More from the studio", "Altre idee dallo studio")}>
      <div className={styles.littleNote}><PawPrint /><span>{t("A small studio.", "Un piccolo studio.")}<br /><em>{t("A personal conversation.", "Una conversazione dedicata a te.")}</em></span></div>
      <Link href={localePath("/how-to-order", locale)}><span><small>{t("CURIOUS ABOUT THE PROCESS?", "VUOI SAPERE COME FUNZIONA?")}</small><b>{t("Here’s how we make it personal.", "Ecco come ci prendiamo cura di ogni richiesta.")}</b></span><span aria-hidden="true">↗</span></Link>
      <Link href={localePath("/shop", locale)}><span><small>{t("A LITTLE MORE WANDERING?", "ANCORA UN PICCOLO GIRO?")}</small><b>{t("There’s lovely company in the collection.", "Nella collezione ti aspetta una dolce compagnia.")}</b></span><span aria-hidden="true">↗</span></Link>
    </nav>
  </div>;
}
