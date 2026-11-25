"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useStore } from "./StoreProvider";
import type { CurrencyOption } from "./content";

const CURRENCY_KEY = "umarex_currency";

const REGION_CURRENCIES: Record<string, string> = {
  PK: "PKR",
  US: "USD", CA: "CAD", MX: "USD", PA: "USD", DO: "USD", GT: "USD", CR: "USD",
  GB: "GBP", IE: "GBP",
  AT: "EUR", BE: "EUR", HR: "EUR", CY: "EUR", EE: "EUR", FI: "EUR", FR: "EUR", DE: "EUR", GR: "EUR", IT: "EUR", LV: "EUR", LT: "EUR", LU: "EUR", MT: "EUR", NL: "EUR", PT: "EUR", SK: "EUR", SI: "EUR", ES: "EUR",
  AE: "AED", SA: "SAR", QA: "SAR", KW: "SAR", BH: "SAR", OM: "SAR",
  AU: "AUD", NZ: "NZD",
  JP: "JPY", CN: "CNY", HK: "CNY", MO: "CNY", TW: "CNY",
  IN: "INR", TR: "TRY", CH: "CHF", LI: "CHF",
};

interface CurrencyValue {
  currency: CurrencyOption;
  currencyCode: string;
  setCurrencyCode: (code: string) => void;
  isInternational: boolean;
  detectedCountry: string;
  formatPrice: (pkr: number) => string;
  formatAmount: (amount: number) => string;
  formatPkr: (pkr: number) => string;
  convertPrice: (pkr: number) => number;
}

const CurrencyContext = createContext<CurrencyValue | null>(null);

function detectCurrency(available: CurrencyOption[]): string {
  try {
    const locale = navigator.language || "en-PK";
    const region = new Intl.Locale(locale).region || "PK";
    const code = REGION_CURRENCIES[region] || "USD";
    return available.some((item) => item.code === code) ? code : "PKR";
  } catch {
    return "PKR";
  }
}

function detectCountry(): string {
  try {
    return new Intl.Locale(navigator.language || "en-PK").region || "PK";
  } catch {
    return "PK";
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useStore();
  const [currencyCode, setCurrencyCodeState] = useState("PKR");
  const [detectedCountry, setDetectedCountry] = useState("PK");
  const available = settings.commerce.currencies;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDetectedCountry(detectCountry());
      const stored = localStorage.getItem(CURRENCY_KEY);
      const detected = detectCurrency(available);
      setCurrencyCodeState(stored && available.some((item) => item.code === stored) ? stored : detected);
    }, 0);
    return () => clearTimeout(timer);
  }, [available]);

  const setCurrencyCode = useCallback((code: string) => {
    setCurrencyCodeState(code);
    localStorage.setItem(CURRENCY_KEY, code);
  }, []);

  const currency = useMemo(
    () => available.find((item) => item.code === currencyCode) || available[0] || { code: "PKR", symbol: "Rs", locale: "en-PK", rate: 1 },
    [available, currencyCode]
  );

  const isInternational = currency.code !== "PKR";
  const margin = Math.max(500, Number(settings.commerce.currencyMarginPkr) || 0);
  const rate = currency.code === "PKR" ? 1 : Number(currency.rate) > 0 ? Number(currency.rate) : 1;

  const convertPrice = useCallback(
    (pkr: number) => Math.ceil(((Number(pkr) || 0) + (isInternational ? margin : 0)) * rate),
    [isInternational, margin, rate]
  );

  const formatPkr = useCallback(
    (pkr: number) => `Rs ${(Number(pkr) || 0).toLocaleString("en-PK")}`,
    []
  );

  const formatAmount = useCallback(
    (amount: number) => {
      if (currency.code === "PKR") return `${currency.symbol} ${(Number(amount) || 0).toLocaleString(currency.locale, { maximumFractionDigits: 0 })}`;
      const number = (Number(amount) || 0).toLocaleString(currency.locale, { maximumFractionDigits: 0 });
      return `${currency.symbol} ${number}`;
    },
    [currency]
  );

  const formatPrice = useCallback(
    (pkr: number) => formatAmount(convertPrice(pkr)),
    [convertPrice, formatAmount]
  );

  const value = useMemo<CurrencyValue>(
    () => ({ currency, currencyCode: currency.code, setCurrencyCode, isInternational, detectedCountry, formatPrice, formatAmount, formatPkr, convertPrice }),
    [currency, setCurrencyCode, isInternational, detectedCountry, formatPrice, formatAmount, formatPkr, convertPrice]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyValue {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}
