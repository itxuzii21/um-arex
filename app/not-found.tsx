"use client";

import { BackLink, PageIntroHeader } from "./components/PageBlocks";
import { useStore } from "./data/StoreProvider";
import { PAGE_CARD_SIZE_CLASSES, normalizePageLayout } from "./data/pageLayout";

export default function NotFound() {
  const { settings } = useStore();
  const content = settings.pages.notFound;
  const layout = normalizePageLayout("notFound", settings.pageLayouts.notFound);
  const sectionStyle = (id: string) => ({ order: layout.sectionOrder.indexOf(id) });

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-green-dark text-brand-cream">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-40 text-center">
        <div id="not-found-intro" style={sectionStyle("not-found-intro")} className={PAGE_CARD_SIZE_CLASSES.notFoundPanel[layout.cardSizes.notFoundPanel]}>
          <PageIntroHeader
            content={content}
            className="[&_h1]:uppercase [&_h1]:tracking-widest [&_h1]:text-brand-gold [&_h1]:drop-shadow-md [&_p]:text-xs [&_p]:uppercase [&_p]:tracking-[0.15em] [&_p]:text-brand-cream/70"
          />
        </div>
        <div id="not-found-back" style={sectionStyle("not-found-back")}>
          <BackLink label={content.backLabel} />
        </div>
      </div>
    </div>
  );
}
