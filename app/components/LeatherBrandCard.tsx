"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useStore } from "../data/StoreProvider";

export default function LeatherBrandCard({ className = "" }: { className?: string }) {
  const { settings } = useStore();
  const shared = settings.shared;
  return (
    <a
      href={shared.leatherUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={shared.leatherCardLabel}
      className={`leather-sheen leather-surface group relative block overflow-hidden rounded-2xl border border-brand-tan/30 shadow-xl shadow-black/40 transition-all duration-500 hover:border-brand-gold/60 hover:shadow-brand-gold/10 ${className}`}
    >
      <div className="relative z-10 flex items-center justify-center px-6 pt-5 pb-3">
        <Image
          src={shared.leatherLogoUrl}
          alt={shared.leatherLogoAlt}
          width={240}
          height={80}
          className="h-12 w-auto object-contain transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <div className="relative z-10 flex items-center justify-between gap-3 border-t border-brand-tan/20 px-5 py-3">
        <div className="min-w-0">
          <span className="block text-[9px] font-semibold uppercase tracking-[0.28em] text-brand-gold-light">
            {shared.leatherCardTitle}
          </span>
          <span className="mt-0.5 block truncate text-[8px] uppercase tracking-[0.18em] text-brand-cream-muted/80">
            {shared.leatherCardSubtitle}
          </span>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-tan/40 text-brand-gold-light transition-all duration-500 group-hover:bg-brand-gold group-hover:text-brand-espresso group-hover:border-brand-gold">
          <ArrowUpRight size={16} className="transition-transform duration-500 group-hover:rotate-45" />
        </span>
      </div>
    </a>
  );
}