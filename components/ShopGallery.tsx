import Link from "next/link";
import type { ProductCardData } from "@/lib/products";
import { localePath, tagName, text, type Locale } from "@/lib/locale";
import { CATALOG_COLLECTIONS, CATALOG_MOODS } from "@/lib/catalog-tags";
import ProductCard from "./ProductCard";
import { SleepingCat } from "./StudioMarks";
import styles from "./ShopGallery.module.css";

const PAGE_SIZE = 24;
type GalleryProps = { locale?: Locale; products: ProductCardData[]; category?: string; collection?: string; mood?: string; page?: string };
type GalleryQuery = { category: string; collection: string; mood: string; page: number };

export function ShopGalleryView({ locale = "en", products, category = "all", collection = "all", mood = "all", page = "1" }: GalleryProps) {
  const categories = Array.from(new Map(products.map(({ category }) => [category.id, category])).values());
  const selectedCategory = categories.find(({ id }) => id === category);
  const selectedCollection = CATALOG_COLLECTIONS.find(({ id }) => id === collection);
  const selectedMood = CATALOG_MOODS.find(({ id }) => id === mood);
  const activeCategory = selectedCategory?.id ?? "all";
  const activeCollection = selectedCollection?.id ?? "all";
  const activeMood = selectedMood?.id ?? "all";
  const categoryProducts = selectedCategory ? products.filter((product) => product.category.id === activeCategory) : products;
  const collectionProducts = selectedCollection ? categoryProducts.filter((product) => product.tags.includes(selectedCollection.tag)) : categoryProducts;
  const matchingProducts = selectedMood ? collectionProducts.filter((product) => product.tags.includes(selectedMood.name)) : collectionProducts;
  // Facet counts preserve the other filters, so each count matches the link's destination.
  const collectionCounts = selectedMood ? categoryProducts.filter((product) => product.tags.includes(selectedMood.name)) : categoryProducts;
  const pageCount = Math.max(1, Math.ceil(matchingProducts.length / PAGE_SIZE));
  const requestedPage = Number(page);
  const currentPage = Number.isFinite(requestedPage) ? Math.max(1, Math.min(pageCount, Math.floor(requestedPage))) : 1;
  const firstIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleProducts = matchingProducts.slice(firstIndex, firstIndex + PAGE_SIZE);
  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1)
    .filter((number) => number === 1 || number === pageCount || Math.abs(number - currentPage) <= 1);
  const pagination: (number | null)[] = [];
  pageNumbers.forEach((number, index) => {
    if (index > 0 && number - pageNumbers[index - 1] > 1) pagination.push(null);
    pagination.push(number);
  });

  function galleryUrl({ category: nextCategory = activeCategory, collection: nextCollection = activeCollection, mood: nextMood = activeMood, page: nextPage = 1 }: Partial<GalleryQuery> = {}) {
    const params = new URLSearchParams();
    if (nextCollection !== "all") params.set("collection", nextCollection);
    if (nextMood !== "all") params.set("mood", nextMood);
    if (nextCategory !== "all") params.set("category", nextCategory);
    if (nextPage > 1) params.set("page", String(nextPage));
    return localePath(`/shop${params.size ? `?${params}` : ""}#collection`, locale);
  }

  const hasFilters = activeCategory !== "all" || activeCollection !== "all" || activeMood !== "all";

  return (
    <section id="collection" className={styles.gallery} aria-label={text(locale, "The art collection", "La collezione d’arte")}>
      <div className={styles.toolbar}>
        <nav className={styles.filters} aria-label={text(locale, "Choose a collection", "Scegli una collezione")}>
          <Link href={galleryUrl({ collection: "all" })} prefetch={false} className={styles.filter} aria-current={activeCollection === "all" ? "true" : undefined}>
            {text(locale, "All little loves", "Tutte le piccole meraviglie")}<span>{String(collectionCounts.length).padStart(2, "0")}</span>
          </Link>
          {CATALOG_COLLECTIONS.map(({ id, name, tag }) => (
            <Link key={id} href={galleryUrl({ collection: id })} prefetch={false} className={styles.filter} aria-current={activeCollection === id ? "true" : undefined}>
              {tagName(name, locale)}<span>{String(collectionCounts.filter((product) => product.tags.includes(tag)).length).padStart(2, "0")}</span>
            </Link>
          ))}
        </nav>
        <p className={styles.count} aria-live="polite" aria-atomic="true">{matchingProducts.length > 0 ? text(locale, `Showing ${firstIndex + 1}–${firstIndex + visibleProducts.length} of ${matchingProducts.length} little ${matchingProducts.length === 1 ? "character" : "characters"}.`, `Da ${firstIndex + 1} a ${firstIndex + visibleProducts.length} di ${matchingProducts.length} piccole meraviglie.`) : text(locale, "A little more room for discovery.", "C’è ancora tanto da scoprire.")}</p>
      </div>

      <div className={styles.discovery}>
        <details className={styles.moods} open={activeMood !== "all"}>
          <summary><span>{text(locale, "Find your kind of company", "Trova la compagnia che fa per te")}</span><span className={styles.moodSummary}>{selectedMood ? tagName(selectedMood.name, locale) : text(locale, "Browse by personality", "Esplora per personalità")} <span aria-hidden="true">+</span></span></summary>
          <nav className={styles.moodChips} aria-label={text(locale, "Choose a personality", "Scegli una personalità")}>
            <Link href={galleryUrl({ mood: "all" })} prefetch={false} aria-current={activeMood === "all" ? "true" : undefined}>{text(locale, "Every personality", "Tutte le personalità")} <span>{collectionProducts.length}</span></Link>
            {CATALOG_MOODS.map(({ id, name }) => <Link key={id} href={galleryUrl({ mood: id })} prefetch={false} aria-current={activeMood === id ? "true" : undefined}>{tagName(name, locale)} <span>{collectionProducts.filter((product) => product.tags.includes(name)).length}</span></Link>)}
          </nav>
        </details>
        {hasFilters && <div className={styles.filterNote}>
          <p>{selectedCategory ? <>{text(locale, "A particular shape:", "Una forma particolare:")} <span>{selectedCategory.name}</span>. <Link href={galleryUrl({ category: "all" })} prefetch={false}>{text(locale, "Show every shape", "Mostra tutte le forme")}</Link></> : text(locale, "A little collection, just your kind.", "Una piccola collezione che ti somiglia.")}</p>
          <Link href={localePath("/shop#collection", locale)} prefetch={false} className={styles.clearFilters}>{text(locale, "See all little loves", "Scopri tutte le piccole meraviglie")} ↗</Link>
        </div>}
      </div>

      {visibleProducts.length ? <div className={styles.grid}>
        {visibleProducts.map((product, index) => <ProductCard key={product.id} product={product} locale={locale} priority={index === 0} />)}
      </div> : <div className={styles.empty}>
        <SleepingCat />
        <h2>{text(locale, "This little corner is having a catnap.", "Questo piccolo angolo si concede un pisolino.")}</h2>
        <p>{text(locale, "There isn’t a match for this combination just yet. A different kind of company might be waiting nearby.", "Non abbiamo ancora una creazione per questa combinazione. Un’altra piccola compagnia potrebbe aspettarti qui vicino.")}</p>
        <Link href={localePath("/shop#collection", locale)} prefetch={false}>{text(locale, "Meet all the little loves", "Conosci tutte le piccole meraviglie")} <span aria-hidden="true">↗</span></Link>
      </div>}

      {pageCount > 1 && <nav className={styles.pagination} aria-label={text(locale, "Collection pages", "Pagine della collezione")}>
        {currentPage > 1 ? <Link href={galleryUrl({ page: currentPage - 1 })} prefetch={false} className={styles.pageDirection}>← {text(locale, "Previous", "Precedente")}</Link> : <span className={styles.pageDirection} aria-disabled="true">← {text(locale, "Previous", "Precedente")}</span>}
        <ol className={styles.pageNumbers}>
          {pagination.map((number, index) => <li key={number ?? `gap-${index}`}>{number === null ? <span className={styles.ellipsis} aria-hidden="true">…</span> : <Link href={galleryUrl({ page: number })} prefetch={false} aria-label={text(locale, `Page ${number}`, `Pagina ${number}`)} aria-current={number === currentPage ? "page" : undefined}>{number}</Link>}</li>)}
        </ol>
        {currentPage < pageCount ? <Link href={galleryUrl({ page: currentPage + 1 })} prefetch={false} className={styles.pageDirection}>{text(locale, "Next", "Successiva")} →</Link> : <span className={styles.pageDirection} aria-disabled="true">{text(locale, "Next", "Successiva")} →</span>}
      </nav>}
      <p className={styles.endnote}><span aria-hidden="true">✳</span> {text(locale, "Little companions. Considerable character.", "Piccole compagnie. Grande personalità.")} <span aria-hidden="true">✳</span></p>
    </section>
  );
}

export default function ShopGallery(props: GalleryProps) {
  return <ShopGalleryView {...props} />;
}
