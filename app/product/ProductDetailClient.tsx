"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Clock,
  Sparkles,
  MessageCircle,
  ChevronRight as Crumb,
} from "lucide-react";
import { useStore } from "../data/StoreProvider";
import ProductCard from "../components/ProductCard";
import { useCurrency } from "../data/CurrencyProvider";
import { resolveContentText } from "../data/content";

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : dir < 0 ? "-100%" : 0, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : dir < 0 ? "100%" : 0, opacity: 0 }),
};

export default function ProductDetailClient({ productId }: { productId: string }) {
  const { products, settings, status } = useStore();
  const { formatPrice, formatAmount, formatPkr, isInternational, deliveryAvailable, country, currencyCode, convertPrice } = useCurrency();
  const page = settings.pages.product;
  const commerce = settings.commerce;
  const product = useMemo(() => products.find((p) => p.id === productId), [products, productId]);

  const related = useMemo(() => {
    if (!product) return [];
    return products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  }, [products, product]);

  const galleryImages = useMemo(
    () => (product?.gallery && product.gallery.length ? product.gallery : product ? [product.image] : []),
    [product]
  );

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [swipedDuringGesture, setSwipedDuringGesture] = useState(false);
  const [direction, setDirection] = useState(0);

  const displayImage = useMemo(
    () => (galleryImages.includes(selectedImage) ? selectedImage : galleryImages[0] || ""),
    [galleryImages, selectedImage]
  );

  const orderTemplate = isInternational && !deliveryAvailable
    ? page.internationalUnavailableMessage
    : commerce.deliveryQuoteRequired
      ? page.orderMessage
      : page.noDeliveryQuoteOrderMessage;
  const whatsappUrl = product
    ? `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
        resolveContentText(orderTemplate, {
          productName: product.name,
          price: formatPrice(product.price),
          currency: currencyCode,
        }) + `\n\nDelivery destination: ${country.name}` + (isInternational ? `\n${page.internationalPriceNote}` : "")
      )}`
    : "#";

  const openWhatsApp = useCallback(() => {
    if (typeof window !== "undefined" && product) {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  }, [whatsappUrl, product]);

  const paginate = useCallback(
    (newIndex: number, dir: number) => {
      setDirection(dir);
      setSelectedImage(galleryImages[newIndex]);
    },
    [galleryImages]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setSwipedDuringGesture(false);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || swipedDuringGesture) return;
    const diffX = touchStart.x - e.touches[0].clientX;
    const diffY = touchStart.y - e.touches[0].clientY;
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      const currentIndex = galleryImages.indexOf(displayImage);
      const nextIndex = diffX > 0 ? (currentIndex + 1) % galleryImages.length : (currentIndex - 1 + galleryImages.length) % galleryImages.length;
      paginate(nextIndex, diffX > 0 ? 1 : -1);
      setSwipedDuringGesture(true);
    }
  };
  const handleTouchEnd = () => {
    setTouchStart(null);
    setSwipedDuringGesture(false);
  };

  const shippingNote1 = resolveContentText((product?.shippingNote1 || page.shippingNote1).replace(/\{\d+\}/g, "{deliveryCharge}"), {
    deliveryCharge: formatPkr(commerce.domesticDeliveryChargePkr),
  });
  const shippingNote2 = product?.shippingNote2 || page.shippingNote2;
  const specifications = product?.specifications?.length ? product.specifications : page.defaultSpecifications.map((specification) =>
    specification.label === "Movement" && product?.category.toLowerCase().includes("automatic")
      ? { ...specification, value: page.automaticMovementLabel }
      : specification
  );
  const orderButtonText = isInternational && !deliveryAvailable
    ? page.internationalUnavailableButtonText
    : isInternational && commerce.deliveryQuoteRequired
      ? page.internationalOrderButtonText
      : product?.orderButtonText || page.orderButtonText;

  if (!product) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-brand-green-dark px-6">
        {status === "loading" ? (
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-gold/20 border-t-brand-gold" />
        ) : (
          <div className="text-center">
            <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">{page.notFoundEyebrow}</span>
            <h1 className="mb-4 font-serif text-3xl text-brand-cream">{page.notFoundTitle}</h1>
            <p className="mb-8 text-sm text-brand-cream-muted">{page.notFoundDescription}</p>
            <Link href="/#collection" className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-green-dark transition-all hover:bg-brand-gold-light">
              <ArrowLeft size={14} /> {page.notFoundCta}
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-brand-green-dark text-brand-cream">
      <div className="pointer-events-none absolute left-1/4 top-[20%] z-0 h-[500px] w-[500px] rounded-full bg-brand-green-glow/10 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-[20%] right-1/4 z-0 h-[400px] w-[400px] rounded-full bg-brand-gold/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-16">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-brand-cream-muted md:mb-10">
          <Link href="/" className="transition-colors hover:text-brand-gold">{page.breadcrumbHome}</Link>
          <Crumb size={12} className="text-brand-gold/40" />
          <Link href="/#collection" className="transition-colors hover:text-brand-gold">{page.breadcrumbCollection}</Link>
          <Crumb size={12} className="text-brand-gold/40" />
          <span className="truncate text-brand-gold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-8 md:gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Gallery */}
          <div className="flex flex-col items-center lg:col-span-7">
            <div
              className="relative aspect-[3/4] w-[80%] max-w-[300px] touch-pan-y overflow-hidden rounded-2xl border border-brand-gold/20 bg-brand-green-mid/20 shadow-2xl md:w-full md:max-w-none md:rounded-[2.5rem]"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={displayImage}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ x: { type: "spring", stiffness: 350, damping: 35 }, opacity: { duration: 0.25 } }}
                  className="absolute inset-0 h-full w-full"
                >
                  <Image src={displayImage} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 700px" priority />
                </motion.div>
              </AnimatePresence>

              <div className="pointer-events-none absolute left-6 top-6 flex flex-col gap-1.5">
                {product.isNew && (
                  <span className="rounded-full bg-brand-gold px-3 py-1 text-[8px] font-bold uppercase tracking-[0.25em] text-brand-green-dark shadow-md">{product.newBadgeText || page.newBadgeText}</span>
                )}
                {product.oldPrice && (
                  <span className="rounded-full border border-brand-gold/30 bg-brand-green-dark px-3 py-1 text-[8px] font-bold uppercase tracking-[0.25em] text-brand-gold shadow-md">{product.offerBadgeText || page.offerBadgeText}</span>
                )}
              </div>

              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={() => { const idx = galleryImages.indexOf(displayImage); paginate((idx - 1 + galleryImages.length) % galleryImages.length, -1); }}
                    className="absolute left-6 top-1/2 hidden -translate-y-1/2 rounded-full border border-brand-gold/10 bg-brand-green-dark/80 p-3 text-brand-cream transition-all duration-300 hover:border-brand-gold/45 hover:text-brand-gold md:flex"
                    aria-label={page.previousImageLabel}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => { const idx = galleryImages.indexOf(displayImage); paginate((idx + 1) % galleryImages.length, 1); }}
                    className="absolute right-6 top-1/2 hidden -translate-y-1/2 rounded-full border border-brand-gold/10 bg-brand-green-dark/80 p-3 text-brand-cream transition-all duration-300 hover:border-brand-gold/45 hover:text-brand-gold md:flex"
                    aria-label={page.nextImageLabel}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="no-scrollbar mt-3 flex max-w-full gap-2 overflow-x-auto px-2 py-1.5">
                {galleryImages.map((src, idx) => (
                  <button
                    key={src}
                    onClick={() => { const currentIdx = galleryImages.indexOf(displayImage); if (idx !== currentIdx) paginate(idx, idx > currentIdx ? 1 : -1); }}
                    className={`relative h-14 w-12 overflow-hidden rounded-lg border transition-all duration-300 md:h-20 md:w-16 md:rounded-xl ${selectedImage === src ? "scale-105 border-brand-gold shadow-md shadow-brand-gold/10" : "border-brand-gold/10 opacity-50 hover:opacity-100"}`}
                    aria-label={`${page.viewImageLabel} ${idx + 1}`}
                  >
                    <Image src={src} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-col lg:col-span-5">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-brand-gold md:mb-3 md:text-xs">{product.detailTagline || `${product.category} ${page.categorySuffix}`}</span>
            <h1 className="mb-3 font-serif text-2xl leading-tight tracking-tight text-brand-cream md:mb-4 md:text-5xl">{product.name}</h1>

            <div className="mb-5 flex items-baseline gap-4 md:mb-6">
              <span className="font-serif text-2xl tracking-wide text-brand-gold md:text-3xl">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-xs font-light text-brand-cream-muted line-through md:text-sm">{formatPrice(product.oldPrice)}</span>
              )}
              {product.oldPrice && (
                <span className="rounded-full border border-brand-success/30 bg-brand-success/10 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-brand-success">
                  {page.saveLabel} {formatAmount(Math.max(0, convertPrice(product.oldPrice) - convertPrice(product.price)))}
                </span>
              )}
            </div>
            {isInternational && <p className="-mt-3 mb-6 text-[10px] leading-5 text-brand-cream-muted"><span className="font-semibold text-brand-tan">{commerce.ratesUpdatedLabel}:</span> {resolveContentText(commerce.ratesNote, { currencyMargin: formatPkr(Math.max(500, Number(commerce.currencyMarginPkr) || 0)) })}</p>}

            <div className="relative mb-6 overflow-hidden rounded-2xl border border-brand-gold/25 bg-brand-green-mid/40 p-5 shadow-xl md:mb-8">
              <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-brand-gold/5 blur-xl" />
              <h3 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gold">
                <Truck size={14} /> {product.shippingTitle || page.shippingTitle}
              </h3>
              <div className="space-y-2.5 text-[11px] font-light leading-relaxed text-brand-cream-muted md:text-xs">
                {!isInternational && <p className="flex items-start gap-2"><span className="font-bold text-brand-gold">•</span><span>{shippingNote1}</span></p>}
                {commerce.worldwideDeliveryEnabled && <p className="flex items-start gap-2"><span className="font-bold text-brand-gold">•</span><span>{shippingNote2}</span></p>}
                {isInternational && commerce.worldwideDeliveryEnabled && <p className="flex items-start gap-2"><span className="font-bold text-brand-gold">•</span><span>{commerce.internationalDeliveryNote}</span></p>}
                {commerce.deliveryQuoteRequired && <p className="flex items-start gap-2"><span className="font-bold text-brand-gold">•</span><span>{commerce.deliveryConfirmationText}</span></p>}
                <p className="flex items-start gap-2"><span className="font-bold text-brand-gold">•</span><span>{commerce.dispatchEstimate}</span></p>
              </div>
            </div>

            <div className="mb-6 md:mb-8">
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gold">{product.overviewTitle || page.overviewTitle}</h3>
              <p className="text-xs font-light leading-relaxed text-brand-cream-muted md:text-sm">{product.detailDescription || product.description}</p>
            </div>

            <div className="mb-8 space-y-4 border-t border-brand-gold/10 pt-6 md:mb-10 md:pt-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gold">{product.specificationsTitle || page.specificationsTitle}</h3>
              <div className="grid grid-cols-2 gap-4">
                {specifications.map((s, index) => (
                  <div key={`${s.label}-${index}`} className="flex items-center gap-3">
                    <span className="rounded-lg border border-brand-gold/10 bg-brand-green-mid/50 p-2 text-brand-gold">{index === 0 ? <Clock className="h-3.5 w-3.5" /> : index === 1 ? <ShieldCheck className="h-3.5 w-3.5" /> : index === 2 ? <Sparkles className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />}</span>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-brand-cream-muted">{s.label}</span>
                      <span className="text-xs font-medium text-brand-cream">{s.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 md:gap-4">
              <button
                onClick={openWhatsApp}
                className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-brand-gold text-[11px] font-bold uppercase tracking-[0.25em] text-brand-green-dark shadow-lg shadow-brand-gold/15 transition-all duration-500 hover:bg-brand-gold-light active:scale-98 md:h-14 md:text-xs"
              >
                <MessageCircle size={16} /> {orderButtonText}
              </button>
              <Link
                href="/#collection"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-brand-gold/25 text-[11px] font-bold uppercase tracking-[0.25em] text-brand-cream-muted transition-all duration-500 hover:border-brand-gold hover:bg-brand-gold/5 hover:text-brand-cream active:scale-98 md:h-14 md:text-xs"
              >
                {page.returnLabel}
              </Link>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20 border-t border-brand-gold/10 pt-16 md:mt-28">
            <div className="mb-10 text-center">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">{product.relatedTag || page.relatedTag}</span>
              <h2 className="text-2xl text-brand-cream md:text-3xl">{(product.relatedTitle || page.relatedTitle).replace("{category}", product.category)}</h2>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}