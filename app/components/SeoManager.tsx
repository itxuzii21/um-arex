"use client";

import { useEffect } from "react";
import { useStore } from "../data/StoreProvider";

function setMeta(selector: string, attribute: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    const name = selector.match(/name="([^"]+)"/)?.[1];
    const property = selector.match(/property="([^"]+)"/)?.[1];
    if (name) element.name = name;
    if (property) element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

export default function SeoManager() {
  const { settings } = useStore();

  useEffect(() => {
    document.title = settings.shared.seoTitle;
    setMeta('meta[name="description"]', "content", settings.shared.seoDescription);
    setMeta('meta[name="keywords"]', "content", settings.shared.seoKeywords);
    setMeta('meta[property="og:title"]', "content", settings.shared.seoTitle);
    setMeta('meta[property="og:description"]', "content", settings.shared.seoDescription);
    setMeta('meta[name="author"]', "content", settings.shared.seoAuthor);
    setMeta('meta[property="og:locale"]', "content", settings.shared.seoLocale);
    document.documentElement.lang = settings.shared.siteLanguage;
    document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.setAttribute("href", settings.shared.faviconUrl);
    document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')?.setAttribute("href", settings.shared.appleIconUrl);
  }, [settings.shared]);

  return null;
}
