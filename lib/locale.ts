export type Locale = "en" | "it";
export function isLocale(value: string): value is Locale { return value === "en" || value === "it"; }
export function asLocale(value: string): Locale { return value === "it" ? "it" : "en"; }
export function text(locale: Locale, english: string, italian: string) { return locale === "it" ? italian : english; }

export function localePath(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const stripped = href.replace(/^\/(?:en|it)(?=\/|[?#]|$)/, "") || "/";
  const bare = /^[?#]/.test(stripped) ? `/${stripped}` : stripped;
  if (locale === "en") return bare;
  return bare === "/" ? "/it" : bare.startsWith("/?") || bare.startsWith("/#") ? `/it${bare.slice(1)}` : `/it${bare}`;
}

export function pageAlternates(path: string, locale: Locale = "en") {
  return { canonical: localePath(path, locale), languages: { en: localePath(path, "en"), it: localePath(path, "it"), "x-default": localePath(path, "en") } };
}

const italianTags: Record<string, string> = {
  "Paintbox Purrs": "Fusa a colori", "Purr in One Hue": "Fusa in un solo colore",
  "Nap committee": "Comitato dei pisolini", "Little lookouts": "Piccoli curiosi",
  "Tiny mischief": "Piccole monellerie", "Quiet company": "Compagnia discreta",
  "Treasure keepers": "Custodi dei tesori", "Stretch club": "Club degli stiracchiamenti",
  "Cosy gatherings": "Coccole in compagnia", "Good-luck greeters": "Benvenuti portafortuna",
};
export function tagName(tag: string, locale: Locale) { return locale === "it" ? italianTags[tag] ?? tag : tag; }

const italianErrors: Record<string, string> = {
  "Let us know what to call you.": "Dicci come ti chiami.",
  "Please keep your name to 100 characters.": "Il nome può contenere al massimo 100 caratteri.",
  "Please keep your name under 100 characters.": "Il nome può contenere al massimo 100 caratteri.",
  "Add a complete email address, like you@example.com.": "Inserisci un indirizzo email completo, per esempio nome@esempio.it.",
  "Add a phone number with 7–15 digits, including your country code.": "Inserisci un numero di telefono da 7 a 15 cifre, incluso il prefisso internazionale.",
  "Choose what you’d like to chat about.": "Scegli di cosa vorresti parlare.",
  "Please keep the organization name to 150 characters.": "Il nome dell’organizzazione può contenere al massimo 150 caratteri.",
  "Add a little note so we know how to help.": "Scrivi un piccolo messaggio: ci aiuterà a capire come accompagnarti.",
  "Please keep your note to 3,000 characters.": "Il messaggio può contenere al massimo 3.000 caratteri.",
  "Tell us which country your pieces would travel to.": "Dicci in quale Paese arriveranno le tue creazioni.",
  "Please use a country name under 100 characters.": "Il nome del Paese può contenere al massimo 100 caratteri.",
  "Add your city or region so we can estimate delivery.": "Indica la città o la regione per aiutarci a stimare la spedizione.",
  "Please keep the city or region under 120 characters.": "La città o la regione può contenere al massimo 120 caratteri.",
  "Please keep the postal code under 32 characters.": "Il codice postale può contenere al massimo 32 caratteri.",
  "Please keep your note under 2,000 characters.": "Il messaggio può contenere al massimo 2.000 caratteri.",
  "Choose a valid calendar date.": "Scegli una data valida.",
  "Choose today or a future date. We’ll confirm what is possible.": "Scegli oggi o una data futura. Ti confermeremo cosa è possibile.",
  "Your browser couldn’t save this basket. Keep this tab open to retain your selections.": "Il browser non ha potuto salvare la selezione. Tieni aperta questa scheda per conservarla.",
};
export function translateError(message: string, locale: Locale) { return locale === "it" ? italianErrors[message] ?? message : message; }
