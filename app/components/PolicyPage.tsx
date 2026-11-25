"use client";

import { useStore } from "../data/StoreProvider";
import { useCurrency } from "../data/CurrencyProvider";
import { resolveContentText } from "../data/content";
import { BackLink, ContentCards, PageIntroHeader, PolicySections } from "./PageBlocks";

export default function PolicyPage({ page }: { page: "privacy" | "terms" | "returns" }) {
  const { settings } = useStore();
  const { formatPkr } = useCurrency();
  const content = settings.pages[page];
  const resolve = (text: string) => resolveContentText(text, { deliveryCharge: formatPkr(settings.commerce.domesticDeliveryChargePkr) });
  const sections = content.sections.map((section) => ({
    ...section,
    paragraphs: section.paragraphs.map(resolve),
    bullets: section.bullets.map(resolve),
    numbered: section.numbered.map(resolve),
  }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-green-dark text-brand-cream">
      <div className="pointer-events-none absolute left-1/4 top-[15%] h-[500px] w-[500px] rounded-full bg-brand-green-glow/10 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-[10%] right-1/4 h-[400px] w-[400px] rounded-full bg-brand-gold/5 blur-[120px]" />
      <div className="relative z-10 mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-20">
        <BackLink label={content.backLabel} />
        <PageIntroHeader content={content} className="mb-12 md:mb-16" />
        <p className="mb-8 text-center text-[10px] uppercase tracking-[0.2em] text-brand-cream-muted">{content.lastUpdatedLabel} {content.lastUpdatedDate}</p>
        {page === "returns" && <ContentCards items={settings.pages.returns.highlights} className="mb-10 grid gap-4 sm:grid-cols-3" />}
        <PolicySections sections={sections} />
      </div>
    </div>
  );
}
