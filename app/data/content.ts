export type ContentIcon = "shield" | "truck" | "clock" | "award" | "gem" | "scissors" | "scroll" | "package" | "check" | "sparkles";

export function resolveContentText(text: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    text
  );
}

export interface ContentCard {
  id: string;
  icon: ContentIcon;
  title: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  piece: string;
  quote: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface PolicySection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets: string[];
  numbered: string[];
}

export interface PageIntro {
  backLabel: string;
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  description: string;
}

export interface PolicyPageContent extends PageIntro {
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  sections: PolicySection[];
}

export interface HomeContent {
  newBadgeText: string;
  offerBadgeText: string;
  viewPieceLabel: string;
  viewProductLabel: string;
  selectImageLabel: string;
  exploreDetailsLabel: string;
  sortLabel: string;
  ratingLabel: string;
  dispatchStatValue: string;
  featuredLabel: string;
  piecesLabel: string;
  pieceLabel: string;
  categoryCollectionSuffix: string;
  searchPlaceholder: string;
  sortFeaturedLabel: string;
  sortPriceAscLabel: string;
  sortPriceDescLabel: string;
  sortNameLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  clearSearchLabel: string;
  signatureLabel: string;
  sealText: string;
  scrollLabel: string;
  heroImageAlt: string;
  storyImageAlt: string;
  specsImage: string;
  specsImageAlt: string;
  specsImageBadge: string;
  faqTag: string;
  faqTitle: string;
  faqViewAllLabel: string;
  responseNote: string;
  testimonialsTag: string;
  testimonialsTitle: string;
  curatedPiecesLabel: string;
  collectionsLabel: string;
  dispatchLabel: string;
  orderMessage: string;
  conciergeMessage: string;
  leatherTag: string;
  leatherTitleLead: string;
  leatherTitleAccent: string;
  leatherDescription: string;
  leatherPrimaryCta: string;
  leatherSecondaryCta: string;
  leatherLogoAlt: string;
  benefits: ContentCard[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
}

export interface AboutContent extends PageIntro {
  heritageTag: string;
  heritageTitleLead: string;
  heritageTitleAccent: string;
  paragraphs: string[];
  image: string;
  imageAlt: string;
  commitmentTag: string;
  commitmentTitle: string;
  values: ContentCard[];
  standardTag: string;
  standardTitle: string;
  standards: ContentCard[];
  ctaTag: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaLabel: string;
}

export interface FaqContent extends PageIntro {
  supportTag: string;
  supportTitle: string;
  supportDescription: string;
  supportCta: string;
  supportMessage: string;
  items: FaqItem[];
}

export interface ReturnsContent extends PolicyPageContent {
  highlights: ContentCard[];
}

export interface TrackOrderContent extends PageIntro {
  fieldLabel: string;
  placeholder: string;
  trackingMessage: string;
  missingTrackingId: string;
  buttonText: string;
  requestedMessage: string;
  fallbackLabel: string;
  trackingNote: string;
  journeyTag: string;
  journeyTitle: string;
  steps: ContentCard[];
  summary: string;
  supportTag: string;
  supportTitle: string;
  supportDescription: string;
  supportCta: string;
  supportMessage: string;
}

export interface LeatherProduct {
  id: string;
  name: string;
  category: string;
  collectionTag: string;
  price: number;
  imageUrl: string;
  imageUrls: string;
  description: string;
}

export interface LeatherContent {
  backLabel: string;
  fullWebsiteLabel: string;
  logoUrl: string;
  logoAlt: string;
  heroTag: string;
  titleLead: string;
  titleAccent: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  previewTag: string;
  previewTitle: string;
  previewDescription: string;
  badgeText: string;
  fallbackTag: string;
  emptyTitle: string;
  emptyDescription: string;
  viewAllLabel: string;
  standardTitle: string;
  values: ContentCard[];
  ctaTitle: string;
  ctaDescription: string;
  ctaLabel: string;
  whatsappCta: string;
  whatsappMessage: string;
  products: LeatherProduct[];
}

export interface WatchPageContent {
  categorySuffix: string;
  internationalOrderButtonText: string;
  internationalUnavailableButtonText: string;
  orderMessage: string;
  noDeliveryQuoteOrderMessage: string;
  internationalUnavailableMessage: string;
  internationalPriceNote: string;
  previousImageLabel: string;
  nextImageLabel: string;
  viewImageLabel: string;
  saveLabel: string;
  automaticMovementLabel: string;
  breadcrumbHome: string;
  breadcrumbCollection: string;
  newBadgeText: string;
  offerBadgeText: string;
  shippingTitle: string;
  shippingNote1: string;
  shippingNote2: string;
  overviewTitle: string;
  specificationsTitle: string;
  defaultSpecifications: { label: string; value: string }[];
  orderButtonText: string;
  returnLabel: string;
  relatedTag: string;
  relatedTitle: string;
  notFoundEyebrow: string;
  notFoundTitle: string;
  notFoundDescription: string;
  notFoundCta: string;
}

export type NotFoundContent = PageIntro;

export interface SearchContent {
  placeholder: string;
  closeLabel: string;
  featuredLabel: string;
  resultOne: string;
  resultMany: string;
  emptyTitle: string;
  emptyDescription: string;
}

export interface PagesContent {
  home: HomeContent;
  about: AboutContent;
  faq: FaqContent;
  privacy: PolicyPageContent;
  terms: PolicyPageContent;
  returns: ReturnsContent;
  trackOrder: TrackOrderContent;
  leather: LeatherContent;
  notFound: NotFoundContent;
  search: SearchContent;
  watch: WatchPageContent;
}

export interface NavContent {
  home: string;
  collection: string;
  about: string;
  leather: string;
  faq: string;
  trackOrder: string;
  contact: string;
  search: string;
  openMenu: string;
  closeMenu: string;
  sisterMaison: string;
  connectLabel: string;
  mobileAbout: string;
  navigationMenuLabel: string;
}

export interface SocialContent {
  whatsapp: string;
  tiktok: string;
  instagram: string;
  facebook: string;
}

export interface FooterContent {
  collectionsTitle: string;
  servicesTitle: string;
  about: string;
  faq: string;
  trackOrder: string;
  returns: string;
  connectedTitle: string;
  connectedDescription: string;
  homeLabel: string;
  leatherLabel: string;
  privacy: string;
  terms: string;
}

export interface SharedContent {
  brandName: string;
  brandSubtitle: string;
  logoUrl: string;
  logoAlt: string;
  faviconUrl: string;
  appleIconUrl: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoAuthor: string;
  seoLocale: string;
  siteLanguage: string;
  leatherUrl: string;
  leatherLogoUrl: string;
  leatherLogoAlt: string;
  leatherCardLabel: string;
  leatherCardTitle: string;
  leatherCardSubtitle: string;
  navbar: NavContent;
  footer: FooterContent;
  social: SocialContent;
}

export interface CurrencyOption {
  code: string;
  symbol: string;
  locale: string;
  rate: number;
}

export interface CommerceSettings {
  worldwideDeliveryEnabled: boolean;
  deliveryQuoteRequired: boolean;
  domesticDeliveryChargePkr: number;
  deliveryConfirmationText: string;
  internationalDeliveryNote: string;
  dispatchEstimate: string;
  currencyMarginPkr: number;
  currencySelectorLabel: string;
  ratesUpdatedLabel: string;
  ratesNote: string;
  currencies: CurrencyOption[];
}

export const DEFAULT_PAGES: PagesContent = {
  home: {
    newBadgeText: "New",
    offerBadgeText: "Offer",
    viewPieceLabel: "View piece",
    viewProductLabel: "View {productName}",
    selectImageLabel: "Select image {index} of {productName}",
    exploreDetailsLabel: "Explore details of {productName}",
    sortLabel: "Sort collection",
    ratingLabel: "5 out of 5 stars",
    dispatchStatValue: "24h",
    featuredLabel: "Featured",
    piecesLabel: "pieces",
    pieceLabel: "piece",
    categoryCollectionSuffix: "Collection",
    searchPlaceholder: "Search this collection...",
    sortFeaturedLabel: "Sort: Featured",
    sortPriceAscLabel: "Price: Low to High",
    sortPriceDescLabel: "Price: High to Low",
    sortNameLabel: "Name: A to Z",
    emptyTitle: "No pieces match your search",
    emptyDescription: "Try a different term or browse another collection.",
    clearSearchLabel: "Clear Search",
    signatureLabel: "Signature Edition",
    sealText: "UM-AREX • Luxury Timepieces • Worldwide Delivery •",
    scrollLabel: "Scroll",
    heroImageAlt: "UM-AREX signature timepiece",
    storyImageAlt: "UM-AREX signature styling",
    specsImage: "/hero_model_two.png",
    specsImageAlt: "Mechanical movement detail",
    specsImageBadge: "21-Jewel Movement",
    faqTag: "Good to Know",
    faqTitle: "Frequently Asked Questions",
    faqViewAllLabel: "View All Questions",
    responseNote: "Typically replies within minutes",
    testimonialsTag: "Client Voices",
    testimonialsTitle: "Trusted by Collectors",
    curatedPiecesLabel: "Curated Pieces",
    collectionsLabel: "Collections",
    dispatchLabel: "Dispatch",
    orderMessage: "Hello UM-AREX, I want to order a watch. Please confirm availability and my exact delivery charge before payment.",
    conciergeMessage: "Hello UM-AREX Concierge, I am interested in custom-sourcing a luxury timepiece. Please guide me.",
    leatherTag: "The Sister Maison",
    leatherTitleLead: "UM-AREX",
    leatherTitleAccent: "Leather",
    leatherDescription: "The same devotion to craft, expressed in full-grain leather. Explore handcrafted wallets and accessories built to age beautifully.",
    leatherPrimaryCta: "Visit Leather Website",
    leatherSecondaryCta: "Preview the Collection",
    leatherLogoAlt: "UM-AREX Leather",
    benefits: [
      { id: "inspection", icon: "shield", title: "Hand-Inspected", description: "Calibrated before dispatch" },
      { id: "delivery", icon: "truck", title: "Worldwide Delivery", description: "Shipping quoted before payment" },
      { id: "precision", icon: "clock", title: "Mechanical Precision", description: "Battery-free automatics" },
      { id: "concierge", icon: "sparkles", title: "WhatsApp Concierge", description: "Personal ordering assistance" },
    ],
    testimonials: [
      { id: "ahmed", name: "Ahmed R.", location: "Lahore", piece: "Cassino Watch", quote: "The finishing exceeded what I expected at this price. The dial catches light beautifully and delivery was tracked within a day." },
      { id: "bilal", name: "Bilal K.", location: "Karachi", piece: "Tissot PRX 1853", quote: "Ordered on WhatsApp, received clear payment details, and had my tracking code promptly. The watch feels solid and genuinely premium." },
      { id: "hassan", name: "Hassan M.", location: "Islamabad", piece: "Cartier Tank", quote: "Understated and elegant. UM-AREX guided me through the dial options patiently. It has become my daily wear for formal meetings." },
    ],
    faqs: [
      { id: "order", question: "How do I place an order?", answer: "Choose your timepiece and tap ‘Order on WhatsApp’. Our concierge confirms availability, delivery destination, shipping charge, and payment details before your order is dispatched." },
      { id: "shipping", question: "How much is worldwide delivery?", answer: "Shipping depends on your country, address, courier, and package weight. We confirm the exact delivery charge on WhatsApp before asking for payment." },
      { id: "timing", question: "How long does delivery take?", answer: "Orders are usually prepared within 24 hours after verification. International transit time depends on the destination and courier and is confirmed with your shipping quote." },
      { id: "automatic", question: "Are the automatics battery-free?", answer: "Yes. Automatic and semi-automatic movements use mechanical energy generated by wrist movement and do not need battery changes." },
    ],
  },
  about: {
    backLabel: "Back to Collection",
    eyebrow: "Our Story",
    titleLead: "About",
    titleAccent: "UM-AREX",
    description: "Where precision mechanical engineering meets considered watch design. Curated for collectors who value craftsmanship, transparency, and enduring style.",
    heritageTag: "Our Heritage",
    heritageTitleLead: "Crafted for Those Who",
    heritageTitleAccent: "Appreciate Precision",
    paragraphs: [
      "UM-AREX represents a standard in curated watch collections. We assemble models that carry the weight of tradition while expressing the edge of modern styling.",
      "From semi-automatic movements to clean daily casuals, every piece is checked for calibration and finishing. We focus on honest specifications, transparent pricing, and personal service.",
      "Our collection is available worldwide. Every destination receives a confirmed shipping quote before payment, with tracking shared after dispatch.",
    ],
    image: "/hero_model_one.png",
    imageAlt: "UM-AREX luxury watch craftsmanship",
    commitmentTag: "Our Commitment",
    commitmentTitle: "Why Choose UM-AREX",
    values: [
      { id: "quality", icon: "shield", title: "Quality Inspected", description: "Every timepiece is inspected before dispatch." },
      { id: "delivery", icon: "truck", title: "Worldwide Delivery", description: "Destination-specific shipping confirmed in advance." },
      { id: "precision", icon: "clock", title: "Mechanical Precision", description: "Reliable automatic and semi-automatic movements." },
      { id: "pricing", icon: "award", title: "Transparent Pricing", description: "Clear product prices and delivery quotes without hidden charges." },
    ],
    standardTag: "Our Standard",
    standardTitle: "Uncompromising Materials",
    standards: [
      { id: "movement", icon: "clock", title: "Mechanical Integrity", description: "Automatic and semi-automatic movements run on mechanical energy generated by wrist movement." },
      { id: "case", icon: "shield", title: "Case & Finish", description: "Carefully selected alloys and finishes are inspected for a balanced, durable timepiece." },
      { id: "crystal", icon: "gem", title: "Crystal & Clarity", description: "Clear coated crystals are selected for readability, reflections, and everyday resilience." },
    ],
    ctaTag: "Ready to Explore?",
    ctaTitle: "Discover Our Collection",
    ctaDescription: "Browse our curated selection and ask our concierge for availability and a delivery quote to your country.",
    ctaLabel: "View Collection",
  },
  faq: {
    backLabel: "Back to Collection",
    eyebrow: "Got Questions?",
    titleLead: "Frequently Asked",
    titleAccent: "Questions",
    description: "Find answers about ordering, worldwide delivery, payment, product care, and our timepieces.",
    supportTag: "Still Have Questions?",
    supportTitle: "Contact Our Support Team",
    supportDescription: "Our WhatsApp concierge can help with product availability, delivery quotes, and order support.",
    supportCta: "Chat on WhatsApp",
    supportMessage: "Hello UM-AREX, I have a question about your collection.",
    items: [
      { id: "order", question: "How do I place an order?", answer: "Choose a watch and tap ‘Order on WhatsApp’. Our concierge confirms availability, your destination, the delivery charge, and payment details." },
      { id: "charges", question: "What are the delivery charges?", answer: "Pakistan delivery is {deliveryCharge}. International shipping varies by destination and is confirmed by our team before payment." },
      { id: "timing", question: "How long does delivery take?", answer: "Preparation usually takes up to 24 hours after verification. International transit estimates are included with your confirmed delivery quote." },
      { id: "products", question: "How are the watches described?", answer: "Each listing shows its category, price, description, images, and available specifications. Contact us if you need clarification before ordering." },
      { id: "payment", question: "What payment methods do you accept?", answer: "Accepted payment methods are confirmed personally on WhatsApp and may include bank transfer or supported mobile wallets." },
      { id: "returns", question: "Can I return or exchange a watch?", answer: "Manufacturing-defect requests must be made within seven days of delivery, in original condition with packaging. See our Return Policy for full details." },
      { id: "warranty", question: "Do the watches come with a warranty?", answer: "Warranty coverage is product-specific and limited to manufacturing defects. Ask our concierge for the terms of your selected watch." },
      { id: "tracking", question: "How do I track my order?", answer: "After dispatch we share your courier and tracking details. You can also send your order ID through our Track Order page." },
      { id: "water", question: "Are the watches water-resistant?", answer: "Everyday splash resistance varies by model. Do not swim or submerge a watch unless its confirmed specifications explicitly allow it." },
      { id: "sourcing", question: "Do you offer custom sourcing?", answer: "Yes. Send our WhatsApp concierge the model, reference, or dial shade you want and we will check sourcing options." },
    ],
  },
  privacy: {
    backLabel: "Back to Collection",
    eyebrow: "Legal",
    titleLead: "Privacy",
    titleAccent: "Policy",
    description: "How UM-AREX handles the information you share while browsing, ordering, and using our concierge service.",
    lastUpdatedLabel: "Last Updated:",
    lastUpdatedDate: "November 2026",
    sections: [
      { id: "introduction", title: "1. Introduction", paragraphs: ["We respect your privacy and use personal information only to provide our products, delivery, and customer support."], bullets: [], numbered: [] },
      { id: "information", title: "2. Information We Collect", paragraphs: ["When you contact or order from us, we may collect:"], bullets: ["Your name and contact details.", "Delivery address and destination country.", "Order and payment confirmation information.", "WhatsApp, email, and support communication records."], numbered: [] },
      { id: "use", title: "3. How We Use Your Information", paragraphs: ["We use information to process orders, arrange delivery, provide support, prevent fraud, and improve our service. Marketing messages are sent only with appropriate consent."], bullets: [], numbered: [] },
      { id: "sharing", title: "4. Data Sharing", paragraphs: ["We do not sell personal information. Relevant details may be shared with courier partners, payment providers, and service providers only as needed to complete your order or meet legal obligations."], bullets: [], numbered: [] },
      { id: "security", title: "5. Data Security", paragraphs: ["We use reasonable technical and organizational safeguards, but no online service can guarantee absolute security."], bullets: [], numbered: [] },
      { id: "rights", title: "6. Your Rights", paragraphs: ["Depending on applicable law, you may request access, correction, deletion, or restriction of your information, and withdraw marketing consent."], bullets: [], numbered: [] },
      { id: "contact", title: "7. Contact Us", paragraphs: ["For privacy questions or requests, contact our WhatsApp concierge using the number shown on this website."], bullets: [], numbered: [] },
    ],
  },
  terms: {
    backLabel: "Back to Collection",
    eyebrow: "Legal",
    titleLead: "Terms &",
    titleAccent: "Conditions",
    description: "The terms that apply to product information, orders, pricing, payment, worldwide delivery, and use of this website.",
    lastUpdatedLabel: "Last Updated:",
    lastUpdatedDate: "November 2026",
    sections: [
      { id: "acceptance", title: "1. Acceptance of Terms", paragraphs: ["By using this website or placing an order, you agree to these terms and the information confirmed with you before purchase."], bullets: [], numbered: [] },
      { id: "pricing", title: "2. Products and Pricing", paragraphs: ["Product prices are maintained in Pakistani Rupees (PKR). International prices are indicative conversions and include the international pricing margin shown by the store. Availability, images, descriptions, and prices may change; our concierge confirms your final order details before payment."], bullets: [], numbered: [] },
      { id: "orders", title: "3. Order Processing", paragraphs: ["An order is accepted only after our team confirms availability, delivery destination, shipping charge, and payment details. We may decline or cancel an order because of:"], bullets: ["Product unavailability or discontinued inventory.", "Pricing, image, or description errors.", "Suspected fraud or unauthorized payment.", "Delivery restrictions or courier limitations."], numbered: [] },
      { id: "payment", title: "4. Payment Terms", paragraphs: ["Pakistan orders currently use a {deliveryCharge} delivery advance unless a different amount is confirmed. For international orders, the destination-specific delivery charge must be confirmed before payment. Accepted methods and any remaining balance are communicated on WhatsApp. Do not send payment before receiving verified instructions."], bullets: [], numbered: [] },
      { id: "shipping", title: "5. Shipping and Delivery", paragraphs: ["We offer worldwide delivery where courier and customs services permit. Dispatch timing begins after order and payment verification. International transit estimates depend on destination, customs clearance, weekends, and courier delays."], bullets: ["Shipping charges are confirmed before payment.", "Tracking details are shared after dispatch.", "Customers are responsible for applicable import duties, taxes, and customs requirements unless explicitly included in the confirmed quote."], numbered: [] },
      { id: "returns", title: "6. Returns and Refunds", paragraphs: ["Manufacturing-defect requests are handled under our Return Policy. International return authorization, inspection, and refund arrangements are confirmed individually before items are sent back."], bullets: [], numbered: [] },
      { id: "warranty", title: "7. Product Warranty", paragraphs: ["Warranty terms are specific to each product and cover manufacturing defects only. Misuse, accidents, unauthorized repairs, and normal wear are excluded unless otherwise confirmed in writing."], bullets: [], numbered: [] },
      { id: "liability", title: "8. Limitation of Liability", paragraphs: ["To the extent permitted by law, liability is limited to the purchase price of the affected product. We are not responsible for indirect losses or delays outside our reasonable control."], bullets: [], numbered: [] },
      { id: "property", title: "9. Intellectual Property", paragraphs: ["Website text, images, logos, and designs belong to UM-AREX or their respective owners and may not be reused without permission."], bullets: [], numbered: [] },
      { id: "contact", title: "10. Contact Information", paragraphs: ["Questions about these terms can be sent to our WhatsApp concierge using the contact details displayed on this website."], bullets: [], numbered: [] },
    ],
  },
  returns: {
    backLabel: "Back to Collection",
    eyebrow: "Our Policy",
    titleLead: "Return &",
    titleAccent: "Refund Policy",
    description: "How manufacturing-defect returns, exchanges, inspections, and refunds are handled for domestic and international orders.",
    lastUpdatedLabel: "Last Updated:",
    lastUpdatedDate: "November 2026",
    highlights: [
      { id: "window", icon: "clock", title: "7-Day Window", description: "Report manufacturing defects within seven days of delivery." },
      { id: "guarantee", icon: "shield", title: "Quality Guarantee", description: "Approved defects are resolved by repair, replacement, or refund." },
      { id: "process", icon: "package", title: "Simple Process", description: "Start your request through WhatsApp support." },
    ],
    sections: [
      { id: "eligibility", title: "1. Return Eligibility", paragraphs: ["A return may be considered when all of the following apply:"], bullets: ["The request is made within seven days of delivery.", "The watch is unused and in original condition.", "Original packaging, tags, and accessories are included.", "The issue is a manufacturing defect, not misuse or accidental damage.", "Proof of purchase or order confirmation is provided."], numbered: [] },
      { id: "exclusions", title: "2. Non-Returnable Items", paragraphs: ["Returns are not accepted for:"], bullets: ["Misuse, accidents, water damage outside confirmed specifications, or normal wear.", "Removed or tampered serial numbers.", "Products not purchased through an authorized UM-AREX channel.", "Missing packaging or accessories.", "Requests submitted after the seven-day window."], numbered: [] },
      { id: "process", title: "3. How to Initiate a Return", paragraphs: ["To request a manufacturing-defect review:"], bullets: [], numbered: ["Contact our WhatsApp concierge within seven days of delivery.", "Provide your order ID and a clear description of the issue.", "Send clear photos or videos showing the defect.", "Wait for our review and return authorization.", "If approved, follow the return instructions provided for your country."] },
      { id: "refund", title: "4. Refund Process", paragraphs: ["After inspection and approval, approved refunds are processed within 7–10 business days. Refund method, original shipping treatment, and any international transfer charges are confirmed before processing."], bullets: [], numbered: [] },
      { id: "exchange", title: "5. Exchange Policy", paragraphs: ["An approved defective item may be exchanged for the same model, subject to stock. International exchanges may require a revised shipping quote."], bullets: [], numbered: [] },
      { id: "shipping", title: "6. Shipping Costs", paragraphs: ["UM-AREX covers return shipping for an approved manufacturing defect. Customers are responsible for unauthorized returns and change-of-mind shipping where such a request is accepted. Original delivery charges are non-refundable unless required by law."], bullets: [], numbered: [] },
      { id: "contact", title: "7. Contact Us", paragraphs: ["Use the WhatsApp concierge shown on this website to start a return request. Keep your order ID and packaging available."], bullets: [], numbered: [] },
    ],
  },
  trackOrder: {
    backLabel: "Back to Collection",
    eyebrow: "Order Tracking",
    titleLead: "Track Your",
    titleAccent: "Order",
    description: "Enter your order or tracking ID and our concierge will confirm the latest status directly on WhatsApp.",
    fieldLabel: "Tracking / Order ID",
    placeholder: "e.g. UM-10241 or your courier tracking ID",
    trackingMessage: "Hello UM-AREX, I would like to track my order.\n\n{fieldLabel}: {trackingId}\n\nPlease share the latest status. Thank you.",
    missingTrackingId: "(not provided)",
    buttonText: "Request Status on WhatsApp",
    requestedMessage: "WhatsApp should open with your message ready. If it did not, use the link below.",
    fallbackLabel: "Open WhatsApp",
    trackingNote: "Courier tracking is shared after dispatch. Our team verifies each order personally and provides the latest available location and delivery estimate.",
    journeyTag: "What to Expect",
    journeyTitle: "Our Delivery Journey",
    steps: [
      { id: "confirmed", icon: "check", title: "Order Confirmed", description: "We confirm product availability, destination, shipping charge, and delivery details on WhatsApp." },
      { id: "packed", icon: "package", title: "Quality Checked & Packed", description: "Your timepiece is inspected and securely packed for transit." },
      { id: "dispatched", icon: "truck", title: "Dispatched Worldwide", description: "After verification, your parcel is dispatched and courier tracking is shared." },
      { id: "delivered", icon: "shield", title: "Delivered to Your Door", description: "Delivery timing depends on your destination, courier, and customs clearance." },
    ],
    summary: "Shipping charge confirmed before payment • Tracking after dispatch • Worldwide delivery where available",
    supportTag: "Need Help?",
    supportTitle: "Contact Our Support Team",
    supportDescription: "Questions about an order, delivery, or a bespoke request? Our WhatsApp concierge is ready to assist.",
    supportCta: "Chat on WhatsApp",
    supportMessage: "Hello UM-AREX, I need help with my order.",
  },
  leather: {
    backLabel: "Back to Watches",
    fullWebsiteLabel: "Full Website",
    logoUrl: "/leather-logo.png",
    logoAlt: "UM-AREX Leather",
    heroTag: "The Sister Maison",
    titleLead: "Crafted for",
    titleAccent: "Legacy",
    description: "Handcrafted leather goods for those who appreciate timeless quality. Full-grain hides, meticulous stitching, and understated luxury.",
    primaryCta: "Visit the Leather Website",
    secondaryCta: "Preview the Collection",
    previewTag: "Live from the Atelier",
    previewTitle: "Signature Leather Pieces",
    previewDescription: "A live preview of the leather inventory. Visit the full leather website for the complete collection and latest releases.",
    badgeText: "Handcrafted",
    fallbackTag: "Signature Premium",
    emptyTitle: "The collection is being prepared",
    emptyDescription: "Visit the leather website for the latest releases.",
    viewAllLabel: "View Full Leather Collection",
    standardTitle: "The Leather Standard",
    values: [
      { id: "leather", icon: "gem", title: "Full-Grain Leather", description: "Premium hides selected for character and durability." },
      { id: "craft", icon: "scissors", title: "Handcrafted", description: "Cut, stitched, and finished by skilled artisans." },
      { id: "design", icon: "scroll", title: "Timeless Design", description: "Classic silhouettes designed to develop a rich patina." },
    ],
    ctaTitle: "Experience the Full Atelier",
    ctaDescription: "Browse the complete collection, place orders, and reach the leather concierge on the dedicated website.",
    ctaLabel: "Visit Leather Website",
    whatsappCta: "Ask on WhatsApp",
    whatsappMessage: "Hello UM-AREX, I am interested in the Leather collection.",
    products: [],
  },
  notFound: {
    backLabel: "Return to Collection",
    eyebrow: "404 Error",
    titleLead: "Page Lost in Time",
    titleAccent: "",
    description: "The requested timepiece or page could not be located. Explore the current collection instead.",
  },
  search: {
    placeholder: "Search timepieces by name or category...",
    closeLabel: "Close search",
    featuredLabel: "Featured pieces",
    resultOne: "1 result",
    resultMany: "{count} results",
    emptyTitle: "No timepieces match your search.",
    emptyDescription: "Try a different name or category.",
  },
  watch: {
    categorySuffix: "Edition",
    internationalOrderButtonText: "Request order & delivery quote",
    internationalUnavailableButtonText: "Ask about international delivery",
    orderMessage: "Hello UM-AREX, I want to order {productName} at {price}. Display currency: {currency}. Please confirm availability and my exact delivery charge to my country before payment.",
    noDeliveryQuoteOrderMessage: "Hello UM-AREX, I want to order {productName} at {price}. Display currency: {currency}. Please confirm availability and payment details.",
    internationalUnavailableMessage: "Hello UM-AREX, I am interested in {productName} at {price}. Display currency: {currency}. Please confirm whether delivery to my country is available.",
    internationalPriceNote: "I understand the displayed international price includes the store's international pricing margin.",
    previousImageLabel: "Previous image",
    nextImageLabel: "Next image",
    viewImageLabel: "View image",
    saveLabel: "Save",
    automaticMovementLabel: "Mechanical Automatic",
    breadcrumbHome: "Home",
    breadcrumbCollection: "Collection",
    newBadgeText: "New Release",
    offerBadgeText: "Special Offer",
    shippingTitle: "Shipping & Delivery",
    shippingNote1: "Pakistan delivery advance: {deliveryCharge}, unless another amount is confirmed.",
    shippingNote2: "Worldwide delivery is available where courier and customs services permit.",
    overviewTitle: "Overview",
    specificationsTitle: "Timepiece Specifications",
    defaultSpecifications: [
      { label: "Movement", value: "Calibrated Quartz" },
      { label: "Quality", value: "Premium Inspected" },
      { label: "Glass", value: "Sapphire Coated" },
      { label: "Delivery", value: "Worldwide Quote" },
    ],
    orderButtonText: "Order on WhatsApp",
    returnLabel: "Return to Gallery",
    relatedTag: "Complete the Collection",
    relatedTitle: "More from {category}",
    notFoundEyebrow: "Not Found",
    notFoundTitle: "This timepiece is no longer available",
    notFoundDescription: "It may have been sold or moved. Explore the current collection instead.",
    notFoundCta: "Back to Collection",
  },
};

export const DEFAULT_SHARED: SharedContent = {
  brandName: "UM-AREX",
  brandSubtitle: "Luxury Timepieces",
  logoUrl: "/logo.png",
  logoAlt: "UM-AREX logo",
  faviconUrl: "/icon.png",
  appleIconUrl: "/apple-icon.png",
  seoTitle: "UM-AREX | Premium Luxury Watches",
  seoDescription: "Discover curated watches with worldwide delivery, confirmed shipping charges, and personal WhatsApp service.",
  seoKeywords: "luxury watches, automatic watches, UM-AREX, premium watches, worldwide watch delivery",
  seoAuthor: "UM-AREX",
  seoLocale: "en_PK",
  siteLanguage: "en",
  leatherUrl: "https://leather.um-arex.store",
  leatherLogoUrl: "/leather-logo.png",
  leatherLogoAlt: "UM-AREX Leather",
  leatherCardLabel: "Visit the UM-AREX Leather website",
  leatherCardTitle: "Visit the Leather Atelier",
  leatherCardSubtitle: "Handcrafted wallets & accessories",
  navbar: {
    home: "Home",
    collection: "Collection",
    about: "About",
    leather: "Leather",
    faq: "FAQ",
    trackOrder: "Track Order",
    contact: "Contact",
    search: "Search timepieces",
    openMenu: "Open navigation menu",
    closeMenu: "Close navigation menu",
    sisterMaison: "Sister Maison",
    connectLabel: "Connect With Us",
    mobileAbout: "About Us",
    navigationMenuLabel: "Navigation menu",
  },
  footer: {
    collectionsTitle: "Collections",
    servicesTitle: "Client Services",
    about: "About Us",
    faq: "FAQ",
    trackOrder: "Track Order",
    returns: "Return Policy",
    connectedTitle: "Stay Connected",
    connectedDescription: "New releases, client stories, and private collection previews.",
    homeLabel: "home",
    leatherLabel: "UM-AREX Leather",
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
  },
  social: {
    whatsapp: "WhatsApp Group",
    tiktok: "TikTok",
    instagram: "Instagram",
    facebook: "Facebook",
  },
};

export const DEFAULT_COMMERCE: CommerceSettings = {
  worldwideDeliveryEnabled: true,
  deliveryQuoteRequired: true,
  domesticDeliveryChargePkr: 250,
  deliveryConfirmationText: "Confirm the exact shipping charge on WhatsApp before payment.",
  internationalDeliveryNote: "International shipping is quoted by destination. Import duties and taxes are confirmed separately where applicable.",
  dispatchEstimate: "Dispatch within 24 hours after verification",
  currencyMarginPkr: 500,
  currencySelectorLabel: "Currency / country",
  ratesUpdatedLabel: "Indicative rates",
  ratesNote: "International prices add {currencyMargin} before conversion. Rates are editable and the final order total is confirmed on WhatsApp.",
  currencies: [
    { code: "PKR", symbol: "Rs", locale: "en-PK", rate: 1 },
    { code: "USD", symbol: "$", locale: "en-US", rate: 0.00355 },
    { code: "EUR", symbol: "€", locale: "de-DE", rate: 0.00330 },
    { code: "GBP", symbol: "£", locale: "en-GB", rate: 0.00300 },
    { code: "AED", symbol: "AED", locale: "en-AE", rate: 0.01300 },
    { code: "SAR", symbol: "SAR", locale: "en-SA", rate: 0.01330 },
    { code: "CAD", symbol: "CA$", locale: "en-CA", rate: 0.00490 },
    { code: "AUD", symbol: "A$", locale: "en-AU", rate: 0.00530 },
    { code: "JPY", symbol: "¥", locale: "ja-JP", rate: 0.55 },
    { code: "CNY", symbol: "CN¥", locale: "zh-CN", rate: 0.0255 },
    { code: "INR", symbol: "₹", locale: "en-IN", rate: 0.31 },
    { code: "TRY", symbol: "₺", locale: "tr-TR", rate: 0.12 },
    { code: "CHF", symbol: "CHF", locale: "de-CH", rate: 0.0031 },
    { code: "NZD", symbol: "NZ$", locale: "en-NZ", rate: 0.006 },
  ],
};
