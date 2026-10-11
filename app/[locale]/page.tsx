import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProducts, getProductCards } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { BasketIcon, CatSeal, EnvelopeCat, PawPrint, SleepingCat, Sparkle } from "@/components/StudioMarks";
import { asLocale, text, localePath, pageAlternates } from "@/lib/locale";
import styles from "./page.module.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = asLocale((await params).locale);
  return {
    title: text(locale, "CattoCraft | Little works of art. Big personality.", "CattoCraft | Piccole opere d'arte. Grande personalità."),
    description: text(locale, "Handmade pieces for cosy corners, thoughtful gifts, and people who notice the little things. Explore our cat-inspired collection and send a personal enquiry.", "Pezzi fatti a mano per angoli accoglienti, regali pieni di cura e persone che amano i piccoli dettagli. Scopri la nostra collezione felina e inviaci una richiesta."),
    alternates: pageAlternates("/", locale),
  };
}

export default async function HomePage({ params }: Props) {
  const locale = asLocale((await params).locale);
  const t = (en: string, it: string) => text(locale, en, it);
  const featuredProducts = getProductCards(getProducts(locale).slice(0, 4), locale);

  return <div className={styles.home}>
    <section className={styles.hero} aria-labelledby="home-heading">
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}><span className={styles.littleDot} /> {t("A LITTLE STUDIO. A SOFT SPOT FOR CATS.", "UN PICCOLO STUDIO. UN DEBOLE PER I GATTI.")}</p>
        <h1 id="home-heading"><span>{t("Little works", "Piccole opere")}<br /> {t("of art.", "d'arte.")}</span>{" "}<em>{t("Big curl-up-and-smile energy.", "Una gran voglia di accoccolarsi e sorridere.")}</em></h1>
        <p className={styles.heroDescription}>{t("Handmade pieces for cosy corners, thoughtful gifts, and people who notice the little things.", "Pezzi fatti a mano per angoli accoglienti, regali pieni di cura e persone che amano i piccoli dettagli.")}</p>
        <div className={styles.heroActions}>
          <Link href={localePath("/shop", locale)} className={styles.primaryLink}>{t("Explore the collection", "Esplora la collezione")} <span aria-hidden="true">↗</span><PawPrint className={styles.buttonPaw} /></Link>
          <a href="#featured" className={styles.scrollLink}>{t("Meet a few favourites", "Incontra i nostri preferiti")} <span aria-hidden="true">↓</span></a>
        </div>
        <div className={styles.heroPostscript}><span className={styles.handdrawnLine} aria-hidden="true" /><span>{t("Small batches. A little mischief. All heart.", "Piccole serie. Qualche marachella. Tanto cuore.")}</span></div>
      </div>

      <figure className={styles.heroFigure}>
        <div className={styles.pictureSurround}>
          <span className={styles.sunMark} aria-hidden="true"><Sparkle /></span>
          <div className={styles.heroImageFrame}>
            <Image src="/art/studio-hero.webp" alt={t("A small ivory cat sculpture resting on a sunlit artist’s table, with linen, a paintbrush, and a terracotta dish.", "Una piccola scultura di gatto color avorio su un tavolo d'artista illuminato dal sole, con lino, un pennello e un piattino di terracotta.")} fill sizes="(max-width: 760px) 88vw, (max-width: 1450px) 43vw, 620px" className={styles.heroImage} preload />
          </div>
          <div className={styles.studioSeal} aria-hidden="true"><span>{t("SMALL BATCH", "PICCOLE SERIE")}</span><CatSeal /><span>{t("BIG HEART", "GRANDE CUORE")}</span></div>
        </div>
        <figcaption className={styles.heroCaption}><span>{t("01 / A LITTLE STUDIO DAYDREAM", "01 / UN PICCOLO SOGNO DI STUDIO")}</span><span>{t("make yourself at home.", "sentiti a casa.")}</span></figcaption>
      </figure>
    </section>

    <div className={styles.welcomeLine} aria-hidden="true"><span>{t("A quiet sort of wonderful", "Una meraviglia discreta")}</span><Sparkle /><span>{t("For your favourite little corner", "Per il tuo angolino preferito")}</span><Sparkle /><span>{t("Approved with a purr", "Approvato a suon di fusa")}</span></div>

    <section id="featured" className={styles.featured} aria-labelledby="featured-heading">
      <header className={styles.sectionHeader}>
        <div><p className={styles.eyebrow}>{t("A FEW FAMILIAR FACES", "QUALCHE MUSO FAMILIARE")} <span className={styles.collectionCount}>01—04</span></p><h2 id="featured-heading">{t("Small pieces.", "Piccoli pezzi.")}<br /><em>{t("Quite the characters.", "Personalità da vendere.")}</em></h2></div>
        <div className={styles.collectionIntro}><p>{t("A quiet little companion. A playful silhouette. A face that makes you smile. There’s a little personality here with your name on it.", "Un piccolo compagno discreto. Una sagoma giocosa. Un musetto che ti fa sorridere. Qui c'è una piccola personalità che aspetta proprio te.")}</p><Link href={localePath("/shop", locale)} className={styles.textLink}>{t("View all pieces", "Scopri tutti i pezzi")} <span aria-hidden="true">↗</span></Link></div>
      </header>
      <div className={styles.productGrid}>{featuredProducts.map((product) => <div key={product.id} className={styles.featuredPiece}><ProductCard product={product} headingLevel={3} locale={locale} /></div>)}</div>
      <div className={styles.collectionFootnote}><span className={styles.footnoteRule} /><PawPrint /><p>{t("For shelves, desks, and people with excellent taste in company.", "Per scaffali, scrivanie e persone che sanno scegliere una bella compagnia.")}</p><span className={styles.footnoteRule} /></div>
    </section>

    <section id="how-it-works" className={styles.process} aria-labelledby="process-heading">
      <div className={styles.processIntro}>
        <p className={styles.eyebrow}><Sparkle /> {t("FROM OUR LITTLE CORNER TO YOURS", "DAL NOSTRO ANGOLO AL TUO")}</p>
        <h2 id="process-heading">{t("First, a little spark.", "Prima, una scintilla.")}<br /><em>{t("Then, a little hello.", "Poi, un piccolo saluto.")}</em></h2>
        <p>{t("Finding your piece should feel as lovely as living with it. Here’s how we make that happen, personally.", "Scegliere il tuo pezzo dovrebbe essere bello quanto averlo accanto. Ecco come lo rendiamo possibile, con un'attenzione tutta per te.")}</p>
        <div className={styles.processCat}><SleepingCat /><span>{t("no rush. the cat certainly isn’t in one.", "nessuna fretta. il gatto, di certo, non ne ha.")}</span></div>
      </div>
      <ol className={styles.processSteps}>
        <li><span className={styles.stepNumber}>01</span><div className={styles.stepCopy}><h3>{t("Find your kind of lovely.", "Trova la bellezza che fa per te.")}</h3><p>{t("Wander through the collection. Get to know the details. Notice the piece you keep coming back to.", "Passeggia nella collezione. Scopri i dettagli. Nota quel pezzo a cui continui a tornare.")}</p></div><Sparkle className={styles.stepMark} /></li>
        <li><span className={styles.stepNumber}>02</span><div className={styles.stepCopy}><h3>{t("Gather your favourites.", "Raccogli i tuoi preferiti.")}</h3><p>{t("Choose your options and add your pieces to the cart. Think of it as a little collection of possibilities.", "Scegli le opzioni e aggiungi i pezzi al carrello. Immaginalo come una piccola collezione di possibilità.")}</p></div><BasketIcon className={styles.stepMark} /></li>
        <li><span className={styles.stepNumber}>03</span><div className={styles.stepCopy}><h3>{t("Send a little hello.", "Inviaci un piccolo saluto.")}</h3><p>{t("Share your selections in an enquiry. Our team will confirm availability and prepare a personal quote, with delivery and the next steps thoughtfully arranged.", "Inviaci una richiesta con i pezzi scelti. Il nostro team confermerà la disponibilità e preparerà un preventivo su misura, curando consegna e prossimi passi.")}</p></div><PawPrint className={styles.stepMark} /></li>
      </ol>
      <p className={styles.processReassurance}>{t("A personal conversation. A quote shaped around you.", "Una conversazione dedicata a te. Un preventivo su misura.")} <span>{t("Every detail, considered together.", "Ogni dettaglio, pensato insieme.")}</span></p>
    </section>

    <section className={styles.studioNote} aria-labelledby="studio-note-heading">
      <div className={styles.letterIllustration}><EnvelopeCat /><span>{t("a note from our little studio", "un biglietto dal nostro piccolo studio")}</span></div>
      <div className={styles.letterCopy}><p className={styles.eyebrow}>{t("FOR THE PEOPLE WHO NOTICE", "PER CHI NOTA I PICCOLI DETTAGLI")}</p><h2 id="studio-note-heading">{t("A home is made", "Una casa è fatta")}<br />{t("of", "di")} <em>{t("little things.", "piccole cose.")}</em></h2><p>{t("The book you always return to. The light at four o’clock. The small, curious face keeping your favourite shelf company.", "Il libro a cui torni sempre. La luce delle quattro. Il musetto curioso che tiene compagnia al tuo scaffale preferito.")}</p><p>{t("We make art for those everyday moments. Pieces with a little warmth, a little character, and a very soft spot for the wonderfully ordinary.", "Creiamo arte per questi momenti quotidiani. Pezzi pieni di calore e carattere, con un debole per la meraviglia delle cose semplici.")}</p><Link href={localePath("/shop", locale)} className={styles.textLink}>{t("Find your little thing", "Trova la tua piccola meraviglia")} <span aria-hidden="true">↗</span></Link></div>
      <Sparkle className={styles.letterSparkle} />
    </section>
  </div>;
}
