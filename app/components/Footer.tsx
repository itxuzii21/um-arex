"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, ArrowUpRight } from "lucide-react";
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { useStore } from "../data/StoreProvider";
import { getCategories } from "../data/catalog";

export default function Footer() {
  const pathname = usePathname();
  const [clickCount, setClickCount] = useState(0);
  const { products, settings } = useStore();
  const shared = settings.shared;
  const footer = shared.footer;

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const newCount = clickCount + 1;
    setClickCount(newCount >= 5 ? 0 : newCount);

    if (newCount >= 5) {
      event.preventDefault();
      window.location.href = "/admin";
      return;
    }

    setTimeout(() => setClickCount(0), 2000);
  };
  const categories = getCategories(products).map((category) => category.name);

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="relative z-10 overflow-hidden border-t border-brand-gold/15 bg-[#08080a] pb-10 pt-20 text-brand-cream md:pt-24">
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-gold/[0.05] blur-[120px]" />
      <div className="relative mx-auto grid max-w-[1500px] grid-cols-1 gap-12 border-b border-white/[0.07] px-5 pb-16 sm:grid-cols-2 md:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10 lg:px-12">
        <div className="flex flex-col items-start">
          <Link href="/" onClick={handleLogoClick} className="flex items-center gap-3" aria-label={`${shared.brandName} ${footer.homeLabel}`}>
            <div className="relative h-11 w-11 rounded-full border border-brand-gold/20 bg-brand-green-mid p-1">
              <Image src={shared.logoUrl} alt={shared.logoAlt} fill sizes="44px" className="object-contain p-1" />
            </div>
            <span className="font-serif text-xl font-semibold uppercase tracking-[0.16em] text-brand-gold">
              {shared.brandName}
            </span>
          </Link>
          <p className="mt-6 max-w-xs text-[13px] font-light leading-7 text-brand-cream-muted">
            {settings.footerDescription}
          </p>
          <a
            href={shared.leatherUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-6 inline-flex items-center gap-2 rounded-full border border-brand-tan/30 bg-brand-leather/40 px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-tan transition-all duration-300 hover:border-brand-gold hover:text-brand-gold-light"
          >
            {footer.leatherLabel}
            <ArrowUpRight size={12} className="transition-transform duration-300 group-hover:rotate-45" />
          </a>
        </div>

        <div>
          <h3 className="mb-5 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">{footer.collectionsTitle}</h3>
          <ul className="space-y-3 text-[13px] font-light text-brand-cream-muted">
            {categories.map((category) => (
              <li key={category}>
                <Link
                  href={`/?category=${encodeURIComponent(category)}#collection`}
                  className="transition-colors duration-300 hover:text-brand-gold"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">{footer.servicesTitle}</h3>
          <ul className="space-y-3 text-[13px] font-light text-brand-cream-muted">
            <li><Link href="/about" className="transition-colors duration-300 hover:text-brand-gold">{footer.about}</Link></li>
            <li><Link href="/faq" className="transition-colors duration-300 hover:text-brand-gold">{footer.faq}</Link></li>
            <li><Link href="/track-order" className="transition-colors duration-300 hover:text-brand-gold">{footer.trackOrder}</Link></li>
            <li><Link href="/returns" className="transition-colors duration-300 hover:text-brand-gold">{footer.returns}</Link></li>
            <li>
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors duration-300 hover:text-brand-gold"
              >
                <Phone size={12} className="text-brand-gold" />
                <span>+{settings.whatsappNumber}</span>
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-5 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">{footer.connectedTitle}</h3>
          <p className="max-w-xs text-[13px] font-light leading-6 text-brand-cream-muted">
            {footer.connectedDescription}
          </p>
          <div className="mt-6 flex gap-3">
            {[
              { href: settings.whatsappGroupUrl, icon: <FaWhatsapp size={15} />, label: shared.social.whatsapp },
              { href: settings.tiktokUrl, icon: <FaTiktok size={14} />, label: shared.social.tiktok },
              { href: settings.instagramUrl, icon: <FaInstagram size={15} />, label: shared.social.instagram },
              { href: settings.facebookUrl, icon: <FaFacebook size={14} />, label: shared.social.facebook },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-gold/20 text-brand-cream-muted transition-all duration-300 hover:border-brand-gold hover:text-brand-gold"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-8 flex max-w-[1500px] flex-col items-center justify-between gap-4 px-5 text-center text-[10px] text-brand-cream-muted md:flex-row md:px-8 md:text-left lg:px-12">
        <p>&copy; {new Date().getFullYear()} {settings.footerCopyright}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link href="/privacy" className="transition-colors duration-300 hover:text-brand-gold">{footer.privacy}</Link>
          <Link href="/terms" className="transition-colors duration-300 hover:text-brand-gold">{footer.terms}</Link>
          <span className="text-brand-gold/70">{settings.footerCredit}</span>
        </div>
      </div>
    </footer>
  );
}
