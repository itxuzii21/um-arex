export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  gallery?: string[];
  description: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  detailTagline?: string;
  detailDescription?: string;
  shippingTitle?: string;
  shippingNote1?: string;
  shippingNote2?: string;
  overviewTitle?: string;
  specificationsTitle?: string;
  specifications?: ProductSpecification[];
  orderButtonText?: string;
  relatedTag?: string;
  relatedTitle?: string;
  newBadgeText?: string;
  offerBadgeText?: string;
}

export interface Category {
  name: string;
  image: string;
}

import watchCatalog from "./data/watches.json";

export const PRODUCTS: Product[] = watchCatalog;

export const OWNER_WHATSAPP_NUMBER = "923279595329";
export const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/EsbVXoDJEvuIjYAp0ipzs0?mode=gi_t";
export const TIKTOK_URL = "https://www.tiktok.com/@um__arex?_r=1&_t=ZS-960Ngidjmul";
export const INSTAGRAM_URL = "https://www.instagram.com/um__arex?igsh=MWJmbWxvdWZweWc1NQ%3D%3D&utm_source=qr";
