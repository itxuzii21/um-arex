"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
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
import { getCategories } from "./data/catalog";
import LeatherBrandCard from "./components/LeatherBrandCard";
import Reveal from "./components/Reveal";
import ContentIcon from "./components/ContentIcon";

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
  const content = settings.pages.home;
  const shared = settings.shared;
  const [selectedCategory, setSelectedCategory] = useState("Featured");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
    <div className="relative min-h-screen overflow-hidden bg-brand-green-dark font-sans text-brand-cream">
      <Suspense fallback={null}>
        <SearchParamsHandler setSelectedCategory={setSelectedCategory} categories={categories} />
      </Suspense>

      <div className="animate-glow-drift pointer-events-none absolute right-[8%] top-[4%] z-0 h-[620px] w-[620px] rounded-full bg-brand-gold/[0.09] blur-[190px]" />
      <div className="pointer-events-none absolute left-0 top-[55%] z-0 h-[420px] w-[420px] rounded-full bg-white/[0.025] blur-[150px]" />

      <section className="relative z-10 flex items-center px-5 pb-20 pt-10 sm:px-8 md:pb-24 lg:min-h-[calc(100vh-104px)] lg:px-12 lg:py-14">
        <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="z-20 flex flex-col items-start text-left lg:col-span-7">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}>
              <span className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-brand-gold/20 bg-brand-gold/[0.06] px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-brand-gold-light md:text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold shadow-[0_0_14px_rgba(229,138,85,0.7)]" />
                {settings.heroTagline}
              </span>
              <h1 className="mb-7 max-w-4xl text-[clamp(2.9rem,6.2vw,6.6rem)] leading-[0.9] tracking-[-0.06em] text-brand-cream">
                {settings.heroTitle1} <br />
                <span className="gold-gradient-text">{settings.heroTitle2}</span> <br />
                {settings.heroTitle3}
              </h1>
              <p className="mb-9 max-w-md text-sm font-light leading-7 text-brand-cream-muted md:text-base">
                {settings.heroDescription}
              </p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <a
                  href="#collection"
                  className="gold-button inline-flex h-13 items-center justify-center gap-3 px-8 shadow-[0_16px_40px_-18px_rgba(229,138,85,0.65)] hover:shadow-[0_20px_45px_-16px_rgba(229,138,85,0.75)] active:scale-[0.98]"
                >
                  {settings.heroCta1Text}
                  <ArrowRight size={15} />
                </a>
                <a
                  href={conciergeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-13 items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/[0.025] px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-cream transition-all duration-500 hover:border-brand-gold/60 hover:bg-brand-gold/[0.07] active:scale-[0.98]"
                >
                  <MessageCircle size={15} />
                  {settings.heroCta2Text}
                </a>
              </div>

              <div className="mt-9 grid w-full max-w-xl grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.025] p-4 backdrop-blur-sm sm:p-5">
                {[
                  { value: `${products.length}+`, label: content.curatedPiecesLabel },
                  { value: `${categories.length}`, label: content.collectionsLabel },
                  { value: content.dispatchStatValue, label: content.dispatchLabel },
                ].map((stat) => (
                  <div key={stat.label} className="border-l border-white/10 pl-3 first:border-l-0 first:pl-0 sm:pl-5">
                    <span className="block font-serif text-2xl text-brand-gold-light md:text-3xl">{stat.value}</span>
                    <span className="mt-1 block text-[8px] uppercase leading-4 tracking-[0.14em] text-brand-cream-muted sm:text-[9px]">{stat.label}</span>
                  </div>
                ))}
              </div>

              <LeatherBrandCard className="mt-6 max-w-[340px]" />
            </motion.div>
          </div>

          <div className="z-10 flex items-center justify-center lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative w-full max-w-[420px] lg:max-w-[480px]"
            >
              <div className="pointer-events-none absolute -inset-4 rounded-[2.4rem] border border-brand-gold/10 bg-brand-gold/[0.035]" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/15 bg-brand-green-mid shadow-[0_45px_120px_-45px_rgba(0,0,0,0.95)]">
                <Image
                  src={settings.heroImage}
                  alt={content.heroImageAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 480px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-black/55 p-5 backdrop-blur-xl sm:bottom-6 sm:left-6 sm:right-6">
                  <span className="mb-2 block text-[8px] font-bold uppercase tracking-[0.24em] text-brand-gold-light">{content.signatureLabel}</span>
                  <p className="text-[11px] font-light leading-6 text-brand-cream sm:text-xs">{settings.heroQuote}</p>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 hidden h-24 w-24 md:block">
                <div className="animate-spin-slow absolute inset-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    <defs>
                      <path id="sealCircle" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                    </defs>
                    <text className="fill-brand-gold text-[8.5px] uppercase tracking-[0.25em]">
                      <textPath href="#sealCircle">{content.sealText}</textPath>
                    </text>
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gem size={20} className="text-brand-gold" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <a href="#categories" className="absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1 text-[8px] font-bold uppercase tracking-[0.22em] text-brand-gold/70 transition-colors hover:text-brand-gold lg:flex">
          <span>{content.scrollLabel}</span>
          <ChevronDown size={14} className="animate-bounce" />
        </a>
      </section>

      <section className="relative z-10 border-y border-white/[0.06] bg-white/[0.018] px-5 py-8 sm:px-8 md:px-12">
        <div className="mx-auto grid max-w-[1500px] grid-cols-2 gap-3 md:grid-cols-4">
          {content.benefits.map((item) => (
            <Reveal key={item.id} className="flex flex-col items-start gap-3 rounded-2xl border border-white/[0.06] bg-black/10 p-4 lg:flex-row lg:p-5">
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

      <section id="categories" className="relative z-10 scroll-mt-28 border-b border-white/[0.06] bg-[#0c0c0f] px-5 py-20 sm:px-8 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <Reveal className="mb-8">
            <span className="mb-3 block text-[9px] font-bold uppercase tracking-[0.28em] text-brand-gold">{settings.categorySectionTag}</span>
            <h2 className="text-3xl text-brand-cream md:text-4xl">{settings.categorySectionTitle}</h2>
          </Reveal>
          <div className="no-scrollbar flex snap-x snap-mandatory flex-row flex-nowrap items-stretch justify-start gap-3 overflow-x-auto px-1 py-2 md:flex-wrap">
            <button type="button" onClick={() => handleCategorySelect("Featured")} className={`group flex shrink-0 snap-center items-center gap-3 rounded-2xl border p-2 pr-5 text-left transition-all duration-300 ${selectedCategory === "Featured" ? "border-brand-gold/60 bg-brand-gold/[0.09]" : "border-white/10 bg-white/[0.025] hover:border-brand-gold/35 hover:bg-white/[0.045]"}`}>
              <span className={`relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border bg-brand-green-mid p-2.5 ${selectedCategory === "Featured" ? "border-brand-gold/40" : "border-white/10"}`}>
                <Image src={shared.logoUrl} alt={content.featuredLabel} fill sizes="56px" className="object-contain p-1 brightness-110" />
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-[0.16em] ${selectedCategory === "Featured" ? "text-brand-gold-light" : "text-brand-cream-muted group-hover:text-brand-gold"}`}>{content.featuredLabel}</span>
            </button>
            {categories.map((category) => (
              <button type="button" key={category.name} onClick={() => handleCategorySelect(category.name)} className={`group flex shrink-0 snap-center items-center gap-3 rounded-2xl border p-2 pr-5 text-left transition-all duration-300 ${selectedCategory === category.name ? "border-brand-gold/60 bg-brand-gold/[0.09]" : "border-white/10 bg-white/[0.025] hover:border-brand-gold/35 hover:bg-white/[0.045]"}`}>
                <span className={`relative h-14 w-14 overflow-hidden rounded-xl border bg-brand-green-mid ${selectedCategory === category.name ? "border-brand-gold/40" : "border-white/10"}`}>
                  <Image src={category.image} alt={category.name} fill sizes="56px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <span className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
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

      <section id="collection" className="relative z-10 scroll-mt-28 px-5 py-20 sm:px-8 md:px-12 md:py-24">
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
                className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-xs text-brand-cream placeholder:text-brand-cream-muted/55 transition-colors focus:border-brand-gold/60 focus:outline-none"
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.215, 0.61, 0.355, 1] }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4"
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

      <section id="story" className="relative z-10 scroll-mt-28 border-t border-white/[0.06] bg-white/[0.015] px-5 py-24 sm:px-8 md:px-12 md:py-32 lg:px-20">
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
              <div className="grid w-full grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-black/15 p-4 backdrop-blur-sm sm:p-5">
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

      <section className="relative z-10 border-t border-white/[0.06] px-5 py-24 sm:px-8 md:px-12 md:py-32">
        <div className="mx-auto max-w-[1500px]">
          <Reveal className="mb-14 text-center">
            <span className="mb-4 inline-flex rounded-full border border-brand-gold/15 bg-brand-gold/[0.05] px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-brand-gold">{settings.specsTag}</span>
            <h2 className="text-3xl tracking-[-0.04em] text-brand-cream md:text-5xl">{settings.specsTitle}</h2>
          </Reveal>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <div className="relative aspect-square overflow-hidden rounded-[1.8rem] border border-white/10 shadow-[0_35px_90px_-40px_rgba(0,0,0,0.9)]">
                <Image src={settings.bannerImage} alt={content.specsImageAlt} fill sizes="(max-width: 1024px) 90vw, 480px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/5" />
                <div className="absolute bottom-5 left-5 rounded-full border border-brand-gold/25 bg-black/65 px-4 py-2 text-[8px] uppercase tracking-[0.16em] text-brand-gold-light backdrop-blur-md">
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
                <Reveal key={spec.title} delay={index * 0.1} className="flex items-start gap-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-colors duration-500 hover:border-brand-gold/20 sm:p-6">
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

      <section className="relative z-10 border-t border-white/[0.06] bg-white/[0.018] px-5 py-24 sm:px-8 md:px-12 md:py-32">
        <div className="mx-auto max-w-[1500px]">
          <Reveal className="mb-12 text-center">
            <span className="mb-4 inline-flex rounded-full border border-brand-gold/15 bg-brand-gold/[0.05] px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-brand-gold">{content.testimonialsTag}</span>
            <h2 className="text-3xl tracking-[-0.04em] text-brand-cream md:text-5xl">{content.testimonialsTitle}</h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {content.testimonials.map((testimonial, index) => (
              <Reveal key={testimonial.id} delay={index * 0.12} className="flex h-full flex-col rounded-2xl border border-white/[0.07] bg-black/15 p-6 transition-colors duration-500 hover:border-brand-gold/25 sm:p-7">
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

      <section className="relative z-10 border-t border-white/[0.06] px-5 py-24 sm:px-8 md:px-12 md:py-32">
        <div className="mx-auto max-w-[1500px]">
          <Reveal>
            <div className="leather-sheen leather-surface relative overflow-hidden rounded-[1.8rem] border border-brand-tan/25 shadow-[0_35px_100px_-40px_rgba(0,0,0,0.95)]">
              <div className="relative z-10 grid grid-cols-1 items-center gap-10 p-7 sm:p-9 md:grid-cols-12 md:p-12 lg:p-16">
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

      <section id="contact" className="relative z-10 scroll-mt-28 border-t border-white/[0.06] px-5 py-24 sm:px-8 md:px-12 md:py-32">
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal>
              <span className="mb-4 block text-[9px] font-bold uppercase tracking-[0.28em] text-brand-gold">{content.faqTag}</span>
              <h2 className="mb-8 text-3xl tracking-[-0.04em] text-brand-cream md:text-5xl">{content.faqTitle}</h2>
              <div className="divide-y divide-white/[0.07] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 sm:px-6">
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
              <div className="relative h-full min-h-[480px] overflow-hidden rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-brand-green-soft/80 to-black/40 p-7 text-center shadow-[0_35px_100px_-45px_rgba(0,0,0,0.95)] sm:p-10">
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