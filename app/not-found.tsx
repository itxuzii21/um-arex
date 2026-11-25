"use client";

import { BackLink, PageIntroHeader } from "./components/PageBlocks";
import { useStore } from "./data/StoreProvider";

export default function NotFound() {
  const { settings } = useStore();
  const content = settings.pages.notFound;

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-green-dark text-brand-cream">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-40 text-center">
        <PageIntroHeader
          content={content}
          className="[&_h1]:uppercase [&_h1]:tracking-widest [&_h1]:text-brand-gold [&_h1]:drop-shadow-md [&_p]:text-xs [&_p]:uppercase [&_p]:tracking-[0.15em] [&_p]:text-brand-cream/70"
        />
        <BackLink label={content.backLabel} />
      </div>
    </div>
  );
}
