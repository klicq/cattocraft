import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import ProductPurchase from "@/components/ProductPurchase";
import ProductCard from "@/components/ProductCard";
import { CatSeal, Sparkle } from "@/components/StudioMarks";
import { getProduct, getProducts, getProductCards } from "@/lib/products";
import { CATALOG_COLLECTIONS, CATALOG_MOODS } from "@/lib/catalog-tags";
import { asLocale, localePath, pageAlternates, text } from "@/lib/locale";
import styles from "./page.module.css";

type Props = { params: Promise<{ locale: string; slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return getProducts().map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const values = await params;
  const locale = asLocale(values.locale);
  const product = getProduct(values.slug, locale);
  if (!product) notFound();
  return {
    title: product.name + " | CattoCraft", description: product.shortDescription,
    keywords: product.tagLabels ?? product.tags,
    alternates: pageAlternates("/products/" + product.slug, locale),
    openGraph: {
      title: product.name + " | CattoCraft", description: product.shortDescription,
      locale: locale === "it" ? "it_IT" : "en_GB", alternateLocale: [locale === "it" ? "en_GB" : "it_IT"],
      images: product.images.map(({ src, width, height, alt }) => ({ url: src, width, height, alt })),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const values = await params;
  const locale = asLocale(values.locale);
  const product = getProduct(values.slug, locale);
  if (!product) notFound();
  const number = String(getProducts().findIndex(({ id }) => id === product.id) + 1).padStart(2, "0");
  const ready = product.availability === "ready-to-ship";
  const availability = ready ? text(locale, "Ready to ship", "Pronto per la spedizione") : product.availability === "sold" ? text(locale, "Sold", "Già adottato") : product.availability === "made-to-order" ? text(locale, "Made to order", "Realizzato su richiesta") : text(locale, "Availability on enquiry", "Disponibilità su richiesta");
  const dimensions = product.dimensions;
  const format = (value: number) => new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-GB", { maximumFractionDigits: 1 }).format(value);
  const size = dimensions ? locale === "it"
    ? "Circa " + [dimensions.length, dimensions.width, dimensions.height].map(value => format(value * 2.54)).join(" × ") + " cm (lunghezza × larghezza × altezza)"
    : "Approx. " + format(dimensions.length) + "″ L × " + format(dimensions.width) + "″ W × " + format(dimensions.height) + "″ H" : text(locale, "Measurements shared with your enquiry.", "Misure condivise con la tua richiesta.");
  const otherCards = getProductCards(undefined, locale).filter(({ id }) => id !== product.id);
  const rank = (piece: (typeof otherCards)[number]) => Number(piece.tags[0] !== product.tags[0]) * 2 + Number(piece.category.id !== product.category.id);
  const related = otherCards.sort((a, b) => rank(a) - rank(b)).slice(0, 3);
  const purchaseProduct = { id: product.id, name: product.name, options: product.options, availability: product.availability, maxQuantity: product.maxQuantity, oneOfAKind: product.oneOfAKind, customization: product.customization };
  const tagLabels = product.tagLabels ?? product.tags;

  return <div className={styles.page}>
    <nav aria-label={text(locale, "Breadcrumb", "Percorso di navigazione")} className={styles.breadcrumb}><ol>
      <li><Link href={localePath("/", locale)}>{text(locale, "Home", "Inizio")}</Link></li><li><Link href={localePath("/shop", locale)}>{text(locale, "Shop", "Collezione")}</Link></li>
      <li><Link href={localePath("/shop?category=" + product.category.id, locale)}>{product.category.name}</Link></li><li aria-current="page">{product.name}</li>
    </ol></nav>
    <div className={styles.product}>
      <ProductGallery key={product.id} images={product.images} name={product.name} note={product.display.note} />
      <section className={styles.information} aria-labelledby="product-title">
        <div className={styles.eyebrow}><span>{tagLabels[0]} / {text(locale, "THE FELINE EDIT", "L’EDIZIONE FELINA")}</span><span>N° {number}</span></div>
        <h1 id="product-title">{product.name}</h1>
        <p className={styles.personality}>{product.shortDescription}</p>
        <ul className={styles.personalityTags} aria-label={text(locale, "This piece’s personality", "La personalità di questa creazione")}>
          {product.tags.map((tag, index) => {
            const collection = CATALOG_COLLECTIONS.find(entry => entry.tag === tag);
            const mood = CATALOG_MOODS.find(entry => entry.name === tag);
            const href = collection ? "/shop?collection=" + collection.id + "#collection" : mood ? "/shop?mood=" + mood.id + "#collection" : null;
            return <li key={tag}>{href ? <Link href={localePath(href, locale)} prefetch={false}>{tagLabels[index]}</Link> : <span>{tagLabels[index]}</span>}</li>;
          })}
        </ul>
        <div className={styles.priceRow}><p>{text(locale, "Price on enquiry", "Prezzo su richiesta")}</p><span className={styles.availability} data-ready={ready}><span aria-hidden="true" />{availability}</span></div>
        <p className={styles.priceNote}>{text(locale, "A small piece. A personal conversation.", "Una piccola creazione. Una conversazione personale.")}</p>
        <ProductPurchase key={product.id} product={purchaseProduct} />
        <div className={styles.studioPromise}><CatSeal /><p>{text(locale, "Chosen with a smile.", "Scelto con un sorriso.")}<br /><em>{text(locale, "Sent with a little studio love.", "Spedito con un po’ d’amore dal laboratorio.")}</em></p></div>
      </section>
    </div>
    <section className={styles.details} aria-labelledby="story-heading">
      <div className={styles.story}>
        <p className={styles.sectionLabel}><Sparkle /> {text(locale, "A LITTLE CHARACTER STUDY", "UN PICCOLO RITRATTO DI CARATTERE")}</p>
        <h2 id="story-heading">{text(locale, "More than a pretty face.", "Più di un bel musetto.")}<br /><em>{text(locale, "Although, just look at it.", "Anche se, guardalo un po’.")}</em></h2>
        <p>{product.description}</p>
        <div className={styles.makerNote}><span>{text(locale, "FROM THE MAKER’S DESK", "DAL TAVOLO DEL CREATORE")}</span><p>{text(locale, "Tell us where this little character will live. We’ll talk through its size, finish, and all the details that make it right for your space.", "Raccontaci dove vivrà questo piccolo personaggio. Parleremo di misure, finiture e di tutti i dettagli che lo renderanno adatto al tuo spazio.")}</p><span className={styles.signature}>{text(locale, "perfectly, purr-sonally yours", "tutto tuo, con un po’ di fusa")}</span></div>
      </div>
      <div className={styles.facts}>
        <p className={styles.sectionLabel}>{text(locale, "THE LOVELY LITTLE DETAILS", "I PICCOLI DETTAGLI CHE CONTANO")}</p>
        <dl>
          <div><dt>{text(locale, "Made of", "Materiale")}</dt><dd>{product.materials.join(" · ")}</dd></div>
          <div><dt>{text(locale, "Approximate size", "Misure indicative")}</dt><dd>{size}
            {locale === "it" && dimensions && <span>{[dimensions.length, dimensions.width, dimensions.height].map(format).join(" × ")} pollici, circa.</span>}
            <span>{text(locale, "An indicative miniature-size guide; final measurements are confirmed with your enquiry.", "Una guida indicativa alle dimensioni della miniatura; le misure finali vengono confermate con la tua richiesta.")}</span>
            <span>{text(locale, "Tell us about the spot you have in mind.", "Raccontaci dell’angolo che hai in mente.")}</span>
          </dd></div>
          <div><dt>{text(locale, "In the box", "Cosa riceverai")}</dt><dd>{product.included.join(". ")}</dd></div>
          <div><dt>{text(locale, "Preparation", "Preparazione")}</dt><dd>{product.leadTime}</dd></div>
          <div><dt>{text(locale, "Make it yours", "Rendilo tuo")}</dt><dd>{product.customization.notes}</dd></div>
          <div><dt>{text(locale, "A little care", "Un po’ di cura")}</dt><dd>{product.care}</dd></div>
        </dl>
        <aside className={styles.materialNote} aria-label={text(locale, "Our approach to making", "Il nostro modo di creare")}>
          <h3>{text(locale, "Small pieces. Thoughtful making.", "Piccole creazioni. Scelte consapevoli.")}</h3>
          <ul>
            <li><strong>{text(locale, "Solvent-free & non-toxic casting mix", "Miscela senza solventi e non tossica")}</strong><span>{text(locale, "A mineral-based casting material, with finishes chosen for each piece.", "Un materiale da colata a base minerale, con finiture scelte per ogni creazione.")}</span></li>
            <li><strong>{text(locale, "Low-energy manufacturing", "Lavorazione a basso consumo energetico")}</strong><span>{product.sustainability.process}</span></li>
            <li><strong>{text(locale, "Zero-waste potential", "Potenziale di riduzione degli scarti")}</strong><span>{product.sustainability.waste}</span></li>
          </ul>
          <p>{product.sustainability.scope}</p>
        </aside>
        <p className={styles.deliveryNote}>{text(locale, "Your studio team will guide you through availability, delivery costs, and timing, with every detail agreed together.", "Il nostro team ti accompagnerà tra disponibilità, costi di spedizione e tempi, concordando ogni dettaglio insieme.")}</p>
      </div>
    </section>
    <section className={styles.related} aria-labelledby="related-heading">
      <div className={styles.relatedHeading}><div><p className={styles.sectionLabel}>{text(locale, "GOOD THINGS COME IN LITTLE GROUPS", "LE COSE BELLE STANNO IN COMPAGNIA")}</p><h2 id="related-heading">{text(locale, "Rather lovely company.", "Una compagnia deliziosa.")}</h2></div><Link href={localePath("/shop", locale)}>{text(locale, "Meet the whole collection", "Conosci tutta la collezione")} <span aria-hidden="true">↗</span></Link></div>
      <div className={styles.relatedGrid}>{related.map(piece => <ProductCard key={piece.id} product={piece} locale={locale} />)}</div>
    </section>
  </div>;
}
