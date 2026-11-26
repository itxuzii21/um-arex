"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useStore } from "../data/StoreProvider";

export default function WatchBrandCard({ className = "" }: { className?: string }) {
  const { settings } = useStore();
  const shared = settings.shared;
  return (
    <a
      href={shared.watchUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={shared.watchCardLabel}
      className={`watch-green-button leather-sheen group relative block overflow-hidden rounded-2xl border border-brand-watch-green-glow shadow-xl shadow-black/40 transition-all duration-500 hover:border-brand-gold/60 hover:shadow-brand-gold/10 ${className}`}
    >
      <div className="relative z-10 flex items-center justify-center px-6 pt-5 pb-3">
        <Image
          src={shared.watchLogoUrl}
          alt={shared.watchLogoAlt}
          width={240}
          height={80}
          className="h-12 w-auto object-contain transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <div className="relative z-10 flex items-center justify-between gap-3 border-t border-brand-gold/20 px-5 py-3">
        <div className="min-w-0">
          <span className="block text-[9px] font-semibold uppercase tracking-[0.28em] text-brand-gold-light">
            {shared.watchCardTitle}
          </span>
          <span className="mt-0.5 block truncate text-[8px] uppercase tracking-[0.18em] text-brand-cream-muted/80">
            {shared.watchCardSubtitle}
          </span>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-gold/40 bg-brand-watch-green-dark/40 text-brand-gold-light transition-all duration-500 group-hover:bg-brand-gold group-hover:text-brand-green-dark group-hover:border-brand-gold">
          <ArrowUpRight size={16} className="transition-transform duration-500 group-hover:rotate-45" />
        </span>
      </div>
    </a>
  );
}
