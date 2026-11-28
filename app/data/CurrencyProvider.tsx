"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "./StoreProvider";
import type { CountryOption, CurrencyOption } from "./content";

const CURRENCY_KEY = "umarex_currency";

type DetectionSource = "ip" | "locale" | "none";

interface CurrencyValue {
  currency: CurrencyOption;
  currencyCode: string;
  setCurrencyCode: (code: string) => void;
  isInternational: boolean;
  detectedCountry: string;
  detectedCountryName: string;
  detectionSource: DetectionSource;
  isAutoSelected: boolean;
  formatPrice: (pkr: number) => string;
  formatAmount: (amount: number) => string;
  formatPkr: (pkr: number) => string;
  convertPrice: (pkr: number) => number;
}

const CurrencyContext = createContext<CurrencyValue | null>(null);

function readSession(key: string): string {
  try {
    return sessionStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function writeSession(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    return;
  }
}

function detectLocaleCountry(): string {
  try {
    return new Intl.Locale(navigator.language || "").region || "";
  } catch {
    return "";
  }
}

async function detectIpCountry(signal: AbortSignal): Promise<string> {
  try {
    const response = await fetch("/.netlify/functions/geo", { signal, cache: "no-store" });
    if (!response.ok) return "";
    const data = await response.json() as { countryCode?: unknown };
    return typeof data.countryCode === "string" && /^[A-Z]{2}$/i.test(data.countryCode)
      ? data.countryCode.toUpperCase()
      : "";
  } catch {
    return "";
  }
}

function currencyForCountry(
  countryCode: string,
  countries: CountryOption[],
  currencies: CurrencyOption[]
): string {
  const country = countries.find((item) => item.code === countryCode && item.enabled);
  return country && currencies.some((item) => item.code === country.currency)
    ? country.currency
    : "";
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { settings, status } = useStore();
  const [currencyCode, setCurrencyCodeState] = useState("PKR");
  const [detectedCountry, setDetectedCountry] = useState("PK");
  const [detectionSource, setDetectionSource] = useState<DetectionSource>("none");
  const [isAutoSelected, setIsAutoSelected] = useState(false);
  const manualCurrencyRef = useRef(false);
  const available = settings.commerce.currencies;
  const enabledCountries = useMemo(
    () => settings.commerce.countries.filter((country) => country.enabled),
    [settings.commerce.countries]
  );
  const autoCurrencyEnabled = settings.commerce.autoCurrencyEnabled;

  useEffect(() => {
    if (status === "loading") return;

    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2500);
    const localeCountry = detectLocaleCountry();
    const storedCurrency = readSession(CURRENCY_KEY);
    const hasManualCurrency = Boolean(storedCurrency && available.some((item) => item.code === storedCurrency));

    const initialTimer = window.setTimeout(() => {
      manualCurrencyRef.current = hasManualCurrency;
      setDetectedCountry(localeCountry);
      setDetectionSource(localeCountry ? "locale" : "none");

      if (hasManualCurrency) {
        setCurrencyCodeState(storedCurrency);
        setIsAutoSelected(false);
      } else if (!autoCurrencyEnabled) {
        setCurrencyCodeState("PKR");
        setIsAutoSelected(false);
      } else {
        const localeCurrency = currencyForCountry(localeCountry, enabledCountries, available);
        setCurrencyCodeState(localeCurrency || "PKR");
        setIsAutoSelected(Boolean(localeCurrency));
      }

      void refineDetection();
    }, 0);

    async function refineDetection() {
      if (!autoCurrencyEnabled) return;
      const ipCountry = await detectIpCountry(controller.signal);
      if (cancelled) return;

      const nextDetectedCountry = ipCountry || localeCountry;
      setDetectedCountry(nextDetectedCountry);
      setDetectionSource(ipCountry ? "ip" : localeCountry ? "locale" : "none");

      if (!manualCurrencyRef.current) {
        const mappedCurrency = currencyForCountry(nextDetectedCountry, enabledCountries, available);
        setCurrencyCodeState(mappedCurrency || "PKR");
        setIsAutoSelected(Boolean(mappedCurrency));
      }
    }

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(initialTimer);
      window.clearTimeout(timeout);
    };
  }, [autoCurrencyEnabled, available, enabledCountries, status]);

  const setCurrencyCode = useCallback((code: string) => {
    manualCurrencyRef.current = true;
    setIsAutoSelected(false);
    setCurrencyCodeState(code);
    writeSession(CURRENCY_KEY, code);
  }, []);

  const currency = useMemo(
    () => available.find((item) => item.code === currencyCode) || available[0] || { code: "PKR", symbol: "Rs", locale: "en-PK", rate: 1 },
    [available, currencyCode]
  );
  const detectedCountryName = enabledCountries.find((item) => item.code === detectedCountry)?.name
    || (detectionSource === "none" ? "" : detectedCountry);

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
    () => ({
      currency,
      currencyCode: currency.code,
      setCurrencyCode,
      isInternational,
      detectedCountry,
      detectedCountryName,
      detectionSource,
      isAutoSelected,
      formatPrice,
      formatAmount,
      formatPkr,
      convertPrice,
    }),
    [currency, setCurrencyCode, isInternational, detectedCountry, detectedCountryName, detectionSource, isAutoSelected, formatPrice, formatAmount, formatPkr, convertPrice]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyValue {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}
