"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useStore } from "./StoreProvider";
import type { CountryOption, CurrencyOption } from "./content";

const CURRENCY_KEY = "umarex_leather_currency";
const COUNTRY_KEY = "umarex_leather_country";

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
  country: CountryOption;
  countryCode: string;
  setCountryCode: (code: string) => void;
  detectedCountry: string;
  isInternational: boolean;
  deliveryAvailable: boolean;
  formatPrice: (pkr: number) => string;
  formatAmount: (amount: number) => string;
  formatPkr: (pkr: number) => string;
  convertPrice: (pkr: number) => number;
}

const CurrencyContext = createContext<CurrencyValue | null>(null);

function detectCountryCode(): string {
  try {
    return new Intl.Locale(navigator.language || "en-PK").region || "PK";
  } catch {
    return "PK";
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useStore();
  const [currencyCode, setCurrencyCodeState] = useState("PKR");
  const [countryCode, setCountryCodeState] = useState("PK");
  const [detectedCountry, setDetectedCountry] = useState("PK");
  const available = settings.commerce.currencies;
  const countries = settings.commerce.countries;
  const enabledCountries = useMemo(() => countries.filter((country) => country.enabled), [countries]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const detected = detectCountryCode();
      setDetectedCountry(detected);
      const storedCountry = localStorage.getItem(COUNTRY_KEY);
      const selectedCountry = enabledCountries.find((country) => country.code === storedCountry)
        || enabledCountries.find((country) => country.code === detected)
        || enabledCountries.find((country) => country.code === "PK")
        || enabledCountries[0];
      const nextCountry = selectedCountry?.code || "PK";
      setCountryCodeState(nextCountry);

      const storedCurrency = localStorage.getItem(CURRENCY_KEY);
      const countryCurrency = selectedCountry?.currency || "PKR";
      const nextCurrency = storedCurrency && available.some((item) => item.code === storedCurrency)
        ? storedCurrency
        : available.some((item) => item.code === countryCurrency)
          ? countryCurrency
          : available.some((item) => item.code === REGION_CURRENCIES[detected])
            ? REGION_CURRENCIES[detected]
            : "PKR";
      setCurrencyCodeState(nextCurrency);
    }, 0);
    return () => clearTimeout(timer);
  }, [available, enabledCountries]);

  const setCurrencyCode = useCallback((code: string) => {
    setCurrencyCodeState(code);
    localStorage.setItem(CURRENCY_KEY, code);
  }, []);

  const setCountryCode = useCallback((code: string) => {
    const country = enabledCountries.find((item) => item.code === code);
    if (!country) return;
    setCountryCodeState(country.code);
    localStorage.setItem(COUNTRY_KEY, country.code);
    if (available.some((item) => item.code === country.currency)) {
      setCurrencyCodeState(country.currency);
      localStorage.setItem(CURRENCY_KEY, country.currency);
    }
  }, [available, enabledCountries]);

  const currency = useMemo(
    () => available.find((item) => item.code === currencyCode) || available[0] || { code: "PKR", symbol: "Rs", locale: "en-PK", rate: 1 },
    [available, currencyCode]
  );
  const country = useMemo(
    () => enabledCountries.find((item) => item.code === countryCode) || enabledCountries[0] || { code: "PK", name: "Pakistan", currency: "PKR", enabled: true },
    [countryCode, enabledCountries]
  );

  const isInternational = country.code !== "PK";
  const deliveryAvailable = country.enabled && (!isInternational || settings.commerce.worldwideDeliveryEnabled);
  const margin = Math.max(500, Number(settings.commerce.currencyMarginPkr) || 0);
  const rate = currency.code === "PKR" ? 1 : Number(currency.rate) > 0 ? Number(currency.rate) : 1;
  const applyMargin = currency.code !== "PKR";

  const convertPrice = useCallback(
    (pkr: number) => Math.ceil(((Number(pkr) || 0) + (applyMargin ? margin : 0)) * rate),
    [applyMargin, margin, rate]
  );

  const formatPkr = useCallback(
    (pkr: number) => `Rs ${(Number(pkr) || 0).toLocaleString("en-PK")}`,
    []
  );

  const formatAmount = useCallback(
    (amount: number) => `${currency.symbol} ${(Number(amount) || 0).toLocaleString(currency.locale, { maximumFractionDigits: 0 })}`,
    [currency]
  );

  const formatPrice = useCallback(
    (pkr: number) => formatAmount(convertPrice(pkr)),
    [convertPrice, formatAmount]
  );

  const value = useMemo<CurrencyValue>(
    () => ({
      currency,
      currencyCode: currency.code,
      setCurrencyCode,
      country,
      countryCode: country.code,
      setCountryCode,
      detectedCountry,
      isInternational,
      deliveryAvailable,
      formatPrice,
      formatAmount,
      formatPkr,
      convertPrice,
    }),
    [currency, setCurrencyCode, country, setCountryCode, detectedCountry, isInternational, deliveryAvailable, formatPrice, formatAmount, formatPkr, convertPrice]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyValue {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}
