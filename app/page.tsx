"use client";

import { Suspense, useMemo, useState, useEffect, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Search,
  MessageCircle,
  Star,
  Plus,
  Minus,
  Gem,
  Award,
  Clock,
} from "lucide-react";
import ProductCard from "./components/ProductCard";
import { useStore } from "./data/StoreProvider";
import { getCategories, productHref } from "./data/catalog";
import { useCurrency } from "./data/CurrencyProvider";
import LeatherBrandCard from "./components/LeatherBrandCard";
import Reveal from "./components/Reveal";
import ContentIcon from "./components/ContentIcon";
import {
  HOME_CARD_SIZE_CLASSES,
  HOME_CATEGORY_ICON_SIZE_CLASSES,
  HOME_PRODUCT_GRID_SIZE_CLASSES,
  normalizePageLayout,
} from "./data/pageLayout";

const HERO_THEME = {
  accent: "#c6a85b",
  glow: "rgba(17, 62, 46, 0.4)",
  deep: "#041a14",
};

function SearchParamsHandler({
  setSelectedCategory,
  categories,
}: {
  setSelectedCategory: (category: string) => void;
  categories: { name: string }[];
}) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && categories.some((cat) => cat.name === categoryParam)) {
      setSelectedCategory(categoryParam);
      const element = document.getElementById("collection");
      if (element) element.scrollIntoView({ behavior: "smooth" });
    } else {
      setSelectedCategory("Featured");
    }
  }, [searchParams, categories, setSelectedCategory]);
  return null;
}

function HomeContent() {
  const router = useRouter();
  const { products, settings } = useStore();
  const { formatPrice } = useCurrency();
  const content = settings.pages.home;
  const shared = settings.shared;
  const layout = normalizePageLayout("home", settings.pageLayouts.home);
  const sectionStyle = (id: string) => ({ order: layout.sectionOrder.indexOf(id) });
  const [selectedCategory, setSelectedCategory] = useState("Featured");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  const categories = useMemo(() => getCategories(products), [products]);

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setQuery("");
    const targetUrl = categoryName === "Featured" ? "/" : `/?category=${encodeURIComponent(categoryName)}`;
    router.push(targetUrl, { scroll: false });
    const element = document.getElementById("collection");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    content.orderMessage
  )}`;
  const conciergeUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    content.conciergeMessage
  )}`;

  const featuredProducts = useMemo(() => {
    const flagged = products.filter((p) => p.isFeatured);
    const rest = products.filter((p) => !p.isFeatured);
    return [...flagged, ...rest].slice(0, 8);
  }, [products]);

  const heroProducts = useMemo(() => featuredProducts.slice(0, 4), [featuredProducts]);
  const activeHeroIndex = heroProducts.length ? heroIndex % heroProducts.length : 0;
  const heroProduct = heroProducts[activeHeroIndex] ?? products[0];
  const heroTheme = HERO_THEME;
  const heroOrderUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    `${content.orderMessage}\n\n${heroProduct.name} — ${formatPrice(heroProduct.price)}`
  )}`;

  useEffect(() => {
    if (heroPaused || heroProducts.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setHeroIndex((index) => index + 1), 6500);
    return () => window.clearInterval(timer);
  }, [heroPaused, heroProducts.length]);

  const filteredProducts = useMemo(() => {
    let list =
      selectedCategory === "Featured"
        ? [...featuredProducts]
        : products.filter((p) => p.category === selectedCategory);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)));
    }
    return list;
  }, [selectedCategory, featuredProducts, products, query, sort]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-brand-green-dark font-sans text-brand-cream">
      <Suspense fallback={null}>
        <SearchParamsHandler setSelectedCategory={setSelectedCategory} categories={categories} />
      </Suspense>

      <section
        id="hero"
        className="relative z-10 isolate overflow-hidden bg-[var(--hero-deep)]"
        style={{
          ...sectionStyle("hero"),
          "--hero-accent": heroTheme.accent,
          "--hero-glow": heroTheme.glow,
          "--hero-deep": heroTheme.deep,
        } as CSSProperties}
        onPointerEnter={() => setHeroPaused(true)}
        onPointerLeave={() => setHeroPaused(false)}
        onTouchStart={() => setHeroPaused(true)}
      >
        <Image
          src={settings.heroImage}
          alt={content.heroImageAlt}
          fill
          sizes="100vw"
          className="pointer-events-none -z-20 scale-110 object-cover opacity-[0.07] blur-2xl"
        />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_64%_48%,var(--hero-glow),transparent_34%),linear-gradient(115deg,rgba(4,26,20,0.98),rgba(10,42,31,0.76)_48%,rgba(4,26,20,0.96))] transition-colors duration-1000" />
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="grain-overlay opacity-40" />

        <div className="relative mx-auto min-h-[920px] w-full max-w-[1600px] lg:min-h-[1020px] lg:pt-[880px] xl:min-h-[calc(100svh-104px)] xl:pt-0">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative z-20 px-5 pt-9 sm:px-8 lg:absolute lg:left-[5.5%] lg:top-[19%] lg:w-[43%] lg:px-0 lg:pt-0"
          >
            <div className="mb-5 flex items-center gap-3 text-[8px] font-semibold uppercase tracking-[0.3em] text-brand-cream/55 lg:mb-7">
              <span className="h-px w-8 bg-[var(--hero-accent)]" />
              {settings.heroTagline}
            </div>
            <h1 className="max-w-[680px] text-[clamp(3rem,12vw,5.8rem)] font-medium uppercase leading-[0.84] tracking-[-0.065em] text-brand-cream lg:text-[clamp(4.8rem,6.7vw,7.6rem)]">
              {settings.heroTitle1}
              <br />
              <span className="font-serif italic text-[var(--hero-accent)]">{settings.heroTitle2}</span>
              <br />
              {settings.heroTitle3}
            </h1>
            <p className="mt-6 max-w-[350px] text-[12px] font-light leading-6 text-brand-cream/55 lg:mt-8 lg:text-[13px] lg:leading-7">
              {settings.heroDescription}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-8">
              <a
                href="#collection"
                className="inline-flex h-11 items-center justify-center gap-3 rounded-full bg-[var(--hero-accent)] px-6 text-[9px] font-bold uppercase tracking-[0.18em] text-brand-green-dark transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
              >
                {settings.heroCta1Text}
                <ArrowRight size={14} />
              </a>
              <a
                href={conciergeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-cream/75 transition-colors hover:border-[var(--hero-accent)] hover:text-brand-cream"
              >
                <MessageCircle size={14} />
                {settings.heroCta2Text}
              </a>
            </div>
            <LeatherBrandCard className="mt-6 hidden w-[250px] lg:block [@media(max-width:1279px)]:hidden [@media(max-height:850px)]:hidden" />
          </motion.div>

          <div className="relative z-10 mx-auto h-[390px] w-full max-w-[780px] sm:h-[470px] lg:absolute lg:left-[34%] lg:top-[5%] lg:h-[88%] lg:max-w-none lg:w-[49%]">
            <div className="pointer-events-none absolute left-1/2 top-[43%] h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--hero-glow)] blur-[90px]" />
            <div className="pointer-events-none absolute left-1/2 top-[76%] h-10 w-[48%] -translate-x-1/2 rounded-[50%] bg-black/75 blur-2xl" />
            <AnimatePresence mode="wait">
              <motion.div
                key={heroProduct.id}
                initial={false}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute inset-x-[3%] bottom-[12%] top-[2%] sm:inset-x-[8%] lg:inset-x-0 lg:bottom-[9%] lg:top-0"
              >
                <Image
                  src={heroProduct.image}
                  alt={heroProduct.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 94vw, 48vw"
                  className="scale-[1.16] object-cover object-center drop-shadow-[0_45px_45px_rgba(0,0,0,0.7)] [mask-image:radial-gradient(ellipse_at_center,#000_38%,rgba(0,0,0,0.94)_58%,transparent_78%)]"
                />
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-brand-green-dark/70 p-1.5 backdrop-blur-xl lg:bottom-auto lg:left-0 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:flex-col lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              {heroProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3 lg:flex-row-reverse">
                  <span className={`hidden w-5 text-right font-mono text-[8px] tracking-widest lg:block ${activeHeroIndex === index ? "text-[var(--hero-accent)]" : "text-brand-cream/30"}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setHeroIndex(index);
                      setHeroPaused(true);
                    }}
                    aria-label={`${content.viewProductLabel.replace("{productName}", product.name)}`}
                    aria-pressed={activeHeroIndex === index}
                    className={`group relative h-[62px] w-[54px] shrink-0 overflow-hidden rounded-xl border transition-all duration-500 sm:h-[72px] sm:w-[62px] lg:h-[82px] lg:w-[68px] ${activeHeroIndex === index ? "border-[var(--hero-accent)] bg-[var(--hero-accent)]/10 shadow-[0_0_28px_var(--hero-glow)]" : "border-white/10 bg-white/[0.035] opacity-55 hover:opacity-100"}`}
                  >
                    <Image src={product.image} alt="" fill sizes="68px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <span className="absolute inset-0 bg-gradient-to-t from-brand-green-dark/65 to-transparent" />
                    {product.isNew && (
                      <span className="absolute left-1 top-1 rounded-full bg-[var(--hero-accent)] px-1.5 py-0.5 text-[5px] font-bold uppercase tracking-wider text-brand-green-dark">
                        {product.newBadgeText || content.newBadgeText}
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute bottom-24 left-[7%] hidden max-w-[240px] lg:block">
              <span className="mb-2 block text-[7px] font-bold uppercase tracking-[0.28em] text-[var(--hero-accent)]">{content.signatureLabel}</span>
              <p className="text-[10px] font-light leading-5 text-brand-cream/45">{settings.heroQuote}</p>
            </div>
          </div>

          <motion.aside
            key={`panel-${heroProduct.id}`}
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            className="relative z-30 px-5 pb-10 sm:px-8 lg:px-10 xl:absolute xl:right-[3.5%] xl:top-[20%] xl:w-[245px] xl:px-0 xl:pb-0"
            aria-live="polite"
          >
            <div className="border-t border-white/15 pt-5 xl:border-t-0 xl:pt-0">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-[8px] font-bold uppercase tracking-[0.28em] text-[var(--hero-accent)]">{heroProduct.category}</span>
                {(heroProduct.isNew || heroProduct.isBestSeller) && (
                  <span className="rounded-full border border-white/15 px-2.5 py-1 text-[6px] font-bold uppercase tracking-[0.2em] text-brand-cream/55">
                    {heroProduct.isNew ? heroProduct.newBadgeText || content.newBadgeText : heroProduct.offerBadgeText || content.offerBadgeText}
                  </span>
                )}
              </div>
              <h2 className="text-[25px] font-medium uppercase leading-[1.05] tracking-[-0.04em] text-brand-cream">{heroProduct.name}</h2>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-serif text-[22px] text-brand-cream">{formatPrice(heroProduct.price)}</span>
                {heroProduct.oldPrice && <span className="text-[10px] text-brand-cream/35 line-through">{formatPrice(heroProduct.oldPrice)}</span>}
              </div>
              <p className="mt-4 line-clamp-3 text-[11px] font-light leading-6 text-brand-cream/50">{heroProduct.description}</p>

              {heroProduct.specifications?.length ? (
                <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
                  {heroProduct.specifications.slice(0, 3).map((spec) => (
                    <div key={`${spec.label}-${spec.value}`} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="text-[7px] font-semibold uppercase tracking-[0.18em] text-brand-cream/35">{spec.label}</span>
                      <span className="text-right text-[9px] text-brand-cream/70">{spec.value}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 flex flex-col gap-2.5">
                <Link
                  href={productHref(heroProduct)}
                  className="group flex h-11 items-center justify-between rounded-full border border-[var(--hero-accent)]/60 px-5 text-[8px] font-bold uppercase tracking-[0.2em] text-brand-cream transition-all hover:bg-[var(--hero-accent)] hover:text-brand-green-dark"
                >
                  {content.viewPieceLabel}
                  <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <a
                  href={heroOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 items-center justify-center gap-2 rounded-full bg-brand-gold text-[8px] font-bold uppercase tracking-[0.18em] text-brand-green-dark transition-colors hover:bg-brand-gold-light"
                >
                  <MessageCircle size={13} />
                  {content.orderMessage.split(".")[0]}
                </a>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 xl:mt-6">
                {[
                  { value: `${products.length}+`, label: content.curatedPiecesLabel },
                  { value: `${categories.length}`, label: content.collectionsLabel },
                  { value: content.dispatchStatValue, label: content.dispatchLabel },
                ].map((stat) => (
                  <div key={stat.label}>
                    <span className="block font-serif text-lg text-brand-cream/85">{stat.value}</span>
                    <span className="mt-1 block text-[6px] uppercase leading-3 tracking-[0.14em] text-brand-cream/30">{stat.label}</span>
                  </div>
                ))}
              </div>
              <LeatherBrandCard className="mt-6 w-full max-w-[280px] xl:hidden" />
            </div>
          </motion.aside>

          <a href="#categories" className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1 text-[7px] font-bold uppercase tracking-[0.24em] text-brand-cream/35 transition-colors hover:text-[var(--hero-accent)] xl:flex">
            <span>{content.scrollLabel}</span>
            <ChevronDown size={13} className="animate-bounce" />
          </a>
        </div>
      </section>

      <section id="benefits" style={sectionStyle("benefits")} className="relative z-10 border-y border-white/[0.06] bg-white/[0.018] px-5 py-8 sm:px-8 md:px-12">
        <div className="mx-auto grid max-w-[1500px] grid-cols-2 gap-3 md:grid-cols-4">
          {content.benefits.map((item) => (
            <Reveal key={item.id} className={`flex flex-col items-start gap-3 rounded-2xl border border-white/[0.06] bg-brand-green-dark/15 lg:flex-row ${HOME_CARD_SIZE_CLASSES.benefits[layout.cardSizes.benefits]}`}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-gold/20 bg-brand-gold/[0.06] text-brand-gold">
                <ContentIcon name={item.icon} size={18} />
              </span>
              <div>
                <h3 className="font-serif text-sm text-brand-cream md:text-base">{item.title}</h3>
                <p className="mt-1 text-[10px] font-light leading-5 text-brand-cream-muted md:text-[11px]">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="categories" style={sectionStyle("categories")} className="relative z-10 scroll-mt-28 border-b border-white/[0.06] bg-brand-green-dark px-5 py-20 sm:px-8 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <Reveal className="mb-8">
            <span className="mb-3 block text-[9px] font-bold uppercase tracking-[0.28em] text-brand-gold">{settings.categorySectionTag}</span>
            <h2 className="text-3xl text-brand-cream md:text-4xl">{settings.categorySectionTitle}</h2>
          </Reveal>
          <div className="no-scrollbar flex snap-x snap-mandatory flex-row flex-nowrap items-stretch justify-start gap-3 overflow-x-auto px-1 py-2 md:flex-wrap">
            <button type="button" onClick={() => handleCategorySelect("Featured")} className={`group flex shrink-0 snap-center items-center rounded-2xl border text-left transition-all duration-300 ${HOME_CARD_SIZE_CLASSES.categories[layout.cardSizes.categories]} ${selectedCategory === "Featured" ? "border-brand-gold/60 bg-brand-gold/[0.09]" : "border-white/10 bg-white/[0.025] hover:border-brand-gold/35 hover:bg-white/[0.045]"}`}>
              <span className={`relative flex ${HOME_CATEGORY_ICON_SIZE_CLASSES[layout.cardSizes.categories]} items-center justify-center overflow-hidden rounded-xl border bg-brand-green-mid p-2.5 ${selectedCategory === "Featured" ? "border-brand-gold/40" : "border-white/10"}`}>
                <Image src={shared.logoUrl} alt={content.featuredLabel} fill sizes="56px" className="object-contain p-1 brightness-110" />
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-[0.16em] ${selectedCategory === "Featured" ? "text-brand-gold-light" : "text-brand-cream-muted group-hover:text-brand-gold"}`}>{content.featuredLabel}</span>
            </button>
            {categories.map((category) => (
              <button type="button" key={category.name} onClick={() => handleCategorySelect(category.name)} className={`group flex shrink-0 snap-center items-center rounded-2xl border text-left transition-all duration-300 ${HOME_CARD_SIZE_CLASSES.categories[layout.cardSizes.categories]} ${selectedCategory === category.name ? "border-brand-gold/60 bg-brand-gold/[0.09]" : "border-white/10 bg-white/[0.025] hover:border-brand-gold/35 hover:bg-white/[0.045]"}`}>
                <span className={`relative ${HOME_CATEGORY_ICON_SIZE_CLASSES[layout.cardSizes.categories]} overflow-hidden rounded-xl border bg-brand-green-mid ${selectedCategory === category.name ? "border-brand-gold/40" : "border-white/10"}`}>
                  <Image src={category.image} alt={category.name} fill sizes="56px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <span className="absolute inset-0 bg-brand-green-dark/15 transition-colors group-hover:bg-transparent" />
                </span>
                <span>
                  <span className={`block text-[10px] font-bold uppercase tracking-[0.16em] ${selectedCategory === category.name ? "text-brand-gold-light" : "text-brand-cream-muted group-hover:text-brand-gold"}`}>{category.name}</span>
                  <span className="mt-1 block text-[9px] text-brand-cream-muted/60">{category.count} {category.count === 1 ? content.pieceLabel : content.piecesLabel}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="collection" style={sectionStyle("collection")} className="relative z-10 scroll-mt-28 px-5 py-20 sm:px-8 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <Reveal className="mb-9 md:flex md:items-end md:justify-between md:gap-8">
            <div>
              <span className="mb-3 block text-[9px] font-bold uppercase tracking-[0.28em] text-brand-gold">{settings.collectionTag}</span>
              <h2 className="text-3xl text-brand-cream md:text-[2.75rem]">
                {selectedCategory === "Featured" ? settings.collectionTitleFeatured : `${selectedCategory} ${content.categoryCollectionSuffix}`}
              </h2>
            </div>
            <span className="mt-4 inline-flex w-fit rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-brand-cream-muted md:mt-0">
              {filteredProducts.length} {filteredProducts.length === 1 ? content.pieceLabel : content.piecesLabel}
            </span>
          </Reveal>

          <div className="mb-8 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-3 md:flex-row md:items-center">
            <div className="relative md:max-w-md md:flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/80" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={content.searchPlaceholder}
                className="w-full rounded-xl border border-white/10 bg-brand-green-dark/65 py-3.5 pl-11 pr-4 text-xs text-brand-cream placeholder:text-brand-cream-muted/55 transition-colors focus:border-brand-gold/60 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between gap-4 md:justify-end">
              <span className="pl-1 text-[11px] text-brand-cream-muted md:hidden">
                {filteredProducts.length} {filteredProducts.length === 1 ? content.pieceLabel : content.piecesLabel}
              </span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label={content.sortLabel}
                className="rounded-xl border border-white/10 bg-brand-green-dark px-4 py-3 text-[10px] font-medium uppercase tracking-[0.1em] text-brand-cream transition-colors focus:border-brand-gold/60 focus:outline-none"
              >
                <option value="featured">{content.sortFeaturedLabel}</option>
                <option value="price-asc">{content.sortPriceAscLabel}</option>
                <option value="price-desc">{content.sortPriceDescLabel}</option>
                <option value="name">{content.sortNameLabel}</option>
              </select>
            </div>
          </div>

          <motion.div
            key={selectedCategory + sort}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.215, 0.61, 0.355, 1] }}
            className={`grid gap-4 ${HOME_PRODUCT_GRID_SIZE_CLASSES[layout.cardSizes.products]}`}
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>

          {filteredProducts.length === 0 && (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] py-20 text-center">
              <p className="text-xl text-brand-cream">{content.emptyTitle}</p>
              <p className="mt-2 text-xs leading-6 text-brand-cream-muted">{content.emptyDescription}</p>
              <button type="button" onClick={() => setQuery("")} className="mt-6 rounded-full border border-brand-gold/40 px-7 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold transition-all hover:bg-brand-gold hover:text-brand-green-dark">
                {content.clearSearchLabel}
              </button>
            </div>
          )}
        </div>
      </section>

      <section id="story" style={sectionStyle("story")} className="relative z-10 scroll-mt-28 border-t border-white/[0.06] bg-white/[0.015] px-5 py-24 sm:px-8 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="order-2 lg:order-1 lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.8rem] border border-white/10 shadow-[0_35px_90px_-40px_rgba(0,0,0,0.9)]">
              <Image src={settings.storyImage} alt={content.storyImageAlt} fill sizes="(max-width: 1024px) 90vw, 450px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-green-dark/50 to-transparent" />
            </div>
          </Reveal>
          <div className="order-1 flex flex-col items-start lg:order-2 lg:col-span-7">
            <Reveal>
              <span className="mb-3 block text-[9px] font-bold uppercase tracking-[0.28em] text-brand-gold">{settings.storyTag}</span>
              <h2 className="mb-6 text-3xl leading-[1.02] tracking-[-0.045em] text-brand-cream md:text-6xl">
                {settings.storyTitle1} <br />
                <span className="gold-gradient-text font-light italic">{settings.storyTitle2}</span>
              </h2>
              <p className="mb-5 max-w-xl text-sm font-light leading-7 text-brand-cream-muted md:text-[15px]">{settings.storyParagraph1}</p>
              <p className="mb-8 max-w-xl text-sm font-light leading-7 text-brand-cream-muted md:text-[15px]">{settings.storyParagraph2}</p>
              <div className={`grid w-full grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-brand-green-mid/35 backdrop-blur-sm ${HOME_CARD_SIZE_CLASSES.storyStats[layout.cardSizes.storyStats]}`}>
                <div className="rounded-xl border border-brand-gold/10 bg-white/[0.025] p-4 sm:p-5">
                  <span className="mb-2 block font-serif text-3xl tracking-tight text-brand-gold-light sm:text-4xl">{settings.storyStat1Value}</span>
                  <span className="block max-w-[150px] text-[9px] uppercase leading-5 tracking-[0.14em] text-brand-cream-muted">{settings.storyStat1Label}</span>
                </div>
                <div className="rounded-xl border border-brand-gold/10 bg-white/[0.025] p-4 sm:p-5">
                  <span className="mb-2 block font-serif text-3xl tracking-tight text-brand-gold-light sm:text-4xl">{settings.storyStat2Value}</span>
                  <span className="block max-w-[170px] text-[9px] uppercase leading-5 tracking-[0.14em] text-brand-cream-muted">{settings.storyStat2Label}</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="specifications" style={sectionStyle("specifications")} className="relative z-10 border-t border-white/[0.06] px-5 py-24 sm:px-8 md:px-12 md:py-32">
        <div className="mx-auto max-w-[1500px]">
          <Reveal className="mb-14 text-center">
            <span className="mb-4 inline-flex rounded-full border border-brand-gold/15 bg-brand-gold/[0.05] px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-brand-gold">{settings.specsTag}</span>
            <h2 className="text-3xl tracking-[-0.04em] text-brand-cream md:text-5xl">{settings.specsTitle}</h2>
          </Reveal>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <div className="relative aspect-square overflow-hidden rounded-[1.8rem] border border-white/10 shadow-[0_35px_90px_-40px_rgba(0,0,0,0.9)]">
                <Image src={settings.bannerImage} alt={content.specsImageAlt} fill sizes="(max-width: 1024px) 90vw, 480px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-green-dark/65 via-transparent to-brand-green-dark/10" />
                <div className="absolute bottom-5 left-5 rounded-full border border-brand-gold/25 bg-brand-green-dark/75 px-4 py-2 text-[8px] uppercase tracking-[0.16em] text-brand-gold-light backdrop-blur-md">
                  {content.specsImageBadge}
                </div>
              </div>
            </Reveal>
            <div className="space-y-3 lg:col-span-7">
              {[
                { icon: <Clock size={19} />, title: settings.spec1Title, desc: settings.spec1Description },
                { icon: <Award size={19} />, title: settings.spec2Title, desc: settings.spec2Description },
                { icon: <Gem size={19} />, title: settings.spec3Title, desc: settings.spec3Description },
              ].map((spec, index) => (
                <Reveal key={spec.title} delay={index * 0.1} className={`flex items-start rounded-2xl border border-white/[0.07] bg-white/[0.025] transition-colors duration-500 hover:border-brand-gold/20 ${HOME_CARD_SIZE_CLASSES.specifications[layout.cardSizes.specifications]}`}>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-gold/20 bg-brand-gold/[0.06] text-brand-gold-light">
                    {spec.icon}
                  </span>
                  <div>
                    <h3 className="mb-2 text-lg tracking-tight text-brand-cream sm:text-xl">{spec.title}</h3>
                    <p className="text-[13px] font-light leading-7 text-brand-cream-muted">{spec.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" style={sectionStyle("testimonials")} className="relative z-10 border-t border-white/[0.06] bg-white/[0.018] px-5 py-24 sm:px-8 md:px-12 md:py-32">
        <div className="mx-auto max-w-[1500px]">
          <Reveal className="mb-12 text-center">
            <span className="mb-4 inline-flex rounded-full border border-brand-gold/15 bg-brand-gold/[0.05] px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-brand-gold">{content.testimonialsTag}</span>
            <h2 className="text-3xl tracking-[-0.04em] text-brand-cream md:text-5xl">{content.testimonialsTitle}</h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {content.testimonials.map((testimonial, index) => (
              <Reveal key={testimonial.id} delay={index * 0.12} className={`flex h-full flex-col rounded-2xl border border-white/[0.07] bg-brand-green-mid/35 transition-colors duration-500 hover:border-brand-gold/25 ${HOME_CARD_SIZE_CLASSES.testimonials[layout.cardSizes.testimonials]}`}>
                <div className="mb-6 flex gap-1 text-brand-gold" aria-label={content.ratingLabel}>
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Star key={star} size={13} fill="currentColor" />
                  ))}
                </div>
                <p className="mb-8 flex-1 font-serif text-lg leading-7 text-brand-cream-muted">“{testimonial.quote}”</p>
                <div className="border-t border-white/[0.07] pt-5">
                  <span className="block font-sans text-xs font-semibold text-brand-cream">{testimonial.name}</span>
                  <span className="mt-1.5 block text-[10px] text-brand-cream-muted">{testimonial.location} · {testimonial.piece}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="sisterBrand" style={sectionStyle("sisterBrand")} className="relative z-10 border-t border-white/[0.06] px-5 py-24 sm:px-8 md:px-12 md:py-32">
        <div className="mx-auto max-w-[1500px]">
          <Reveal>
            <div className="leather-sheen leather-surface relative overflow-hidden rounded-[1.8rem] border border-brand-tan/25 shadow-[0_35px_100px_-40px_rgba(0,0,0,0.95)]">
              <div className={`relative z-10 grid grid-cols-1 items-center gap-10 md:grid-cols-12 ${HOME_CARD_SIZE_CLASSES.sisterBrand[layout.cardSizes.sisterBrand]}`}>
                <div className="md:col-span-7">
                  <span className="mb-5 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.24em] text-brand-tan">
                    <span className="h-[1px] w-7 bg-brand-tan/60" /> {content.leatherTag}
                  </span>
                  <h2 className="mb-5 text-3xl leading-[1.02] tracking-[-0.045em] text-brand-cream md:text-6xl">
                    {content.leatherTitleLead} <span className="gold-gradient-text font-light italic">{content.leatherTitleAccent}</span>
                  </h2>
                  <p className="mb-8 max-w-lg text-[13px] font-light leading-7 text-brand-cream-muted md:text-sm">
                    {content.leatherDescription}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      href={shared.leatherUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gold-button inline-flex h-12 items-center justify-center gap-2.5 px-7 active:scale-[0.98]"
                    >
                      {content.leatherPrimaryCta} <ArrowUpRight size={14} />
                    </a>
                    <Link
                      href="/leather"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-brand-tan/40 px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-cream transition-all duration-500 hover:border-brand-gold hover:bg-brand-gold/5 active:scale-[0.98]"
                    >
                      {content.leatherSecondaryCta}
                    </Link>
                  </div>
                </div>
                <div className="flex justify-center md:col-span-5">
                  <Image src={shared.leatherLogoUrl} alt={content.leatherLogoAlt} width={420} height={140} className="h-auto w-full max-w-[320px] object-contain" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="contact" style={sectionStyle("contact")} className="relative z-10 scroll-mt-28 border-t border-white/[0.06] px-5 py-24 sm:px-8 md:px-12 md:py-32">
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal>
              <span className="mb-4 block text-[9px] font-bold uppercase tracking-[0.28em] text-brand-gold">{content.faqTag}</span>
              <h2 className="mb-8 text-3xl tracking-[-0.04em] text-brand-cream md:text-5xl">{content.faqTitle}</h2>
              <div className={`divide-y divide-white/[0.07] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] ${HOME_CARD_SIZE_CLASSES.faqs[layout.cardSizes.faqs]}`}>
                {content.faqs.map((faq, index) => (
                  <div key={faq.id}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left"
                      aria-expanded={openFaq === index}
                    >
                      <span className="font-serif text-base text-brand-cream md:text-lg">{faq.question}</span>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${openFaq === index ? "border-brand-gold/40 bg-brand-gold/10 text-brand-gold-light" : "border-white/10 text-brand-gold"}`}>{openFaq === index ? <Minus size={15} /> : <Plus size={15} />}</span>
                    </button>
                    <motion.div initial={false} animate={{ height: openFaq === index ? "auto" : 0, opacity: openFaq === index ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <p className="pb-6 pr-5 text-[13px] font-light leading-7 text-brand-cream-muted">{faq.answer}</p>
                    </motion.div>
                  </div>
                ))}
              </div>
              <Link href="/faq" className="mt-7 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold transition-colors hover:text-brand-gold-light">
                {content.faqViewAllLabel} <ArrowRight size={13} />
              </Link>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal delay={0.1}>
              <div className={`relative h-full overflow-hidden rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-brand-green-soft/80 to-brand-green-dark/60 text-center shadow-[0_35px_100px_-45px_rgba(0,0,0,0.95)] ${HOME_CARD_SIZE_CLASSES.contact[layout.cardSizes.contact]}`}>
                <div className="pointer-events-none absolute -bottom-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-gold/10 blur-[80px]" />
                <div className="relative z-10 flex h-full flex-col items-center justify-center">
                  <span className="mb-4 inline-flex rounded-full border border-brand-gold/20 bg-brand-gold/[0.06] px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-brand-gold-light">{settings.contactTag}</span>
                  <h2
                    aria-label={`${settings.contactTitle1} ${settings.contactTitle2}`}
                    className="mb-5 text-3xl leading-[1.02] tracking-[-0.045em] text-brand-cream md:text-5xl"
                  >
                    {settings.contactTitle1}{" "}
                    <span className="gold-gradient-text font-light italic">
                      {settings.contactTitle2}
                    </span>
                  </h2>
                  <p className="mb-8 max-w-md text-[13px] font-light leading-7 text-brand-cream-muted">{settings.contactDescription}</p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gold-button inline-flex h-12 items-center justify-center gap-2.5 px-8 shadow-xl shadow-black/10 hover:shadow-brand-gold/15 active:scale-[0.98]"
                  >
                    <MessageCircle size={15} /> {settings.contactCtaText}
                  </a>
                  <span className="mt-5 text-[10px] text-brand-cream-muted">{content.responseNote}</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-brand-green-dark">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-gold/20 border-t-brand-gold" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}