import Link from "next/link";
import { localePath, text, type Locale } from "@/lib/locale";
import { CatSeal, SleepingCat, Sparkle } from "./StudioMarks";
import { navigationLinks } from "./navigation";
import styles from "./Footer.module.css";

export default function Footer({ locale = "en" }: { locale?: Locale }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.invitation}>
          <div>
            <p className={styles.eyebrow}><Sparkle /> {text(locale, "FROM OUR LITTLE CORNER TO YOURS", "DAL NOSTRO PICCOLO ANGOLO AL TUO")}</p>
            <h2>{text(locale, "Made with care.", "Creato con cura.")}<br /><em>{text(locale, "Kept with love.", "Custodito con amore.")}</em></h2>
          </div>
          <div className={styles.catCorner}>
            <span className={styles.catCaption}>{text(locale, "quality control is on a break", "il controllo qualità si concede una pausa")}</span>
            <SleepingCat className={styles.sleepingCat} />
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.studio}>
            <Link href={localePath("/", locale)} className={styles.brand}><CatSeal /><span>CattoCraft</span></Link>
            <p>{text(locale, "Small-batch art for cosy corners,", "Piccole serie d’arte per angoli accoglienti,")}<br className={styles.desktopBreak} /> {text(locale, "thoughtful gifts, and everyday delight.", "regali pensati con amore e sorrisi quotidiani.")}</p>
          </div>

          <nav className={styles.explore} aria-label={text(locale, "Footer navigation", "Navigazione a piè di pagina")}>
            <h3>{text(locale, "A LOOK AROUND", "GUARDATI INTORNO")}</h3>
            {navigationLinks.map(({ href, label }) => <Link key={href} href={localePath(href, locale)}>{text(locale, label, href === "/shop" ? "Collezione" : href === "/how-to-order" ? "Come ordinare" : "Scrivici")}</Link>)}
          </nav>

          <div className={styles.ordering}>
            <h3>{text(locale, "SOMETHING CATCH YOUR EYE?", "QUALCOSA TI HA CONQUISTATO?")}</h3>
            <p>{text(locale, "Gather your favourites and send an enquiry. We’ll take it from there, personally.", "Raccogli le tue preferite e inviaci una richiesta. Da lì, ti accompagneremo personalmente.")}</p>
            <Link href={localePath("/how-to-order", locale)} className={styles.orderLink}>{text(locale, "Here’s how it works", "Ecco come funziona")} <span aria-hidden="true">↗</span></Link>
            <span className={styles.paymentNote}>{text(locale, "Personal attention. A quote prepared just for you.", "Attenzione personale. Un preventivo pensato per te.")}</span>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} CattoCraft.</span>
          <span className={styles.signoff}>{text(locale, "Made with care. Approved with a purr.", "Creato con cura. Approvato con le fusa.")}<Sparkle /></span>
          <a href="#top" className={styles.backToTop}>{text(locale, "Back to the top", "Torna all’inizio")} <span aria-hidden="true">↑</span></a>
        </div>
      </div>
    </footer>
  );
}
