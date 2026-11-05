'use client';

import { useState } from 'react';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/', label: 'HOME', key: 'home' },
  { href: '/collections', label: 'COLLECTIONS', key: 'collections' },
  { href: '/wallets', label: 'WALLETS', key: 'wallets' },
  { href: '/accessories', label: 'ACCESSORIES', key: 'accessories' },
  { href: '/about', label: 'ABOUT US', key: 'about' },
  { href: '/contact', label: 'CONTACT', key: 'contact' },
];

export default function StoreHeader({ activePage = 'home' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header>
        <div className="nav-container">
          <div className="logo-wrapper">
            <Link href="/" className="logo-brand">
              <img
                src="https://imgur.com/7zyXbkn.jpg"
                alt="UM-AREX LEATHER"
                className="brand-logo-img"
              />
            </Link>
          </div>
          <nav>
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className={activePage === item.key ? 'active' : ''}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="nav-icons">
            <Link href="/search" aria-label="Search products">
              <i className="fa-solid fa-magnifying-glass"></i>
            </Link>
            <Link href="https://wa.me/923279595329" target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <i className="fa-brands fa-whatsapp"></i>
            </Link>
          </div>
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-nav-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-nav-header">
              <span>MENU</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={activePage === item.key ? 'active' : ''}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/search"
                  className={activePage === 'search' ? 'active' : ''}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fa-solid fa-magnifying-glass" style={{ marginRight: 8 }}></i>
                  SEARCH
                </Link>
              </li>
            </ul>
            <div className="mobile-nav-footer">
              <Link href="https://wa.me/923279595329" target="_blank" rel="noreferrer" onClick={() => setMobileMenuOpen(false)}>
                <i className="fa-brands fa-whatsapp"></i> WhatsApp
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
