"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Product } from "../types";
import { productHref } from "../data/catalog";
import { useCurrency } from "../data/CurrencyProvider";
import { useStore } from "../data/StoreProvider";
import { resolveContentText } from "../data/content";

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : dir < 0 ? "-100%" : 0,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : dir < 0 ? "100%" : 0,
    opacity: 0,
  }),
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { settings } = useStore();
  const { formatPrice } = useCurrency();
  const galleryImages = useMemo(
    () => (product.gallery && product.gallery.length ? product.gallery : [product.image]),
    [product.gallery, product.image]
  );

  const [selectedImage, setSelectedImage] = useState(galleryImages[0]);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [hasSwiped, setHasSwiped] = useState(false);
  const [swipedDuringGesture, setSwipedDuringGesture] = useState(false);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev

  const displayImage = useMemo(() => {
    return galleryImages.includes(selectedImage) ? selectedImage : galleryImages[0];
  }, [galleryImages, selectedImage]);

  const paginate = useCallback((newIndex: number, dir: number) => {
    setDirection(dir);
    setSelectedImage(galleryImages[newIndex]);
  }, [galleryImages]);

  // Touch Swipe Gesture Tracking - Optimized for instant sliding response
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
    setSwipedDuringGesture(false);
    setHasSwiped(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || swipedDuringGesture) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = touchStart.x - currentX;
    const diffY = touchStart.y - currentY;

    // Trigger transition immediately once drag exceeds 40px horizontally
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      const currentIndex = galleryImages.indexOf(displayImage);
      if (diffX > 0) {
        // Swipe Left -> Next Image
        const nextIndex = (currentIndex + 1) % galleryImages.length;
        paginate(nextIndex, 1);
      } else {
        // Swipe Right -> Previous Image
        const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        paginate(prevIndex, -1);
      }
      setSwipedDuringGesture(true);
      setHasSwiped(true);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
    setSwipedDuringGesture(false);
    setTimeout(() => {
      setHasSwiped(false);
    }, 80);
  };

  const handleImageLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasSwiped) event.preventDefault();
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
      }}
      className="group relative aspect-[4/5] overflow-hidden rounded-[1.6rem] border border-brand-gold/15 bg-brand-green-mid shadow-[0_24px_70px_-32px_rgba(0,0,0,0.8)] transition-all duration-500 hover:-translate-y-1 hover:border-brand-gold/45 hover:shadow-[0_30px_80px_-30px_rgba(198,168,91,0.22)]"
    >
      <div
        className="relative h-full w-full select-none touch-pan-y"
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
            transition={{
              x: { type: "spring", stiffness: 350, damping: 35 },
              opacity: { duration: 0.25 }
            }}
            className="absolute inset-0 h-full w-full"
          >
            <Image
              src={displayImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
              priority={product.isFeatured}
            />
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-green-dark via-brand-green-dark/10 to-brand-green-dark/20" />
        <Link
          href={productHref(product)}
          onClick={handleImageLinkClick}
          className="absolute inset-0 z-10"
          aria-label={resolveContentText(settings.pages.home.viewProductLabel, { productName: product.name })}
        />

        <div className="pointer-events-none absolute left-4 top-4 z-20 flex flex-col gap-2">
          {product.isNew && (
            <span className="w-fit rounded-full bg-brand-gold px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em] text-brand-green-dark shadow-lg shadow-black/20">
              {product.newBadgeText || settings.pages.home.newBadgeText}
            </span>
          )}
          {product.oldPrice && (
            <span className="w-fit rounded-full border border-brand-gold/35 bg-brand-green-dark/65 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em] text-brand-gold backdrop-blur-md">
              {product.offerBadgeText || settings.pages.home.offerBadgeText}
            </span>
          )}
        </div>

        {galleryImages.length > 1 && (
          <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-brand-green-dark/65 px-3 py-2.5 backdrop-blur-md">
            {galleryImages.map((src, index) => {
              const currentIndex = galleryImages.indexOf(displayImage);
              const handleSelect = () => {
                if (index === currentIndex) return;
                paginate(index, index > currentIndex ? 1 : -1);
              };
              return (
                <button
                  key={src}
                  type="button"
                  onClick={handleSelect}
                  onMouseEnter={handleSelect}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    selectedImage === src ? "w-5 bg-brand-gold" : "w-1.5 bg-brand-cream/45 hover:bg-brand-gold/70"
                  }`}
                  aria-label={resolveContentText(settings.pages.home.selectImageLabel, { index: index + 1, productName: product.name })}
                  aria-pressed={selectedImage === src}
                />
              );
            })}
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-brand-green-dark via-brand-green-dark/85 to-transparent px-5 pb-5 pt-20">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-brand-cream/60">
            {product.category}
          </p>
          <Link href={productHref(product)} className="pointer-events-auto mt-2 block w-fit">
            <h3 className="line-clamp-2 text-[1.35rem] leading-[1.08] tracking-[-0.025em] text-brand-cream transition-colors duration-300 group-hover:text-brand-gold-light">
              {product.name}
            </h3>
          </Link>

          <div className="mt-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="font-serif text-xl tracking-normal text-brand-gold-light">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-xs font-light text-brand-cream/45 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          <Link
            href={productHref(product)}
            className="pointer-events-auto mt-4 inline-flex w-fit items-center gap-2 border-b border-brand-gold/30 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-brand-cream/70 transition-colors duration-300 hover:border-brand-gold hover:text-brand-gold-light"
            aria-label={resolveContentText(settings.pages.home.exploreDetailsLabel, { productName: product.name })}
          >
            {settings.pages.home.viewPieceLabel}
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
