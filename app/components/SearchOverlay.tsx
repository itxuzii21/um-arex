"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, ArrowUpRight } from "lucide-react";
import { useStore } from "../data/StoreProvider";
import { productHref } from "../data/catalog";
import { useCurrency } from "../data/CurrencyProvider";

export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { products, settings } = useStore();
  const { formatPrice } = useCurrency();
  const copy = settings.pages.search;
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => {
        setQuery("");
        inputRef.current?.focus();
      }, 120);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.filter((p) => p.isFeatured).slice(0, 6);
    return products
      .filter(
        (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, products]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[80] flex items-start justify-center bg-brand-green-dark/80 backdrop-blur-md px-4 pt-24 md:pt-32"
          onClick={onClose}
        >
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-brand-gold/20 bg-brand-green-mid shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-brand-gold/15 px-5 py-4">
              <Search size={18} className="shrink-0 text-brand-gold" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.placeholder}
                className="w-full bg-transparent text-sm text-brand-cream placeholder:text-brand-cream-muted/60 focus:outline-none"
              />
              <button
                onClick={onClose}
                aria-label={copy.closeLabel}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-gold/20 text-brand-cream-muted transition-colors hover:border-brand-gold hover:text-brand-gold"
              >
                <X size={15} />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-3">
              <p className="px-3 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[0.3em] text-brand-cream-muted">
                {query.trim() ? (results.length === 1 ? copy.resultOne : copy.resultMany.replace("{count}", String(results.length))) : copy.featuredLabel}
              </p>
              {results.length === 0 ? (
                <div className="px-3 py-10 text-center">
                  <p className="text-sm text-brand-cream-muted">{copy.emptyTitle}</p>
                  <p className="mt-1 text-xs text-brand-cream-muted/60">{copy.emptyDescription}</p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {results.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={productHref(p)}
                        onClick={onClose}
                        className="group flex items-center gap-4 rounded-2xl px-3 py-2.5 transition-colors hover:bg-brand-green-dark/60"
                      >
                        <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl border border-brand-gold/15 bg-brand-green-dark">
                          <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-serif text-sm text-brand-cream transition-colors group-hover:text-brand-gold">
                            {p.name}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-brand-cream-muted">
                            {p.category}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-serif text-brand-gold">{formatPrice(p.price)}</span>
                        <ArrowUpRight size={15} className="shrink-0 text-brand-cream-muted transition-all group-hover:text-brand-gold" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}