"use client";

import Image from "next/image";
import Link from "next/link";
import ContentIcon from "../components/ContentIcon";
import { BackLink, ContentCards, PageIntroHeader } from "../components/PageBlocks";
import { useStore } from "../data/StoreProvider";

export default function AboutPage() {
  const { settings } = useStore();
  const content = settings.pages.about;

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-green-dark text-brand-cream">
      <div className="pointer-events-none absolute left-1/4 top-[20%] z-0 h-[500px] w-[500px] rounded-full bg-brand-green-glow/10 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-[20%] right-1/4 z-0 h-[400px] w-[400px] rounded-full bg-brand-gold/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 md:py-20">
        <BackLink label={content.backLabel} />

        <PageIntroHeader content={content} className="mb-16 md:mb-24" />

        <div className="mb-20 grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20 md:mb-32">
          <div className="order-2 lg:order-1">
            <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">{content.heritageTag}</span>
            <h2 className="mb-6 font-serif text-3xl leading-tight text-brand-cream md:text-4xl">
              {content.heritageTitleLead}{" "}
              {content.heritageTitleAccent ? <span className="font-light italic text-brand-gold">{content.heritageTitleAccent}</span> : null}
            </h2>
            <div className="space-y-4 text-sm font-light leading-relaxed text-brand-cream-muted md:text-base">
              {content.paragraphs.map((paragraph, index) => (
                <p key={`heritage-paragraph-${index}`}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-brand-gold/10 shadow-2xl">
              <Image
                src={content.image}
                alt={content.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 450px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-green-dark/40 to-transparent" />
            </div>
          </div>
        </div>

        <div className="mb-20 md:mb-32">
          <div className="mb-16 text-center">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">{content.commitmentTag}</span>
            <h2 className="font-serif text-3xl text-brand-cream md:text-4xl">{content.commitmentTitle}</h2>
          </div>

          <ContentCards
            items={content.values}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
          />
        </div>

        <div className="mb-20 md:mb-32">
          <div className="mb-16 text-center">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">{content.standardTag}</span>
            <h2 className="font-serif text-3xl text-brand-cream md:text-4xl">{content.standardTitle}</h2>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {content.standards.map((standard) => (
              <div key={standard.id} className="text-center md:text-left">
                <div className="mb-6 flex items-center justify-center gap-3 text-brand-gold md:justify-start">
                  <span className="h-px w-12 bg-brand-gold" />
                  <ContentIcon name={standard.icon} size={18} />
                </div>
                <h3 className="mb-3 font-serif text-lg uppercase tracking-wider text-brand-gold">{standard.title}</h3>
                <p className="text-xs font-light leading-relaxed text-brand-cream-muted">{standard.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-brand-gold/15 bg-gradient-to-br from-brand-green-mid/50 to-brand-green-dark p-8 text-center shadow-2xl md:p-16">
          <div className="pointer-events-none absolute -bottom-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-gold/5 blur-[80px]" />
          <div className="relative z-10">
            <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">{content.ctaTag}</span>
            <h2 className="mb-4 font-serif text-3xl leading-tight text-brand-cream md:text-4xl">{content.ctaTitle}</h2>
            <p className="mx-auto mb-8 max-w-xl text-xs font-light leading-relaxed text-brand-cream-muted md:text-sm">{content.ctaDescription}</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-brand-gold px-10 py-4 text-xs font-bold uppercase tracking-[0.25em] text-brand-green-dark shadow-xl transition-all duration-500 hover:bg-brand-gold-dark hover:shadow-brand-gold/10 active:scale-[0.97]"
            >
              {content.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
