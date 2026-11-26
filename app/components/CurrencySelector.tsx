"use client";

import { Globe } from "lucide-react";
import { useStore } from "../data/StoreProvider";
import { useCurrency } from "../data/CurrencyProvider";

export default function CurrencySelector() {
  const { settings } = useStore();
  const { currencyCode, setCurrencyCode, countryCode, setCountryCode } = useCurrency();
  const countries = settings.commerce.countries.filter((country) => country.enabled);

  return (
    <div className="flex h-10 items-center gap-1.5 rounded-full border border-brand-gold/20 bg-brand-green-mid/50 px-2.5 text-brand-cream-muted transition hover:border-brand-gold/60 hover:text-brand-gold sm:px-3">
      <Globe size={14} className="shrink-0 text-brand-gold" aria-hidden="true" />
      <label>
        <span className="sr-only">{settings.commerce.countrySelectorLabel}</span>
        <select
          value={countryCode}
          onChange={(event) => setCountryCode(event.target.value)}
          aria-label={settings.commerce.countrySelectorLabel}
          className="max-w-[86px] cursor-pointer appearance-none bg-transparent text-[10px] font-semibold uppercase tracking-wider outline-none sm:max-w-[130px]"
        >
          {countries.map((country) => (
            <option key={country.code} value={country.code} className="bg-brand-green-dark text-brand-cream">
              {country.code} · {country.currency}
            </option>
          ))}
        </select>
      </label>
      <span className="h-3 w-px bg-brand-gold/20" aria-hidden="true" />
      <label>
        <span className="sr-only">{settings.commerce.currencySelectorLabel}</span>
        <select
          value={currencyCode}
          onChange={(event) => setCurrencyCode(event.target.value)}
          aria-label={settings.commerce.currencySelectorLabel}
          className="max-w-[62px] cursor-pointer appearance-none bg-transparent text-[10px] font-semibold uppercase tracking-wider outline-none"
        >
          {settings.commerce.currencies.map((currency) => (
            <option key={currency.code} value={currency.code} className="bg-brand-green-dark text-brand-cream">
              {currency.code}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
