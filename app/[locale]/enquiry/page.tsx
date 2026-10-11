import type { Metadata } from "next";
import EnquiryExperience from "@/components/EnquiryExperience";
import { asLocale, text, pageAlternates } from "@/lib/locale";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = asLocale((await params).locale);
  return {
    title: text(locale, "Send an Enquiry | CattoCraft", "Invia una richiesta | CattoCraft"),
    description: text(locale, "Review your little collection and write to our studio about the pieces you love.", "Rivedi la tua piccola collezione e scrivi al nostro studio per i pezzi che ami."),
    alternates: pageAlternates("/enquiry", locale),
    robots: { index: false, follow: true },
  };
}

export default async function EnquiryPage({ params }: Props) {
  await params;
  return <EnquiryExperience />;
}
