import { Product } from "../types";

export const CATEGORY_ORDER = [
  "Wallets",
  "Card Holders",
  "Accessories",
];

export function sortCategories(names: string[]): string[] {
  return [...names].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    if (ai !== -1 || bi !== -1) {
      return (ai === -1 ? Number.MAX_SAFE_INTEGER : ai) - (bi === -1 ? Number.MAX_SAFE_INTEGER : bi);
    }
    return a.localeCompare(b);
  });
}

export function getCategories(products: Product[]): { name: string; image: string; count: number }[] {
  const map = new Map<string, { image: string; count: number }>();
  for (const p of products) {
    const existing = map.get(p.category);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(p.category, { image: p.image, count: 1 });
    }
  }
  return sortCategories(Array.from(map.keys())).map((name) => ({
    name,
    image: map.get(name)!.image,
    count: map.get(name)!.count,
  }));
}

export function productHref(product: Product): string {
  return `/product?id=${encodeURIComponent(product.id)}`;
}