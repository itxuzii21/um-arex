export const PAGE_LAYOUT_DEFINITIONS = {
  home: {
    label: "Homepage",
    path: "/",
    sections: [
      { id: "hero", label: "Hero introduction", description: "Main introduction and featured product." },
      { id: "benefits", label: "Benefits", description: "Delivery, quality and service highlights." },
      { id: "categories", label: "Categories", description: "Shop-by-category buttons." },
      { id: "collection", label: "Product collection", description: "Product grid with search and sorting." },
      { id: "story", label: "Brand story", description: "Brand story, image and quality statistics." },
      { id: "specifications", label: "Materials & details", description: "Materials and craftsmanship details." },
      { id: "testimonials", label: "Customer reviews", description: "Customer review cards." },
      { id: "sisterBrand", label: "Sister-brand feature", description: "Panel linking the other UM-AREX store." },
      { id: "contact", label: "Contact & FAQ", description: "FAQ list and WhatsApp contact box." },
    ],
    cardGroups: [
      { id: "benefits", label: "Benefit boxes" },
      { id: "categories", label: "Category buttons" },
      { id: "products", label: "Product cards" },
      { id: "storyStats", label: "Story statistics" },
      { id: "specifications", label: "Specification cards" },
      { id: "testimonials", label: "Review boxes" },
      { id: "sisterBrand", label: "Sister-brand panel" },
      { id: "faqs", label: "FAQ list" },
      { id: "contact", label: "Contact box" },
    ],
  },
  about: {
    label: "About page",
    path: "/about",
    sections: [
      { id: "about-intro", label: "Page introduction", description: "About page heading and introduction." },
      { id: "about-heritage", label: "Heritage story", description: "Brand story text and image." },
      { id: "about-values", label: "Our commitments", description: "Value and commitment cards." },
      { id: "about-standards", label: "Our standards", description: "Materials and service standards." },
      { id: "about-cta", label: "Collection invitation", description: "Final invitation to explore the collection." },
    ],
    cardGroups: [
      { id: "aboutValues", label: "Commitment cards" },
      { id: "aboutCta", label: "Collection invitation box" },
    ],
  },
  faq: {
    label: "FAQ page",
    path: "/faq",
    sections: [
      { id: "faq-intro", label: "Page introduction", description: "FAQ heading and introduction." },
      { id: "faq-questions", label: "Questions & answers", description: "Expandable FAQ cards." },
      { id: "faq-support", label: "WhatsApp support", description: "Support contact box." },
    ],
    cardGroups: [
      { id: "faqItems", label: "Question cards" },
      { id: "faqSupport", label: "Support box" },
    ],
  },
  privacy: {
    label: "Privacy policy",
    path: "/privacy",
    sections: [
      { id: "privacy-intro", label: "Page introduction", description: "Privacy policy heading." },
      { id: "privacy-updated", label: "Last updated", description: "Policy update date." },
      { id: "privacy-content", label: "Policy sections", description: "Privacy policy information cards." },
    ],
    cardGroups: [
      { id: "policyCards", label: "Policy cards" },
    ],
  },
  terms: {
    label: "Terms & conditions",
    path: "/terms",
    sections: [
      { id: "terms-intro", label: "Page introduction", description: "Terms heading." },
      { id: "terms-updated", label: "Last updated", description: "Policy update date." },
      { id: "terms-content", label: "Policy sections", description: "Terms information cards." },
    ],
    cardGroups: [
      { id: "policyCards", label: "Policy cards" },
    ],
  },
  returns: {
    label: "Returns page",
    path: "/returns",
    sections: [
      { id: "returns-intro", label: "Page introduction", description: "Returns heading." },
      { id: "returns-updated", label: "Last updated", description: "Policy update date." },
      { id: "returns-highlights", label: "Return highlights", description: "Important return-policy highlights." },
      { id: "returns-content", label: "Policy sections", description: "Detailed return information cards." },
    ],
    cardGroups: [
      { id: "returnHighlights", label: "Highlight cards" },
      { id: "policyCards", label: "Policy cards" },
    ],
  },
  trackOrder: {
    label: "Track order page",
    path: "/track-order",
    sections: [
      { id: "track-order-intro", label: "Page introduction", description: "Tracking heading and introduction." },
      { id: "track-order-form", label: "Tracking form", description: "Tracking number and WhatsApp button." },
      { id: "track-order-journey", label: "Delivery journey", description: "Order journey heading and step cards." },
      { id: "track-order-support", label: "Support box", description: "WhatsApp support contact box." },
    ],
    cardGroups: [
      { id: "trackingForm", label: "Tracking form box" },
      { id: "journeySteps", label: "Journey step cards" },
      { id: "trackingSupport", label: "Support box" },
    ],
  },
  leather: {
    label: "Leather page",
    path: "/leather",
    sections: [
      { id: "leather-hero", label: "Leather introduction", description: "Leather page hero and introduction." },
      { id: "leather-preview", label: "Collection preview", description: "Leather product preview grid." },
      { id: "leather-values", label: "Brand values", description: "Leather quality and service values." },
      { id: "leather-cta", label: "Visit or contact", description: "External store and WhatsApp invitation." },
    ],
    cardGroups: [
      { id: "leatherProducts", label: "Product cards" },
      { id: "leatherValues", label: "Value cards" },
      { id: "leatherCta", label: "Contact box" },
    ],
  },
  product: {
    label: "Leather product page",
    path: "/product",
    sections: [
      { id: "product-details", label: "Product details", description: "Product gallery, description and order details." },
      { id: "product-related", label: "Related products", description: "Related leather product cards." },
    ],
    cardGroups: [
      { id: "productShipping", label: "Delivery box" },
      { id: "productSpecifications", label: "Specifications area" },
      { id: "productRelated", label: "Related product cards" },
    ],
  },
  watch: {
    label: "Watch product page",
    path: "/watch",
    sections: [
      { id: "watch-details", label: "Product details", description: "Watch gallery, description and order details." },
      { id: "watch-related", label: "Related products", description: "Related watch product cards." },
    ],
    cardGroups: [
      { id: "watchShipping", label: "Delivery box" },
      { id: "watchSpecifications", label: "Specifications area" },
      { id: "watchRelated", label: "Related product cards" },
    ],
  },
  notFound: {
    label: "Not found page",
    path: "/404",
    sections: [
      { id: "not-found-intro", label: "404 message", description: "Page not found heading and message." },
      { id: "not-found-back", label: "Back link", description: "Return to collection link." },
    ],
    cardGroups: [
      { id: "notFoundPanel", label: "404 message panel" },
    ],
  },
} as const;

export const PAGE_LAYOUT_KEYS = Object.keys(PAGE_LAYOUT_DEFINITIONS) as PageLayoutKey[];
export type PageLayoutKey = keyof typeof PAGE_LAYOUT_DEFINITIONS;
export type PageSectionId = string;
export type PageCardGroupId = string;

export const PAGE_CARD_SIZE_OPTIONS = [
  { value: "compact", label: "Compact" },
  { value: "default", label: "Default" },
  { value: "large", label: "Large" },
] as const;

export type PageCardSize = (typeof PAGE_CARD_SIZE_OPTIONS)[number]["value"];

export interface PageLayout {
  sectionOrder: PageSectionId[];
  cardSizes: Record<PageCardGroupId, PageCardSize>;
}

export type PageLayouts = Record<PageLayoutKey, PageLayout>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function getDefaultPageLayout(page: PageLayoutKey): PageLayout {
  const definition = PAGE_LAYOUT_DEFINITIONS[page];
  return {
    sectionOrder: definition.sections.map((section) => section.id),
    cardSizes: Object.fromEntries(
      definition.cardGroups.map((group) => [group.id, "default"])
    ) as Record<PageCardGroupId, PageCardSize>,
  };
}

export const DEFAULT_PAGE_LAYOUTS = Object.fromEntries(
  PAGE_LAYOUT_KEYS.map((page) => [page, getDefaultPageLayout(page)])
) as PageLayouts;

export function normalizePageLayout(page: PageLayoutKey, value: unknown): PageLayout {
  const definition = PAGE_LAYOUT_DEFINITIONS[page];
  const source = isRecord(value) ? value : {};
  const validSections: readonly string[] = definition.sections.map((section) => section.id);
  const savedOrder = Array.isArray(source.sectionOrder)
    ? source.sectionOrder.filter(
        (id): id is PageSectionId =>
          typeof id === "string" && validSections.includes(id)
      )
    : [];
  const uniqueOrder = [...new Set(savedOrder)];
  const sectionOrder = [
    ...uniqueOrder,
    ...validSections.filter((id) => !uniqueOrder.includes(id)),
  ];
  const validGroups = definition.cardGroups.map((group) => group.id);
  const savedSizes = isRecord(source.cardSizes) ? source.cardSizes : {};
  const cardSizes = Object.fromEntries(
    validGroups.map((group) => {
      const size = savedSizes[group];
      return [
        group,
        PAGE_CARD_SIZE_OPTIONS.some((option) => option.value === size)
          ? size
          : "default",
      ];
    })
  ) as Record<PageCardGroupId, PageCardSize>;

  return { sectionOrder, cardSizes };
}

export function normalizePageLayouts(value: unknown): PageLayouts {
  const source = isRecord(value) ? value : {};
  return Object.fromEntries(
    PAGE_LAYOUT_KEYS.map((page) => [
      page,
      normalizePageLayout(page, source[page]),
    ])
  ) as PageLayouts;
}

export const HOME_CARD_SIZE_CLASSES: Record<string, Record<PageCardSize, string>> = {
  benefits: {
    compact: "p-3 lg:p-4",
    default: "p-4 lg:p-5",
    large: "p-6 lg:p-7",
  },
  categories: {
    compact: "gap-2 p-1.5 pr-4",
    default: "gap-3 p-2 pr-5",
    large: "gap-4 p-3 pr-6",
  },
  storyStats: {
    compact: "p-3 sm:p-4",
    default: "p-4 sm:p-5",
    large: "p-6 sm:p-7",
  },
  specifications: {
    compact: "gap-4 p-4 sm:p-5",
    default: "gap-5 p-5 sm:p-6",
    large: "gap-6 p-7 sm:p-8",
  },
  testimonials: {
    compact: "p-4 sm:p-5",
    default: "p-6 sm:p-7",
    large: "p-8 sm:p-10",
  },
  sisterBrand: {
    compact: "p-5 sm:p-7 md:p-9",
    default: "p-7 sm:p-9 md:p-12 lg:p-16",
    large: "p-10 sm:p-14 md:p-20 lg:p-24",
  },
  faqs: {
    compact: "px-4 sm:px-5",
    default: "px-5 sm:px-6",
    large: "px-7 sm:px-8",
  },
  contact: {
    compact: "min-h-[400px] p-5 sm:p-7",
    default: "min-h-[480px] p-7 sm:p-10",
    large: "min-h-[560px] p-9 sm:p-12",
  },
};

export const PAGE_CARD_SIZE_CLASSES: Record<string, Record<PageCardSize, string>> = {
  aboutValues: {
    compact: "p-4",
    default: "p-6",
    large: "p-8",
  },
  aboutCta: {
    compact: "p-6 md:p-8",
    default: "p-8 md:p-12",
    large: "p-10 md:p-16",
  },
  faqItems: {
    compact: "p-4",
    default: "p-6",
    large: "p-8",
  },
  faqSupport: {
    compact: "p-6 md:p-8",
    default: "p-8 md:p-12",
    large: "p-10 md:p-16",
  },
  policyCards: {
    compact: "p-5 md:p-6",
    default: "p-6 md:p-8",
    large: "p-8 md:p-10",
  },
  returnHighlights: {
    compact: "p-4",
    default: "p-6",
    large: "p-8",
  },
  trackingForm: {
    compact: "p-5 md:p-7",
    default: "p-7 md:p-10",
    large: "p-9 md:p-12",
  },
  journeySteps: {
    compact: "p-4",
    default: "p-5",
    large: "p-7",
  },
  trackingSupport: {
    compact: "p-6 md:p-8",
    default: "p-8",
    large: "p-10 md:p-12",
  },
  leatherValues: {
    compact: "p-5",
    default: "p-8",
    large: "p-10",
  },
  leatherCta: {
    compact: "p-2",
    default: "p-0",
    large: "p-6 md:p-8",
  },
  productShipping: {
    compact: "p-4",
    default: "p-5",
    large: "p-7",
  },
  productSpecifications: {
    compact: "space-y-2",
    default: "space-y-4",
    large: "space-y-6",
  },
  watchShipping: {
    compact: "p-4",
    default: "p-5",
    large: "p-7",
  },
  watchSpecifications: {
    compact: "space-y-2",
    default: "space-y-4",
    large: "space-y-6",
  },
  notFoundPanel: {
    compact: "px-2 py-2",
    default: "px-0 py-0",
    large: "px-6 py-8",
  },
};

export const FAQ_ITEM_SIZE_CLASSES: Record<PageCardSize, { button: string; answer: string }> = {
  compact: { button: "p-4", answer: "px-4 pb-4 pt-4" },
  default: { button: "p-6", answer: "px-6 pb-6 pt-4" },
  large: { button: "p-8", answer: "px-8 pb-8 pt-5" },
};

export const HOME_CATEGORY_ICON_SIZE_CLASSES: Record<PageCardSize, string> = {
  compact: "h-11 w-11",
  default: "h-14 w-14",
  large: "h-16 w-16",
};

export const HOME_PRODUCT_GRID_SIZE_CLASSES: Record<PageCardSize, string> = {
  compact: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  default: "grid-cols-1 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4",
  large: "grid-cols-1 sm:grid-cols-2 md:gap-5 lg:grid-cols-3",
};

export const LEATHER_PRODUCT_GRID_SIZE_CLASSES: Record<PageCardSize, string> = {
  compact: "grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4",
  default: "grid-cols-2 gap-6 md:grid-cols-4",
  large: "grid-cols-1 gap-8 sm:grid-cols-2",
};

export const RELATED_PRODUCT_GRID_SIZE_CLASSES: Record<PageCardSize, string> = {
  compact: "grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4",
  default: "grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4",
  large: "grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3",
};
