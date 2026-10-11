import type { Metadata } from "next";
import Link from "next/link";
import { BasketIcon, CatSeal, EnvelopeCat, PawPrint, SleepingCat, Sparkle } from "@/components/StudioMarks";
import { asLocale, text, localePath, pageAlternates, type Locale } from "@/lib/locale";
import styles from "./page.module.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = asLocale((await params).locale);
  return {
    title: text(locale, "How to Order | A Personal Studio Experience | CattoCraft", "Come ordinare | Un'esperienza su misura | CattoCraft"),
    description: text(locale, "Choose your favourite art, speak with our team, and receive a quote tailored to you. Worldwide delivery and personal pricing for individual, bulk, school, and hospital orders.", "Scegli i tuoi pezzi preferiti, parla con il nostro team e ricevi un preventivo su misura. Spedizioni in tutto il mondo e prezzi dedicati a privati, ordini in quantità, scuole e ospedali."),
    alternates: pageAlternates("/how-to-order", locale),
  };
}

function getChapters(locale: Locale) {
  const t = (en: string, it: string) => text(locale, en, it);
  return [
    { id: "choose", number: "01", name: t("A little collection", "Una piccola collezione"), detail: t("Choose & enquire", "Scegli e scrivici") },
    { id: "conversation", number: "02", name: t("A real conversation", "Una vera conversazione"), detail: t("Personal guidance", "Un consiglio dedicato") },
    { id: "delivery", number: "03", name: t("A world of possibilities", "Un mondo di possibilità"), detail: t("Global & organizational orders", "Ordini in tutto il mondo e per organizzazioni") },
    { id: "pricing", number: "04", name: t("A thoughtful quote", "Un preventivo curato"), detail: t("Pricing around your needs", "Prezzi pensati per le tue esigenze") },
  ];
}

function getQuestions(locale: Locale) {
  const t = (en: string, it: string) => text(locale, en, it);
  return [
  {
    question: t("What should I include in my enquiry?", "Cosa devo includere nella richiesta?"),
    answer: t("Start with the pieces and finishes you love, then share your delivery country and city, preferred timing, and any questions. For an organizational order, add your organization’s name, total quantities, and the budget you would like us to work with. Those little details help us prepare a useful, personal quote.", "Parti dai pezzi e dalle finiture che ami, poi indicaci il Paese e la città di consegna, le tempistiche desiderate e le tue domande. Per un ordine destinato a un'organizzazione, aggiungi il nome, le quantità totali e il budget a cui vorresti attenerti. Questi piccoli dettagli ci aiutano a preparare un preventivo davvero utile e su misura."),
  },
  {
    question: t("How do I request a larger quantity than the cart allows?", "Come richiedo più pezzi di quanti ne consente il carrello?"),
    answer: t("Add the pieces you’re interested in to your collection, then write the total quantity you need for each piece in the enquiry notes. Our team will discuss the full order with you and prepare pricing for those quantities. Schools, hospitals, and organizations are very welcome to tell us about a whole project.", "Aggiungi alla collezione i pezzi che ti interessano, poi scrivi nelle note della richiesta la quantità totale desiderata per ciascuno. Il nostro team discuterà con te l'intero ordine e preparerà i prezzi per quelle quantità. Scuole, ospedali e organizzazioni sono i benvenuti: raccontateci pure il vostro progetto completo."),
  },
  {
    question: t("Can we talk through the details by phone?", "Possiamo parlare dei dettagli al telefono?"),
    answer: t("Of course. Include your phone number and country code in the optional phone field, and let us know a convenient time and your time zone in the notes. Our team will follow up personally by email and can call to discuss the pieces, availability, and pricing together.", "Certamente. Inserisci il numero con prefisso internazionale nel campo facoltativo dedicato al telefono e indicaci nelle note un orario comodo e il tuo fuso orario. Ti risponderemo personalmente via email e potremo chiamarti per parlare insieme dei pezzi, della disponibilità e dei prezzi."),
  },
  {
    question: t("How are delivery and final pricing arranged?", "Come definiamo consegna e prezzo finale?"),
    answer: t("We ship globally and review the delivery destination, quantities, and product details with each enquiry. Your team will explain the available delivery arrangements, confirm current availability, and finalize your tailored pricing with you before arranging the order.", "Spediamo in tutto il mondo e valutiamo destinazione, quantità e dettagli dei prodotti per ogni richiesta. Il nostro team ti illustrerà le possibilità di consegna, confermerà la disponibilità e definirà con te il prezzo su misura prima di organizzare l'ordine."),
  },
  ];
}

function WorldMark() {
  return <svg viewBox="0 0 300 240" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="150" cy="115" r="80" />
    <ellipse cx="150" cy="115" rx="34" ry="80" />
    <path d="M150 35v160M70 115h160M82 74c35 19 101 19 136 0M82 157c35-19 101-19 136 0" />
    <path d="M80 174c-49 14-64-2-31-27m198-62c57-17 61 10 3 47-31 20-72 38-111 49" strokeDasharray="4 6" />
    <path d="m238 71 24 4-15 18-1-12-8-10Zm8 10 16-6" fill="var(--color-warm-ivory)" />
    <path d="m38 58 2-8 2 8 8 2-8 2-2 8-2-8-8-2 8-2Zm224 122 2-8 2 8 8 2-8 2-2 8-2-8-8-2 8-2Z" />
    <path d="M145 115c-4-10-17-5-15 3 1 5 8 9 15 14 7-5 14-9 15-14 2-8-11-13-15-3Z" fill="var(--color-deep-terracotta)" stroke="var(--color-deep-terracotta)" />
    <path d="M100 222c29-3 70-3 100 0" opacity=".4" />
  </svg>;
}

export default async function HowToOrderPage({ params }: Props) {
  const locale = asLocale((await params).locale);
  const t = (en: string, it: string) => text(locale, en, it);
  const chapters = getChapters(locale);
  const questions = getQuestions(locale);
  return <div className={styles.page}>
    <nav className={styles.breadcrumb} aria-label={t("Breadcrumb", "Percorso di navigazione")}><Link href={localePath("/", locale)}>{t("Home", "Home")}</Link><span aria-hidden="true">/</span><span aria-current="page">{t("How to order", "Come ordinare")}</span></nav>

    <header className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}><span /> {t("THE ART OF ORDERING, PERSONALLY", "L'ARTE DI ORDINARE, CON CURA")}</p>
        <h1>{t("A little hello.", "Un piccolo saluto.")}<br /><em>{t("A lovely beginning.", "Un bellissimo inizio.")}</em></h1>
        <p className={styles.heroDescription}>{t("A piece for your favourite corner. A collection for a whole community. Every order begins the same way—with a conversation, and our full attention.", "Un pezzo per il tuo angolo preferito. Una collezione per un'intera comunità. Ogni ordine inizia allo stesso modo: con una conversazione e tutta la nostra attenzione.")}</p>
        <a href="#choose" className={styles.discover}>{t("Let’s walk you through it", "Ti accompagniamo passo dopo passo")} <span aria-hidden="true">↓</span></a>
      </div>
      <aside className={styles.correspondence} aria-label={t("A note from the studio", "Un biglietto dallo studio")}>
        <div className={styles.letterBack} aria-hidden="true" />
        <div className={styles.letter}>
          <div className={styles.letterTop}><span>{t("STUDIO CORRESPONDENCE", "LA POSTA DELLO STUDIO")}<br /><b>{t("A PERSONAL INVITATION", "UN INVITO PER TE")}</b></span><span className={styles.postage}><CatSeal /><small>{t("WITH CARE", "CON CURA")}</small></span></div>
          <EnvelopeCat className={styles.letterCat} />
          <p>{t("Dear fellow lover", "A te che ami")}<br />{t("of", "le")} <em>{t("little things,", "piccole cose,")}</em></p>
          <span className={styles.letterSignoff}>{t("we’d love to hear what you have in mind.", "ci piacerebbe sapere cosa hai in mente.")}</span>
        </div>
        <span className={styles.letterAnnotation}>{t("good things begin with a little note", "le cose belle iniziano con un biglietto")} <PawPrint /></span>
      </aside>
    </header>

    <nav className={styles.chapterNav} aria-label={t("Explore the ordering process", "Scopri come ordinare")}>
      {chapters.map((chapter) => <a key={chapter.id} href={`#${chapter.id}`}><span className={styles.chapterNumber}>{chapter.number}</span><span><b>{chapter.name}</b><small>{chapter.detail}</small></span><span className={styles.chapterArrow} aria-hidden="true">↘</span></a>)}
    </nav>

    <ol className={styles.journey} role="list" aria-label={t("Our four-part ordering process", "I quattro passi per ordinare")}>
      <li id="choose" className={styles.step}>
        <span className={styles.stepNumber} aria-hidden="true">01<span>{t("THE SPARK", "LA SCINTILLA")}</span></span>
        <div className={styles.stepCopy}>
          <p className={styles.eyebrow}>{t("CHOOSE THE PIECES THAT FEEL LIKE YOU", "SCEGLI I PEZZI CHE TI SOMIGLIANO")}</p>
          <h2><span className={styles.srOnly}>{t("Step 1: ", "Passo 1: ")}</span>{t("Follow that", "Segui quella")}<br /><em>{t("little spark.", "piccola scintilla.")}</em></h2>
          <p>{t("Take your time with the collection. Meet the sleepy companions, the curious characters, and the pieces that make you pause for a second look.", "Prenditi il tuo tempo nella collezione. Incontra i compagni assonnati, i personaggi curiosi e quei pezzi che ti invitano a guardarli ancora una volta.")}</p>
          <p>{t("Add your favourites to your collection, choose the details you love, and send us an enquiry. Tell us what you have in mind—a gift, a corner of your home, or something rather bigger. That’s our cue to give it personal attention.", "Aggiungi i preferiti alla tua collezione, scegli i dettagli che ami e inviaci una richiesta. Raccontaci cosa hai in mente: un regalo, un angolo di casa o qualcosa di più grande. Da qui iniziamo a prendercene cura insieme a te.")}</p>
          <Link href={localePath("/shop", locale)} className={styles.textLink}>{t("Explore the collection", "Esplora la collezione")} <span aria-hidden="true">↗</span></Link>
        </div>
        <div className={styles.collectionArt} aria-hidden="true">
          <div className={styles.collectionArch}><BasketIcon /><span>{t("lovely things,", "piccole bellezze,")}<br /><em>{t("gathered by you.", "raccolte da te.")}</em></span><Sparkle /></div>
          <p>{t("THE BEGINNING OF YOUR LITTLE COLLECTION", "L'INIZIO DELLA TUA PICCOLA COLLEZIONE")}</p>
        </div>
      </li>

      <li id="conversation" className={`${styles.step} ${styles.conversation}`}>
        <span className={styles.stepNumber} aria-hidden="true">02<span>{t("THE HELLO", "IL SALUTO")}</span></span>
        <div className={styles.stepCopy}>
          <p className={styles.eyebrow}>{t("A REAL PERSON, ON THE OTHER END", "DALL'ALTRA PARTE, UNA PERSONA VERA")}</p>
          <h2><span className={styles.srOnly}>{t("Step 2: ", "Passo 2: ")}</span>{t("Let’s get to know", "Conosciamo insieme")}<br /><em>{t("your lovely idea.", "la tua bella idea.")}</em></h2>
          <p>{t("Our team will get back to you personally by email and, when you share a phone number, by phone. You’ll have someone to talk to about the pieces, the possibilities, and all those thoughtful little details.", "Il nostro team ti risponderà personalmente via email e, se ci lasci un numero, anche per telefono. Avrai qualcuno con cui parlare dei pezzi, delle possibilità e di tutti quei piccoli dettagli che contano.")}</p>
          <p>{t("Together, we’ll discuss your chosen products, check current availability, and finalize the pricing. From the first question to the agreed order, your collection gets the care and attention it deserves.", "Insieme parleremo dei prodotti scelti, verificheremo la disponibilità e definiremo il prezzo. Dalla prima domanda all'ordine concordato, la tua collezione riceverà tutta la cura e l'attenzione che merita.")}</p>
          <p className={styles.marginalNote}><PawPrint /> {t("The humans handle the details. The cat offers moral support.", "Gli umani curano i dettagli. Il gatto offre sostegno morale.")}</p>
        </div>
        <aside className={styles.conversationArt} aria-label={t("Our approach", "Il nostro approccio")}>
          <span className={styles.smallLabel}>{t("THE PERSONAL TOUCH", "UN TOCCO PERSONALE")}</span>
          <p>{t("Your ideas.", "Le tue idee.")}<br />{t("Our attention.", "La nostra attenzione.")}<br /><em>{t("Every lovely detail.", "Ogni piccolo dettaglio.")}</em></p>
          <span className={styles.inkLine} aria-hidden="true" />
          <CatSeal />
        </aside>
      </li>

      <li id="delivery" className={`${styles.step} ${styles.delivery}`}>
        <span className={styles.stepNumber} aria-hidden="true">03<span>{t("THE JOURNEY", "IL VIAGGIO")}</span></span>
        <div className={styles.stepCopy}>
          <p className={styles.eyebrow}>{t("A SMALL STUDIO. A WORLD OF POSSIBILITY.", "UN PICCOLO STUDIO. UN MONDO DI POSSIBILITÀ.")}</p>
          <h2><span className={styles.srOnly}>{t("Step 3: ", "Passo 3: ")}</span>{t("Little things.", "Piccole cose.")}<br /><em>{t("A wider world.", "Un mondo più grande.")}</em></h2>
          <p>{t("We ship globally, bringing a little studio warmth to homes and shared spaces around the world. Tell us where your collection is headed, and we’ll work through the delivery arrangements with you.", "Spediamo in tutto il mondo, portando il calore del nostro studio nelle case e negli spazi condivisi. Dicci dove è diretta la tua collezione: organizzeremo insieme a te tutti i dettagli della consegna.")}</p>
          <p>{t("We also regularly supply large organizations, schools, and hospitals. Whether you’re choosing a single piece or planning an order for a whole community, our team will give your project the same thoughtful, personal care.", "Lavoriamo regolarmente anche con grandi organizzazioni, scuole e ospedali. Che tu stia scegliendo un solo pezzo o preparando un ordine per un'intera comunità, il nostro team dedicherà al progetto la stessa cura personale.")}</p>
          <ul className={styles.destinations} aria-label={t("Who we work with", "Per chi lavoriamo")}><li>{t("Homes", "Case")}</li><li>{t("Organizations", "Organizzazioni")}</li><li>{t("Schools", "Scuole")}</li><li>{t("Hospitals", "Ospedali")}</li></ul>
        </div>
        <figure className={styles.worldArt}><WorldMark /><figcaption>{t("from our little corner,", "dal nostro piccolo angolo,")}<br /><em>{t("to wherever you are.", "ovunque tu sia.")}</em></figcaption></figure>
        <aside className={styles.projectNote}><Sparkle /><p><strong>{t("Planning for a group?", "Stai pensando a un ordine per un gruppo?")}</strong> {t("Include your organization, total quantities, destination, and preferred timing in the enquiry notes. We’ll take a personal look at the whole picture.", "Indica nelle note l'organizzazione, le quantità totali, la destinazione e le tempistiche desiderate. Valuteremo con cura l'intero progetto.")}</p></aside>
      </li>

      <li id="pricing" className={`${styles.step} ${styles.pricing}`}>
        <span className={styles.stepNumber} aria-hidden="true">04<span>{t("THE CONSIDERATION", "LA CURA")}</span></span>
        <div className={styles.stepCopy}>
          <p className={styles.eyebrow}>{t("THOUGHTFULLY MADE. THOUGHTFULLY PRICED.", "CREATI CON CURA. PREZZI PENSATI CON CURA.")}</p>
          <h2><span className={styles.srOnly}>{t("Step 4: ", "Passo 4: ")}</span>{t("A thoughtful quote.", "Un preventivo curato.")}<br /><em>{t("A very personal fit.", "Davvero su misura.")}</em></h2>
          <p>{t("Our clients come with different spaces, quantities, and budgets. We personally review and adjust the pricing for every enquiry, so your quote reflects the products and the scale of your particular order.", "Ogni cliente ha spazi, quantità e budget diversi. Valutiamo e adattiamo personalmente i prezzi per ogni richiesta, così il preventivo rispecchia i prodotti scelti e le dimensioni del tuo ordine.")}</p>
          <p>{t("That flexibility helps us offer the most affordable rates we can, especially for bulk and organizational orders. Share what you’re working towards, and we’ll work with you to make the numbers feel as considered as the art.", "Questa flessibilità ci aiuta a offrire le tariffe più accessibili possibili, soprattutto per ordini in quantità e per organizzazioni. Raccontaci il tuo obiettivo: cercheremo insieme prezzi curati quanto i nostri pezzi.")}</p>
        </div>
        <aside className={styles.quoteArt} aria-label={t("What shapes your personal quote", "Cosa guida il tuo preventivo su misura")}>
          <div className={styles.quoteHeader}><span>{t("FROM THE STUDIO DESK", "DALLA SCRIVANIA DELLO STUDIO")}</span><Sparkle /></div>
          <h3>{t("Made to fit", "Pensato per")}<br /><em>{t("your plans.", "i tuoi progetti.")}</em></h3>
          <ul><li><span>01</span> {t("Your chosen pieces", "I pezzi che hai scelto")}</li><li><span>02</span> {t("Your quantities", "Le tue quantità")}</li><li><span>03</span> {t("Your delivery needs", "Le esigenze di consegna")}</li><li><span>04</span> {t("Your budget & wishes", "Il tuo budget e i tuoi desideri")}</li></ul>
          <p>{t("Personally prepared, just for you.", "Preparato con cura, proprio per te.")}</p><CatSeal className={styles.quoteSeal} />
        </aside>
      </li>
    </ol>

    <section className={styles.questions} aria-labelledby="questions-heading">
      <div className={styles.questionsIntro}><p className={styles.eyebrow}>{t("A FEW HELPFUL LITTLE DETAILS", "QUALCHE PICCOLO DETTAGLIO UTILE")}</p><h2 id="questions-heading">{t("Curious?", "Hai curiosità?")}<br /><em>{t("Good company.", "Sei in buona compagnia.")}</em></h2><SleepingCat /><p>{t("We have a soft spot for questions.", "Abbiamo un debole per le domande.")}</p></div>
      <div className={styles.answers}>{questions.map(({ question, answer }) => <details key={question} className={styles.answer}><summary>{question}<span className={styles.plus} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
    </section>

    <section className={styles.invitation} aria-labelledby="invitation-heading">
      <p className={styles.eyebrow}><Sparkle /> {t("YOUR NEXT LITTLE BEGINNING", "IL TUO PROSSIMO PICCOLO INIZIO")}</p>
      <h2 id="invitation-heading">{t("Something lovely", "Qualcosa di bello")}<br /><em>{t("starts with you.", "inizia da te.")}</em></h2>
      <p>{t("Find the pieces you love. We’ll help with the rest.", "Trova i pezzi che ami. Al resto pensiamo insieme.")}</p>
      <div className={styles.invitationActions}><Link href={localePath("/shop", locale)} className={styles.primaryLink}>{t("Find your favourites", "Trova i tuoi preferiti")} <span aria-hidden="true">↗</span></Link><Link href={localePath("/enquiry", locale)} className={styles.textLink}>{t("Review your collection", "Rivedi la tua collezione")} <span aria-hidden="true">↗</span></Link></div>
      <span className={styles.signature}>{t("with care, the little studio", "con cura, il piccolo studio")} <PawPrint /></span>
    </section>
  </div>;
}
