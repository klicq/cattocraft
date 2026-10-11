import type { Metadata } from "next";
import { asLocale, pageAlternates, text } from "@/lib/locale";
import { ShopGalleryView } from "@/components/ShopGallery";
import { CatSeal, Sparkle } from "@/components/StudioMarks";
import { getProductCards } from "@/lib/products";
import styles from "./page.module.css";

export async function generateMetadata({ params }: Props): Promise<Metadata> { const locale = asLocale((await params).locale); return { title: text(locale, "The Collection | CattoCraft", "La collezione | CattoCraft"), description: text(locale, "Meet our cat-inspired collection: curious companions and pieces with plenty of personality.", "Scopri la nostra collezione ispirata ai gatti: piccoli compagni curiosi e creazioni ricche di personalità."), alternates: pageAlternates("/shop", locale) }; }

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ category?: string | string[]; collection?: string | string[]; mood?: string | string[]; page?: string | string[] }> };

export default async function ShopPage({ searchParams, params }: Props) {
  const locale = asLocale((await params).locale);
  const products = getProductCards(undefined, locale);
  const query = await searchParams;
  const category = typeof query.category === "string" ? query.category : "all";
  const collection = typeof query.collection === "string" ? query.collection : "all";
  const mood = typeof query.mood === "string" ? query.mood : "all";
  const page = typeof query.page === "string" ? query.page : "1";

  return (
    <div className={styles.shop}>
      <header className={styles.intro}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}><span aria-hidden="true" /> {text(locale, "THE STUDIO COLLECTION", "LA COLLEZIONE DEL LABORATORIO")} <span className={styles.volume}>VOL. 01</span></p>
          <h1>{text(locale, "A little art.", "Un po’ d’arte.")}<br /><em>{text(locale, "A lot of personality.", "Tanta personalità.")}</em><Sparkle className={styles.headingSparkle} /></h1>
          <p className={styles.description}>{text(locale, "For the sunny shelf, the quiet corner,", "Per una mensola al sole, un angolo tranquillo,")}<br className={styles.desktopBreak} />{text(locale, " and the person who always stops to say hello to a cat.", " e chi si ferma sempre a salutare un gatto.")}</p>
        </div>
        <aside className={styles.studioNote} aria-label={text(locale, "A note from the studio", "Un messaggio dal laboratorio")}>
          <span className={styles.notePin} aria-hidden="true" />
          <CatSeal className={styles.noteCat} />
          <span className={styles.noteLabel}>{text(locale, "A NOTE FROM THE STUDIO", "UN MESSAGGIO DAL LABORATORIO")}</span>
          <p>{text(locale, "Some things just", "Certe piccole cose")}<br /><em>{text(locale, "make a place feel like you.", "fanno sentire un posto tuo.")}</em></p>
          <span className={styles.noteBody}>{text(locale, "A few small pieces. A little mischief.", "Piccole creazioni. Un po’ di monelleria.")}<br />{text(locale, "Find the one that feels like home.", "Trova quella che ti fa sentire a casa.")}</span>
          <span className={styles.noteSignature}>{text(locale, "with love, & a little purr", "con amore e un po’ di fusa")}</span>
        </aside>
      </header>

      <ShopGalleryView locale={locale} products={products} category={category} collection={collection} mood={mood} page={page} />

      <section className={styles.ordering} aria-labelledby="ordering-heading">
        <div className={styles.orderingIntro}>
          <p className={styles.eyebrow}><Sparkle /> {text(locale, "A PERSONAL LITTLE PROCESS", "UN PICCOLO PERCORSO PERSONALE")}</p>
          <h2 id="ordering-heading">{text(locale, "Found your", "Hai trovato la tua")}<br /><em>{text(locale, "kind of curious?", "piccola curiosità?")}</em></h2>
          <p>{text(locale, "Every piece starts a conversation.", "Ogni creazione dà inizio a una conversazione.")}</p>
        </div>
        <ol className={styles.steps}>
          <li><span className={styles.stepNumber}>01</span><div><h3>{text(locale, "Find your favourite", "Trova la tua preferita")}</h3><p>{text(locale, "Get to know the pieces. See which little personality catches your eye.", "Conosci le creazioni e scopri quale piccola personalità ti conquista.")}</p></div></li>
          <li><span className={styles.stepNumber}>02</span><div><h3>{text(locale, "Send a little hello", "Mandaci un piccolo saluto")}</h3><p>{text(locale, "Add your choices to the cart, then send us an itemized enquiry.", "Aggiungi le tue preferite alla selezione e inviaci una richiesta con tutti i dettagli.")}</p></div></li>
          <li><span className={styles.stepNumber}>03</span><div><h3>{text(locale, "We’ll take it personally", "Ci penseremo personalmente")}</h3><p>{text(locale, "We’ll confirm availability, delivery, and all the little details by email.", "Confermeremo via email disponibilità, spedizione e ogni piccolo dettaglio.")}</p></div></li>
        </ol>
        <p className={styles.reassurance}>{text(locale, "Personal guidance, tailored pricing, and delivery details arranged with care.", "Consigli personali, un preventivo su misura e una spedizione organizzata con cura.")}</p>
      </section>
    </div>
  );
}
