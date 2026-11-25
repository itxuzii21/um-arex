"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Search, ArrowUpRight } from "lucide-react";
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { useStore } from "../data/StoreProvider";
import { getCategories } from "../data/catalog";
import SearchOverlay from "./SearchOverlay";
import CurrencySelector from "./CurrencySelector";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { products, settings } = useStore();
  const pathname = usePathname();

  const categories = useMemo(() => getCategories(products), [products]);
  const shared = settings.shared;
  const nav = shared.navbar;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const menuVariants = {
    closed: { opacity: 0, x: "100%", transition: { type: "tween", ease: [0.25, 0.1, 0.25, 1], duration: 0.45 } },
    opened: { opacity: 1, x: 0, transition: { type: "tween", ease: [0.25, 0.1, 0.25, 1], duration: 0.45, staggerChildren: 0.05, delayChildren: 0.08 } },
  };
  const itemVariants = {
    closed: { opacity: 0, y: 12 },
    opened: { opacity: 1, y: 0, transition: { type: "tween", ease: [0.25, 0.1, 0.25, 1], duration: 0.4 } },
  };

  if (pathname.startsWith("/admin")) return null;

  const navLink =
    "relative text-[11px] font-medium uppercase tracking-[0.16em] text-brand-cream-muted transition-all duration-300 hover:text-brand-gold group py-2";
  const underline =
    "absolute bottom-0 left-0 h-[1px] w-full origin-left scale-x-0 bg-brand-gold transition-transform duration-500 group-hover:scale-x-100";

  return (
    <>
      <header className={`sticky top-0 z-50 border-b transition-all duration-500 ${scrolled ? "border-brand-gold/20 bg-brand-green-dark/95 shadow-lg shadow-black/30 backdrop-blur-xl" : "border-brand-gold/10 bg-brand-green-dark/90 backdrop-blur-xl"}`}>
        <div className="relative z-50 overflow-hidden border-b border-brand-gold-dark/40 bg-gradient-to-r from-brand-gold-dark via-brand-gold to-brand-gold-dark py-2">
          <div className="flex w-full overflow-hidden">
            <div className="animate-marquee-infinite whitespace-nowrap text-[9px] md:text-[10px] font-bold uppercase tracking-[0.18em] text-brand-green-dark">
              <span className="px-8">{settings.bannerText}</span>
              <span className="px-8">{settings.bannerText}</span>
              <span className="px-8">{settings.bannerText}</span>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3 transition-transform duration-500 active:scale-95">
            <div className="relative h-11 w-11 rounded-full border border-brand-gold/25 bg-brand-green-mid p-1 shadow-inner">
              <Image src={shared.logoUrl} alt={shared.logoAlt} fill sizes="44px" className="rounded-full object-contain p-1" />
            </div>
            <div className="leading-none">
              <span className="block font-serif text-xl font-semibold uppercase tracking-[0.22em] text-brand-gold">
                {shared.brandName}
              </span>
              <span className="mt-1.5 block text-[8px] font-medium uppercase tracking-[0.32em] text-brand-cream-muted">
                {shared.brandSubtitle}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 xl:flex">
            <Link href="/" className={navLink}>
              {nav.home}
              <span className={underline} />
            </Link>
            <Link href="/#collection" className={navLink}>
              {nav.collection}
              <span className={underline} />
            </Link>
            <Link href="/about" className={navLink}>
              {nav.about}
              <span className={underline} />
            </Link>
            <a href={shared.leatherUrl} target="_blank" rel="noopener noreferrer" className={`${navLink} inline-flex items-center gap-1.5 text-brand-tan hover:text-brand-gold-light`}>
              {nav.leather}
              <ArrowUpRight size={11} />
              <span className={underline} />
            </a>
            <Link href="/faq" className={navLink}>
              {nav.faq}
              <span className={underline} />
            </Link>
            <Link href="/track-order" className={navLink}>
              {nav.trackOrder}
              <span className={underline} />
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <div className="hidden md:block"><CurrencySelector /></div>
            <button
              onClick={() => setSearchOpen(true)}
              aria-label={nav.search}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-gold/20 bg-brand-green-mid/50 text-brand-cream-muted transition-all duration-300 hover:border-brand-gold hover:text-brand-gold active:scale-90"
            >
              <Search size={15} />
            </button>
            <Link
              href="/#contact"
              className="hidden rounded-full bg-brand-gold px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-green-dark transition-all duration-500 hover:bg-brand-gold-light xl:inline-flex"
            >
              {nav.contact}
            </Link>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-gold/15 bg-brand-green-mid/50 text-brand-gold transition-all duration-300 hover:border-brand-gold/50 hover:bg-brand-green-mid active:scale-90 xl:hidden"
              onClick={() => setIsMenuOpen(true)}
              aria-label={nav.openMenu}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label={nav.navigationMenuLabel}
            variants={menuVariants}
            initial="closed"
            animate="opened"
            exit="closed"
            className="fixed inset-0 z-[70] flex min-h-screen flex-col overflow-y-auto bg-brand-green-dark p-5 sm:p-7"
          >
            <div className="flex items-center justify-between border-b border-brand-gold/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 rounded-full border border-brand-gold/20 bg-brand-green-mid p-1">
                  <Image src={shared.logoUrl} alt={shared.logoAlt} fill sizes="36px" className="rounded-full object-contain p-1" />
                </div>
                <span className="font-serif text-sm font-medium uppercase tracking-[0.2em] text-brand-gold">{shared.brandName}</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-gold/15 bg-brand-green-mid text-brand-gold transition-all duration-300 active:scale-90"
                aria-label={nav.closeMenu}
              >
                <X size={20} />
              </button>
            </div>

            <div className="pt-5 md:hidden"><CurrencySelector /></div>

            <div className="flex flex-col gap-1 py-8">
              {[
                { label: nav.home, href: "/" },
                { label: nav.collection, href: "/#collection" },
                { label: nav.mobileAbout, href: "/about" },
                { label: nav.faq, href: "/faq" },
                { label: nav.trackOrder, href: "/track-order" },
              ].map((item) => (
                <motion.div key={item.label} variants={itemVariants}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-2xl px-5 py-3 font-serif text-lg tracking-wide text-brand-cream transition-all duration-300 hover:bg-brand-green-mid hover:text-brand-gold active:scale-95"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div variants={itemVariants} className="mt-3 border-t border-brand-gold/10 pt-4">
                <p className="px-5 pb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-brand-cream-muted">{shared.footer.collectionsTitle}</p>
                <div className="flex flex-wrap gap-2 px-5">
                  {categories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={`/?category=${encodeURIComponent(cat.name)}#collection`}
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-full border border-brand-gold/20 bg-brand-green-mid/40 px-4 py-1.5 text-[10px] uppercase tracking-wider text-brand-cream-muted transition-all hover:border-brand-gold hover:text-brand-gold"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-5 px-1">
                <a
                  href={shared.leatherUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="leather-sheen leather-surface flex items-center justify-between rounded-2xl border border-brand-tan/30 px-5 py-4"
                >
                  <div>
                    <span className="block text-[8px] font-bold uppercase tracking-[0.18em] text-brand-tan">{nav.sisterMaison}</span>
                    <span className="mt-1 block font-serif text-base uppercase tracking-[0.15em] text-brand-cream">
                      {shared.brandName} <span className="text-brand-gold-light">{nav.leather}</span>
                    </span>
                  </div>
                  <ArrowUpRight size={18} className="text-brand-gold-light" />
                </a>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-5">
                <Link
                  href="/#contact"
                  onClick={() => setIsMenuOpen(false)}
                  className="mx-auto flex items-center justify-center rounded-full border border-brand-gold/40 px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold transition-all duration-500 hover:bg-brand-gold hover:text-brand-green-dark active:scale-95"
                >
                  {nav.contact}
                </Link>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="mt-auto flex flex-col items-center gap-4 border-t border-brand-gold/10 pt-6">
              <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-brand-cream-muted">{nav.connectLabel}</span>
              <div className="flex justify-center gap-4">
                {[
                  { href: settings.whatsappGroupUrl, icon: <FaWhatsapp size={16} />, label: shared.social.whatsapp },
                  { href: settings.tiktokUrl, icon: <FaTiktok size={14} />, label: shared.social.tiktok },
                  { href: settings.instagramUrl, icon: <FaInstagram size={15} />, label: shared.social.instagram },
                  { href: settings.facebookUrl, icon: <FaFacebook size={15} />, label: shared.social.facebook },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-gold/20 bg-brand-green-mid/40 text-brand-cream-muted transition-all duration-300 hover:border-brand-gold hover:text-brand-gold active:scale-90"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}