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

const CATALOG_KEY = "umarex_products";
const SETTINGS_KEY = "umarex_site_settings";
const CATALOG_CONTENT_ID = "watch_catalog";
const SETTINGS_CONTENT_ID = "watch_settings";

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
    /* storage full or unavailable — non-fatal */
  }
}

function normalizeProducts(input: unknown): Product[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;
  const valid = input.every(
    (p) => p && typeof p.id === "string" && typeof p.name === "string"
  );
  return valid ? (input as Product[]) : null;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProductsState] = useState<Product[]>(STATIC_PRODUCTS);
  const [settings, setSettingsState] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [status, setStatus] = useState<StoreStatus>("loading");
  const hydrated = useRef(false);

  const setProducts = useCallback((p: Product[]) => {
    setProductsState(p);
    writeCache(CATALOG_KEY, p);
  }, []);

  const setSettings = useCallback((s: SiteSettings) => {
    setSettingsState(s);
    writeCache(SETTINGS_KEY, s);
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

      const catalogRow = data.find((r) => r.id === CATALOG_CONTENT_ID);
      const settingsRow = data.find((r) => r.id === SETTINGS_CONTENT_ID);
      let live = false;

      const catalogContent = catalogRow?.content as { products?: unknown } | undefined;
      const dbProducts = normalizeProducts(catalogContent?.products);
      if (dbProducts) {
        setProductsState(dbProducts);
        writeCache(CATALOG_KEY, dbProducts);
        live = true;
      }

      if (settingsRow?.content && typeof settingsRow.content === "object") {
        const merged = mergeSiteSettings(settingsRow.content as Partial<SiteSettings>);
        setSettingsState(merged);
        writeCache(SETTINGS_KEY, merged);
        live = true;
      }

      setStatus(live ? "live" : "local");
    } catch {
      setStatus("local");
    }
  }, []);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const timer = setTimeout(() => {
      const cachedProducts = normalizeProducts(readCache<Product[]>(CATALOG_KEY));
      if (cachedProducts) setProductsState(cachedProducts);

      const cachedSettings = readCache<Partial<SiteSettings>>(SETTINGS_KEY);
      if (cachedSettings) {
        setSettingsState(mergeSiteSettings(cachedSettings));
      }

      refresh();
    }, 0);
    return () => clearTimeout(timer);
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
          error:
            "Could not reach the save service. Run the site with Netlify Dev or deploy to Netlify to save to the database.",
        };
      }
    },
    []
  );

  const value = useMemo<StoreValue>(
    () => ({
      products,
      settings,
      status,
      refresh,
      setProducts,
      setSettings,
      persist,
    }),
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