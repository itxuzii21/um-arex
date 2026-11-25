"use client";

import { useState, useEffect, useRef, useCallback, useId, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle, ArrowLeft, ArrowUpRight, BookOpenText, Check, CheckCircle2,
  ChevronRight, Cloud, CloudOff, ContactRound, Database, Edit3, ExternalLink,
  Eye, EyeOff, FileText, Globe2, Image as ImageIcon, KeyRound, Loader2, LockKeyhole,
  LogOut, Mail, Menu, Megaphone, Package, PanelTop, Plus, RefreshCw, Save, Search,
  Settings2, Share2, ShieldCheck, Sparkles, Trash2, Truck, UserRound, X,
} from "lucide-react";
import { Product } from "../types";
import { SiteSettings, DEFAULT_SITE_SETTINGS } from "../data/siteSettings";
import {
  useStore, CATALOG_CONTENT_ID, SETTINGS_CONTENT_ID,
} from "../data/StoreProvider";
import { supabase, isSupabaseConfigured, ADMIN_ACCOUNT_EMAIL } from "@/lib/supabase";

type Tab = "products" | "shared" | "pages" | "trackOrder" | "commerce" | "hero" | "navbar" | "story" | "banner" | "specs" | "contact" | "footer" | "social" | "security";
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
  watch: "Product detail defaults",
} as const;

const navigation: { label: string; tabs: { key: Tab; label: string; icon: typeof Package }[] }[] = [
  {
    label: "Catalog",
    tabs: [{ key: "products", label: "Products", icon: Package }],
  },
  {
    label: "Website content",
    tabs: [
      { key: "shared", label: "Brand, navigation & SEO", icon: Globe2 },
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
    tabs: [{ key: "commerce", label: "Delivery & currency", icon: Globe2 }],
  },
  {
    label: "System",
    tabs: [{ key: "security", label: "Account security", icon: ShieldCheck }],
  },
];

const pageMeta: Record<Tab, { eyebrow: string; title: string; description: string }> = {
  products: { eyebrow: "Catalog management", title: "Product collection", description: "Manage products, galleries, pricing, and every field on each product detail page." },
  shared: { eyebrow: "Website content", title: "Brand, navigation & SEO", description: "Control the brand name, logos, navigation labels, footer labels, leather links, and search metadata." },
  pages: { eyebrow: "Website content", title: "Pages & policies", description: "Edit homepage extras, About, FAQ, policies, leather content, search messages, and product-page defaults." },
  trackOrder: { eyebrow: "Website content", title: "Track order page", description: "Edit the tracking form, delivery journey, support messages, and WhatsApp request flow." },
  commerce: { eyebrow: "International sales", title: "Delivery & currency", description: "Configure worldwide delivery, shipping-charge confirmation, country currencies, exchange rates, and the international margin." },
  navbar: { eyebrow: "Website content", title: "Header & announcement", description: "Update the announcement message displayed above the main navigation." },
  hero: { eyebrow: "Website content", title: "Hero section", description: "Control the first impression visitors see when they enter your store." },
  story: { eyebrow: "Website content", title: "Brand story", description: "Share your heritage, philosophy and quality standards with customers." },
  banner: { eyebrow: "Website content", title: "Promotional banner", description: "Highlight a collection, offer or featured message in the cinematic banner." },
  specs: { eyebrow: "Website content", title: "Technical specifications", description: "Present the materials and engineering behind your collection." },
  contact: { eyebrow: "Website content", title: "Contact section", description: "Update the invitation and call to action for customer enquiries." },
  footer: { eyebrow: "Website content", title: "Footer content", description: "Manage your brand description, copyright and credit information." },
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
  product?: Product;
  searchText: string;
};

type SearchLocation = { tab: Tab; section: string; page?: keyof typeof PAGE_LABELS };

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
  if (key === "bannerText") return { tab: "navbar", section: "Header & announcement" };
  if (key.startsWith("hero")) return { tab: "hero", section: "Hero section" };
  if (key.startsWith("story")) return { tab: "story", section: "Brand story" };
  if (key.startsWith("banner")) return { tab: "banner", section: "Promotional banner" };
  if (key.startsWith("spec")) return { tab: "specs", section: "Technical specifications" };
  if (key.startsWith("contact")) return { tab: "contact", section: "Contact section" };
  if (key.startsWith("footer")) return { tab: "footer", section: "Footer content" };
  if (["whatsappNumber", "whatsappGroupUrl", "tiktokUrl", "instagramUrl", "facebookUrl"].includes(key)) return { tab: "social", section: "Social & contact links" };
  if (key.startsWith("categorySection") || key.startsWith("collection")) return { tab: "pages", section: PAGE_LABELS.home, page: "home" };
  return null;
}

function Field({ label, value, onChange, type = "text", textarea = false, placeholder, hint, min, step, required, disabled, fieldPath }: {
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
  fieldPath?: string;
}) {
  const id = useId();
  const inputClass = `w-full rounded-xl border border-white/10 bg-[#071711] px-4 py-3 text-sm text-brand-cream outline-none transition placeholder:text-[#607168] focus:border-brand-gold/60 focus:ring-4 focus:ring-brand-gold/5 disabled:cursor-not-allowed disabled:opacity-50 ${textarea ? "min-h-28 resize-y leading-relaxed" : ""}`;

  return (
    <div data-admin-field={fieldPath} className="scroll-mt-32 rounded-xl">
      <label htmlFor={id} className="mb-2 block text-xs font-medium text-[#cbd5ce]">
        {label}{required && <span className="ml-1 text-brand-gold">*</span>}
      </label>
      {textarea ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} required={required} disabled={disabled} />
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} min={min} step={step} className={inputClass} required={required} disabled={disabled} />
      )}
      {hint && <p className="mt-2 text-[11px] leading-relaxed text-[#71837a]">{hint}</p>}
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
          <label className="mb-2 block text-xs font-medium text-[#cbd5ce]">Icon</label>
          <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#071711] px-4 py-3 text-sm text-brand-cream outline-none focus:border-brand-gold/60">
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
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.06] bg-black/10 p-4 text-xs text-[#b6c4bc]">
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
          <button type="button" onClick={addItem} className="inline-flex items-center gap-1.5 rounded-lg border border-brand-gold/25 px-3 py-2 text-[11px] text-brand-gold transition hover:bg-brand-gold hover:text-[#082016]"><Plus size={13} /> Add item</button>
        </div>
        {items.map((item, index) => (
          <div key={String(item.id || index)} className="rounded-xl border border-white/[0.07] bg-black/10 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71837a]">{label} {index + 1}</span>
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
  const [accessToken, setAccessToken] = useState("");
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
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
  const [leatherNotice, setLeatherNotice] = useState("");
  const [leatherImportBusy, setLeatherImportBusy] = useState(false);
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
        setAccessToken("");
        setAuthReady(true);
        return;
      }
      if (session.user.email?.toLowerCase() !== ADMIN_ACCOUNT_EMAIL.toLowerCase()) {
        void client.auth.signOut();
        setPasswordError("This portal is restricted to the configured administrator account.");
        setIsAuthenticated(false);
        setAccessToken("");
        setAuthReady(true);
        return;
      }
      setAccessToken(session.access_token);
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
        setAccessToken("");
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
    setSettings(store.settings);
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
    addSearchResults(settings.commerce, "settings.commerce", ["Delivery & currency"], { tab: "commerce", section: "Delivery & currency" }, results);
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
        searchText: `${product.name} ${product.category} ${product.description} ${detail}`.toLowerCase(),
      });
    });
    return results;
  }, [settings, products]);

  const quickSearchResults = useMemo<SearchResult[]>(() => [
    { id: "quick:delivery", label: "Delivery charge", detail: `Pakistan advance: Rs ${settings.commerce.domesticDeliveryChargePkr.toLocaleString()}`, tab: "commerce", path: "settings.commerce.domesticDeliveryChargePkr", searchText: "delivery charge shipping" },
    { id: "quick:tracking", label: "Track order page", detail: "Form, delivery journey and WhatsApp message", tab: "trackOrder", searchText: "track order tracking" },
    { id: "quick:watch", label: "Product detail defaults", detail: "Shipping, specifications and order buttons", tab: "pages", page: "watch", path: "settings.pages.watch", searchText: "product detail watch specifications" },
    { id: "quick:home", label: "Homepage section headings", detail: "Category and collection titles", tab: "pages", page: "home", path: "settings.categorySectionTag", searchText: "home category collection headings" },
    { id: "quick:products", label: "Products", detail: `${products.length} products in your collection`, tab: "products", searchText: "products catalog watches" },
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

    setAccessToken(data.session.access_token);
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
    setAccessToken("");
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
    if (!accessToken) {
      setSaveStatus("error");
      setSaveError("Your session has expired. Sign out and sign in again before saving.");
      return;
    }
    setSaveStatus("saving");
    setSaveError("");
    store.setProducts(products);
    store.setSettings(settings);

    if (!isSupabaseConfigured) {
      setSaveStatus("local");
      setDirty(false);
      setTimeout(() => setSaveStatus("idle"), 2500);
      return;
    }

    const [catalogRes, settingsRes] = await Promise.all([
      store.persist(CATALOG_CONTENT_ID, { products }, accessToken),
      store.persist(SETTINGS_CONTENT_ID, settings, accessToken),
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
  }, [products, settings, accessToken, store]);

  const updateSetting = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    markDirty();
  };

  const updateSpec = (number: 1 | 2 | 3, field: "Title" | "Description", value: string) => {
    const key = `spec${number}${field}` as keyof SiteSettings;
    setSettings((prev) => ({ ...prev, [key]: value }));
    markDirty();
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Delete this product? It will be removed from the live catalog when you save changes.")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      markDirty();
    }
  };

  const handleSaveProduct = () => {
    if (!editingProduct) return;
    if (!editingProduct.id.trim() || !editingProduct.name.trim() || !editingProduct.image.trim()) {
      alert("Product ID, name and main image URL are required.");
      return;
    }
    if (editingProduct.price <= 0) {
      alert("Please enter a valid product price.");
      return;
    }
    setProducts((prev) =>
      isAddingNew
        ? [...prev, editingProduct]
        : prev.map((p) => p.id === editingProduct.id ? editingProduct : p)
    );
    setEditingProduct(null);
    setIsAddingNew(false);
    markDirty();
  };

  const handleAddNew = () => {
    setEditingProduct({
      id: `watch-${Date.now().toString(36)}`,
      name: "", category: "Casual", price: 0, image: "",
      gallery: [], description: "", isNew: true, isFeatured: false,
    });
    setIsAddingNew(true);
  };

  const handleImportLeather = async () => {
    if (!supabase) {
      setLeatherNotice("The database is not configured in this browser.");
      return;
    }
    setLeatherImportBusy(true);
    setLeatherNotice("");
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      const items = (data || []).map((item) => ({
        id: String(item.id),
        name: String(item.name || ""),
        category: String(item.category || ""),
        collectionTag: String(item.collection_tag || ""),
        price: Number(item.price) || 0,
        imageUrl: String(item.image_url || ""),
        imageUrls: Array.isArray(item.image_urls) ? item.image_urls.join(", ") : "",
        description: String(item.description || ""),
      }));
      updateSetting("pages", { ...settings.pages, leather: { ...settings.pages.leather, products: items } });
      setLeatherNotice(`Imported ${items.length} leather products. Click Save all changes to publish them.`);
    } catch {
      setLeatherNotice("Could not import leather products. Check the database connection and try again.");
    } finally {
      setLeatherImportBusy(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset products and website text to the built-in defaults? Click Save all afterwards to publish the reset.")) {
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
      setAccessToken(data.session.access_token);
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
      <div className="flex min-h-screen items-center justify-center bg-[#06130f] text-brand-cream">
        <div className="flex items-center gap-3 text-sm text-[#9caca3]">
          <Loader2 size={18} className="animate-spin text-brand-gold" /> Preparing your admin portal…
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#06130f] text-brand-cream lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-white/5 bg-[#0a2118] p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-brand-gold/5 blur-3xl" />
          <div className="absolute -right-40 -top-20 h-[30rem] w-[30rem] rounded-full bg-[#1d5b40]/20 blur-3xl" />
          <Link href="/" className="relative flex w-fit items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-brand-gold/25 bg-black/10">
              <Image src="/logo.png" alt="UM-AREX" width={40} height={40} className="object-contain" />
            </span>
            <span>
              <span className="block font-serif text-lg font-semibold tracking-[0.28em] text-brand-gold">UM-AREX</span>
              <span className="mt-1 block text-[8px] uppercase tracking-[0.42em] text-[#8da094]">Luxury timepieces</span>
            </span>
          </Link>
          <div className="relative max-w-xl py-16">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/5 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-brand-gold">
              <Sparkles size={13} /> Management console
            </div>
            <h1 className="font-serif text-4xl leading-[1.3] text-[#f1eadb] xl:text-5xl">Precision in every detail.</h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-[#9caca3]">A private workspace to curate your collection, refine your brand and keep your storefront current.</p>
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {[{ icon: ShieldCheck, label: "Secure access" }, { icon: Database, label: "Live catalog" }, { icon: Sparkles, label: "Brand control" }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-xs text-[#b7c4bc]">
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-brand-gold"><Icon size={16} /></span>
                  {label}
                </div>
              ))}
            </div>
          </div>
          <p className="relative text-[10px] uppercase tracking-[0.25em] text-[#5f776a]">UM-AREX · Authorized personnel only</p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-3">
                <Image src="/logo.png" alt="UM-AREX" width={44} height={44} className="rounded-full border border-brand-gold/20 bg-brand-green-mid p-1" />
                <span className="font-serif text-base font-semibold tracking-[0.25em] text-brand-gold">UM-AREX</span>
              </Link>
            </div>
            <div className="mb-8">
              <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-brand-gold/20 bg-brand-gold/5 text-brand-gold"><LockKeyhole size={21} /></span>
              <h2 className="font-serif text-3xl text-[#f1eadb]">Welcome back</h2>
              <p className="mt-2 text-sm text-[#8fa198]">Sign in to access your administration workspace.</p>
            </div>

            <form onSubmit={handleLogin} className="rounded-3xl border border-white/10 bg-[#0b2018]/90 p-6 shadow-2xl shadow-black/20 sm:p-8">
              <div className="mb-6">
                <label className="mb-2 block text-xs font-medium text-[#cbd5ce]">Administrator account</label>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#071711] px-4 py-3.5 text-sm text-[#b9c7bf]">
                  <Mail size={16} className="shrink-0 text-brand-gold/70" />
                  <span className="truncate">{ADMIN_ACCOUNT_EMAIL}</span>
                </div>
              </div>
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="admin-password" className="text-xs font-medium text-[#cbd5ce]">Password</label>
                  <button type="button" onClick={handlePasswordReset} disabled={resetBusy} className="text-xs font-medium text-brand-gold transition hover:text-brand-gold-light disabled:opacity-50">
                    {resetBusy ? "Sending…" : "Forgot password?"}
                  </button>
                </div>
                <div className="relative">
                  <input id="admin-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }} placeholder="Enter your password" autoComplete="current-password" className="w-full rounded-xl border border-white/10 bg-[#071711] px-4 py-3.5 pr-12 text-sm text-brand-cream outline-none transition placeholder:text-[#607168] focus:border-brand-gold/60 focus:ring-4 focus:ring-brand-gold/5" autoFocus />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#71837a] transition hover:bg-white/5 hover:text-brand-gold">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              {passwordError && <p role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-brand-danger/20 bg-brand-danger/5 p-3 text-xs leading-5 text-[#f19797]"><AlertCircle size={15} className="mt-0.5 shrink-0" />{passwordError}</p>}
              {resetNotice && <p role={resetNotice.type === "error" ? "alert" : "status"} className={`mb-5 flex items-start gap-2 rounded-xl border p-3 text-xs leading-5 ${resetNotice.type === "error" ? "border-brand-danger/20 bg-brand-danger/5 text-[#f19797]" : "border-brand-success/20 bg-brand-success/5 text-[#8bdba8]"}`}><Mail size={15} className="mt-0.5 shrink-0" />{resetNotice.text}</p>}
              <button type="submit" disabled={loginBusy || !password} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[#082016] transition hover:bg-brand-gold-light active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50">
                {loginBusy ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : <>Sign in to admin <ChevronRight size={15} /></>}
              </button>
              <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/5 pt-5 text-[10px] uppercase tracking-[0.16em] text-[#6f8478]"><ShieldCheck size={13} /> Protected by Supabase authentication</div>
            </form>
            <Link href="/" className="mt-7 inline-flex items-center gap-2 text-xs text-[#8fa198] transition hover:text-brand-gold"><ArrowLeft size={14} /> Back to storefront</Link>
          </div>
        </section>
      </div>
    );
  }

  const meta = pageMeta[activeTab];
  const statusBadge = store.status === "live"
    ? { icon: Cloud, text: "Live database", cls: "border-brand-success/20 bg-brand-success/5 text-[#82d6a0]" }
    : store.status === "loading"
      ? { icon: Loader2, text: "Connecting", cls: "border-white/10 bg-white/5 text-[#9caca3]" }
      : { icon: CloudOff, text: "Local cache", cls: "border-brand-gold/20 bg-brand-gold/5 text-brand-gold" };
  const StatusIcon = statusBadge.icon;
  const securityType = showSecurityPasswords ? "text" : "password";
  const passwordInputClass = "w-full rounded-xl border border-white/10 bg-[#071711] px-4 py-3 pr-12 text-sm text-brand-cream outline-none transition placeholder:text-[#607168] focus:border-brand-gold/60 focus:ring-4 focus:ring-brand-gold/5";

  return (
    <div className="min-h-screen bg-[#071712] text-brand-cream">
      {mobileNavOpen && <button aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/[0.07] bg-[#091c15] transition-transform duration-300 lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-24 items-center justify-between border-b border-white/[0.06] px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="UM-AREX" width={42} height={42} className="rounded-full border border-brand-gold/20 bg-black/10 p-1" />
            <span>
              <span className="block font-serif text-base font-semibold tracking-[0.24em] text-brand-gold">UM-AREX</span>
              <span className="mt-1 block text-[8px] uppercase tracking-[0.35em] text-[#71837a]">Admin portal</span>
            </span>
          </Link>
          <button onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" className="rounded-lg p-2 text-[#8fa198] hover:bg-white/5 lg:hidden"><X size={18} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {navigation.map((group) => (
            <div key={group.label} className="mb-7">
              <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#536b5d]">{group.label}</p>
              <div className="space-y-1">
                {group.tabs.map((tab) => {
                  const Icon = tab.icon;
                  const selected = activeTab === tab.key;
                  return (
                    <button key={tab.key} onClick={() => { setActiveTab(tab.key); setMobileNavOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-medium transition ${selected ? "bg-brand-gold text-[#092017] shadow-lg shadow-black/10" : "text-[#93a69b] hover:bg-white/[0.04] hover:text-brand-cream"}`}>
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
          <Link href="/" target="_blank" className="mb-3 flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-xs text-[#9caca3] transition hover:border-brand-gold/20 hover:text-brand-gold"><span className="flex items-center gap-2"><ExternalLink size={14} /> View storefront</span><ArrowUpRight size={13} /></Link>
          <div className="flex items-center gap-3 rounded-xl bg-black/10 p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-gold/10 text-xs font-semibold text-brand-gold">UA</span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-[#d5dfd8]">Administrator</span>
              <span className="block truncate text-[10px] text-[#6f8478]">{ADMIN_ACCOUNT_EMAIL}</span>
            </span>
            <ShieldCheck size={15} className="shrink-0 text-[#5f8a70]" />
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#071712]/95 backdrop-blur-xl">
          <div className="flex min-h-20 items-center gap-3 px-5 sm:px-8 xl:px-10">
            <button onClick={() => setMobileNavOpen(true)} aria-label="Open navigation" className="rounded-xl border border-white/10 p-2.5 text-[#a7b7ae] lg:hidden"><Menu size={18} /></button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[9px] font-semibold uppercase tracking-[0.22em] text-[#61796a]">{meta.eyebrow}</p>
              <p className="mt-1 truncate text-sm font-medium text-[#dbe4de]">{meta.title}</p>
            </div>
            <span className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium sm:inline-flex ${statusBadge.cls}`}><StatusIcon size={12} className={store.status === "loading" ? "animate-spin" : ""} />{statusBadge.text}</span>
            {saveStatus === "saving" && <span className="hidden items-center gap-1.5 text-xs text-[#9caca3] md:flex"><Loader2 size={14} className="animate-spin" /> Saving…</span>}
            {saveStatus === "saved" && <span className="hidden items-center gap-1.5 text-xs text-[#82d6a0] md:flex"><CheckCircle2 size={14} /> All changes saved</span>}
            {saveStatus === "local" && <span className="hidden items-center gap-1.5 text-xs text-brand-gold md:flex"><Check size={14} /> Saved locally</span>}
            <button onClick={() => setSearchOpen(true)} aria-label="Search admin settings" title="Search settings (Ctrl+K)" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-[11px] font-medium text-[#a7b7ae] transition hover:border-brand-gold/30 hover:text-brand-gold"><Search size={15} /><span className="hidden xl:inline">Search</span><kbd className="hidden rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-[#607168] lg:inline">Ctrl K</kbd></button>
            <button onClick={() => setDeliveryEditorOpen(true)} aria-label="Change delivery charge" title="Change delivery charge" className="inline-flex items-center gap-2 rounded-xl border border-brand-gold/20 bg-brand-gold/5 px-3 py-2.5 text-[11px] font-semibold text-brand-gold transition hover:bg-brand-gold hover:text-[#082016]"><Truck size={15} /><span className="hidden xl:inline">Rs {settings.commerce.domesticDeliveryChargePkr.toLocaleString()}</span></button>
            <button onClick={handleSave} disabled={saveStatus === "saving" || !dirty || activeTab === "security"} className="flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#082016] transition hover:bg-brand-gold-light disabled:cursor-not-allowed disabled:opacity-40"><Save size={14} /><span className="hidden sm:inline">Save all</span></button>
            <button onClick={handleLogout} aria-label="Sign out" title="Sign out" className="rounded-xl border border-white/10 p-2.5 text-[#8fa198] transition hover:border-brand-danger/30 hover:text-brand-danger"><LogOut size={16} /></button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 xl:px-10">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-gold">{meta.eyebrow}</p>
              <h1 className="font-serif text-2xl text-[#f0eadf] sm:text-3xl">{meta.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#81958a]">{meta.description}</p>
            </div>
            {activeTab === "products" && <button onClick={handleAddNew} className="flex w-fit items-center gap-2 rounded-xl border border-brand-gold/30 bg-brand-gold/5 px-4 py-3 text-xs font-semibold text-brand-gold transition hover:bg-brand-gold hover:text-[#082016]"><Plus size={16} /> Add product</button>}
          </div>

          {dirty && activeTab !== "security" && <div className="mb-6 flex items-center gap-3 rounded-xl border border-brand-gold/15 bg-brand-gold/5 px-4 py-3 text-xs text-[#c7b98e]"><span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />You have unpublished changes. Select <strong className="font-semibold text-brand-gold">Save all</strong> to update the live store.</div>}
          {saveStatus === "error" && saveError && <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-brand-danger/20 bg-brand-danger/5 p-4 text-xs leading-6 text-[#e5aaaa]"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span><strong className="font-semibold">Could not save to the database.</strong> {saveError}</span></div>}

          {activeTab === "products" && (
            <section>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-[#0b2018] px-5 py-4">
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gold/10 text-brand-gold"><Package size={18} /></span><div><p className="text-sm font-medium text-[#dbe4de]">{products.length} {products.length === 1 ? "product" : "products"}</p><p className="mt-0.5 text-[11px] text-[#71837a]">in your current collection</p></div></div>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] ${statusBadge.cls}`}><StatusIcon size={11} />{statusBadge.text}</span>
              </div>
              {products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center"><Package size={30} className="mx-auto mb-4 text-[#4f6859]" /><h2 className="font-serif text-lg text-[#dbe4de]">Your collection is empty</h2><p className="mt-2 text-sm text-[#71837a]">Add your first timepiece to get started.</p><button onClick={handleAddNew} className="mt-6 rounded-xl bg-brand-gold px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#082016]">Add product</button></div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <article key={product.id} className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b2018] transition hover:-translate-y-0.5 hover:border-brand-gold/20 hover:shadow-xl hover:shadow-black/10">
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#06130f]">
                        {product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                        ) : <div className="grid h-full place-items-center text-[#3e5a4b]"><Package size={34} /></div>}
                        <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-[#06130f]/85 px-3 py-1 text-[9px] font-medium uppercase tracking-[0.14em] text-[#c5d1c9] backdrop-blur-md">{product.category}</span>
                        {product.isFeatured && <span className="absolute right-3 top-3 rounded-full bg-brand-gold px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#082016]">Featured</span>}
                      </div>
                      <div className="p-5">
                        <h2 className="line-clamp-1 text-sm font-semibold text-[#e4eae6]">{product.name}</h2>
                        <p className="mt-2 font-serif text-lg text-brand-gold">Rs {product.price.toLocaleString()}</p>
                        <div className="mt-5 flex gap-2 border-t border-white/[0.06] pt-4">
                          <button onClick={() => { setEditingProduct(product); setIsAddingNew(false); }} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-xs font-medium text-[#b6c4bc] transition hover:border-brand-gold/30 hover:text-brand-gold"><Edit3 size={14} /> Edit</button>
                          <button onClick={() => handleDeleteProduct(product.id)} aria-label={`Delete ${product.name}`} className="rounded-lg border border-white/10 px-3 text-[#7f9187] transition hover:border-brand-danger/30 hover:bg-brand-danger/5 hover:text-brand-danger"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab !== "products" && activeTab !== "security" && (
            <div className="rounded-2xl border border-white/[0.07] bg-[#0b2018] p-5 sm:p-7">
              {activeTab === "shared" && <ContentEditor label="Brand, navigation, footer & SEO" path="settings.shared" value={settings.shared} onChange={(value) => updateSetting("shared", value as SiteSettings["shared"])} />}

              {activeTab === "pages" && (
                <div className="space-y-7">
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(PAGE_LABELS) as (keyof typeof PAGE_LABELS)[]).map((key) => (
                      <button key={key} type="button" onClick={() => setSelectedPage(key)} className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-wider transition ${selectedPage === key ? "border-brand-gold bg-brand-gold text-[#082016]" : "border-white/10 text-[#9caca3] hover:border-brand-gold/40 hover:text-brand-gold"}`}>{PAGE_LABELS[key]}</button>
                    ))}
                  </div>
                  {selectedPage === "home" ? (
                    <div className="space-y-7">
                      <ContentEditor label="Homepage extras" path="settings.pages.home" value={settings.pages.home} onChange={(value) => updateSetting("pages", { ...settings.pages, home: value } as SiteSettings["pages"])} />
                      <div className="space-y-5 rounded-xl border border-white/[0.07] bg-black/10 p-5">
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">Category &amp; collection headings</h3>
                          <p className="mt-2 text-[11px] leading-5 text-[#71837a]">These headings appear above the category filters and featured collection on the homepage.</p>
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
                      <div className="rounded-xl border border-brand-gold/15 bg-brand-gold/5 p-4 text-[11px] leading-6 text-[#c7b98e]">
                        Manage the leather products shown in the preview. Import the current inventory once, then edit it here. Leaving this list empty uses the live database preview again.
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <button type="button" onClick={handleImportLeather} disabled={leatherImportBusy} className="inline-flex items-center gap-2 rounded-lg border border-brand-gold/30 px-3 py-2 text-[11px] font-semibold text-brand-gold transition hover:bg-brand-gold hover:text-[#082016] disabled:opacity-50">
                            {leatherImportBusy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} {leatherImportBusy ? "Importing…" : "Import current leather inventory"}
                          </button>
                          {leatherNotice && <span role="status">{leatherNotice}</span>}
                        </div>
                      </div>
                      <ContentEditor
                        label="Leather products"
                        path="settings.pages.leather.products"
                        value={settings.pages.leather.products}
                        itemTemplate={{ id: "", name: "", category: "", collectionTag: "", price: 0, imageUrl: "", imageUrls: "", description: "" }}
                        allowEmpty
                        onChange={(value) => updateSetting("pages", { ...settings.pages, leather: { ...settings.pages.leather, products: value as SiteSettings["pages"]["leather"]["products"] } })}
                      />
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
                    <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gold/10 text-brand-gold"><Truck size={18} /></span><div><p className="text-xs font-medium text-[#dbe4de]">Pakistan delivery charge</p><p className="mt-1 font-serif text-2xl text-brand-gold">Rs {settings.commerce.domesticDeliveryChargePkr.toLocaleString()}</p><p className="mt-1 text-[11px] text-[#8d9f94]">Used in product pages, FAQ and policy delivery details.</p></div></div>
                    <button type="button" onClick={() => setDeliveryEditorOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-gold/30 px-4 py-3 text-xs font-semibold text-brand-gold transition hover:bg-brand-gold hover:text-[#082016]"><Edit3 size={14} /> Change delivery charge</button>
                  </div>
                  <div className="rounded-xl border border-brand-gold/15 bg-brand-gold/5 p-4 text-[11px] leading-6 text-[#c7b98e]">International prices add a minimum PKR 500 margin before conversion and round up to the next whole currency unit. Each rate is the number of currency units per 1 PKR and is multiplied after adding the margin. PKR prices stay unchanged. Delivery charges are confirmed on WhatsApp before payment.</div>
                  <ContentEditor label="Worldwide delivery & currency" path="settings.commerce" value={settings.commerce} onChange={(value) => updateSetting("commerce", value as SiteSettings["commerce"])} />
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
                  <Field label="Hero image path" fieldPath="settings.heroImage" value={settings.heroImage} onChange={(v) => updateSetting("heroImage", v)} placeholder="/hero_model_three.png" hint="Use a public file path such as /hero_model_three.png or a full HTTPS image URL." />
                </div>
              )}

              {activeTab === "story" && (
                <div className="space-y-6">
                  <Field label="Section tag" fieldPath="settings.storyTag" value={settings.storyTag} onChange={(v) => updateSetting("storyTag", v)} />
                  <div className="grid gap-6 md:grid-cols-2"><Field label="Title line 1" fieldPath="settings.storyTitle1" value={settings.storyTitle1} onChange={(v) => updateSetting("storyTitle1", v)} /><Field label="Title line 2 (gold italic)" fieldPath="settings.storyTitle2" value={settings.storyTitle2} onChange={(v) => updateSetting("storyTitle2", v)} /></div>
                  <Field label="Paragraph 1" fieldPath="settings.storyParagraph1" value={settings.storyParagraph1} onChange={(v) => updateSetting("storyParagraph1", v)} textarea />
                  <Field label="Paragraph 2" fieldPath="settings.storyParagraph2" value={settings.storyParagraph2} onChange={(v) => updateSetting("storyParagraph2", v)} textarea />
                  <div className="grid gap-6 md:grid-cols-2"><div className="rounded-xl border border-white/[0.06] bg-black/10 p-5"><p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gold">Quality stat 1</p><div className="space-y-5"><Field label="Value" fieldPath="settings.storyStat1Value" value={settings.storyStat1Value} onChange={(v) => updateSetting("storyStat1Value", v)} /><Field label="Label" fieldPath="settings.storyStat1Label" value={settings.storyStat1Label} onChange={(v) => updateSetting("storyStat1Label", v)} /></div></div><div className="rounded-xl border border-white/[0.06] bg-black/10 p-5"><p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gold">Quality stat 2</p><div className="space-y-5"><Field label="Value" fieldPath="settings.storyStat2Value" value={settings.storyStat2Value} onChange={(v) => updateSetting("storyStat2Value", v)} /><Field label="Label" fieldPath="settings.storyStat2Label" value={settings.storyStat2Label} onChange={(v) => updateSetting("storyStat2Label", v)} /></div></div></div>
                  <Field label="Story image path" fieldPath="settings.storyImage" value={settings.storyImage} onChange={(v) => updateSetting("storyImage", v)} />
                </div>
              )}

              {activeTab === "banner" && (
                <div className="space-y-6">
                  <Field label="Section tag" fieldPath="settings.bannerTag" value={settings.bannerTag} onChange={(v) => updateSetting("bannerTag", v)} />
                  <div className="grid gap-6 md:grid-cols-2"><Field label="Title line 1" fieldPath="settings.bannerTitle1" value={settings.bannerTitle1} onChange={(v) => updateSetting("bannerTitle1", v)} /><Field label="Title line 2 (gold italic)" fieldPath="settings.bannerTitle2" value={settings.bannerTitle2} onChange={(v) => updateSetting("bannerTitle2", v)} /></div>
                  <Field label="Description" fieldPath="settings.bannerDescription" value={settings.bannerDescription} onChange={(v) => updateSetting("bannerDescription", v)} textarea />
                  <Field label="Call to action text" fieldPath="settings.bannerCtaText" value={settings.bannerCtaText} onChange={(v) => updateSetting("bannerCtaText", v)} />
                  <Field label="Background image path" fieldPath="settings.bannerImage" value={settings.bannerImage} onChange={(v) => updateSetting("bannerImage", v)} />
                </div>
              )}

              {activeTab === "specs" && (
                <div className="space-y-6">
                  <Field label="Section tag" fieldPath="settings.specsTag" value={settings.specsTag} onChange={(v) => updateSetting("specsTag", v)} />
                  <Field label="Section title" fieldPath="settings.specsTitle" value={settings.specsTitle} onChange={(v) => updateSetting("specsTitle", v)} />
                  {([1, 2, 3] as const).map((number) => (
                    <div key={number} className="rounded-xl border border-white/[0.06] bg-black/10 p-5">
                      <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">Specification {number}</h2>
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
              <section className="h-fit rounded-2xl border border-white/[0.07] bg-[#0b2018] p-6">
                <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gold/10 text-brand-gold"><UserRound size={21} /></span><div><p className="text-sm font-semibold text-[#e1e9e4]">Administrator</p><p className="mt-1 text-[11px] text-[#71837a]">Full portal access</p></div></div>
                <div className="my-6 h-px bg-white/[0.06]" />
                <div className="space-y-4 text-xs"><div className="flex items-start gap-3 text-[#91a399]"><Mail size={15} className="mt-0.5 shrink-0 text-[#607b6a]" /><div><p className="text-[10px] uppercase tracking-wider text-[#5f7668]">Account email</p><p className="mt-1 break-all text-[#c5d1c9]">{ADMIN_ACCOUNT_EMAIL}</p></div></div><div className="flex items-start gap-3 text-[#91a399]"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#607b6a]" /><div><p className="text-[10px] uppercase tracking-wider text-[#5f7668]">Authentication</p><p className="mt-1 text-[#c5d1c9]">Secured by Supabase</p></div></div></div>
                <div className="mt-6 rounded-xl border border-brand-gold/10 bg-brand-gold/5 p-4 text-[11px] leading-6 text-[#a99e80]">Use a unique password of at least 10 characters. Do not reuse a password from your email or social accounts.</div>
              </section>

              <section className="rounded-2xl border border-white/[0.07] bg-[#0b2018] p-6 sm:p-8">
                <div className="mb-7"><h2 className="font-serif text-lg text-[#e8e2d6]">{recoveryMode ? "Set a new password" : "Change password"}</h2><p className="mt-2 text-xs leading-6 text-[#7f9388]">{recoveryMode ? "Your reset link has been verified. Choose a new password to regain access." : "Confirm your current password before choosing a new one."}</p></div>
                {securityNotice && <div role={securityNotice.type === "error" ? "alert" : "status"} className={`mb-6 flex items-start gap-2 rounded-xl border p-3 text-xs leading-5 ${securityNotice.type === "error" ? "border-brand-danger/20 bg-brand-danger/5 text-[#f19797]" : securityNotice.type === "success" ? "border-brand-success/20 bg-brand-success/5 text-[#8bdba8]" : "border-brand-gold/20 bg-brand-gold/5 text-[#c7b98e]"}`}>{securityNotice.type === "error" ? <AlertCircle size={15} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={15} className="mt-0.5 shrink-0" />}{securityNotice.text}</div>}
                <form onSubmit={handlePasswordChange} className="space-y-5">
                  {!recoveryMode && <div><label htmlFor="current-password" className="mb-2 block text-xs font-medium text-[#cbd5ce]">Current password</label><div className="relative"><input id="current-password" type={securityType} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" className={passwordInputClass} /><button type="button" onClick={() => setShowSecurityPasswords((value) => !value)} aria-label={showSecurityPasswords ? "Hide passwords" : "Show passwords"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#71837a] hover:bg-white/5 hover:text-brand-gold">{showSecurityPasswords ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>}
                  <div><label htmlFor="new-password" className="mb-2 block text-xs font-medium text-[#cbd5ce]">New password</label><div className="relative"><input id="new-password" type={securityType} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" minLength={10} required className={passwordInputClass} placeholder="At least 10 characters" />{recoveryMode && <button type="button" onClick={() => setShowSecurityPasswords((value) => !value)} aria-label={showSecurityPasswords ? "Hide passwords" : "Show passwords"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#71837a] hover:bg-white/5 hover:text-brand-gold">{showSecurityPasswords ? <EyeOff size={16} /> : <Eye size={16} />}</button>}</div></div>
                  <div><label htmlFor="confirm-password" className="mb-2 block text-xs font-medium text-[#cbd5ce]">Confirm new password</label><input id="confirm-password" type={securityType} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" minLength={10} required className="w-full rounded-xl border border-white/10 bg-[#071711] px-4 py-3 text-sm text-brand-cream outline-none transition placeholder:text-[#607168] focus:border-brand-gold/60 focus:ring-4 focus:ring-brand-gold/5" /></div>
                  <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between"><button type="submit" disabled={securityBusy} className="flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#082016] transition hover:bg-brand-gold-light disabled:opacity-50">{securityBusy ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}{securityBusy ? "Updating…" : recoveryMode ? "Set new password" : "Update password"}</button><button type="button" onClick={handlePasswordReset} disabled={resetBusy} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs text-[#9caca3] transition hover:border-brand-gold/30 hover:text-brand-gold disabled:opacity-50"><Mail size={14} />{resetBusy ? "Sending…" : "Email me a reset link"}</button></div>
                  {resetNotice && <p role={resetNotice.type === "error" ? "alert" : "status"} className={`text-xs leading-6 ${resetNotice.type === "error" ? "text-[#f19797]" : "text-[#8bdba8]"}`}>{resetNotice.text}</p>}
                </form>
              </section>
            </div>
          )}

          {activeTab !== "security" && (
            <section className="mt-8 rounded-2xl border border-white/[0.07] bg-[#0b2018] p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div className="flex max-w-3xl items-start gap-3"><Database size={17} className="mt-0.5 shrink-0 text-brand-gold/70" /><p className="text-[11px] leading-6 text-[#7f9388]"><strong className="font-medium text-[#b7c4bc]">Shared live database.</strong> Saving publishes your products and content to the storefront. A local copy is kept in this browser as a fallback.</p></div><div className="flex shrink-0 flex-wrap gap-4"><button onClick={() => { initialized.current = false; store.refresh(); }} className="inline-flex items-center gap-2 text-xs text-[#9caca3] transition hover:text-brand-gold"><RefreshCw size={13} /> Reload from database</button><button onClick={handleReset} className="inline-flex items-center gap-2 text-xs text-[#c47e7e] transition hover:text-brand-danger"><Trash2 size={13} /> Reset content</button></div></div>
            </section>
          )}
        </main>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center bg-black/75 px-4 pt-[8vh] backdrop-blur-md" onMouseDown={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="admin-search-title" className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b2018] shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">
              <Search size={19} className="shrink-0 text-brand-gold" />
              <input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && visibleSearchResults[0]) openSearchResult(visibleSearchResults[0]); }} placeholder="Search delivery, track order, hero, FAQs, products…" aria-label="Search all admin options" className="min-w-0 flex-1 bg-transparent text-sm text-brand-cream outline-none placeholder:text-[#607168]" />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="rounded-lg border border-white/10 p-2 text-[#8fa198] transition hover:text-brand-cream"><X size={16} /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              <p className="px-3 pb-2 pt-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#607b6a]">{searchQuery.trim() ? `${visibleSearchResults.length} matching options` : "Quick actions"}</p>
              {visibleSearchResults.length ? visibleSearchResults.map((result) => {
                const Icon = result.product ? Package : result.tab === "security" ? ShieldCheck : FileText;
                return (
                  <button key={result.id} type="button" onClick={() => openSearchResult(result)} className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.05]">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-black/10 text-brand-gold"><Icon size={16} /></span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-[#dbe4de]">{result.label}</span><span className="mt-1 block truncate text-[11px] text-[#71837a]">{result.detail}</span></span>
                    <ChevronRight size={15} className="mt-2 shrink-0 text-[#536b5d]" />
                  </button>
                );
              }) : <div className="px-4 py-12 text-center"><Search size={28} className="mx-auto mb-3 text-[#3e5a4b]" /><p className="text-sm text-[#b6c4bc]">No matching options found</p><p className="mt-2 text-xs text-[#71837a]">Try a page name, field label or product name.</p></div>}
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3 text-[10px] text-[#607168]"><span>Search covers every editable setting and product.</span><span className="hidden items-center gap-1 sm:flex"><kbd className="rounded border border-white/10 px-1.5 py-0.5">Esc</kbd> to close</span></div>
          </div>
        </div>
      )}

      {deliveryEditorOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md" onMouseDown={(e) => { if (e.target === e.currentTarget) setDeliveryEditorOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delivery-editor-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b2018] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.07] bg-[#0b2018]/95 px-6 py-5 backdrop-blur-xl"><div><p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-brand-gold">Quick delivery editor</p><h2 id="delivery-editor-title" className="font-serif text-lg text-[#e8e2d6]">Delivery charge &amp; worldwide shipping</h2></div><button onClick={() => setDeliveryEditorOpen(false)} aria-label="Close delivery editor" className="rounded-xl border border-white/10 p-2 text-[#8fa198] transition hover:bg-white/5 hover:text-brand-cream"><X size={18} /></button></div>
            <div className="space-y-6 px-6 py-7 sm:px-8">
              <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/5 p-5">
                <Field label="Pakistan delivery charge (PKR)" type="number" min={0} step={1} value={String(settings.commerce.domesticDeliveryChargePkr)} onChange={(value) => updateSetting("commerce", { ...settings.commerce, domesticDeliveryChargePkr: Math.max(0, Number(value) || 0) })} hint="This amount appears on product pages, FAQ and policy delivery details." />
                <div className="mt-4 flex flex-wrap gap-2">{[250, 300, 500].map((amount) => <button key={amount} type="button" onClick={() => updateSetting("commerce", { ...settings.commerce, domesticDeliveryChargePkr: amount })} className={`rounded-lg border px-3 py-2 text-[11px] font-medium transition ${settings.commerce.domesticDeliveryChargePkr === amount ? "border-brand-gold bg-brand-gold text-[#082016]" : "border-white/10 text-[#9caca3] hover:border-brand-gold/30 hover:text-brand-gold"}`}>Rs {amount}</button>)}</div>
              </div>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-black/10 p-4"><span><span className="block text-xs font-medium text-[#dbe4de]">Worldwide delivery</span><span className="mt-1 block text-[11px] text-[#71837a]">Allow international customers to request delivery.</span></span><input type="checkbox" checked={settings.commerce.worldwideDeliveryEnabled} onChange={(event) => updateSetting("commerce", { ...settings.commerce, worldwideDeliveryEnabled: event.target.checked })} className="h-4 w-4 shrink-0 accent-brand-gold" /></label>
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-black/10 p-4"><span><span className="block text-xs font-medium text-[#dbe4de]">Confirm exact charge before payment</span><span className="mt-1 block text-[11px] text-[#71837a]">International customers must confirm their destination charge on WhatsApp.</span></span><input type="checkbox" checked={settings.commerce.deliveryQuoteRequired} onChange={(event) => updateSetting("commerce", { ...settings.commerce, deliveryQuoteRequired: event.target.checked })} className="h-4 w-4 shrink-0 accent-brand-gold" /></label>
              </div>
              <Field label="Dispatch estimate" value={settings.commerce.dispatchEstimate} onChange={(value) => updateSetting("commerce", { ...settings.commerce, dispatchEstimate: value })} />
              <Field label="Delivery confirmation message" value={settings.commerce.deliveryConfirmationText} onChange={(value) => updateSetting("commerce", { ...settings.commerce, deliveryConfirmationText: value })} textarea />
              <Field label="International delivery note" value={settings.commerce.internationalDeliveryNote} onChange={(value) => updateSetting("commerce", { ...settings.commerce, internationalDeliveryNote: value })} textarea />
            </div>
            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/[0.07] bg-[#0b2018]/95 px-6 py-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-8"><p className="text-[10px] leading-5 text-[#71837a]">Saving publishes all pending admin changes.</p><div className="flex gap-3"><button onClick={() => setDeliveryEditorOpen(false)} className="rounded-xl border border-white/10 px-5 py-3 text-xs font-medium text-[#9caca3] transition hover:bg-white/5 hover:text-brand-cream">Cancel</button><button onClick={() => { setDeliveryEditorOpen(false); void handleSave(); }} disabled={saveStatus === "saving" || !dirty} className="flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#082016] transition hover:bg-brand-gold-light disabled:cursor-not-allowed disabled:opacity-50"><Save size={14} /> Save changes</button></div></div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md" onMouseDown={(e) => { if (e.target === e.currentTarget) { setEditingProduct(null); setIsAddingNew(false); } }}>
          <div role="dialog" aria-modal="true" aria-labelledby="product-dialog-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b2018] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.07] bg-[#0b2018]/95 px-6 py-5 backdrop-blur-xl sm:px-8"><div><p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-brand-gold">Catalog management</p><h2 id="product-dialog-title" className="font-serif text-lg text-[#e8e2d6]">{isAddingNew ? "Add a new product" : "Edit product"}</h2></div><button onClick={() => { setEditingProduct(null); setIsAddingNew(false); }} aria-label="Close product editor" className="rounded-xl border border-white/10 p-2 text-[#8fa198] transition hover:bg-white/5 hover:text-brand-cream"><X size={18} /></button></div>
            <div className="space-y-5 px-6 py-7 sm:px-8">
              <Field label="Product ID" value={editingProduct.id} onChange={(v) => setEditingProduct({ ...editingProduct, id: v })} disabled={!isAddingNew} required hint="A unique internal identifier. It cannot be changed after creation." />
              <Field label="Product name" value={editingProduct.name} onChange={(v) => setEditingProduct({ ...editingProduct, name: v })} placeholder="e.g. Rolex Daytona" required />
              <div className="grid gap-5 md:grid-cols-2"><Field label="Category" value={editingProduct.category} onChange={(v) => setEditingProduct({ ...editingProduct, category: v })} placeholder="Casual, Automatic, Ladies…" required hint="Use a new category name to create another collection." /><Field label="Base price (PKR)" type="number" value={String(editingProduct.price)} onChange={(v) => setEditingProduct({ ...editingProduct, price: Number(v) })} min={1} required /></div>
              <Field label="Previous price (optional)" type="number" value={editingProduct.oldPrice ? String(editingProduct.oldPrice) : ""} onChange={(v) => setEditingProduct({ ...editingProduct, oldPrice: v ? Number(v) : undefined })} min={1} />
              <Field label="Main image URL" value={editingProduct.image} onChange={(v) => setEditingProduct({ ...editingProduct, image: v })} type="url" placeholder="https://… or /watches/…" required />
              <Field label="Gallery image URLs" value={editingProduct.gallery?.join(", ") || ""} onChange={(v) => setEditingProduct({ ...editingProduct, gallery: v.split(",").map((s) => s.trim()).filter(Boolean) })} textarea hint="Separate multiple image URLs with commas." />
              <Field label="Product description" value={editingProduct.description} onChange={(v) => setEditingProduct({ ...editingProduct, description: v })} textarea />

              <div className="space-y-5 rounded-2xl border border-brand-gold/15 bg-brand-gold/[0.03] p-5">
                <div><h3 className="font-serif text-lg text-[#e8e2d6]">Product detail page</h3><p className="mt-1 text-[11px] leading-5 text-[#71837a]">Leave optional fields blank to use the global defaults from Pages &amp; policies → Product detail defaults.</p></div>
                <div className="grid gap-5 md:grid-cols-2"><Field label="Detail tagline" value={editingProduct.detailTagline || ""} onChange={(v) => setEditingProduct({ ...editingProduct, detailTagline: v || undefined })} placeholder="Automatic Edition" /><Field label="Order button text" value={editingProduct.orderButtonText || ""} onChange={(v) => setEditingProduct({ ...editingProduct, orderButtonText: v || undefined })} /></div>
                <Field label="Detail-page description" value={editingProduct.detailDescription || ""} onChange={(v) => setEditingProduct({ ...editingProduct, detailDescription: v || undefined })} textarea placeholder="Optional longer overview for this watch" />
                <div className="grid gap-5 md:grid-cols-2"><Field label="Shipping section title" value={editingProduct.shippingTitle || ""} onChange={(v) => setEditingProduct({ ...editingProduct, shippingTitle: v || undefined })} /><Field label="Overview title" value={editingProduct.overviewTitle || ""} onChange={(v) => setEditingProduct({ ...editingProduct, overviewTitle: v || undefined })} /></div>
                <Field label="Shipping note 1" value={editingProduct.shippingNote1 || ""} onChange={(v) => setEditingProduct({ ...editingProduct, shippingNote1: v || undefined })} textarea />
                <Field label="Shipping note 2" value={editingProduct.shippingNote2 || ""} onChange={(v) => setEditingProduct({ ...editingProduct, shippingNote2: v || undefined })} textarea />
                <Field label="Specifications title" value={editingProduct.specificationsTitle || ""} onChange={(v) => setEditingProduct({ ...editingProduct, specificationsTitle: v || undefined })} />
                <div className="space-y-3">
                  {editingProduct.specifications && <button type="button" onClick={() => setEditingProduct({ ...editingProduct, specifications: undefined })} className="text-[11px] font-medium text-brand-gold underline underline-offset-4 hover:text-brand-gold-light">Use global specification defaults</button>}
                  <ContentEditor label="Product specifications" value={editingProduct.specifications?.length ? editingProduct.specifications : settings.pages.watch.defaultSpecifications} itemTemplate={{ label: "", value: "" }} allowEmpty onChange={(value) => setEditingProduct({ ...editingProduct, specifications: value as Product["specifications"] })} />
                </div>
                <div className="grid gap-5 md:grid-cols-2"><Field label="Related section tag" value={editingProduct.relatedTag || ""} onChange={(v) => setEditingProduct({ ...editingProduct, relatedTag: v || undefined })} /><Field label="Related section title" value={editingProduct.relatedTitle || ""} onChange={(v) => setEditingProduct({ ...editingProduct, relatedTitle: v || undefined })} placeholder="More from {category}" /></div>
                <div className="grid gap-5 md:grid-cols-2"><Field label="New badge text" value={editingProduct.newBadgeText || ""} onChange={(v) => setEditingProduct({ ...editingProduct, newBadgeText: v || undefined })} /><Field label="Offer badge text" value={editingProduct.offerBadgeText || ""} onChange={(v) => setEditingProduct({ ...editingProduct, offerBadgeText: v || undefined })} /></div>
              </div>

              <div className="flex flex-wrap gap-6 rounded-xl border border-white/[0.06] bg-black/10 p-4"><label className="flex cursor-pointer items-center gap-2 text-xs text-[#b6c4bc]"><input type="checkbox" checked={editingProduct.isNew || false} onChange={(e) => setEditingProduct({ ...editingProduct, isNew: e.target.checked })} className="h-4 w-4 accent-brand-gold" />New arrival</label><label className="flex cursor-pointer items-center gap-2 text-xs text-[#b6c4bc]"><input type="checkbox" checked={editingProduct.isBestSeller || false} onChange={(e) => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })} className="h-4 w-4 accent-brand-gold" />Best seller</label><label className="flex cursor-pointer items-center gap-2 text-xs text-[#b6c4bc]"><input type="checkbox" checked={editingProduct.isFeatured || false} onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })} className="h-4 w-4 accent-brand-gold" />Featured product</label></div>
            </div>
            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/[0.07] bg-[#0b2018]/95 px-6 py-5 backdrop-blur-xl sm:flex-row sm:justify-end sm:px-8"><button onClick={() => { setEditingProduct(null); setIsAddingNew(false); }} className="rounded-xl border border-white/10 px-5 py-3 text-xs font-medium text-[#9caca3] transition hover:bg-white/5 hover:text-brand-cream">Cancel</button><button onClick={handleSaveProduct} className="flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#082016] transition hover:bg-brand-gold-light"><Save size={14} /> Save product</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
