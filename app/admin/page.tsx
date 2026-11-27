"use client";

import { useState, useEffect, useRef, useCallback, useId, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle, ArrowDown, ArrowLeft, ArrowUp, ArrowUpRight, BookOpenText, Check, CheckCircle2,
  ChevronRight, Cloud, CloudOff, ContactRound, Database, Edit3, ExternalLink,
  Eye, EyeOff, FileText, Globe2, Image as ImageIcon, KeyRound, Loader2, LockKeyhole,
  LogOut, Mail, Menu, Megaphone, Package, PanelTop, Plus, RefreshCw, Save, Search,
  Settings2, Share2, ShieldCheck, ShoppingBag, Sparkles, Trash2, Truck, UserRound, X,
} from "lucide-react";
import { Product, ProductSpecification } from "../types";
import type { CountryOption } from "../data/content";
import { SiteSettings, DEFAULT_SITE_SETTINGS } from "../data/siteSettings";
import { normalizePageLayouts } from "../data/pageLayout";
import PageLayoutEditor from "./PageLayoutEditor";
import {
  useStore, CATALOG_CONTENT_ID, SETTINGS_CONTENT_ID,
} from "../data/StoreProvider";
import { supabase, isSupabaseConfigured, ADMIN_ACCOUNT_EMAIL } from "@/lib/supabase";

type AdminProduct = Product & { collectionTag?: string };

type Tab = "products" | "showcase" | "pageLayouts" | "shared" | "pages" | "trackOrder" | "commerce" | "hero" | "navbar" | "story" | "banner" | "specs" | "contact" | "footer" | "social" | "security";
type ShowcaseField = keyof SiteSettings["showcase"];
type SaveStatus = "idle" | "saving" | "saved" | "error" | "local";
type Notice = { type: "success" | "error" | "info"; text: string } | null;
const PAGE_LABELS = {
  home: "Homepage extras",
  about: "About page",
  faq: "FAQ page",
  privacy: "Privacy policy",
  terms: "Terms & conditions",
  returns: "Returns & refunds",
  trackOrder: "Track order page",
  leather: "Leather page",
  notFound: "404 page",
  search: "Search overlay",
  product: "Product detail defaults",
} as const;

const navigation: { label: string; tabs: { key: Tab; label: string; icon: typeof Package }[] }[] = [
  {
    label: "Leather catalog",
    tabs: [
      { key: "products", label: "Products", icon: Package },
      { key: "showcase", label: "Product Showcase", icon: Sparkles },
    ],
  },
  {
    label: "Website content",
    tabs: [
      { key: "shared", label: "Brand, navigation & SEO", icon: Globe2 },
      { key: "pageLayouts", label: "Page layouts", icon: Settings2 },
      { key: "navbar", label: "Header", icon: PanelTop },
      { key: "hero", label: "Hero section", icon: ImageIcon },
      { key: "story", label: "Brand story", icon: BookOpenText },
      { key: "banner", label: "Promotional banner", icon: Megaphone },
      { key: "specs", label: "Specifications", icon: Settings2 },
      { key: "contact", label: "Contact section", icon: ContactRound },
      { key: "footer", label: "Footer", icon: FileText },
      { key: "social", label: "Social links", icon: Share2 },
      { key: "pages", label: "Pages & policies", icon: FileText },
      { key: "trackOrder", label: "Track order", icon: Truck },
    ],
  },
  {
    label: "International sales",
    tabs: [{ key: "commerce", label: "Commerce", icon: Globe2 }],
  },
  {
    label: "System",
    tabs: [{ key: "security", label: "Account security", icon: ShieldCheck }],
  },
];

const pageMeta: Record<Tab, { eyebrow: string; title: string; description: string }> = {
  products: { eyebrow: "Leather catalog", title: "Wallets & accessories", description: "Manage leather products, galleries, pricing, materials, and every field on each product detail page." },
  showcase: { eyebrow: "Leather catalog", title: "Product Showcase", description: "Choose featured, new, and best-seller wallets and accessories, and arrange the featured collection." },
  shared: { eyebrow: "Website content", title: "Brand, navigation & SEO", description: "Control the leather brand name, logos, navigation labels, footer labels, links, and search metadata." },
  pageLayouts: { eyebrow: "Website content", title: "Page layouts", description: "Reorder sections on every public page and resize cards, forms, policy boxes, and other panels." },
  pages: { eyebrow: "Website content", title: "Pages & policies", description: "Edit homepage extras, About, FAQ, policies, leather content, search messages, and product-page defaults." },
  trackOrder: { eyebrow: "Website content", title: "Track order page", description: "Edit the tracking form, delivery journey, support messages, and WhatsApp request flow." },
  commerce: { eyebrow: "International sales", title: "Delivery, countries & currency", description: "Configure delivery, enabled countries, currencies, exchange rates, and the international pricing margin." },
  navbar: { eyebrow: "Website content", title: "Header & announcement", description: "Update the announcement message displayed above the leather storefront navigation." },
  hero: { eyebrow: "Website content", title: "Hero section", description: "Control the first impression visitors see when they enter your leather store." },
  story: { eyebrow: "Website content", title: "Brand story", description: "Share your leather heritage, philosophy, materials, and quality standards with customers." },
  banner: { eyebrow: "Website content", title: "Promotional banner", description: "Highlight a leather collection, offer, or featured message in the cinematic banner." },
  specs: { eyebrow: "Website content", title: "Materials & details", description: "Present the leather, craftsmanship, and finishing standards behind your collection." },
  contact: { eyebrow: "Website content", title: "Contact section", description: "Update the invitation and call to action for customer enquiries." },
  footer: { eyebrow: "Website content", title: "Footer content", description: "Manage your leather brand description, copyright, and credit information." },
  social: { eyebrow: "Website content", title: "Social & contact links", description: "Keep your WhatsApp and social media destinations up to date." },
  security: { eyebrow: "Account settings", title: "Account security", description: "Change your administrator password and manage secure access." },
};

type SearchResult = {
  id: string;
  label: string;
  detail: string;
  tab: Tab;
  page?: keyof typeof PAGE_LABELS;
  path?: string;
  product?: AdminProduct;
  searchText: string;
};

type SearchLocation = { tab: Tab; section: string; page?: keyof typeof PAGE_LABELS };

function normalizeCode(value: unknown): string {
  return String(value ?? "").trim().toUpperCase();
}

function normalizeIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((id) => id !== null && id !== undefined).map(String)));
}

function normalizeShowcase(value: unknown): SiteSettings["showcase"] {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    featuredProductIds: normalizeIdList(source.featuredProductIds),
    newProductIds: normalizeIdList(source.newProductIds),
    bestSellerProductIds: normalizeIdList(source.bestSellerProductIds),
  };
}

function initialShowcase(settings: SiteSettings, products: Product[]): SiteSettings["showcase"] {
  if (settings.showcase && typeof settings.showcase === "object") return normalizeShowcase(settings.showcase);
  return {
    featuredProductIds: products.filter((product) => product.isFeatured).map((product) => String(product.id)),
    newProductIds: products.filter((product) => product.isNew).map((product) => String(product.id)),
    bestSellerProductIds: products.filter((product) => product.isBestSeller).map((product) => String(product.id)),
  };
}

function nextUnusedCode(codes: string[], length: number): string {
  const used = new Set(codes.map(normalizeCode));
  for (let index = 0; index < 26 ** length; index += 1) {
    let remaining = index;
    let code = "";
    for (let position = 0; position < length; position += 1) {
      code = String.fromCharCode(65 + (remaining % 26)) + code;
      remaining = Math.floor(remaining / 26);
    }
    if (!used.has(code)) return code;
  }
  return "";
}

function databaseSpecifications(value: unknown): ProductSpecification[] {
  const raw = value;
  let source: unknown = value;
  if (typeof raw === "string") {
    try {
      source = JSON.parse(raw) as unknown;
    } catch {
      source = raw.split(/\r?\n/);
    }
  }
  const items = Array.isArray(source) ? source : source && (typeof source === "string" || typeof source === "object") ? [source] : [];
  return items.flatMap((item, index) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const specification = item as Record<string, unknown>;
      const label = String(specification.label ?? `Detail ${index + 1}`).trim();
      const detail = String(specification.value ?? "").trim();
      return label && detail ? [{ label, value: detail }] : [];
    }
    const detail = String(item ?? "").trim();
    if (!detail) return [];
    const separator = detail.indexOf(":");
    if (separator > 0 && separator < 60) {
      return [{ label: detail.slice(0, separator).trim(), value: detail.slice(separator + 1).trim() }];
    }
    return [{ label: `Detail ${index + 1}`, value: detail }];
  });
}

function databaseImages(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function commerceValidationError(commerce: SiteSettings["commerce"]): string {
  const currencies = Array.isArray(commerce.currencies) ? commerce.currencies : [];
  const currencyCodes = currencies.map((currency) => normalizeCode(currency.code));
  if (!currencyCodes.includes("PKR")) return "PKR must remain in the currency list as the base currency.";
  if (currencyCodes.some((code) => !/^[A-Z]{3}$/.test(code))) return "Enter a three-letter code for every currency.";
  if (new Set(currencyCodes).size !== currencyCodes.length) return "Currency codes must be unique.";
  if (currencies.some((currency) => !Number.isFinite(Number(currency.rate)) || Number(currency.rate) <= 0)) return "Every currency rate must be greater than zero.";
  const pkr = currencies.find((currency) => normalizeCode(currency.code) === "PKR");
  if (pkr && Number(pkr.rate) !== 1) return "The PKR exchange rate is protected and must remain 1.";
  if (!Number.isFinite(Number(commerce.domesticDeliveryChargePkr)) || Number(commerce.domesticDeliveryChargePkr) < 0) return "The Pakistan delivery charge cannot be negative.";
  if (!Number.isFinite(Number(commerce.currencyMarginPkr)) || Number(commerce.currencyMarginPkr) < 500) return "The international currency margin must be at least PKR 500.";

  const countries = Array.isArray(commerce.countries) ? commerce.countries : [];
  const countryCodes = countries.map((country) => normalizeCode(country.code));
  if (countryCodes.some((code) => !/^[A-Z]{2}$/.test(code))) return "Enter a two-letter code for every country.";
  if (new Set(countryCodes).size !== countryCodes.length) return "Country codes must be unique.";
  const invalidCountry = countries.find((country) => {
    if (country.enabled === false) return false;
    return !String(country.name ?? "").trim() || !currencyCodes.includes(normalizeCode(country.currency));
  });
  if (invalidCountry) {
    return !String(invalidCountry.name ?? "").trim()
      ? `Enter a name for enabled country ${normalizeCode(invalidCountry.code) || "entry"}.`
      : `Select a configured currency for enabled country ${normalizeCode(invalidCountry.code) || "entry"}.`;
  }
  return "";
}

function settingsForSave(settings: SiteSettings): SiteSettings {
  return {
    ...settings,
    showcase: normalizeShowcase(settings.showcase),
    pageLayouts: normalizePageLayouts(settings.pageLayouts),
    commerce: {
      ...settings.commerce,
      domesticDeliveryChargePkr: Number(settings.commerce.domesticDeliveryChargePkr),
      currencyMarginPkr: Number(settings.commerce.currencyMarginPkr),
      currencies: settings.commerce.currencies.map((currency) => {
        const code = normalizeCode(currency.code);
        return { ...currency, code, rate: code === "PKR" ? 1 : Number(currency.rate) };
      }),
      countries: settings.commerce.countries.map((country) => ({
        ...country,
        code: normalizeCode(country.code),
        currency: normalizeCode(country.currency),
        enabled: country.enabled !== false,
      })),
    },
  };
}

function addSearchResults(value: unknown, path: string, labels: string[], location: SearchLocation, results: SearchResult[]) {
  if (Array.isArray(value)) {
    const label = labels.join(" › ");
    const detail = `${value.length} ${value.length === 1 ? "item" : "items"}`;
    results.push({ id: `${location.tab}:${path}`, label, detail, ...location, path, searchText: `${label} ${location.section} ${detail}`.toLowerCase() });
    if (value.length && value.every((item) => item && typeof item === "object" && !Array.isArray(item))) {
      value.forEach((item, index) => addSearchResults(item, `${path}.${index}`, [...labels, `Item ${index + 1}`], location, results));
    }
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, nested]) => {
      addSearchResults(nested, `${path}.${key}`, [...labels, readableLabel(key)], location, results);
    });
    return;
  }
  const label = labels.join(" › ");
  const detail = typeof value === "boolean" ? (value ? "Enabled" : "Disabled") : String(value ?? "");
  results.push({
    id: `${location.tab}:${path}`,
    label,
    detail: detail.length > 110 ? `${detail.slice(0, 107)}…` : detail,
    ...location,
    path,
    searchText: `${label} ${location.section} ${detail}`.toLowerCase(),
  });
}

function topLevelSearchLocation(key: string): SearchLocation | null {
  if (key === "pageLayouts") return { tab: "pageLayouts", section: "Page layouts" };
  if (key === "bannerText") return { tab: "navbar", section: "Header & announcement" };
  if (key.startsWith("hero")) return { tab: "hero", section: "Hero section" };
  if (key.startsWith("story")) return { tab: "story", section: "Brand story" };
  if (key.startsWith("banner")) return { tab: "banner", section: "Promotional banner" };
  if (key.startsWith("spec")) return { tab: "specs", section: "Materials & details" };
  if (key.startsWith("contact")) return { tab: "contact", section: "Contact section" };
  if (key.startsWith("footer")) return { tab: "footer", section: "Footer content" };
  if (["whatsappNumber", "whatsappGroupUrl", "tiktokUrl", "instagramUrl", "facebookUrl"].includes(key)) return { tab: "social", section: "Social & contact links" };
  if (key.startsWith("categorySection") || key.startsWith("collection")) return { tab: "pages", section: PAGE_LABELS.home, page: "home" };
  return null;
}

function Field({ label, value, onChange, type = "text", textarea = false, placeholder, hint, min, step, required, disabled, maxLength, fieldPath }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  placeholder?: string;
  hint?: string;
  min?: number;
  step?: number | "any";
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  fieldPath?: string;
}) {
  const id = useId();
  const inputClass = `w-full rounded-xl border border-white/10 bg-brand-green-dark px-4 py-3 text-sm text-brand-cream outline-none transition placeholder:text-brand-cream-muted focus:border-brand-gold/60 focus:ring-4 focus:ring-brand-gold/5 disabled:cursor-not-allowed disabled:opacity-50 ${textarea ? "min-h-28 resize-y leading-relaxed" : ""}`;

  return (
    <div data-admin-field={fieldPath} className="scroll-mt-32 rounded-xl">
      <label htmlFor={id} className="mb-2 block text-xs font-medium text-brand-cream">
        {label}{required && <span className="ml-1 text-brand-gold">*</span>}
      </label>
      {textarea ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} required={required} disabled={disabled} />
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} min={min} step={step} maxLength={maxLength} className={inputClass} required={required} disabled={disabled} />
      )}
      {hint && <p className="mt-2 text-[11px] leading-relaxed text-brand-cream-muted">{hint}</p>}
    </div>
  );
}

function readableLabel(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (character) => character.toUpperCase());
}

function ContentEditor({ label, value, onChange, itemTemplate, allowEmpty = false, path }: { label: string; value: unknown; onChange: (value: unknown) => void; itemTemplate?: Record<string, unknown>; allowEmpty?: boolean; path?: string }) {
  const fieldPath = path || label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (typeof value === "string") {
    if (label.toLowerCase() === "icon") {
      return (
        <div data-admin-field={fieldPath} className="scroll-mt-32 rounded-xl">
          <label className="mb-2 block text-xs font-medium text-brand-cream">Icon</label>
          <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-white/10 bg-brand-green-dark px-4 py-3 text-sm text-brand-cream outline-none focus:border-brand-gold/60">
            {["shield", "truck", "clock", "award", "gem", "scissors", "scroll", "package", "check", "sparkles"].map((icon) => <option key={icon}>{icon}</option>)}
          </select>
        </div>
      );
    }
    return <div data-admin-field={fieldPath} className="scroll-mt-32 rounded-xl"><Field label={label} value={value} onChange={(next) => onChange(next)} textarea={value.length > 90 || /description|paragraph|answer|message|note|text|image urls/i.test(label)} hint={label === "Image Urls" ? "Separate multiple image URLs with commas." : undefined} /></div>;
  }
  if (typeof value === "number") {
    const isCurrencyMargin = label === "Currency Margin Pkr";
    const isExchangeRate = label === "Rate";
    return <div data-admin-field={fieldPath} className="scroll-mt-32 rounded-xl"><Field label={label} value={String(value)} onChange={(next) => onChange(Number(next))} type="number" min={isCurrencyMargin ? 500 : isExchangeRate ? 0.00000001 : 0} step={isExchangeRate ? "any" : undefined} hint={isCurrencyMargin ? "Minimum allowed margin: PKR 500. PKR prices are never increased." : isExchangeRate ? "Currency units per 1 PKR. Example: 1 PKR = 0.00355 USD, so enter 0.00355." : undefined} /></div>;
  }
  if (typeof value === "boolean") {
    return (
      <div data-admin-field={fieldPath} className="scroll-mt-32 rounded-xl">
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.06] bg-black/10 p-4 text-xs text-brand-cream">
          <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-brand-gold" />
          {label}
        </label>
      </div>
    );
  }
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "string") && !itemTemplate && !allowEmpty) {
      return <Field label={label} value={value.join("\n")} onChange={(next) => onChange(next.split("\n").map((item) => item.trim()).filter(Boolean))} textarea hint="One item per line." />;
    }
    const items = value as Record<string, unknown>[];
    const addItem = () => {
      const template = items[0] || itemTemplate || {};
      const created = Object.fromEntries(Object.keys(template).map((key) => {
        const current = template[key];
        if (key === "id") return [key, `item-${Date.now().toString(36)}`];
        if (typeof current === "number") return [key, 0];
        if (typeof current === "boolean") return [key, false];
        if (Array.isArray(current)) return [key, []];
        return [key, ""];
      }));
      onChange([...items, created]);
    };
    return (
      <div data-admin-field={fieldPath} className="scroll-mt-32 space-y-4 rounded-xl">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">{label} ({items.length})</h3>
          <button type="button" onClick={addItem} className="inline-flex items-center gap-1.5 rounded-lg border border-brand-gold/25 px-3 py-2 text-[11px] text-brand-gold transition hover:bg-brand-gold hover:text-brand-green-dark"><Plus size={13} /> Add item</button>
        </div>
        {items.map((item, index) => (
          <div key={String(item.id || index)} className="rounded-xl border border-white/[0.07] bg-black/10 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-cream-muted">{label} {index + 1}</span>
              <button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} disabled={items.length === 1 && !allowEmpty} aria-label={`Remove ${label} ${index + 1}`} className="rounded-lg border border-brand-danger/20 p-2 text-[#c47e7e] transition hover:bg-brand-danger/10 hover:text-brand-danger disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={13} /></button>
            </div>
            <div className="space-y-4">
              {Object.entries(item).map(([key, itemValue]) => <ContentEditor key={key} label={readableLabel(key)} value={itemValue} path={`${fieldPath}.${index}.${key}`} onChange={(next) => onChange(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, [key]: next } : entry))} />)}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (value && typeof value === "object") {
    return (
      <fieldset data-admin-field={fieldPath} className="scroll-mt-32 space-y-5 rounded-xl border border-white/[0.07] bg-black/10 p-5">
        <legend className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">{label}</legend>
        {Object.entries(value as Record<string, unknown>).map(([key, nested]) => <ContentEditor key={key} label={readableLabel(key)} value={nested} path={`${fieldPath}.${key}`} onChange={(next) => onChange({ ...(value as Record<string, unknown>), [key]: next })} />)}
      </fieldset>
    );
  }
  return null;
}

export default function AdminPage() {
  const store = useStore();
  const [authReady, setAuthReady] = useState(() => !isSupabaseConfigured || !supabase);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetNotice, setResetNotice] = useState<Notice>(null);
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [selectedPage, setSelectedPage] = useState<keyof typeof PAGE_LABELS>("home");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedField, setFocusedField] = useState<{ path: string; token: number } | null>(null);
  const [deliveryEditorOpen, setDeliveryEditorOpen] = useState(false);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSecurityPasswords, setShowSecurityPasswords] = useState(false);
  const [securityBusy, setSecurityBusy] = useState(false);
  const [securityNotice, setSecurityNotice] = useState<Notice>(null);
  const [inventoryNotice, setInventoryNotice] = useState("");
  const [inventoryImportBusy, setInventoryImportBusy] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    sessionStorage.removeItem("umarex_admin_passcode");
    if (!isSupabaseConfigured || !supabase) return;

    const client = supabase;
    let active = true;
    const acceptSession = (session: { access_token: string; user: { email?: string } } | null) => {
      if (!active) return;
      if (!session) {
        setIsAuthenticated(false);
        setAuthReady(true);
        return;
      }
      if (session.user.email?.toLowerCase() !== ADMIN_ACCOUNT_EMAIL.toLowerCase()) {
        void client.auth.signOut();
        setPasswordError("This portal is restricted to the configured administrator account.");
        setIsAuthenticated(false);
        setAuthReady(true);
        return;
      }
      setIsAuthenticated(true);
      setAuthReady(true);
    };

    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setRecoveryMode(true);
        setActiveTab("security");
        setSecurityNotice({ type: "info", text: "Choose a new password below to complete your password reset." });
      }
      if (event === "SIGNED_OUT") {
        setRecoveryMode(false);
        setIsAuthenticated(false);
      }
      acceptSession(session);
    });

    void client.auth.getSession().then(({ data }) => acceptSession(data.session));
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || initialized.current || store.status === "loading") return;
    initialized.current = true;
    setProducts(store.products);
    setSettings({
      ...store.settings,
      showcase: initialShowcase(store.settings, store.products),
      commerce: {
        ...store.settings.commerce,
        currencies: store.settings.commerce.currencies.map((currency) => (
          normalizeCode(currency.code) === "PKR" ? { ...currency, code: "PKR", rate: 1 } : currency
        )),
      },
    });
  }, [isAuthenticated, store.status, store.products, store.settings]);

  const searchResults = useMemo(() => {
    const results: SearchResult[] = [];
    navigation.forEach((group) => group.tabs.forEach((tab) => {
      results.push({
        id: `section:${tab.key}`,
        label: tab.label,
        detail: group.label,
        tab: tab.key,
        searchText: `${tab.label} ${group.label}`.toLowerCase(),
      });
    }));
    addSearchResults(settings.shared, "settings.shared", ["Brand, navigation & SEO"], { tab: "shared", section: "Brand, navigation & SEO" }, results);
    addSearchResults(settings.showcase, "settings.showcase", ["Product Showcase"], { tab: "showcase", section: "Product Showcase" }, results);
    addSearchResults(settings.commerce, "settings.commerce", ["Delivery, countries & currency"], { tab: "commerce", section: "Delivery, countries & currency" }, results);
    addSearchResults(settings.pages.trackOrder, "settings.pages.trackOrder", ["Track order page"], { tab: "trackOrder", section: "Track order page" }, results);
    (Object.keys(PAGE_LABELS) as (keyof typeof PAGE_LABELS)[]).forEach((page) => {
      if (page === "trackOrder") return;
      addSearchResults(settings.pages[page], `settings.pages.${page}`, [PAGE_LABELS[page]], { tab: "pages", section: PAGE_LABELS[page], page }, results);
    });
    Object.entries(settings).forEach(([key, value]) => {
      if (key === "shared" || key === "pages" || key === "commerce") return;
      const location = topLevelSearchLocation(key);
      if (location) addSearchResults(value, `settings.${key}`, [readableLabel(key)], location, results);
    });
    products.forEach((product) => {
      const detail = `${product.category} · Rs ${product.price.toLocaleString()}`;
      results.push({
        id: `product:${product.id}`,
        label: product.name,
        detail,
        tab: "products",
        product,
        searchText: `${product.name} ${product.category} ${product.collectionTag || ""} ${product.description} ${detail}`.toLowerCase(),
      });
    });
    return results;
  }, [settings, products]);

  const quickSearchResults = useMemo<SearchResult[]>(() => [
    { id: "quick:delivery", label: "Delivery charge", detail: `Pakistan advance: Rs ${settings.commerce.domesticDeliveryChargePkr.toLocaleString()}`, tab: "commerce", path: "settings.commerce.domesticDeliveryChargePkr", searchText: "delivery charge shipping" },
    { id: "quick:countries", label: "Countries & currencies", detail: "Enabled destinations, exchange rates and international margin", tab: "commerce", path: "settings.commerce.countries", searchText: "countries currency exchange rate margin" },
    { id: "quick:tracking", label: "Track order page", detail: "Form, delivery journey and WhatsApp message", tab: "trackOrder", searchText: "track order tracking" },
    { id: "quick:product", label: "Product detail defaults", detail: "Shipping, materials and order buttons", tab: "pages", page: "product", path: "settings.pages.product", searchText: "product detail leather materials specifications" },
    { id: "quick:showcase", label: "Product Showcase", detail: "Featured ordering, new arrivals and best sellers", tab: "showcase", searchText: "featured new best seller showcase wallets accessories" },
    { id: "quick:home", label: "Homepage section headings", detail: "Category and collection titles", tab: "pages", page: "home", path: "settings.categorySectionTag", searchText: "home category collection headings" },
    { id: "quick:layout", label: "Page layouts", detail: "Section order and card sizes", tab: "pageLayouts", path: "settings.pageLayouts", searchText: "page layouts every page reorder move sections resize boxes categories benefits reviews policies forms products" },
    { id: "quick:products", label: "Leather products", detail: `${products.length} wallets and accessories in your catalog`, tab: "products", searchText: "products catalog wallets accessories leather" },
    { id: "quick:security", label: "Change administrator password", detail: "Account security and reset email", tab: "security", searchText: "password security reset" },
  ], [settings.commerce.domesticDeliveryChargePkr, products.length]);

  const visibleSearchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return quickSearchResults;
    return searchResults
      .filter((result) => result.searchText.includes(query))
      .sort((a, b) => {
        const aLabel = a.label.toLowerCase();
        const bLabel = b.label.toLowerCase();
        const aScore = aLabel === query ? 0 : aLabel.startsWith(query) ? 1 : aLabel.includes(query) ? 2 : 3;
        const bScore = bLabel === query ? 0 : bLabel.startsWith(query) ? 1 : bLabel.includes(query) ? 2 : 3;
        return aScore - bScore || a.label.localeCompare(b.label);
      })
      .slice(0, 16);
  }, [searchQuery, searchResults, quickSearchResults]);

  const openSearchResult = (result: SearchResult) => {
    setSearchOpen(false);
    setSearchQuery("");
    setActiveTab(result.tab);
    if (result.page) setSelectedPage(result.page);
    if (result.product) {
      setEditingProduct(result.product);
      setIsAddingNew(false);
    }
    if (result.path) setFocusedField({ path: result.path, token: Date.now() });
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (!editingProduct && !deliveryEditorOpen && !searchOpen) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setEditingProduct(null);
      setIsAddingNew(false);
      setDeliveryEditorOpen(false);
      setSearchOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingProduct, deliveryEditorOpen, searchOpen]);

  useEffect(() => {
    if (!focusedField) return;
    const timer = window.setTimeout(() => {
      const target = Array.from(document.querySelectorAll<HTMLElement>("[data-admin-field]"))
        .find((element) => element.dataset.adminField === focusedField.path);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      const previousShadow = target.style.boxShadow;
      const previousRadius = target.style.borderRadius;
      target.style.boxShadow = "0 0 0 3px rgba(212, 175, 55, 0.65)";
      target.style.borderRadius = "12px";
      target.querySelector<HTMLElement>("input, textarea, select")?.focus({ preventScroll: true });
      window.setTimeout(() => {
        target.style.boxShadow = previousShadow;
        target.style.borderRadius = previousRadius;
      }, 1800);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [focusedField, activeTab, selectedPage]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoginBusy(true);
    setPasswordError("");
    setResetNotice(null);

    if (!isSupabaseConfigured || !supabase) {
      setPasswordError("The database is not configured on this build.");
      setLoginBusy(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_ACCOUNT_EMAIL,
      password,
    });

    if (error || !data.session) {
      setPasswordError(error?.message === "Invalid login credentials" ? "Incorrect password. Please try again." : error?.message || "Unable to sign in. Please try again.");
      setLoginBusy(false);
      return;
    }

    setPassword("");
    setIsAuthenticated(true);
    setLoginBusy(false);
  };

  const handlePasswordReset = async () => {
    if (!supabase) return;
    setResetBusy(true);
    setResetNotice(null);
    setPasswordError("");
    const { error } = await supabase.auth.resetPasswordForEmail(ADMIN_ACCOUNT_EMAIL, {
      redirectTo: `${window.location.origin}/admin`,
    });
    setResetBusy(false);
    setResetNotice(error
      ? { type: "error", text: error.message }
      : { type: "success", text: `A reset link has been sent to ${ADMIN_ACCOUNT_EMAIL}. Check your inbox and spam folder.` });
  };

  const handleLogout = async () => {
    if (dirty && !confirm("You have unsaved changes. Discard them and sign out?")) return;
    if (supabase) await supabase.auth.signOut();
    sessionStorage.removeItem("umarex_admin_passcode");
    setPassword("");
    setRecoveryMode(false);
    setIsAuthenticated(false);
    setActiveTab("products");
    setEditingProduct(null);
    setIsAddingNew(false);
    setDirty(false);
    setSaveStatus("idle");
    initialized.current = false;
  };

  const markDirty = () => {
    setDirty(true);
    if (saveStatus === "saved" || saveStatus === "local") setSaveStatus("idle");
  };

  const handleSave = useCallback(async () => {
    const validationError = commerceValidationError(settings.commerce);
    if (validationError) {
      setSaveStatus("error");
      setSaveError(validationError);
      setActiveTab("commerce");
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      setSaveStatus("local");
      setDirty(false);
      setTimeout(() => setSaveStatus("idle"), 2500);
      return;
    }

    const normalizedSettings = settingsForSave(settings);
    setSaveStatus("saving");
    setSaveError("");
    store.setSettings(normalizedSettings);
    store.setProducts(products);

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session || session.user.email?.toLowerCase() !== ADMIN_ACCOUNT_EMAIL.toLowerCase()) {
      setSaveStatus("error");
      setSaveError("Your session has expired. Sign out and sign in again before saving.");
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.email?.toLowerCase() !== ADMIN_ACCOUNT_EMAIL.toLowerCase()) {
      setSaveStatus("error");
      setSaveError("Your admin session is invalid or has expired. Please sign in again.");
      return;
    }

    const currentAccessToken = session.access_token;
    const [catalogRes, settingsRes] = await Promise.all([
      store.persist(CATALOG_CONTENT_ID, { products }, currentAccessToken),
      store.persist(SETTINGS_CONTENT_ID, normalizedSettings, currentAccessToken),
    ]);

    if (catalogRes.ok && settingsRes.ok) {
      setSaveStatus("saved");
      setDirty(false);
      store.refresh();
      setTimeout(() => setSaveStatus("idle"), 2500);
    } else {
      setSaveStatus("error");
      setSaveError(catalogRes.error || settingsRes.error || "Save failed.");
    }
  }, [products, settings, store]);

  const updateSetting = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    markDirty();
  };

  const showcase = normalizeShowcase(settings.showcase);

  const updateShowcaseField = (field: ShowcaseField, ids: string[]) => {
    setSettings((prev) => ({
      ...prev,
      showcase: { ...normalizeShowcase(prev.showcase), [field]: normalizeIdList(ids) },
    }));
    markDirty();
  };

  const toggleShowcaseProduct = (productId: string, field: ShowcaseField) => {
    const id = String(productId);
    const currentIds = normalizeShowcase(settings.showcase)[field];
    updateShowcaseField(field, currentIds.includes(id) ? currentIds.filter((currentId) => currentId !== id) : [...currentIds, id]);
  };

  const moveShowcaseProduct = (productId: string, direction: -1 | 1) => {
    const id = String(productId);
    const currentIds = normalizeShowcase(settings.showcase).featuredProductIds;
    const currentIndex = currentIds.indexOf(id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= currentIds.length) return;
    const nextIds = [...currentIds];
    [nextIds[currentIndex], nextIds[nextIndex]] = [nextIds[nextIndex], nextIds[currentIndex]];
    updateShowcaseField("featuredProductIds", nextIds);
  };

  const updateProductBadge = (productId: string, field: ShowcaseField, enabled: boolean) => {
    const currentIds = normalizeShowcase(settings.showcase)[field];
    updateShowcaseField(field, enabled ? normalizeIdList([...currentIds, productId]) : currentIds.filter((id) => id !== productId));
    const productField = field === "featuredProductIds" ? "isFeatured" : field === "newProductIds" ? "isNew" : "isBestSeller";
    setEditingProduct((current) => current && String(current.id) === productId ? { ...current, [productField]: enabled } : current);
  };

  const updateCommerce = (update: (commerce: SiteSettings["commerce"]) => SiteSettings["commerce"]) => {
    setSettings((prev) => ({ ...prev, commerce: update(prev.commerce) }));
    markDirty();
  };

  const updateCurrency = (index: number, field: keyof SiteSettings["commerce"]["currencies"][number], value: string) => {
    updateCommerce((commerce) => ({
      ...commerce,
      currencies: commerce.currencies.map((currency, currencyIndex) => {
        if (currencyIndex !== index) return currency;
        const code = normalizeCode(currency.code);
        if (code === "PKR" && (field === "code" || field === "rate")) return currency;
        if (field === "code") return { ...currency, code: normalizeCode(value).slice(0, 3) };
        if (field === "rate") return { ...currency, rate: Number(value) };
        return { ...currency, [field]: value };
      }),
    }));
  };

  const addCurrency = () => {
    updateCommerce((commerce) => ({
      ...commerce,
      currencies: [...commerce.currencies, { code: nextUnusedCode(commerce.currencies.map((currency) => currency.code), 3), symbol: "", locale: "en-US", rate: 0 }],
    }));
  };

  const removeCurrency = (code: string) => {
    if (normalizeCode(code) === "PKR") return;
    updateCommerce((commerce) => ({ ...commerce, currencies: commerce.currencies.filter((currency) => normalizeCode(currency.code) !== normalizeCode(code)) }));
  };

  const updateCountry = (index: number, field: keyof CountryOption, value: string | boolean) => {
    updateCommerce((commerce) => ({
      ...commerce,
      countries: commerce.countries.map((country, countryIndex) => {
        if (countryIndex !== index) return country;
        if (field === "code") return { ...country, code: normalizeCode(value).slice(0, 2) };
        return { ...country, [field]: value };
      }),
    }));
  };

  const addCountry = () => {
    updateCommerce((commerce) => ({
      ...commerce,
      countries: [...commerce.countries, { code: nextUnusedCode(commerce.countries.map((country) => country.code), 2), name: "", currency: "PKR", enabled: true }],
    }));
  };

  const removeCountry = (code: string) => {
    if (normalizeCode(code) === "PK") return;
    updateCommerce((commerce) => ({ ...commerce, countries: commerce.countries.filter((country) => normalizeCode(country.code) !== normalizeCode(code)) }));
  };

  const updateSpec = (number: 1 | 2 | 3, field: "Title" | "Description", value: string) => {
    const key = `spec${number}${field}` as keyof SiteSettings;
    setSettings((prev) => ({ ...prev, [key]: value }));
    markDirty();
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Delete this leather product? It will be removed from the live catalog when you save changes.")) {
      const productId = String(id);
      setProducts((prev) => prev.filter((p) => String(p.id) !== productId));
      setSettings((prev) => ({
        ...prev,
        showcase: {
          featuredProductIds: normalizeShowcase(prev.showcase).featuredProductIds.filter((currentId) => currentId !== productId),
          newProductIds: normalizeShowcase(prev.showcase).newProductIds.filter((currentId) => currentId !== productId),
          bestSellerProductIds: normalizeShowcase(prev.showcase).bestSellerProductIds.filter((currentId) => currentId !== productId),
        },
      }));
      markDirty();
    }
  };

  const handleSaveProduct = () => {
    if (!editingProduct) return;
    if (!editingProduct.id.trim() || !editingProduct.name.trim() || !editingProduct.image.trim()) {
      alert("Product ID, name and main image URL are required.");
      return;
    }
    if (!Number.isFinite(Number(editingProduct.price)) || editingProduct.price <= 0) {
      alert("Please enter a valid product price.");
      return;
    }
    const productId = String(editingProduct.id).trim();
    const currentShowcase = normalizeShowcase(settings.showcase);
    const featured = isAddingNew ? editingProduct.isFeatured === true : currentShowcase.featuredProductIds.includes(productId);
    const newArrival = isAddingNew ? editingProduct.isNew === true : currentShowcase.newProductIds.includes(productId);
    const bestSeller = isAddingNew ? editingProduct.isBestSeller === true : currentShowcase.bestSellerProductIds.includes(productId);
    const nextShowcase: SiteSettings["showcase"] = {
      featuredProductIds: featured ? normalizeIdList([...currentShowcase.featuredProductIds, productId]) : currentShowcase.featuredProductIds.filter((id) => id !== productId),
      newProductIds: newArrival ? normalizeIdList([...currentShowcase.newProductIds, productId]) : currentShowcase.newProductIds.filter((id) => id !== productId),
      bestSellerProductIds: bestSeller ? normalizeIdList([...currentShowcase.bestSellerProductIds, productId]) : currentShowcase.bestSellerProductIds.filter((id) => id !== productId),
    };
    const productToSave: AdminProduct = {
      ...editingProduct,
      id: productId,
      isFeatured: nextShowcase.featuredProductIds.includes(productId),
      isNew: nextShowcase.newProductIds.includes(productId),
      isBestSeller: nextShowcase.bestSellerProductIds.includes(productId),
    };
    setSettings((prev) => ({ ...prev, showcase: nextShowcase }));
    setProducts((prev) =>
      isAddingNew
        ? [...prev, productToSave]
        : prev.map((p) => String(p.id) === productId ? productToSave : p)
    );
    setEditingProduct(null);
    setIsAddingNew(false);
    markDirty();
  };

  const handleAddNew = () => {
    setEditingProduct({
      id: `leather-${Date.now().toString(36)}`,
      name: "", category: "wallet", collectionTag: "", price: 0, image: "",
      gallery: [], description: "", isNew: true, isFeatured: false,
    });
    setIsAddingNew(true);
  };

  const handleImportInventory = async () => {
    if (!supabase) {
      setInventoryNotice("The database is not configured in this browser.");
      return;
    }
    setInventoryImportBusy(true);
    setInventoryNotice("");
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      const items: AdminProduct[] = (data || []).map((item) => {
        const optionalText = (value: unknown) => value === null || value === undefined || value === "" ? undefined : String(value);
        const oldPrice = Number(item.old_price ?? item.oldPrice);
        return {
          id: String(item.id ?? ""),
          name: String(item.name || ""),
          category: String(item.category || "accessory"),
          collectionTag: String(item.collection_tag || item.collectionTag || ""),
          price: Number(item.price) || 0,
          oldPrice: Number.isFinite(oldPrice) && oldPrice > 0 ? oldPrice : undefined,
          image: String(item.image_url || item.image || ""),
          gallery: databaseImages(item.image_urls ?? item.gallery),
          description: String(item.description || ""),
          specifications: databaseSpecifications(item.specs ?? item.specifications),
          isNew: Boolean(item.is_new ?? item.isNew),
          isBestSeller: Boolean(item.is_best_seller ?? item.isBestSeller),
          isFeatured: Boolean(item.is_featured ?? item.isFeatured),
          detailTagline: optionalText(item.detail_tagline ?? item.detailTagline),
          detailDescription: optionalText(item.detail_description ?? item.detailDescription),
          shippingTitle: optionalText(item.shipping_title ?? item.shippingTitle),
          shippingNote1: optionalText(item.shipping_note1 ?? item.shippingNote1),
          shippingNote2: optionalText(item.shipping_note2 ?? item.shippingNote2),
          overviewTitle: optionalText(item.overview_title ?? item.overviewTitle),
          specificationsTitle: optionalText(item.specifications_title ?? item.specificationsTitle),
          orderButtonText: optionalText(item.order_button_text ?? item.orderButtonText),
          relatedTag: optionalText(item.related_tag ?? item.relatedTag),
          relatedTitle: optionalText(item.related_title ?? item.relatedTitle),
          newBadgeText: optionalText(item.new_badge_text ?? item.newBadgeText),
          offerBadgeText: optionalText(item.offer_badge_text ?? item.offerBadgeText),
        };
      });
      setProducts(items);
      setSettings((prev) => {
        const current = normalizeShowcase(prev.showcase);
        const addFlagged = (ids: string[], flagged: AdminProduct[]) => normalizeIdList([...ids, ...flagged.map((product) => product.id)]);
        return {
          ...prev,
          showcase: {
            featuredProductIds: addFlagged(current.featuredProductIds, items.filter((product) => product.isFeatured)),
            newProductIds: addFlagged(current.newProductIds, items.filter((product) => product.isNew)),
            bestSellerProductIds: addFlagged(current.bestSellerProductIds, items.filter((product) => product.isBestSeller)),
          },
        };
      });
      markDirty();
      setInventoryNotice(`Imported ${items.length} leather products. Click Save all changes to publish them.`);
    } catch {
      setInventoryNotice("Could not import leather products. Check the database connection and try again.");
    } finally {
      setInventoryImportBusy(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset the leather catalog and website text to the loaded defaults? Click Save all afterwards to publish the reset.")) {
      setProducts(store.products.length ? store.products : []);
      setSettings(DEFAULT_SITE_SETTINGS);
      markDirty();
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSecurityNotice(null);

    if (newPassword.length < 10) {
      setSecurityNotice({ type: "error", text: "Use at least 10 characters for your new password." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityNotice({ type: "error", text: "The new passwords do not match." });
      return;
    }
    if (!recoveryMode && !currentPassword) {
      setSecurityNotice({ type: "error", text: "Enter your current password to confirm this change." });
      return;
    }

    setSecurityBusy(true);
    if (!recoveryMode) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: ADMIN_ACCOUNT_EMAIL,
        password: currentPassword,
      });
      if (error || !data.session) {
        setSecurityBusy(false);
        setSecurityNotice({ type: "error", text: "Your current password is incorrect. Please try again." });
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSecurityBusy(false);
    if (error) {
      setSecurityNotice({ type: "error", text: error.message });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setRecoveryMode(false);
    setSecurityNotice({ type: "success", text: "Your password has been updated successfully. Use the new password the next time you sign in." });
  };

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-green-dark text-brand-cream">
        <div className="flex items-center gap-3 text-sm text-brand-cream-muted">
          <Loader2 size={18} className="animate-spin text-brand-gold" /> Preparing your admin portal…
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-green-dark text-brand-cream lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-white/5 bg-brand-green-mid p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-brand-gold/5 blur-3xl" />
          <div className="absolute -right-40 -top-20 h-[30rem] w-[30rem] rounded-full bg-brand-leather-glow/20 blur-3xl" />
          <Link href="/" className="relative flex w-fit items-center">
            <Image src="/leather-logo.png" alt="UM-AREX Leather" width={240} height={79} priority className="h-[72px] w-auto object-contain" />
          </Link>
          <div className="relative max-w-xl py-16">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/5 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-brand-gold">
              <Sparkles size={13} /> Management console
            </div>
            <h1 className="font-serif text-4xl leading-[1.3] text-brand-cream xl:text-5xl">Crafted for enduring style.</h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-brand-cream-muted">A private workspace to curate your wallets and accessories, refine your leather brand, and keep your storefront current.</p>
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {[{ icon: ShieldCheck, label: "Secure access" }, { icon: Database, label: "Live catalog" }, { icon: Sparkles, label: "Brand control" }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-xs text-brand-cream">
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-brand-gold"><Icon size={16} /></span>
                  {label}
                </div>
              ))}
            </div>
          </div>
          <p className="relative text-[10px] uppercase tracking-[0.25em] text-brand-cream-muted">UM-AREX Leather · Authorized personnel only</p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <Link href="/" className="inline-flex items-center">
                <Image src="/leather-logo.png" alt="UM-AREX Leather" width={210} height={69} priority className="h-[62px] w-auto object-contain" />
              </Link>
            </div>
            <div className="mb-8">
              <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-brand-gold/20 bg-brand-gold/5 text-brand-gold"><LockKeyhole size={21} /></span>
              <h2 className="font-serif text-3xl text-brand-cream">Welcome back</h2>
              <p className="mt-2 text-sm text-brand-cream-muted">Sign in to manage your leather storefront and catalog.</p>
            </div>

            <form onSubmit={handleLogin} className="rounded-3xl border border-white/10 bg-brand-green-mid/90 p-6 shadow-2xl shadow-black/20 sm:p-8">
              <div className="mb-6">
                <label className="mb-2 block text-xs font-medium text-brand-cream">Administrator account</label>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-brand-green-dark px-4 py-3.5 text-sm text-brand-cream">
                  <Mail size={16} className="shrink-0 text-brand-gold/70" />
                  <span className="truncate">{ADMIN_ACCOUNT_EMAIL}</span>
                </div>
              </div>
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="admin-password" className="text-xs font-medium text-brand-cream">Password</label>
                  <button type="button" onClick={handlePasswordReset} disabled={resetBusy} className="text-xs font-medium text-brand-gold transition hover:text-brand-gold-light disabled:opacity-50">
                    {resetBusy ? "Sending…" : "Forgot password?"}
                  </button>
                </div>
                <div className="relative">
                  <input id="admin-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }} placeholder="Enter your password" autoComplete="current-password" className="w-full rounded-xl border border-white/10 bg-brand-green-dark px-4 py-3.5 pr-12 text-sm text-brand-cream outline-none transition placeholder:text-brand-cream-muted focus:border-brand-gold/60 focus:ring-4 focus:ring-brand-gold/5" autoFocus />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-brand-cream-muted transition hover:bg-white/5 hover:text-brand-gold">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              {passwordError && <p role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-brand-danger/20 bg-brand-danger/5 p-3 text-xs leading-5 text-[#f19797]"><AlertCircle size={15} className="mt-0.5 shrink-0" />{passwordError}</p>}
              {resetNotice && <p role={resetNotice.type === "error" ? "alert" : "status"} className={`mb-5 flex items-start gap-2 rounded-xl border p-3 text-xs leading-5 ${resetNotice.type === "error" ? "border-brand-danger/20 bg-brand-danger/5 text-[#f19797]" : "border-brand-success/20 bg-brand-success/5 text-[#8bdba8]"}`}><Mail size={15} className="mt-0.5 shrink-0" />{resetNotice.text}</p>}
              <button type="submit" disabled={loginBusy || !password} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-green-dark transition hover:bg-brand-gold-light active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50">
                {loginBusy ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : <>Sign in to admin <ChevronRight size={15} /></>}
              </button>
              <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/5 pt-5 text-[10px] uppercase tracking-[0.16em] text-brand-cream-muted"><ShieldCheck size={13} /> Protected by Supabase authentication</div>
            </form>
            <Link href="/" className="mt-7 inline-flex items-center gap-2 text-xs text-brand-cream-muted transition hover:text-brand-gold"><ArrowLeft size={14} /> Back to storefront</Link>
          </div>
        </section>
      </div>
    );
  }

  const meta = pageMeta[activeTab];
  const currentCommerceError = commerceValidationError(settings.commerce);
  const featuredProductIds = showcase.featuredProductIds.filter((id) => products.some((product) => String(product.id) === id));
  const orderedShowcaseProducts: AdminProduct[] = [
    ...featuredProductIds.map((id) => products.find((product) => String(product.id) === id)).filter((product): product is AdminProduct => Boolean(product)),
    ...products.filter((product) => !featuredProductIds.includes(String(product.id))),
  ];
  const statusBadge = store.status === "live"
    ? { icon: Cloud, text: "Live database", cls: "border-brand-success/20 bg-brand-success/5 text-[#82d6a0]" }
    : store.status === "loading"
      ? { icon: Loader2, text: "Connecting", cls: "border-white/10 bg-white/5 text-brand-cream-muted" }
      : { icon: CloudOff, text: "Local cache", cls: "border-brand-gold/20 bg-brand-gold/5 text-brand-gold" };
  const StatusIcon = statusBadge.icon;
  const securityType = showSecurityPasswords ? "text" : "password";
  const passwordInputClass = "w-full rounded-xl border border-white/10 bg-brand-green-dark px-4 py-3 pr-12 text-sm text-brand-cream outline-none transition placeholder:text-brand-cream-muted focus:border-brand-gold/60 focus:ring-4 focus:ring-brand-gold/5";

  return (
    <div className="min-h-screen bg-brand-green-dark text-brand-cream">
      {mobileNavOpen && <button aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/[0.07] bg-brand-green-mid transition-transform duration-300 lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-24 items-center justify-between border-b border-white/[0.06] px-6">
          <Link href="/" className="flex items-center">
            <Image src="/leather-logo.png" alt="UM-AREX Leather" width={180} height={59} className="h-[52px] w-auto object-contain" />
          </Link>
          <button onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" className="rounded-lg p-2 text-brand-cream-muted hover:bg-white/5 lg:hidden"><X size={18} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {navigation.map((group) => (
            <div key={group.label} className="mb-7">
              <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.24em] text-brand-cream-muted">{group.label}</p>
              <div className="space-y-1">
                {group.tabs.map((tab) => {
                  const Icon = tab.icon;
                  const selected = activeTab === tab.key;
                  return (
                    <button key={tab.key} onClick={() => { setActiveTab(tab.key); setMobileNavOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-medium transition ${selected ? "bg-brand-gold text-brand-green-dark shadow-lg shadow-black/10" : "text-brand-cream-muted hover:bg-white/[0.04] hover:text-brand-cream"}`}>
                      <Icon size={17} strokeWidth={selected ? 2.2 : 1.7} />
                      <span>{tab.label}</span>
                      {selected && <ChevronRight size={14} className="ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/[0.06] p-4">
          <Link href="/" target="_blank" className="mb-3 flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-xs text-brand-cream-muted transition hover:border-brand-gold/20 hover:text-brand-gold"><span className="flex items-center gap-2"><ExternalLink size={14} /> View storefront</span><ArrowUpRight size={13} /></Link>
          <div className="flex items-center gap-3 rounded-xl bg-black/10 p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-gold/10 text-xs font-semibold text-brand-gold">UA</span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-brand-cream">Administrator</span>
              <span className="block truncate text-[10px] text-brand-cream-muted">{ADMIN_ACCOUNT_EMAIL}</span>
            </span>
            <ShieldCheck size={15} className="shrink-0 text-brand-gold" />
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-brand-green-dark/95 backdrop-blur-xl">
          <div className="flex min-h-20 items-center gap-3 px-5 sm:px-8 xl:px-10">
            <button onClick={() => setMobileNavOpen(true)} aria-label="Open navigation" className="rounded-xl border border-white/10 p-2.5 text-brand-cream-muted lg:hidden"><Menu size={18} /></button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[9px] font-semibold uppercase tracking-[0.22em] text-brand-cream-muted">{meta.eyebrow}</p>
              <p className="mt-1 truncate text-sm font-medium text-brand-cream">{meta.title}</p>
            </div>
            <span className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium sm:inline-flex ${statusBadge.cls}`}><StatusIcon size={12} className={store.status === "loading" ? "animate-spin" : ""} />{statusBadge.text}</span>
            {saveStatus === "saving" && <span className="hidden items-center gap-1.5 text-xs text-brand-cream-muted md:flex"><Loader2 size={14} className="animate-spin" /> Saving…</span>}
            {saveStatus === "saved" && <span className="hidden items-center gap-1.5 text-xs text-[#82d6a0] md:flex"><CheckCircle2 size={14} /> All changes saved</span>}
            {saveStatus === "local" && <span className="hidden items-center gap-1.5 text-xs text-brand-gold md:flex"><Check size={14} /> Saved locally</span>}
            <button onClick={() => setSearchOpen(true)} aria-label="Search admin settings" title="Search settings (Ctrl+K)" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-[11px] font-medium text-brand-cream-muted transition hover:border-brand-gold/30 hover:text-brand-gold"><Search size={15} /><span className="hidden xl:inline">Search</span><kbd className="hidden rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-brand-cream-muted lg:inline">Ctrl K</kbd></button>
            <button onClick={() => setDeliveryEditorOpen(true)} aria-label="Change delivery charge" title="Change delivery charge" className="inline-flex items-center gap-2 rounded-xl border border-brand-gold/20 bg-brand-gold/5 px-3 py-2.5 text-[11px] font-semibold text-brand-gold transition hover:bg-brand-gold hover:text-brand-green-dark"><Truck size={15} /><span className="hidden xl:inline">Rs {settings.commerce.domesticDeliveryChargePkr.toLocaleString()}</span></button>
            <button onClick={handleSave} disabled={saveStatus === "saving" || !dirty || activeTab === "security" || Boolean(currentCommerceError)} title={currentCommerceError || "Save all pending changes"} className="flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-green-dark transition hover:bg-brand-gold-light disabled:cursor-not-allowed disabled:opacity-40"><Save size={14} /><span className="hidden sm:inline">Save all</span></button>
            <button onClick={handleLogout} aria-label="Sign out" title="Sign out" className="rounded-xl border border-white/10 p-2.5 text-brand-cream-muted transition hover:border-brand-danger/30 hover:text-brand-danger"><LogOut size={16} /></button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 xl:px-10">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-gold">{meta.eyebrow}</p>
              <h1 className="font-serif text-2xl text-brand-cream sm:text-3xl">{meta.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-cream-muted">{meta.description}</p>
            </div>
            {activeTab === "products" && <button onClick={handleAddNew} className="flex w-fit items-center gap-2 rounded-xl border border-brand-gold/30 bg-brand-gold/5 px-4 py-3 text-xs font-semibold text-brand-gold transition hover:bg-brand-gold hover:text-brand-green-dark"><Plus size={16} /> Add leather product</button>}
          </div>

          {dirty && activeTab !== "security" && <div className="mb-6 flex items-center gap-3 rounded-xl border border-brand-gold/15 bg-brand-gold/5 px-4 py-3 text-xs text-brand-gold"><span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />You have unpublished changes. Select <strong className="font-semibold text-brand-gold">Save all</strong> to update the live store.</div>}
          {activeTab === "commerce" && currentCommerceError && <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-brand-danger/20 bg-brand-danger/5 p-4 text-xs leading-6 text-[#e5aaaa]"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span><strong className="font-semibold">Commerce settings need attention.</strong> {currentCommerceError}</span></div>}
          {saveStatus === "error" && saveError && <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-brand-danger/20 bg-brand-danger/5 p-4 text-xs leading-6 text-[#e5aaaa]"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span><strong className="font-semibold">Changes could not be saved.</strong> {saveError}</span></div>}

          {activeTab === "products" && (
            <section>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-brand-green-mid px-5 py-4">
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gold/10 text-brand-gold"><ShoppingBag size={18} /></span><div><p className="text-sm font-medium text-brand-cream">{products.length} leather {products.length === 1 ? "product" : "products"}</p><p className="mt-0.5 text-[11px] text-brand-cream-muted">Wallets and accessories in your current catalog</p></div></div>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={handleImportInventory} disabled={inventoryImportBusy} className="inline-flex items-center gap-2 rounded-xl border border-brand-gold/25 px-3 py-2 text-[11px] font-semibold text-brand-gold transition hover:bg-brand-gold hover:text-brand-green-dark disabled:cursor-not-allowed disabled:opacity-50">
                    {inventoryImportBusy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} {inventoryImportBusy ? "Importing…" : "Import live inventory"}
                  </button>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] ${statusBadge.cls}`}><StatusIcon size={11} />{statusBadge.text}</span>
                </div>
              </div>
              {inventoryNotice && <div role="status" className="mb-6 flex items-start gap-3 rounded-xl border border-brand-gold/15 bg-brand-gold/5 p-4 text-xs leading-6 text-brand-gold"><Database size={16} className="mt-0.5 shrink-0 text-brand-gold" />{inventoryNotice}</div>}
              {products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center"><ShoppingBag size={30} className="mx-auto mb-4 text-brand-cream-muted" /><h2 className="font-serif text-lg text-brand-cream">Your leather collection is empty</h2><p className="mt-2 text-sm text-brand-cream-muted">Add your first wallet or accessory, or import the live inventory.</p><button onClick={handleAddNew} className="mt-6 rounded-xl bg-brand-gold px-5 py-3 text-xs font-bold uppercase tracking-wider text-brand-green-dark">Add leather product</button></div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <article key={product.id} className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-brand-green-mid transition hover:-translate-y-0.5 hover:border-brand-gold/20 hover:shadow-xl hover:shadow-black/10">
                      <div className="relative aspect-[4/3] overflow-hidden bg-brand-green-dark">
                        {product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                        ) : <div className="grid h-full place-items-center text-brand-cream-muted/40"><Package size={34} /></div>}
                        <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-brand-green-dark/85 px-3 py-1 text-[9px] font-medium uppercase tracking-[0.14em] text-brand-cream backdrop-blur-md">{product.category}{product.collectionTag ? ` · ${product.collectionTag}` : ""}</span>
                        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
                          {showcase.featuredProductIds.includes(String(product.id)) && <span className="rounded-full bg-brand-gold px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-brand-green-dark">Featured</span>}
                          {showcase.newProductIds.includes(String(product.id)) && <span className="rounded-full border border-white/10 bg-brand-green-dark/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-brand-cream backdrop-blur-md">New</span>}
                          {showcase.bestSellerProductIds.includes(String(product.id)) && <span className="rounded-full border border-brand-gold/20 bg-brand-green-dark/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-brand-gold backdrop-blur-md">Best seller</span>}
                        </div>
                      </div>
                      <div className="p-5">
                        <h2 className="line-clamp-1 text-sm font-semibold text-brand-cream">{product.name}</h2>
                        <p className="mt-2 font-serif text-lg text-brand-gold">Rs {product.price.toLocaleString()}</p>
                        <div className="mt-5 flex gap-2 border-t border-white/[0.06] pt-4">
                          <button onClick={() => { setEditingProduct(product); setIsAddingNew(false); }} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-xs font-medium text-brand-cream transition hover:border-brand-gold/30 hover:text-brand-gold"><Edit3 size={14} /> Edit</button>
                          <button onClick={() => handleDeleteProduct(product.id)} aria-label={`Delete ${product.name}`} className="rounded-lg border border-white/10 px-3 text-brand-cream-muted transition hover:border-brand-danger/30 hover:bg-brand-danger/5 hover:text-brand-danger"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "showcase" && (
            <section data-admin-field="settings.showcase" className="scroll-mt-32 space-y-5">
              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-brand-gold/15 bg-brand-gold/5 p-5 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gold/10 text-brand-gold"><Sparkles size={18} /></span><div><h2 className="text-sm font-semibold text-brand-cream">Curate the storefront showcase</h2><p className="mt-1 max-w-2xl text-[11px] leading-6 text-brand-cream-muted">Featured selections control homepage ordering. New and best-seller selections control their badges without changing the underlying leather product data.</p></div></div>
                <div className="flex shrink-0 flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wider">
                  <span className="rounded-full border border-brand-gold/20 px-3 py-1.5 text-brand-gold">{featuredProductIds.length} featured</span>
                  <span className="rounded-full border border-white/10 px-3 py-1.5 text-brand-cream-muted">{showcase.newProductIds.length} new</span>
                  <span className="rounded-full border border-white/10 px-3 py-1.5 text-brand-cream-muted">{showcase.bestSellerProductIds.length} best sellers</span>
                </div>
              </div>
              {orderedShowcaseProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center"><Package size={28} className="mx-auto mb-4 text-brand-cream-muted" /><h2 className="font-serif text-lg text-brand-cream">No leather products to showcase</h2><p className="mt-2 text-sm text-brand-cream-muted">Add or import wallets and accessories in the Products tab first.</p><button type="button" onClick={() => setActiveTab("products")} className="mt-6 rounded-xl bg-brand-gold px-5 py-3 text-xs font-bold uppercase tracking-wider text-brand-green-dark">Open Products</button></div>
              ) : (
                <div className="space-y-3">
                  {orderedShowcaseProducts.map((product) => {
                    const productId = String(product.id);
                    const featuredIndex = featuredProductIds.indexOf(productId);
                    return (
                      <article key={productId} className="flex flex-col gap-5 rounded-2xl border border-white/[0.07] bg-brand-green-mid p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/[0.07] bg-brand-green-dark">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                            ) : <div className="grid h-full place-items-center text-brand-cream-muted"><ShoppingBag size={22} /></div>}
                          </div>
                          <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-brand-cream">{product.name}</h3><p className="mt-1 text-[11px] capitalize text-brand-cream-muted">{product.category || "Uncategorized"}{product.collectionTag ? ` · ${product.collectionTag}` : ""}</p><p className="mt-1 font-serif text-sm text-brand-gold">Rs {product.price.toLocaleString()}</p></div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          {([
                            { field: "featuredProductIds", label: "Featured" },
                            { field: "newProductIds", label: "New" },
                            { field: "bestSellerProductIds", label: "Best seller" },
                          ] as { field: ShowcaseField; label: string }[]).map(({ field, label }) => (
                            <label key={field} className="flex cursor-pointer items-center gap-2 text-xs text-brand-cream"><input type="checkbox" checked={showcase[field].includes(productId)} onChange={() => toggleShowcaseProduct(productId, field)} className="h-4 w-4 accent-brand-gold" />{label}</label>
                          ))}
                          {featuredIndex >= 0 && <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/10 px-2 py-1.5"><button type="button" onClick={() => moveShowcaseProduct(productId, -1)} disabled={featuredIndex === 0} aria-label={`Move ${product.name} up`} className="rounded-lg p-1.5 text-brand-gold transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"><ArrowUp size={14} /></button><span className="min-w-12 text-center text-[10px] font-medium text-brand-cream-muted">{featuredIndex + 1} / {featuredProductIds.length}</span><button type="button" onClick={() => moveShowcaseProduct(productId, 1)} disabled={featuredIndex === featuredProductIds.length - 1} aria-label={`Move ${product.name} down`} className="rounded-lg p-1.5 text-brand-gold transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"><ArrowDown size={14} /></button></div>}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
              <p className="text-[11px] leading-6 text-brand-cream-muted">Use the arrows to set the featured sequence. Select <strong className="font-medium text-brand-gold">Save all</strong> to publish showcase changes.</p>
            </section>
          )}

          {activeTab === "pageLayouts" && (
            <PageLayoutEditor value={settings.pageLayouts} onChange={(value) => updateSetting("pageLayouts", value)} />
          )}

          {activeTab !== "products" && activeTab !== "showcase" && activeTab !== "pageLayouts" && activeTab !== "security" && (
            <div className="rounded-2xl border border-white/[0.07] bg-brand-green-mid p-5 sm:p-7">
              {activeTab === "shared" && <ContentEditor label="Brand, navigation, footer & SEO" path="settings.shared" value={settings.shared} onChange={(value) => updateSetting("shared", value as SiteSettings["shared"])} />}

              {activeTab === "pages" && (
                <div className="space-y-7">
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(PAGE_LABELS) as (keyof typeof PAGE_LABELS)[]).map((key) => (
                      <button key={key} type="button" onClick={() => setSelectedPage(key)} className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-wider transition ${selectedPage === key ? "border-brand-gold bg-brand-gold text-brand-green-dark" : "border-white/10 text-brand-cream-muted hover:border-brand-gold/40 hover:text-brand-gold"}`}>{PAGE_LABELS[key]}</button>
                    ))}
                  </div>
                  {selectedPage === "home" ? (
                    <div className="space-y-7">
                      <ContentEditor label="Homepage extras" path="settings.pages.home" value={settings.pages.home} onChange={(value) => updateSetting("pages", { ...settings.pages, home: value } as SiteSettings["pages"])} />
                      <div className="space-y-5 rounded-xl border border-white/[0.07] bg-black/10 p-5">
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">Category &amp; collection headings</h3>
                          <p className="mt-2 text-[11px] leading-5 text-brand-cream-muted">These headings appear above the category filters and featured collection on the homepage.</p>
                        </div>
                        <div className="grid gap-5 md:grid-cols-2">
                          <Field label="Category section tag" fieldPath="settings.categorySectionTag" value={settings.categorySectionTag} onChange={(v) => updateSetting("categorySectionTag", v)} />
                          <Field label="Category section title" fieldPath="settings.categorySectionTitle" value={settings.categorySectionTitle} onChange={(v) => updateSetting("categorySectionTitle", v)} />
                          <Field label="Collection section tag" fieldPath="settings.collectionTag" value={settings.collectionTag} onChange={(v) => updateSetting("collectionTag", v)} />
                          <Field label="Featured collection title" fieldPath="settings.collectionTitleFeatured" value={settings.collectionTitleFeatured} onChange={(v) => updateSetting("collectionTitleFeatured", v)} />
                        </div>
                      </div>
                    </div>
                  ) : selectedPage === "leather" ? (
                    <div className="space-y-7">
                      <ContentEditor
                        label="Leather page content"
                        path="settings.pages.leather"
                        value={Object.fromEntries(Object.entries(settings.pages.leather).filter(([key]) => key !== "products"))}
                        onChange={(value) => updateSetting("pages", { ...settings.pages, leather: { ...(value as Omit<SiteSettings["pages"]["leather"], "products">), products: settings.pages.leather.products } })}
                      />
                      <div className="rounded-xl border border-brand-gold/15 bg-brand-gold/5 p-4 text-[11px] leading-6 text-brand-gold">Leather inventory is managed in the Products tab. This section edits only the page presentation; existing preview product data is preserved.</div>
                    </div>
                  ) : (
                    <ContentEditor label={PAGE_LABELS[selectedPage]} path={`settings.pages.${selectedPage}`} value={settings.pages[selectedPage]} onChange={(value) => updateSetting("pages", { ...settings.pages, [selectedPage]: value } as SiteSettings["pages"])} />
                  )}
                </div>
              )}

              {activeTab === "trackOrder" && <ContentEditor label="Track order page" path="settings.pages.trackOrder" value={settings.pages.trackOrder} onChange={(value) => updateSetting("pages", { ...settings.pages, trackOrder: value } as SiteSettings["pages"])} />}

              {activeTab === "commerce" && (
                <div className="space-y-7">
                  <div className="flex flex-col justify-between gap-4 rounded-xl border border-brand-gold/20 bg-brand-gold/5 p-5 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gold/10 text-brand-gold"><Truck size={18} /></span><div><p className="text-xs font-medium text-brand-cream">Pakistan delivery charge</p><p className="mt-1 font-serif text-2xl text-brand-gold">Rs {settings.commerce.domesticDeliveryChargePkr.toLocaleString()}</p><p className="mt-1 text-[11px] text-brand-cream-muted">Used in product pages, FAQ and policy delivery details.</p></div></div>
                    <button type="button" onClick={() => setDeliveryEditorOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-gold/30 px-4 py-3 text-xs font-semibold text-brand-gold transition hover:bg-brand-gold hover:text-brand-green-dark"><Edit3 size={14} /> Change delivery charge</button>
                  </div>
                  <div className="rounded-xl border border-brand-gold/15 bg-brand-gold/5 p-4 text-[11px] leading-6 text-brand-gold">International prices add a minimum PKR 500 margin before conversion and round up to the next whole currency unit. Each rate is the number of currency units per 1 PKR and is multiplied after adding the margin. PKR prices stay unchanged. Delivery charges are confirmed on WhatsApp before payment.</div>
                  <ContentEditor
                    label="Delivery & international ordering"
                    path="settings.commerce"
                    value={Object.fromEntries(Object.entries(settings.commerce).filter(([key]) => key !== "currencies" && key !== "countries"))}
                    onChange={(value) => updateSetting("commerce", { ...settings.commerce, ...(value as Partial<SiteSettings["commerce"]>) })}
                  />

                  <section data-admin-field="settings.commerce.currencies" className="scroll-mt-32 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">Currencies</h3><p className="mt-2 text-[11px] leading-5 text-brand-cream-muted">Rates are currency units per 1 PKR. PKR is the protected base currency and always uses rate 1.</p></div><button type="button" onClick={addCurrency} className="inline-flex items-center gap-1.5 rounded-lg border border-brand-gold/25 px-3 py-2 text-[11px] text-brand-gold transition hover:bg-brand-gold hover:text-brand-green-dark"><Plus size={13} /> Add currency</button></div>
                    <div className="grid gap-4 xl:grid-cols-2">
                      {settings.commerce.currencies.map((currency, index) => {
                        const code = normalizeCode(currency.code);
                        const isPkr = code === "PKR";
                        const invalidRate = !Number.isFinite(Number(currency.rate)) || Number(currency.rate) <= 0 || (isPkr && Number(currency.rate) !== 1);
                        return (
                          <div key={`currency-${index}`} className="space-y-4 rounded-xl border border-white/[0.07] bg-black/10 p-5">
                            <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-cream-muted">{isPkr ? "Base currency" : `Currency ${index + 1}`}</span><button type="button" onClick={() => removeCurrency(currency.code)} disabled={isPkr} aria-label={`Remove ${code || "currency"}`} title={isPkr ? "PKR is required as the base currency." : "Remove currency"} className="rounded-lg border border-brand-danger/20 p-2 text-[#c47e7e] transition hover:bg-brand-danger/10 hover:text-brand-danger disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={13} /></button></div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Field label="Code" value={currency.code} onChange={(value) => updateCurrency(index, "code", value)} maxLength={3} disabled={isPkr} required fieldPath={`settings.commerce.currencies.${index}.code`} hint={isPkr ? "PKR cannot be renamed." : "Three-letter currency code."} />
                              <Field label="Symbol" value={currency.symbol} onChange={(value) => updateCurrency(index, "symbol", value)} placeholder="$" fieldPath={`settings.commerce.currencies.${index}.symbol`} />
                              <Field label="Locale" value={currency.locale} onChange={(value) => updateCurrency(index, "locale", value)} placeholder="en-US" fieldPath={`settings.commerce.currencies.${index}.locale`} />
                              <Field label="Rate per PKR" type="number" value={String(currency.rate)} onChange={(value) => updateCurrency(index, "rate", value)} min={0.00000001} step="any" disabled={isPkr} required fieldPath={`settings.commerce.currencies.${index}.rate`} hint={isPkr ? "Protected at 1. PKR prices are never increased." : "Example: 1 PKR = 0.00355 USD, so enter 0.00355."} />
                            </div>
                            {invalidRate && <p role="alert" className="text-[11px] text-[#f19797]">{isPkr ? "The PKR rate must remain 1." : "Enter a rate greater than zero."}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section data-admin-field="settings.commerce.countries" className="scroll-mt-32 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">Countries</h3><p className="mt-2 text-[11px] leading-5 text-brand-cream-muted">Enabled countries appear in the storefront selector. Every enabled country must use a configured currency.</p></div><button type="button" onClick={addCountry} className="inline-flex items-center gap-1.5 rounded-lg border border-brand-gold/25 px-3 py-2 text-[11px] text-brand-gold transition hover:bg-brand-gold hover:text-brand-green-dark"><Plus size={13} /> Add country</button></div>
                    <div className="grid gap-4 xl:grid-cols-2">
                      {settings.commerce.countries.map((country, index) => {
                        const code = normalizeCode(country.code);
                        const isPakistan = code === "PK";
                        const duplicateCode = settings.commerce.countries.filter((item) => normalizeCode(item.code) === code).length > 1;
                        const invalidCode = !/^[A-Z]{2}$/.test(code) || duplicateCode;
                        const invalidName = country.enabled !== false && !String(country.name || "").trim();
                        const currencyExists = settings.commerce.currencies.some((currency) => normalizeCode(currency.code) === normalizeCode(country.currency));
                        const invalidCurrency = country.enabled !== false && !currencyExists;
                        return (
                          <div key={`country-${index}`} className="space-y-4 rounded-xl border border-white/[0.07] bg-black/10 p-5">
                            <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-cream-muted">{isPakistan ? "Domestic destination" : `Country ${index + 1}`}</span><button type="button" onClick={() => removeCountry(country.code)} disabled={isPakistan} aria-label={`Remove ${country.name || code || "country"}`} title={isPakistan ? "Pakistan is required for domestic delivery." : "Remove country"} className="rounded-lg border border-brand-danger/20 p-2 text-[#c47e7e] transition hover:bg-brand-danger/10 hover:text-brand-danger disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={13} /></button></div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Field label="Country code" value={country.code} onChange={(value) => updateCountry(index, "code", value)} maxLength={2} disabled={isPakistan} required fieldPath={`settings.commerce.countries.${index}.code`} hint={isPakistan ? "Pakistan uses the fixed PK code." : "Unique two-letter country code."} />
                              <Field label="Country name" value={country.name} onChange={(value) => updateCountry(index, "name", value)} placeholder="Pakistan" required={country.enabled !== false} fieldPath={`settings.commerce.countries.${index}.name`} />
                              <div data-admin-field={`settings.commerce.countries.${index}.currency`} className="scroll-mt-32"><label className="mb-2 block text-xs font-medium text-brand-cream">Currency{country.enabled !== false && <span className="ml-1 text-brand-gold">*</span>}</label><select value={country.currency} onChange={(event) => updateCountry(index, "currency", event.target.value)} aria-invalid={invalidCurrency} className="w-full rounded-xl border border-white/10 bg-brand-green-dark px-4 py-3 text-sm text-brand-cream outline-none focus:border-brand-gold/60"><option value="">Select currency</option>{settings.commerce.currencies.map((currency, currencyIndex) => <option key={`${currency.code}-${currencyIndex}`} value={currency.code}>{currency.code || "Unnamed currency"}</option>)}</select></div>
                              <label className={`flex cursor-pointer items-center gap-3 self-end rounded-xl border border-white/[0.06] bg-black/10 p-4 text-xs text-brand-cream ${isPakistan ? "cursor-default" : ""}`}><input type="checkbox" checked={country.enabled !== false} disabled={isPakistan} onChange={(event) => updateCountry(index, "enabled", event.target.checked)} className="h-4 w-4 accent-brand-gold" />Enabled in storefront</label>
                            </div>
                            {(invalidCode || invalidName || invalidCurrency) && <p role="alert" className="text-[11px] leading-5 text-[#f19797]">{invalidCode ? "Enter a unique two-letter country code." : invalidName ? "Enter a country name." : "Select a configured currency for this enabled country."}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === "navbar" && <div className="space-y-6"><Field label="Scrolling announcement text" fieldPath="settings.bannerText" value={settings.bannerText} onChange={(v) => updateSetting("bannerText", v)} textarea hint="This message scrolls across the gold announcement bar at the top of the storefront." /></div>}

              {activeTab === "hero" && (
                <div className="space-y-6">
                  <Field label="Small tagline above title" fieldPath="settings.heroTagline" value={settings.heroTagline} onChange={(v) => updateSetting("heroTagline", v)} />
                  <div className="grid gap-6 md:grid-cols-3"><Field label="Title line 1" fieldPath="settings.heroTitle1" value={settings.heroTitle1} onChange={(v) => updateSetting("heroTitle1", v)} /><Field label="Title line 2 (gold italic)" fieldPath="settings.heroTitle2" value={settings.heroTitle2} onChange={(v) => updateSetting("heroTitle2", v)} /><Field label="Title line 3" fieldPath="settings.heroTitle3" value={settings.heroTitle3} onChange={(v) => updateSetting("heroTitle3", v)} /></div>
                  <Field label="Description" fieldPath="settings.heroDescription" value={settings.heroDescription} onChange={(v) => updateSetting("heroDescription", v)} textarea />
                  <div className="grid gap-6 md:grid-cols-2"><Field label="Primary button text" fieldPath="settings.heroCta1Text" value={settings.heroCta1Text} onChange={(v) => updateSetting("heroCta1Text", v)} /><Field label="Secondary button text" fieldPath="settings.heroCta2Text" value={settings.heroCta2Text} onChange={(v) => updateSetting("heroCta2Text", v)} /></div>
                  <Field label="Quote text" fieldPath="settings.heroQuote" value={settings.heroQuote} onChange={(v) => updateSetting("heroQuote", v)} textarea />
                  <Field label="Hero image path" fieldPath="settings.heroImage" value={settings.heroImage} onChange={(v) => updateSetting("heroImage", v)} placeholder="/leather-hero.jpg" hint="Use a public leather image path such as /leather-hero.jpg or a full HTTPS image URL." />
                </div>
              )}

              {activeTab === "story" && (
                <div className="space-y-6">
                  <Field label="Section tag" fieldPath="settings.storyTag" value={settings.storyTag} onChange={(v) => updateSetting("storyTag", v)} />
                  <div className="grid gap-6 md:grid-cols-2"><Field label="Title line 1" fieldPath="settings.storyTitle1" value={settings.storyTitle1} onChange={(v) => updateSetting("storyTitle1", v)} /><Field label="Title line 2 (gold italic)" fieldPath="settings.storyTitle2" value={settings.storyTitle2} onChange={(v) => updateSetting("storyTitle2", v)} /></div>
                  <Field label="Paragraph 1" fieldPath="settings.storyParagraph1" value={settings.storyParagraph1} onChange={(v) => updateSetting("storyParagraph1", v)} textarea />
                  <Field label="Paragraph 2" fieldPath="settings.storyParagraph2" value={settings.storyParagraph2} onChange={(v) => updateSetting("storyParagraph2", v)} textarea />
                  <div className="grid gap-6 md:grid-cols-2"><div className="rounded-xl border border-white/[0.06] bg-black/10 p-5"><p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gold">Quality stat 1</p><div className="space-y-5"><Field label="Value" fieldPath="settings.storyStat1Value" value={settings.storyStat1Value} onChange={(v) => updateSetting("storyStat1Value", v)} /><Field label="Label" fieldPath="settings.storyStat1Label" value={settings.storyStat1Label} onChange={(v) => updateSetting("storyStat1Label", v)} /></div></div><div className="rounded-xl border border-white/[0.06] bg-black/10 p-5"><p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gold">Quality stat 2</p><div className="space-y-5"><Field label="Value" fieldPath="settings.storyStat2Value" value={settings.storyStat2Value} onChange={(v) => updateSetting("storyStat2Value", v)} /><Field label="Label" fieldPath="settings.storyStat2Label" value={settings.storyStat2Label} onChange={(v) => updateSetting("storyStat2Label", v)} /></div></div></div>
                  <Field label="Atelier image path" fieldPath="settings.storyImage" value={settings.storyImage} onChange={(v) => updateSetting("storyImage", v)} placeholder="/leather-atelier.jpg" />
                </div>
              )}

              {activeTab === "banner" && (
                <div className="space-y-6">
                  <Field label="Section tag" fieldPath="settings.bannerTag" value={settings.bannerTag} onChange={(v) => updateSetting("bannerTag", v)} />
                  <div className="grid gap-6 md:grid-cols-2"><Field label="Title line 1" fieldPath="settings.bannerTitle1" value={settings.bannerTitle1} onChange={(v) => updateSetting("bannerTitle1", v)} /><Field label="Title line 2 (gold italic)" fieldPath="settings.bannerTitle2" value={settings.bannerTitle2} onChange={(v) => updateSetting("bannerTitle2", v)} /></div>
                  <Field label="Description" fieldPath="settings.bannerDescription" value={settings.bannerDescription} onChange={(v) => updateSetting("bannerDescription", v)} textarea />
                  <Field label="Call to action text" fieldPath="settings.bannerCtaText" value={settings.bannerCtaText} onChange={(v) => updateSetting("bannerCtaText", v)} />
                  <Field label="Background image path" fieldPath="settings.bannerImage" value={settings.bannerImage} onChange={(v) => updateSetting("bannerImage", v)} placeholder="/leather-collection.jpg" />
                </div>
              )}

              {activeTab === "specs" && (
                <div className="space-y-6">
                  <Field label="Section tag" fieldPath="settings.specsTag" value={settings.specsTag} onChange={(v) => updateSetting("specsTag", v)} />
                  <Field label="Section title" fieldPath="settings.specsTitle" value={settings.specsTitle} onChange={(v) => updateSetting("specsTitle", v)} />
                  {([1, 2, 3] as const).map((number) => (
                    <div key={number} className="rounded-xl border border-white/[0.06] bg-black/10 p-5">
                      <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">Material &amp; craft detail {number}</h2>
                      <div className="space-y-5"><Field label="Title" fieldPath={`settings.spec${number}Title`} value={settings[`spec${number}Title`]} onChange={(v) => updateSpec(number, "Title", v)} /><Field label="Description" fieldPath={`settings.spec${number}Description`} value={settings[`spec${number}Description`]} onChange={(v) => updateSpec(number, "Description", v)} textarea /></div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "contact" && (
                <div className="space-y-6">
                  <Field label="Section tag" fieldPath="settings.contactTag" value={settings.contactTag} onChange={(v) => updateSetting("contactTag", v)} />
                  <div className="grid gap-6 md:grid-cols-2"><Field label="Title line 1" fieldPath="settings.contactTitle1" value={settings.contactTitle1} onChange={(v) => updateSetting("contactTitle1", v)} /><Field label="Title line 2 (gold italic)" fieldPath="settings.contactTitle2" value={settings.contactTitle2} onChange={(v) => updateSetting("contactTitle2", v)} /></div>
                  <Field label="Description" fieldPath="settings.contactDescription" value={settings.contactDescription} onChange={(v) => updateSetting("contactDescription", v)} textarea />
                  <Field label="Call to action text" fieldPath="settings.contactCtaText" value={settings.contactCtaText} onChange={(v) => updateSetting("contactCtaText", v)} />
                </div>
              )}

              {activeTab === "footer" && (
                <div className="space-y-6"><Field label="Brand description" fieldPath="settings.footerDescription" value={settings.footerDescription} onChange={(v) => updateSetting("footerDescription", v)} textarea /><Field label="Copyright text" fieldPath="settings.footerCopyright" value={settings.footerCopyright} onChange={(v) => updateSetting("footerCopyright", v)} /><Field label="Credit text" fieldPath="settings.footerCredit" value={settings.footerCredit} onChange={(v) => updateSetting("footerCredit", v)} /></div>
              )}

              {activeTab === "social" && (
                <div className="space-y-6"><Field label="WhatsApp number" fieldPath="settings.whatsappNumber" value={settings.whatsappNumber} onChange={(v) => updateSetting("whatsappNumber", v)} placeholder="923279595329" hint="Include the country code and omit the + symbol." /><Field label="WhatsApp group URL" fieldPath="settings.whatsappGroupUrl" value={settings.whatsappGroupUrl} onChange={(v) => updateSetting("whatsappGroupUrl", v)} type="url" /><Field label="TikTok URL" fieldPath="settings.tiktokUrl" value={settings.tiktokUrl} onChange={(v) => updateSetting("tiktokUrl", v)} type="url" /><Field label="Instagram URL" fieldPath="settings.instagramUrl" value={settings.instagramUrl} onChange={(v) => updateSetting("instagramUrl", v)} type="url" /><Field label="Facebook URL" fieldPath="settings.facebookUrl" value={settings.facebookUrl} onChange={(v) => updateSetting("facebookUrl", v)} type="url" /></div>
              )}
            </div>
          )}

          {activeTab === "security" && (
            <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
              <section className="h-fit rounded-2xl border border-white/[0.07] bg-brand-green-mid p-6">
                <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gold/10 text-brand-gold"><UserRound size={21} /></span><div><p className="text-sm font-semibold text-brand-cream">Administrator</p><p className="mt-1 text-[11px] text-brand-cream-muted">Full portal access</p></div></div>
                <div className="my-6 h-px bg-white/[0.06]" />
                <div className="space-y-4 text-xs"><div className="flex items-start gap-3 text-brand-cream-muted"><Mail size={15} className="mt-0.5 shrink-0 text-brand-cream-muted" /><div><p className="text-[10px] uppercase tracking-wider text-brand-cream-muted">Account email</p><p className="mt-1 break-all text-brand-cream">{ADMIN_ACCOUNT_EMAIL}</p></div></div><div className="flex items-start gap-3 text-brand-cream-muted"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-brand-cream-muted" /><div><p className="text-[10px] uppercase tracking-wider text-brand-cream-muted">Authentication</p><p className="mt-1 text-brand-cream">Secured by Supabase</p></div></div></div>
                <div className="mt-6 rounded-xl border border-brand-gold/10 bg-brand-gold/5 p-4 text-[11px] leading-6 text-brand-gold">Use a unique password of at least 10 characters. Do not reuse a password from your email or social accounts.</div>
              </section>

              <section className="rounded-2xl border border-white/[0.07] bg-brand-green-mid p-6 sm:p-8">
                <div className="mb-7"><h2 className="font-serif text-lg text-brand-cream">{recoveryMode ? "Set a new password" : "Change password"}</h2><p className="mt-2 text-xs leading-6 text-brand-cream-muted">{recoveryMode ? "Your reset link has been verified. Choose a new password to regain access." : "Confirm your current password before choosing a new one."}</p></div>
                {securityNotice && <div role={securityNotice.type === "error" ? "alert" : "status"} className={`mb-6 flex items-start gap-2 rounded-xl border p-3 text-xs leading-5 ${securityNotice.type === "error" ? "border-brand-danger/20 bg-brand-danger/5 text-[#f19797]" : securityNotice.type === "success" ? "border-brand-success/20 bg-brand-success/5 text-[#8bdba8]" : "border-brand-gold/20 bg-brand-gold/5 text-brand-gold"}`}>{securityNotice.type === "error" ? <AlertCircle size={15} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={15} className="mt-0.5 shrink-0" />}{securityNotice.text}</div>}
                <form onSubmit={handlePasswordChange} className="space-y-5">
                  {!recoveryMode && <div><label htmlFor="current-password" className="mb-2 block text-xs font-medium text-brand-cream">Current password</label><div className="relative"><input id="current-password" type={securityType} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" className={passwordInputClass} /><button type="button" onClick={() => setShowSecurityPasswords((value) => !value)} aria-label={showSecurityPasswords ? "Hide passwords" : "Show passwords"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-brand-cream-muted hover:bg-white/5 hover:text-brand-gold">{showSecurityPasswords ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>}
                  <div><label htmlFor="new-password" className="mb-2 block text-xs font-medium text-brand-cream">New password</label><div className="relative"><input id="new-password" type={securityType} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" minLength={10} required className={passwordInputClass} placeholder="At least 10 characters" />{recoveryMode && <button type="button" onClick={() => setShowSecurityPasswords((value) => !value)} aria-label={showSecurityPasswords ? "Hide passwords" : "Show passwords"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-brand-cream-muted hover:bg-white/5 hover:text-brand-gold">{showSecurityPasswords ? <EyeOff size={16} /> : <Eye size={16} />}</button>}</div></div>
                  <div><label htmlFor="confirm-password" className="mb-2 block text-xs font-medium text-brand-cream">Confirm new password</label><input id="confirm-password" type={securityType} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" minLength={10} required className="w-full rounded-xl border border-white/10 bg-brand-green-dark px-4 py-3 text-sm text-brand-cream outline-none transition placeholder:text-brand-cream-muted focus:border-brand-gold/60 focus:ring-4 focus:ring-brand-gold/5" /></div>
                  <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between"><button type="submit" disabled={securityBusy} className="flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-brand-green-dark transition hover:bg-brand-gold-light disabled:opacity-50">{securityBusy ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}{securityBusy ? "Updating…" : recoveryMode ? "Set new password" : "Update password"}</button><button type="button" onClick={handlePasswordReset} disabled={resetBusy} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs text-brand-cream-muted transition hover:border-brand-gold/30 hover:text-brand-gold disabled:opacity-50"><Mail size={14} />{resetBusy ? "Sending…" : "Email me a reset link"}</button></div>
                  {resetNotice && <p role={resetNotice.type === "error" ? "alert" : "status"} className={`text-xs leading-6 ${resetNotice.type === "error" ? "text-[#f19797]" : "text-[#8bdba8]"}`}>{resetNotice.text}</p>}
                </form>
              </section>
            </div>
          )}

          {activeTab !== "security" && (
            <section className="mt-8 rounded-2xl border border-white/[0.07] bg-brand-green-mid p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div className="flex max-w-3xl items-start gap-3"><Database size={17} className="mt-0.5 shrink-0 text-brand-gold/70" /><p className="text-[11px] leading-6 text-brand-cream-muted"><strong className="font-medium text-brand-cream">Leather catalog &amp; content database.</strong> Saving publishes your wallets, accessories, showcase, and content to the storefront. A local copy is kept in this browser as a fallback.</p></div><div className="flex shrink-0 flex-wrap gap-4"><button onClick={() => { initialized.current = false; store.refresh(); }} className="inline-flex items-center gap-2 text-xs text-brand-cream-muted transition hover:text-brand-gold"><RefreshCw size={13} /> Reload from database</button><button onClick={handleReset} className="inline-flex items-center gap-2 text-xs text-[#c47e7e] transition hover:text-brand-danger"><Trash2 size={13} /> Reset content</button></div></div>
            </section>
          )}
        </main>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center bg-black/75 px-4 pt-[8vh] backdrop-blur-md" onMouseDown={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="admin-search-title" className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-brand-green-mid shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">
              <Search size={19} className="shrink-0 text-brand-gold" />
              <input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && visibleSearchResults[0]) openSearchResult(visibleSearchResults[0]); }} placeholder="Search wallets, accessories, showcase, delivery, pages…" aria-label="Search all admin options" className="min-w-0 flex-1 bg-transparent text-sm text-brand-cream outline-none placeholder:text-brand-cream-muted" />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="rounded-lg border border-white/10 p-2 text-brand-cream-muted transition hover:text-brand-cream"><X size={16} /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              <p className="px-3 pb-2 pt-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-brand-cream-muted">{searchQuery.trim() ? `${visibleSearchResults.length} matching options` : "Quick actions"}</p>
              {visibleSearchResults.length ? visibleSearchResults.map((result) => {
                const Icon = result.product ? Package : result.tab === "security" ? ShieldCheck : FileText;
                return (
                  <button key={result.id} type="button" onClick={() => openSearchResult(result)} className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.05]">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-black/10 text-brand-gold"><Icon size={16} /></span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-brand-cream">{result.label}</span><span className="mt-1 block truncate text-[11px] text-brand-cream-muted">{result.detail}</span></span>
                    <ChevronRight size={15} className="mt-2 shrink-0 text-brand-cream-muted" />
                  </button>
                );
              }) : <div className="px-4 py-12 text-center"><Search size={28} className="mx-auto mb-3 text-brand-cream-muted/40" /><p className="text-sm text-brand-cream">No matching options found</p><p className="mt-2 text-xs text-brand-cream-muted">Try a page name, field label or product name.</p></div>}
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3 text-[10px] text-brand-cream-muted"><span>Search covers every editable setting and product.</span><span className="hidden items-center gap-1 sm:flex"><kbd className="rounded border border-white/10 px-1.5 py-0.5">Esc</kbd> to close</span></div>
          </div>
        </div>
      )}

      {deliveryEditorOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md" onMouseDown={(e) => { if (e.target === e.currentTarget) setDeliveryEditorOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delivery-editor-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-brand-green-mid shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.07] bg-brand-green-mid/95 px-6 py-5 backdrop-blur-xl"><div><p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-brand-gold">Quick delivery editor</p><h2 id="delivery-editor-title" className="font-serif text-lg text-brand-cream">Delivery charge &amp; worldwide shipping</h2></div><button onClick={() => setDeliveryEditorOpen(false)} aria-label="Close delivery editor" className="rounded-xl border border-white/10 p-2 text-brand-cream-muted transition hover:bg-white/5 hover:text-brand-cream"><X size={18} /></button></div>
            <div className="space-y-6 px-6 py-7 sm:px-8">
              <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/5 p-5">
                <Field label="Pakistan delivery charge (PKR)" type="number" min={0} step={1} value={String(settings.commerce.domesticDeliveryChargePkr)} onChange={(value) => updateSetting("commerce", { ...settings.commerce, domesticDeliveryChargePkr: Math.max(0, Number(value) || 0) })} hint="This amount appears on product pages, FAQ and policy delivery details." />
                <div className="mt-4 flex flex-wrap gap-2">{[250, 300, 500].map((amount) => <button key={amount} type="button" onClick={() => updateSetting("commerce", { ...settings.commerce, domesticDeliveryChargePkr: amount })} className={`rounded-lg border px-3 py-2 text-[11px] font-medium transition ${settings.commerce.domesticDeliveryChargePkr === amount ? "border-brand-gold bg-brand-gold text-brand-green-dark" : "border-white/10 text-brand-cream-muted hover:border-brand-gold/30 hover:text-brand-gold"}`}>Rs {amount}</button>)}</div>
              </div>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-black/10 p-4"><span><span className="block text-xs font-medium text-brand-cream">Worldwide delivery</span><span className="mt-1 block text-[11px] text-brand-cream-muted">Allow international customers to request delivery.</span></span><input type="checkbox" checked={settings.commerce.worldwideDeliveryEnabled} onChange={(event) => updateSetting("commerce", { ...settings.commerce, worldwideDeliveryEnabled: event.target.checked })} className="h-4 w-4 shrink-0 accent-brand-gold" /></label>
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-black/10 p-4"><span><span className="block text-xs font-medium text-brand-cream">Confirm exact charge before payment</span><span className="mt-1 block text-[11px] text-brand-cream-muted">International customers must confirm their destination charge on WhatsApp.</span></span><input type="checkbox" checked={settings.commerce.deliveryQuoteRequired} onChange={(event) => updateSetting("commerce", { ...settings.commerce, deliveryQuoteRequired: event.target.checked })} className="h-4 w-4 shrink-0 accent-brand-gold" /></label>
              </div>
              <Field label="Dispatch estimate" value={settings.commerce.dispatchEstimate} onChange={(value) => updateSetting("commerce", { ...settings.commerce, dispatchEstimate: value })} />
              <Field label="Delivery confirmation message" value={settings.commerce.deliveryConfirmationText} onChange={(value) => updateSetting("commerce", { ...settings.commerce, deliveryConfirmationText: value })} textarea />
              <Field label="International delivery note" value={settings.commerce.internationalDeliveryNote} onChange={(value) => updateSetting("commerce", { ...settings.commerce, internationalDeliveryNote: value })} textarea />
            </div>
            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/[0.07] bg-brand-green-mid/95 px-6 py-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-8"><p className="text-[10px] leading-5 text-brand-cream-muted">Saving publishes all pending admin changes.</p><div className="flex gap-3"><button onClick={() => setDeliveryEditorOpen(false)} className="rounded-xl border border-white/10 px-5 py-3 text-xs font-medium text-brand-cream-muted transition hover:bg-white/5 hover:text-brand-cream">Cancel</button><button onClick={() => { setDeliveryEditorOpen(false); void handleSave(); }} disabled={saveStatus === "saving" || !dirty || Boolean(currentCommerceError)} title={currentCommerceError || "Save all pending changes"} className="flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-brand-green-dark transition hover:bg-brand-gold-light disabled:cursor-not-allowed disabled:opacity-50"><Save size={14} /> Save changes</button></div></div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md" onMouseDown={(e) => { if (e.target === e.currentTarget) { setEditingProduct(null); setIsAddingNew(false); } }}>
          <div role="dialog" aria-modal="true" aria-labelledby="product-dialog-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-brand-green-mid shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.07] bg-brand-green-mid/95 px-6 py-5 backdrop-blur-xl sm:px-8"><div><p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-brand-gold">Leather catalog</p><h2 id="product-dialog-title" className="font-serif text-lg text-brand-cream">{isAddingNew ? "Add a leather product" : "Edit leather product"}</h2></div><button onClick={() => { setEditingProduct(null); setIsAddingNew(false); }} aria-label="Close product editor" className="rounded-xl border border-white/10 p-2 text-brand-cream-muted transition hover:bg-white/5 hover:text-brand-cream"><X size={18} /></button></div>
            <div className="space-y-5 px-6 py-7 sm:px-8">
              <Field label="Product ID" value={editingProduct.id} onChange={(v) => setEditingProduct({ ...editingProduct, id: v })} disabled={!isAddingNew} required hint="A unique internal identifier, such as classic-bifold-wallet. It cannot be changed after creation." />
              <Field label="Product name" value={editingProduct.name} onChange={(v) => setEditingProduct({ ...editingProduct, name: v })} placeholder="e.g. Classic Bifold Wallet" required />
              <div className="grid gap-5 md:grid-cols-2"><Field label="Category" value={editingProduct.category} onChange={(v) => setEditingProduct({ ...editingProduct, category: v })} placeholder="wallet, accessory, collection…" required hint="Use a new category name to create another leather collection." /><Field label="Collection tag" value={editingProduct.collectionTag || ""} onChange={(v) => setEditingProduct({ ...editingProduct, collectionTag: v })} placeholder="Signature Leather" hint="Optional collection name from the leather inventory." /></div>
              <Field label="Base price (PKR)" type="number" value={String(editingProduct.price)} onChange={(v) => setEditingProduct({ ...editingProduct, price: Number(v) })} min={1} required />
              <Field label="Previous price (optional)" type="number" value={editingProduct.oldPrice ? String(editingProduct.oldPrice) : ""} onChange={(v) => setEditingProduct({ ...editingProduct, oldPrice: v ? Number(v) : undefined })} min={1} />
              <Field label="Main image URL" value={editingProduct.image} onChange={(v) => setEditingProduct({ ...editingProduct, image: v })} type="url" placeholder="https://… or /wallets/…" required />
              <Field label="Gallery image URLs" value={editingProduct.gallery?.join(", ") || ""} onChange={(v) => setEditingProduct({ ...editingProduct, gallery: v.split(",").map((s) => s.trim()).filter(Boolean) })} textarea hint="Separate multiple image URLs with commas." />
              <Field label="Product description" value={editingProduct.description} onChange={(v) => setEditingProduct({ ...editingProduct, description: v })} textarea />

              <div className="space-y-5 rounded-2xl border border-brand-gold/15 bg-brand-gold/[0.03] p-5">
                <div><h3 className="font-serif text-lg text-brand-cream">Leather product detail page</h3><p className="mt-1 text-[11px] leading-5 text-brand-cream-muted">Leave optional fields blank to use the global defaults from Pages &amp; policies → Product detail defaults.</p></div>
                <div className="grid gap-5 md:grid-cols-2"><Field label="Detail tagline" value={editingProduct.detailTagline || ""} onChange={(v) => setEditingProduct({ ...editingProduct, detailTagline: v || undefined })} placeholder="Full-Grain Collection" /><Field label="Order button text" value={editingProduct.orderButtonText || ""} onChange={(v) => setEditingProduct({ ...editingProduct, orderButtonText: v || undefined })} /></div>
                <Field label="Detail-page description" value={editingProduct.detailDescription || ""} onChange={(v) => setEditingProduct({ ...editingProduct, detailDescription: v || undefined })} textarea placeholder="Optional longer overview for this wallet or accessory" />
                <div className="grid gap-5 md:grid-cols-2"><Field label="Shipping section title" value={editingProduct.shippingTitle || ""} onChange={(v) => setEditingProduct({ ...editingProduct, shippingTitle: v || undefined })} /><Field label="Overview title" value={editingProduct.overviewTitle || ""} onChange={(v) => setEditingProduct({ ...editingProduct, overviewTitle: v || undefined })} /></div>
                <Field label="Shipping note 1" value={editingProduct.shippingNote1 || ""} onChange={(v) => setEditingProduct({ ...editingProduct, shippingNote1: v || undefined })} textarea />
                <Field label="Shipping note 2" value={editingProduct.shippingNote2 || ""} onChange={(v) => setEditingProduct({ ...editingProduct, shippingNote2: v || undefined })} textarea />
                <Field label="Materials & details title" value={editingProduct.specificationsTitle || ""} onChange={(v) => setEditingProduct({ ...editingProduct, specificationsTitle: v || undefined })} />
                <div className="space-y-3">
                  {editingProduct.specifications && <button type="button" onClick={() => setEditingProduct({ ...editingProduct, specifications: undefined })} className="text-[11px] font-medium text-brand-gold underline underline-offset-4 hover:text-brand-gold-light">Use global material defaults</button>}
                  <ContentEditor label="Product materials & details" value={editingProduct.specifications?.length ? editingProduct.specifications : settings.pages.product.defaultSpecifications} itemTemplate={{ label: "", value: "" }} allowEmpty onChange={(value) => setEditingProduct({ ...editingProduct, specifications: value as Product["specifications"] })} />
                </div>
                <div className="grid gap-5 md:grid-cols-2"><Field label="Related section tag" value={editingProduct.relatedTag || ""} onChange={(v) => setEditingProduct({ ...editingProduct, relatedTag: v || undefined })} /><Field label="Related section title" value={editingProduct.relatedTitle || ""} onChange={(v) => setEditingProduct({ ...editingProduct, relatedTitle: v || undefined })} placeholder="More from {category}" /></div>
                <div className="grid gap-5 md:grid-cols-2"><Field label="New badge text" value={editingProduct.newBadgeText || ""} onChange={(v) => setEditingProduct({ ...editingProduct, newBadgeText: v || undefined })} /><Field label="Offer badge text" value={editingProduct.offerBadgeText || ""} onChange={(v) => setEditingProduct({ ...editingProduct, offerBadgeText: v || undefined })} /></div>
              </div>

              <div className="flex flex-wrap gap-6 rounded-xl border border-white/[0.06] bg-black/10 p-4"><label className="flex cursor-pointer items-center gap-2 text-xs text-brand-cream"><input type="checkbox" checked={isAddingNew ? editingProduct.isNew || false : showcase.newProductIds.includes(String(editingProduct.id))} onChange={(e) => updateProductBadge(String(editingProduct.id), "newProductIds", e.target.checked)} className="h-4 w-4 accent-brand-gold" />New arrival</label><label className="flex cursor-pointer items-center gap-2 text-xs text-brand-cream"><input type="checkbox" checked={isAddingNew ? editingProduct.isBestSeller || false : showcase.bestSellerProductIds.includes(String(editingProduct.id))} onChange={(e) => updateProductBadge(String(editingProduct.id), "bestSellerProductIds", e.target.checked)} className="h-4 w-4 accent-brand-gold" />Best seller</label><label className="flex cursor-pointer items-center gap-2 text-xs text-brand-cream"><input type="checkbox" checked={isAddingNew ? editingProduct.isFeatured || false : showcase.featuredProductIds.includes(String(editingProduct.id))} onChange={(e) => updateProductBadge(String(editingProduct.id), "featuredProductIds", e.target.checked)} className="h-4 w-4 accent-brand-gold" />Featured product</label></div>
            </div>
            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/[0.07] bg-brand-green-mid/95 px-6 py-5 backdrop-blur-xl sm:flex-row sm:justify-end sm:px-8"><button onClick={() => { setEditingProduct(null); setIsAddingNew(false); }} className="rounded-xl border border-white/10 px-5 py-3 text-xs font-medium text-brand-cream-muted transition hover:bg-white/5 hover:text-brand-cream">Cancel</button><button onClick={handleSaveProduct} className="flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-brand-green-dark transition hover:bg-brand-gold-light"><Save size={14} /> Save leather product</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
