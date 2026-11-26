"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Product, PRODUCTS as STATIC_PRODUCTS } from "../types";
import {
  SiteSettings,
  DEFAULT_SITE_SETTINGS,
  mergeSiteSettings,
} from "./siteSettings";

const CATALOG_KEY = "umarex_leather_products";
const SETTINGS_KEY = "umarex_leather_site_settings";
const CATALOG_CONTENT_ID = "leather_catalog";
const SETTINGS_CONTENT_ID = "leather_settings";

export type StoreStatus = "loading" | "live" | "local";

interface StoreValue {
  products: Product[];
  settings: SiteSettings;
  status: StoreStatus;
  refresh: () => Promise<void>;
  setProducts: (p: Product[]) => void;
  setSettings: (s: SiteSettings) => void;
  persist: (
    id: string,
    content: unknown,
    accessToken: string
  ) => Promise<{ ok: boolean; error?: string }>;
}

const StoreContext = createContext<StoreValue | null>(null);

function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

function titleCase(value: string): string {
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function optionalText(value: unknown): string | undefined {
  return value === null || value === undefined || value === "" ? undefined : String(value);
}

function normalizeSpecifications(value: unknown): Product["specifications"] {
  const raw = value;
  let source: unknown = value;
  if (typeof raw === "string") {
    try {
      source = JSON.parse(raw) as unknown;
    } catch {
      source = raw.split(/[|\n]/);
    }
  }
  const items = Array.isArray(source) ? source : source ? [source] : [];
  const specifications = items.flatMap((item, index) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const specification = item as Record<string, unknown>;
      const label = String(specification.label ?? `Detail ${index + 1}`).trim();
      const detail = String(specification.value ?? "").trim();
      return label && detail ? [{ label, value: detail }] : [];
    }
    const detail = String(item ?? "").trim();
    if (!detail) return [];
    const separator = detail.indexOf(":");
    return separator > 0 && separator < 60
      ? [{ label: detail.slice(0, separator).trim(), value: detail.slice(separator + 1).trim() }]
      : [{ label: `Detail ${index + 1}`, value: detail }];
  });
  return specifications.length ? specifications : undefined;
}

function normalizeProduct(input: unknown, preserveLegacyBadges = false): Product | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;
  const id = String(row.id ?? "").trim();
  const name = String(row.name ?? "").trim();
  if (!id || !name) return null;

  const rawCategory = String(row.category ?? "Wallets").trim().toLowerCase();
  const category = rawCategory === "wallet" || rawCategory === "wallets"
    ? "Wallets"
    : rawCategory === "card holder" || rawCategory === "card holders" || name.toLowerCase().includes("card")
      ? "Card Holders"
      : rawCategory === "accessory" || rawCategory === "accessories"
        ? "Accessories"
        : titleCase(rawCategory);
  const rawGallery = row.gallery ?? row.image_urls;
  const gallery = Array.isArray(rawGallery)
    ? rawGallery.map(String).map((item) => item.trim()).filter(Boolean)
    : typeof rawGallery === "string"
      ? rawGallery.split(/[|,\n]/).map((item) => item.trim()).filter(Boolean)
      : [];
  const image = String(row.image ?? row.image_url ?? gallery[0] ?? "").trim();
  const oldPrice = Number(row.oldPrice ?? row.old_price);

  return {
    id,
    name,
    category,
    price: Number(row.price) || 0,
    oldPrice: Number.isFinite(oldPrice) && oldPrice > 0 ? oldPrice : undefined,
    image,
    gallery: gallery.length ? gallery : image ? [image] : undefined,
    description: String(row.description ?? ""),
    isNew: Boolean(row.isNew ?? row.is_new),
    isBestSeller: Boolean(row.isBestSeller ?? row.is_best_seller),
    isFeatured: Boolean(row.isFeatured ?? row.is_featured),
    legacyIsFeatured: preserveLegacyBadges ? Boolean(row.legacyIsFeatured ?? row.isFeatured ?? row.is_featured) : undefined,
    legacyIsNew: preserveLegacyBadges ? Boolean(row.legacyIsNew ?? row.isNew ?? row.is_new) : undefined,
    legacyIsBestSeller: preserveLegacyBadges ? Boolean(row.legacyIsBestSeller ?? row.isBestSeller ?? row.is_best_seller) : undefined,
    detailTagline: String(row.detailTagline ?? row.detail_tagline ?? row.collection_tag ?? ""),
    detailDescription: optionalText(row.detailDescription ?? row.detail_description),
    shippingTitle: optionalText(row.shippingTitle ?? row.shipping_title),
    shippingNote1: optionalText(row.shippingNote1 ?? row.shipping_note1),
    shippingNote2: optionalText(row.shippingNote2 ?? row.shipping_note2),
    overviewTitle: optionalText(row.overviewTitle ?? row.overview_title),
    specificationsTitle: optionalText(row.specificationsTitle ?? row.specifications_title),
    specifications: normalizeSpecifications(row.specifications ?? row.specs),
    orderButtonText: optionalText(row.orderButtonText ?? row.order_button_text),
    relatedTag: optionalText(row.relatedTag ?? row.related_tag),
    relatedTitle: optionalText(row.relatedTitle ?? row.related_title),
    newBadgeText: optionalText(row.newBadgeText ?? row.new_badge_text),
    offerBadgeText: optionalText(row.offerBadgeText ?? row.offer_badge_text),
  };
}

function normalizeProducts(input: unknown, preserveLegacyBadges = false): Product[] | null {
  if (!Array.isArray(input)) return null;
  if (input.length === 0) return [];
  const normalized = input
    .map((product) => normalizeProduct(product, preserveLegacyBadges))
    .filter((product): product is Product => Boolean(product));
  return normalized.length ? normalized : null;
}

function applyShowcase(products: Product[], settings: SiteSettings): Product[] {
  const featuredOrder = new Map(settings.showcase.featuredProductIds.map((id, index) => [String(id), index]));
  const featured = new Set(settings.showcase.featuredProductIds.map(String));
  const fresh = new Set(settings.showcase.newProductIds.map(String));
  const bestSellers = new Set(settings.showcase.bestSellerProductIds.map(String));

  return products
    .map((product) => ({
      ...product,
      isFeatured: featured.has(product.id) || product.legacyIsFeatured,
      isNew: fresh.has(product.id) || product.legacyIsNew,
      isBestSeller: bestSellers.has(product.id) || product.legacyIsBestSeller,
    }))
    .sort((a, b) => {
      const ai = featuredOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const bi = featuredOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return ai - bi;
    });
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProductsState] = useState<Product[]>(() => applyShowcase(STATIC_PRODUCTS, DEFAULT_SITE_SETTINGS));
  const [settings, setSettingsState] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [status, setStatus] = useState<StoreStatus>("loading");
  const hydrated = useRef(false);
  const settingsRef = useRef(settings);

  const setProducts = useCallback((nextProducts: Product[]) => {
    const showcased = applyShowcase(nextProducts, settingsRef.current);
    setProductsState(showcased);
    writeCache(CATALOG_KEY, showcased);
    window.dispatchEvent(new Event("umarex-content-updated"));
  }, []);

  const setSettings = useCallback((nextSettings: SiteSettings) => {
    const merged = mergeSiteSettings(nextSettings);
    settingsRef.current = merged;
    setSettingsState(merged);
    setProductsState((current) => applyShowcase(current, merged));
    writeCache(SETTINGS_KEY, merged);
    window.dispatchEvent(new Event("umarex-content-updated"));
  }, []);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setStatus("local");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("id, content")
        .in("id", [CATALOG_CONTENT_ID, SETTINGS_CONTENT_ID]);

      if (error || !data) {
        setStatus("local");
        return;
      }

      const catalogRow = data.find((row) => row.id === CATALOG_CONTENT_ID);
      const settingsRow = data.find((row) => row.id === SETTINGS_CONTENT_ID);
      const mergedSettings = settingsRow?.content && typeof settingsRow.content === "object"
        ? mergeSiteSettings(settingsRow.content as Partial<SiteSettings>)
        : settingsRef.current;
      settingsRef.current = mergedSettings;
      setSettingsState(mergedSettings);
      if (settingsRow?.content) writeCache(SETTINGS_KEY, mergedSettings);

      const catalogContent = catalogRow?.content as { products?: unknown } | undefined;
      let liveProducts = normalizeProducts(catalogContent?.products);
      if (!liveProducts) {
        const { data: databaseProducts, error: productError } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        if (!productError) liveProducts = normalizeProducts(databaseProducts, true);
      }

      if (liveProducts) {
        const showcased = applyShowcase(liveProducts, mergedSettings);
        setProductsState(showcased);
        writeCache(CATALOG_KEY, showcased);
      }

      setStatus(settingsRow?.content || liveProducts ? "live" : "local");
    } catch {
      setStatus("local");
    }
  }, []);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const timer = setTimeout(() => {
      const cachedSettings = readCache<Partial<SiteSettings>>(SETTINGS_KEY);
      const initialSettings = cachedSettings ? mergeSiteSettings(cachedSettings) : settingsRef.current;
      settingsRef.current = initialSettings;
      setSettingsState(initialSettings);

      const cachedProducts = normalizeProducts(readCache<unknown>(CATALOG_KEY));
      setProductsState(applyShowcase(cachedProducts || STATIC_PRODUCTS, initialSettings));
      refresh();
    }, 0);

    const onContentUpdated = () => { void refresh(); };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== CATALOG_KEY && event.key !== SETTINGS_KEY) return;
      const nextSettings = event.key === SETTINGS_KEY && event.newValue
        ? mergeSiteSettings(JSON.parse(event.newValue) as Partial<SiteSettings>)
        : settingsRef.current;
      settingsRef.current = nextSettings;
      setSettingsState(nextSettings);
      setProductsState((currentProducts) => {
        const nextProducts = event.key === CATALOG_KEY && event.newValue
          ? normalizeProducts(JSON.parse(event.newValue))
          : null;
        return applyShowcase(nextProducts ?? currentProducts, nextSettings);
      });
    };

    window.addEventListener("umarex-content-updated", onContentUpdated);
    window.addEventListener("storage", onStorage);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("umarex-content-updated", onContentUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  const persist = useCallback(
    async (id: string, content: unknown, accessToken: string) => {
      try {
        const res = await fetch("/.netlify/functions/admin-content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ id, content }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok || !body.success) {
          return { ok: false, error: body.error || `Save failed (${res.status}).` };
        }
        return { ok: true };
      } catch {
        return {
          ok: false,
          error: "Could not reach the save service. Run the site with Netlify Dev or deploy to Netlify to save to the database.",
        };
      }
    },
    []
  );

  const value = useMemo<StoreValue>(
    () => ({ products, settings, status, refresh, setProducts, setSettings, persist }),
    [products, settings, status, refresh, setProducts, setSettings, persist]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export { CATALOG_CONTENT_ID, SETTINGS_CONTENT_ID };
