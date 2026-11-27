"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, ArrowUpRight, Gem, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Reveal from "../components/Reveal";
import ContentIcon from "../components/ContentIcon";
import { useStore } from "../data/StoreProvider";
import { useCurrency } from "../data/CurrencyProvider";
import type { LeatherProduct } from "../data/content";
import { LEATHER_PRODUCT_GRID_SIZE_CLASSES, PAGE_CARD_SIZE_CLASSES, normalizePageLayout } from "../data/pageLayout";

interface LeatherRecord {
  id: string | number;
  name: string;
  category: string;
  collection_tag: string;
  price: number;
  image_url: string;
  image_urls: string[];
  description: string;
}

function leatherImage(p: LeatherProduct): string {
  return p.imageUrls.split(",")[0]?.trim() || p.imageUrl || "";
}

export default function LeatherPage() {
  const { settings } = useStore();
  const { formatPrice } = useCurrency();
  const content = settings.pages.leather;
  const shared = settings.shared;
  const layout = normalizePageLayout("leather", settings.pageLayouts.leather);
  const sectionStyle = (id: string) => ({ order: layout.sectionOrder.indexOf(id) });
  const [products, setProducts] = useState<LeatherProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const displayProducts = content.products.length ? content.products : products;

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(8);
        if (active && data) setProducts((data as LeatherRecord[]).map((item) => ({
          id: String(item.id),
          name: item.name,
          category: item.category,
          collectionTag: item.collection_tag || "",
          price: Number(item.price) || 0,
          imageUrl: item.image_url || "",
          imageUrls: Array.isArray(item.image_urls) ? item.image_urls.join(", ") : "",
          description: item.description || "",
        })));
      } catch {
        /* graceful — preview is optional */
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-brand-espresso text-brand-cream">
      {/* Ambient leather glows */}
      <div className="animate-glow-drift pointer-events-none absolute left-1/4 top-[15%] z-0 h-[500px] w-[500px] rounded-full bg-brand-leather-glow/20 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-[10%] right-1/4 z-0 h-[400px] w-[400px] rounded-full bg-brand-gold/5 blur-[130px]" />

      {/* Header */}
      <div className="relative z-20 border-b border-brand-tan/15 bg-brand-espresso/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-2 text-brand-cream-muted transition-colors hover:text-brand-gold">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] uppercase tracking-[0.2em]">{content.backLabel}</span>
          </Link>
          <Image src={content.logoUrl} alt={content.logoAlt} width={180} height={60} className="h-8 w-auto object-contain" />
          <a href={shared.leatherUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-brand-tan transition-colors hover:text-brand-gold-light">
            <span className="hidden text-[10px] uppercase tracking-[0.2em] sm:inline">{content.fullWebsiteLabel}</span>
            <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
          </a>
        </div>
      </div>

      {/* Hero */}
      <section id="leather-hero" style={sectionStyle("leather-hero")} className="relative z-10 flex min-h-[78vh] items-center justify-center px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}>
            <span className="mb-7 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-tan md:text-xs">
              <span className="h-[1px] w-8 bg-brand-tan/60" /> {content.heroTag} <span className="h-[1px] w-8 bg-brand-tan/60" />
            </span>
            <div className="mb-9 flex justify-center">
              <Image src={content.logoUrl} alt={content.logoAlt} width={520} height={172} priority className="h-auto w-full max-w-[440px] object-contain" />
            </div>
            <h1 className="mb-7 font-serif text-4xl leading-[1.1] tracking-tight text-brand-cream md:text-6xl">
              {content.titleLead} <span className="gold-gradient-text font-light italic">{content.titleAccent}</span>
            </h1>
            <p className="mx-auto mb-11 max-w-xl text-sm font-light leading-relaxed text-brand-cream-muted md:text-base">
              {content.description}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={shared.leatherUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="leather-sheen inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-gold px-10 py-4 text-xs font-bold uppercase tracking-[0.25em] text-brand-espresso shadow-xl transition-all duration-500 hover:bg-brand-gold-light hover:shadow-brand-gold/20 active:scale-97"
              >
                {content.primaryCta} <ArrowUpRight size={15} />
              </a>
              <a
                href="#preview"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-tan/40 px-10 py-4 text-xs font-bold uppercase tracking-[0.25em] text-brand-cream transition-all duration-500 hover:border-brand-gold hover:bg-brand-gold/5 active:scale-97"
              >
                {content.secondaryCta}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live collection preview from shared database */}
      <section id="preview" style={sectionStyle("leather-preview")} className="relative z-10 scroll-mt-24 border-t border-brand-tan/15 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14 text-center">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.4em] text-brand-tan">{content.previewTag}</span>
            <h2 className="text-3xl text-brand-cream md:text-4xl">{content.previewTitle}</h2>
            <p className="mx-auto mt-4 max-w-lg text-xs font-light leading-relaxed text-brand-cream-muted">
              {content.previewDescription}
            </p>
          </Reveal>

          {loading && !content.products.length ? (
            <div className={`grid ${LEATHER_PRODUCT_GRID_SIZE_CLASSES[layout.cardSizes.leatherProducts]}`}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-3xl border border-brand-tan/10 bg-brand-leather/30 p-4">
                  <div className="mb-4 aspect-[4/5] rounded-2xl bg-brand-leather-mid/50" />
                  <div className="mb-2 h-3 w-2/3 rounded bg-brand-leather-mid/50" />
                  <div className="h-3 w-1/3 rounded bg-brand-leather-mid/50" />
                </div>
              ))}
            </div>
          ) : displayProducts.length > 0 ? (
            <div className={`grid ${LEATHER_PRODUCT_GRID_SIZE_CLASSES[layout.cardSizes.leatherProducts]}`}>
              {displayProducts.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <a
                    href={`${shared.leatherUrl}/product?id=${encodeURIComponent(String(p.id))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover-lift group flex h-full flex-col rounded-3xl border border-brand-tan/15 bg-brand-leather/30 p-4 hover:border-brand-gold/40"
                  >
                    <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-2xl border border-brand-tan/10 bg-brand-leather-mid">
                      {leatherImage(p) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={leatherImage(p)} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-brand-tan/40"><Gem size={28} /></div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-brand-espresso/80 px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.2em] text-brand-tan backdrop-blur">{content.badgeText}</span>
                    </div>
                    <span className="mb-1 text-[8px] font-bold uppercase tracking-[0.25em] text-brand-tan">{p.collectionTag || content.fallbackTag}</span>
                    <h3 className="mb-3 line-clamp-2 flex-1 font-serif text-sm leading-snug text-brand-cream transition-colors group-hover:text-brand-gold-light">{p.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm text-brand-gold">{formatPrice(Number(p.price))}</span>
                      <ArrowUpRight size={15} className="text-brand-tan transition-all group-hover:text-brand-gold" />
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-brand-tan/15 bg-brand-leather/30 py-16 text-center">
              <p className="font-serif text-xl text-brand-cream">{content.emptyTitle}</p>
              <p className="mt-2 text-xs text-brand-cream-muted">{content.emptyDescription}</p>
            </div>
          )}

          <div className="mt-12 text-center">
            <a
              href={shared.leatherUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border border-brand-tan/40 px-9 py-3.5 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gold-light transition-all duration-500 hover:border-brand-gold hover:bg-brand-gold hover:text-brand-espresso active:scale-97"
            >
              {content.viewAllLabel} <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* Brand values */}
      <section id="leather-values" style={sectionStyle("leather-values")} className="relative z-10 border-t border-brand-tan/15 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-16 text-center">
            <h2 className="text-2xl text-brand-cream md:text-3xl">{content.standardTitle}</h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {content.values.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.12} className={`hover-lift rounded-3xl border border-brand-tan/15 bg-brand-leather/30 text-center hover:border-brand-gold/30 ${PAGE_CARD_SIZE_CLASSES.leatherValues[layout.cardSizes.leatherValues]}`}>
                <span className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-brand-tan/30 text-brand-gold-light"><ContentIcon name={item.icon} /></span>
                <h3 className="mb-3 font-serif text-base uppercase tracking-wider text-brand-gold-light">{item.title}</h3>
                <p className="text-xs font-light leading-relaxed text-brand-cream-muted">{item.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="leather-cta" style={sectionStyle("leather-cta")} className="relative z-10 border-t border-brand-tan/15 px-6 py-20 md:px-12">
        <div className={`mx-auto max-w-2xl text-center ${PAGE_CARD_SIZE_CLASSES.leatherCta[layout.cardSizes.leatherCta]}`}>
          <Reveal>
            <h2 className="mb-4 font-serif text-2xl text-brand-cream md:text-3xl">{content.ctaTitle}</h2>
            <p className="mb-9 text-xs font-light leading-relaxed text-brand-cream-muted md:text-sm">
              {content.ctaDescription}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={shared.leatherUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full bg-brand-gold px-10 py-4 text-xs font-bold uppercase tracking-[0.25em] text-brand-espresso shadow-xl transition-all duration-500 hover:bg-brand-gold-light active:scale-97"
              >
                {content.ctaLabel} <ArrowUpRight size={15} />
              </a>
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(content.whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-brand-tan/40 px-10 py-4 text-xs font-bold uppercase tracking-[0.25em] text-brand-cream transition-all duration-500 hover:border-brand-gold hover:bg-brand-gold/5 active:scale-97"
              >
                <MessageCircle size={15} /> {content.whatsappCta}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}