"use client";

import { Globe } from "lucide-react";
import { useStore } from "../data/StoreProvider";
import { useCurrency } from "../data/CurrencyProvider";

export default function CurrencySelector({ compact = false }: { compact?: boolean }) {
  const { settings } = useStore();
  const { currencyCode, setCurrencyCode } = useCurrency();

  return (
    <label className={`relative flex ${compact ? "h-8 gap-1 px-2" : "h-10 gap-1.5 px-2.5 sm:px-3"} items-center rounded-full border border-brand-gold/20 bg-brand-green-mid/50 text-brand-cream-muted transition hover:border-brand-gold/60 hover:text-brand-gold`}>
      <Globe size={compact ? 12 : 14} className="shrink-0 text-brand-gold" aria-hidden="true" />
      <span className="sr-only">{settings.commerce.currencySelectorLabel}</span>
      <select
        value={currencyCode}
        onChange={(event) => setCurrencyCode(event.target.value)}
        aria-label={settings.commerce.currencySelectorLabel}
        className={`${compact ? "max-w-[40px] pr-0 text-[9px]" : "max-w-[72px] pr-1 text-[10px] sm:max-w-none"} cursor-pointer appearance-none bg-transparent font-semibold uppercase tracking-wider outline-none`}
      >
        {settings.commerce.currencies.map((currency) => (
          <option key={currency.code} value={currency.code} className="bg-brand-green-dark text-brand-cream">
            {currency.code}
          </option>
        ))}
      </select>
    </label>
  );
}
