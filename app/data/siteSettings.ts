import {
  DEFAULT_COMMERCE,
  DEFAULT_PAGES,
  DEFAULT_SHARED,
  type CommerceSettings,
  type PagesContent,
  type SharedContent,
  type ShowcaseSettings,
} from "./content";

export interface SiteSettings {
  bannerText: string;
  heroTagline: string;
  heroTitle1: string;
  heroTitle2: string;
  heroTitle3: string;
  heroDescription: string;
  heroCta1Text: string;
  heroCta2Text: string;
  heroQuote: string;
  heroImage: string;
  categorySectionTag: string;
  categorySectionTitle: string;
  collectionTag: string;
  collectionTitleFeatured: string;
  storyTag: string;
  storyTitle1: string;
  storyTitle2: string;
  storyParagraph1: string;
  storyParagraph2: string;
  storyStat1Value: string;
  storyStat1Label: string;
  storyStat2Value: string;
  storyStat2Label: string;
  storyImage: string;
  bannerTag: string;
  bannerTitle1: string;
  bannerTitle2: string;
  bannerDescription: string;
  bannerCtaText: string;
  bannerImage: string;
  specsTag: string;
  specsTitle: string;
  spec1Title: string;
  spec1Description: string;
  spec2Title: string;
  spec2Description: string;
  spec3Title: string;
  spec3Description: string;
  contactTag: string;
  contactTitle1: string;
  contactTitle2: string;
  contactDescription: string;
  contactCtaText: string;
  footerDescription: string;
  footerCopyright: string;
  footerCredit: string;
  whatsappNumber: string;
  whatsappGroupUrl: string;
  tiktokUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  pages: PagesContent;
  shared: SharedContent;
  commerce: CommerceSettings;
  showcase: ShowcaseSettings;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  bannerText: "Premium leather goods • Worldwide delivery • Shipping charge confirmed before payment • Dispatch within 24 hours",
  heroTagline: "The Art of Leather Craft",
  heroTitle1: "CRAFTED",
  heroTitle2: "FOR",
  heroTitle3: "LEGACY.",
  heroDescription: "Refined leather wallets and accessories shaped by considered materials, precise finishing, and timeless everyday design.",
  heroCta1Text: "Explore Collection",
  heroCta2Text: "Speak to a Concierge",
  heroQuote: "\"True luxury is found in the details you feel every day.\"",
  heroImage: "https://imgur.com/uqhb98G.jpg",
  categorySectionTag: "The UM-AREX Selection",
  categorySectionTitle: "Shop by Collection",
  collectionTag: "Curated Leather Pieces",
  collectionTitleFeatured: "The Signature Collection",
  storyTag: "Our Heritage",
  storyTitle1: "Where Quality",
  storyTitle2: "Meets Quiet Elegance",
  storyParagraph1: "UM-AREX Leather brings together classic silhouettes and modern everyday function. From refined vertical wallets to minimal card holders, each piece is designed to feel considered without feeling excessive.",
  storyParagraph2: "Our focus is simple: selected materials, clean construction, careful stitching, and honest product information. Every order receives personal confirmation before payment.",
  storyStat1Value: "100%",
  storyStat1Label: "Quality Inspected",
  storyStat2Value: "24h",
  storyStat2Label: "Dispatch After Verification",
  storyImage: "https://imgur.com/flUaxyp.jpg",
  bannerTag: "The Leather Standard",
  bannerTitle1: "Built for Those Who",
  bannerTitle2: "Value the Details",
  bannerDescription: "Clean lines, refined proportions, and practical everyday carry. Discover leather pieces selected for appearance, durability, and lasting character.",
  bannerCtaText: "Ask About a Piece",
  bannerImage: "https://imgur.com/7Md6x0H.jpg",
  specsTag: "Our Standard",
  specsTitle: "Considered in Every Detail",
  spec1Title: "Material Character",
  spec1Description: "Leather is selected for its appearance, feel, and suitability for regular everyday use.",
  spec2Title: "Construction & Finish",
  spec2Description: "Stitching, edges, and closures are reviewed for a clean finish and a practical, durable construction.",
  spec3Title: "Timeless Design",
  spec3Description: "Classic proportions are refined for modern daily carry, creating versatile pieces that remain stylish beyond a single season.",
  contactTag: "Personal Client Services",
  contactTitle1: "Need Help Choosing",
  contactTitle2: "Your Piece?",
  contactDescription: "Looking for a particular silhouette, a gift, or a custom leather piece? Our WhatsApp concierge can help with dimensions, availability, and delivery to your country.",
  contactCtaText: "Chat on WhatsApp",
  footerDescription: "Refined leather wallets and accessories, curated for everyday elegance and delivered with personal service.",
  footerCopyright: "UM-AREX Leather. All rights reserved.",
  footerCredit: "A UM-AREX Experience · Pakistan",
  whatsappNumber: "923279595329",
  whatsappGroupUrl: "https://chat.whatsapp.com/EsbVXoDJEvuIjYAp0ipzs0?mode=gi_t",
  tiktokUrl: "https://www.tiktok.com/@um__arex?_r=1&_t=ZS-960Ngidjmul",
  instagramUrl: "https://www.instagram.com/um__arex?igsh=MWJmbWxvdWZweWc1NQ%3D%3D&utm_source=qr",
  facebookUrl: "https://www.facebook.com/profile.php?id=61592505966869",
  pages: DEFAULT_PAGES,
  shared: DEFAULT_SHARED,
  commerce: DEFAULT_COMMERCE,
  showcase: {
    featuredProductIds: ["25", "24", "23", "22", "21"],
    newProductIds: ["25", "23", "20"],
    bestSellerProductIds: ["24", "21", "17"],
  },
};

const STORAGE_KEY_SETTINGS = "umarex_leather_site_settings";

function mergeContent<T>(defaults: T, input: unknown): T {
  if (Array.isArray(defaults)) {
    return (Array.isArray(input) ? input : defaults) as T;
  }
  if (defaults && typeof defaults === "object") {
    const result: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
    if (input && typeof input === "object" && !Array.isArray(input)) {
      for (const [key, value] of Object.entries(input)) {
        result[key] = key in result ? mergeContent(result[key], value) : value;
      }
    }
    return result as T;
  }
  return (input === undefined ? defaults : input) as T;
}

export function mergeSiteSettings(input?: Partial<SiteSettings> | null): SiteSettings {
  const merged = mergeContent(DEFAULT_SITE_SETTINGS, input || {}) as SiteSettings;
  const currencies = Array.isArray(merged.commerce.currencies) ? merged.commerce.currencies : [];
  const normalizedCurrencies = currencies.map((currency) => ({
    ...currency,
    rate: currency.code === "PKR" ? 1 : Number(currency.rate) > 0 ? Number(currency.rate) : 1,
  }));
  merged.commerce.currencies = normalizedCurrencies.some((currency) => currency.code === "PKR")
    ? normalizedCurrencies
    : [DEFAULT_COMMERCE.currencies[0], ...normalizedCurrencies];
  merged.commerce.currencyMarginPkr = Math.max(500, Number(merged.commerce.currencyMarginPkr) || 500);

  const countries = Array.isArray(merged.commerce.countries) ? merged.commerce.countries : [];
  merged.commerce.countries = countries.some((country) => country.code === "PK")
    ? countries.map((country) => country.code === "PK" ? { ...country, currency: "PKR", enabled: true } : country)
    : [DEFAULT_COMMERCE.countries[0], ...countries];

  const normalizeIds = (value: unknown) => Array.isArray(value)
    ? [...new Set(value.map((id) => String(id)).filter(Boolean))]
    : [];
  merged.showcase = {
    featuredProductIds: normalizeIds(merged.showcase?.featuredProductIds),
    newProductIds: normalizeIds(merged.showcase?.newProductIds),
    bestSellerProductIds: normalizeIds(merged.showcase?.bestSellerProductIds),
  };
  return merged;
}

export function getSiteSettings(): SiteSettings {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored);
        return mergeSiteSettings(parsed && typeof parsed === "object" ? parsed as Partial<SiteSettings> : null);
      } catch {
        return DEFAULT_SITE_SETTINGS;
      }
    }
  }
  return DEFAULT_SITE_SETTINGS;
}

export function saveSiteSettings(settings: SiteSettings): void {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
}
