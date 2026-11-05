'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StoreFooter from '../components/StoreFooter';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /*
   * HOME PAGE CONTENT
   */
  const home = {
    heroSubtitle: 'UM-AREX LEATHER',
    heroTitle: 'CRAFTED FOR LEGACY',
    heroDescription:
      'Discover premium leather goods crafted with timeless elegance, refined details, and exceptional attention to quality.',
    heroButtonText: 'EXPLORE COLLECTION',

    sectionTitle: 'SIGNATURE COLLECTION',
    sectionSubtitle:
      'A refined selection of premium leather pieces designed for everyday elegance.',

    feature1Icon: 'fa-solid fa-gem',
    feature1Title: 'Premium Quality',
    feature1Desc:
      'Carefully selected materials and premium craftsmanship for lasting quality.',

    feature2Icon: 'fa-solid fa-scroll',
    feature2Title: 'Timeless Heritage',
    feature2Desc:
      'Classic designs created to remain elegant beyond changing trends.',

    feature3Icon: 'fa-solid fa-scissors',
    feature3Title: 'Crafted With Detail',
    feature3Desc:
      'Every piece is finished with attention to detail and refined craftsmanship.',
  };

  /*
   * LOAD PRODUCTS FROM SUPABASE
   */
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase product loading error:', error);
          setProducts([]);
          return;
        }

        const formattedProducts = (data || []).map((product) => ({
          ...product,

          // Support Supabase snake_case columns
          image_urls: Array.isArray(product.image_urls)
            ? product.image_urls
            : [],

          specs: Array.isArray(product.specs)
            ? product.specs
            : [],

          image_url: product.image_url || '',

          collection_tag: product.collection_tag || '',
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error('Unexpected catalog error:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  /*
   * ADMIN ACCESS
   */
  const accessAdmin = () => {
    const password = window.prompt('Enter Admin Password:');

    if (password === 'Ux@!r786') {
      window.location.href = '/admin';
    } else if (password !== null) {
      window.alert('Invalid Access.');
    }
  };

  /*
   * GET PRODUCT IMAGE
   */
  const getProductImage = (product) => {
    if (
      product.image_urls &&
      Array.isArray(product.image_urls) &&
      product.image_urls.length > 0
    ) {
      return product.image_urls[0];
    }

    if (product.image_url) {
      return product.image_url;
    }

    return 'https://via.placeholder.com/600x600?text=UM-AREX+LEATHER';
  };

  /*
   * FORMAT PRICE
   */
  const formatPrice = (price) => {
    const numericPrice = Number(price || 0);

    return numericPrice.toLocaleString('en-PK');
  };

  return (
    <main
      className="min-h-screen bg-[#1c110b] text-[#f5f0eb]"
      suppressHydrationWarning
    >
      {/* =========================================================
          HEADER
      ========================================================= */}

      <header>
        <div className="nav-container">

          {/* LOGO */}
          <div className="logo-wrapper">
            <Link href="/" className="logo-brand">
              <img
                src="https://imgur.com/7zyXbkn.jpg"
                alt="UM-AREX Leather"
                className="brand-logo-img"
              />
            </Link>
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav>
            <ul>
              <li>
                <Link href="/" className="active">
                  HOME
                </Link>
              </li>

              <li>
                <Link href="/collections">
                  COLLECTIONS
                </Link>
              </li>

              <li>
                <Link href="/wallets">
                  WALLETS
                </Link>
              </li>

              <li>
                <Link href="/accessories">
                  ACCESSORIES
                </Link>
              </li>

              <li>
                <Link href="/about">
                  ABOUT US
                </Link>
              </li>

              <li>
                <Link href="/contact">
                  CONTACT
                </Link>
              </li>
            </ul>
          </nav>

          {/* NAVIGATION ICONS */}
          <div className="nav-icons">

            <Link
              href="/search"
              aria-label="Search"
            >
              <i className="fa-solid fa-magnifying-glass"></i>
            </Link>

            <Link
              href="/"
              aria-label="Shopping Bag"
            >
              <i className="fa-solid fa-bag-shopping"></i>
            </Link>

          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() =>
              setMobileMenuOpen(!mobileMenuOpen)
            }
            aria-label="Toggle navigation menu"
          >
            <i
              className={`fa-solid ${
                mobileMenuOpen
                  ? 'fa-xmark'
                  : 'fa-bars'
              }`}
            ></i>
          </button>
        </div>
      </header>

      {/* =========================================================
          MOBILE NAVIGATION
      ========================================================= */}

      {mobileMenuOpen && (
        <div
          className="mobile-nav-overlay"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        >
          <div
            className="mobile-nav-menu"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="mobile-nav-header">

              <span>MENU</span>

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                aria-label="Close menu"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

            </div>

            <ul>

              <li>
                <Link
                  href="/"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                >
                  HOME
                </Link>
              </li>

              <li>
                <Link
                  href="/collections"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                >
                  COLLECTIONS
                </Link>
              </li>

              <li>
                <Link
                  href="/wallets"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                >
                  WALLETS
                </Link>
              </li>

              <li>
                <Link
                  href="/accessories"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                >
                  ACCESSORIES
                </Link>
              </li>

              <li>
                <Link
                  href="/about"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                >
                  ABOUT US
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                >
                  CONTACT
                </Link>
              </li>

              <li>
                <Link
                  href="/search"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                >
                  <i
                    className="fa-solid fa-magnifying-glass"
                    style={{
                      marginRight: 8,
                    }}
                  ></i>

                  SEARCH
                </Link>
              </li>

            </ul>

            <div className="mobile-nav-footer">

              <Link
                href="https://wa.me/923279595329"
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
              >
                <i className="fa-brands fa-whatsapp"></i>

                {' '}WhatsApp
              </Link>

            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          HERO SECTION
      ========================================================= */}

      <section className="hero">

        <div className="hero-content">

          <span className="sub-title">
            {home.heroSubtitle}
          </span>

          <h1>
            {home.heroTitle}
          </h1>

          <p>
            {home.heroDescription}
          </p>

          <a
            href="#collection"
            className="btn-primary"
          >
            {home.heroButtonText}
          </a>

        </div>

      </section>

      {/* =========================================================
          COLLECTION SECTION
      ========================================================= */}

      <section
        id="collection"
        className="products-section"
      >

        <div className="section-header">

          <h2>
            {home.sectionTitle}
          </h2>

          <p
            style={{
              maxWidth: '650px',
              margin: '15px auto 0',
              color: '#bdb3ac',
              fontFamily:
                'Montserrat, sans-serif',
              lineHeight: 1.7,
            }}
          >
            {home.sectionSubtitle}
          </p>

          <div className="divider"></div>

        </div>

        {/* PRODUCT GRID */}

        <div
          className="product-grid"
          id="live-products-grid"
        >

          {/* LOADING */}

          {loading && (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '60px 20px',
              }}
            >
              <i
                className="fa-solid fa-spinner fa-spin"
                style={{
                  fontSize: '28px',
                  color: '#d4af37',
                  marginBottom: '15px',
                }}
              ></i>

              <p
                style={{
                  color: '#d4af37',
                  fontFamily:
                    'Montserrat, sans-serif',
                }}
              >
                Loading luxury collection...
              </p>
            </div>
          )}

          {/* NO PRODUCTS */}

          {!loading &&
            products.length === 0 && (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '60px 20px',
                }}
              >

                <i
                  className="fa-solid fa-box-open"
                  style={{
                    fontSize: '40px',
                    color: '#d4af37',
                    marginBottom: '20px',
                  }}
                ></i>

                <h3
                  style={{
                    fontFamily:
                      'Playfair Display, serif',
                    color: '#f5f0eb',
                    fontSize: '24px',
                    marginBottom: '10px',
                  }}
                >
                  Collection Coming Soon
                </h3>

                <p
                  style={{
                    color: '#aaa',
                    fontFamily:
                      'Montserrat, sans-serif',
                  }}
                >
                  Our premium leather collection
                  is being prepared.
                </p>

              </div>
            )}

          {/* PRODUCTS */}

          {!loading &&
            products.length > 0 &&
            products.map((product) => {

              const productImage =
                getProductImage(product);

              return (
                <div
                  key={product.id}
                  className="product-card"
                >

                  {/* PRODUCT IMAGE */}

                  <div className="product-image">

                    <img
                      src={productImage}
                      alt={
                        product.name ||
                        'UM-AREX Leather Product'
                      }
                      className="wallet-img"
                      loading="lazy"
                    />

                    <span className="badge">
                      HANDCRAFTED
                    </span>

                  </div>

                  {/* PRODUCT INFORMATION */}

                  <div className="product-info">

                    <span className="collection-tag">
                      {product.collection_tag ||
                        'SIGNATURE PREMIUM'}
                    </span>

                    <h3>
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="product-desc">
                        {product.description}
                      </p>
                    )}

                    {/* PRODUCT SPECS */}

                    {product.specs &&
                      product.specs.length > 0 && (
                        <ul className="spec-list">

                          {product.specs
                            .slice(0, 3)
                            .map(
                              (
                                spec,
                                index
                              ) => (
                                <li
                                  key={`${product.id}-spec-${index}`}
                                >
                                  <i className="fa-solid fa-circle-check"></i>

                                  {' '}

                                  {spec}
                                </li>
                              )
                            )}

                        </ul>
                      )}

                    {/* CARD FOOTER */}

                    <div className="card-footer">

                      <p className="price">

                        PKR{' '}

                        {formatPrice(
                          product.price
                        )}

                      </p>

                      <Link
                        href={`/product?id=${encodeURIComponent(product.id)}`}
                        className="btn-secondary"
                      >
                        VIEW DETAILS
                      </Link>

                    </div>

                  </div>

                </div>
              );
            })}

        </div>

        {/* VIEW ALL */}

        {!loading &&
          products.length > 0 && (
            <div
              style={{
                textAlign: 'center',
                marginTop: '50px',
              }}
            >
              <Link
                href="/collections"
                className="btn-primary"
              >
                VIEW ALL COLLECTIONS
              </Link>
            </div>
          )}

      </section>

      {/* =========================================================
          BRAND VALUES
      ========================================================= */}

      <section className="features">

        <div className="feature-item">

          <i
            className={home.feature1Icon}
          ></i>

          <h3>
            {home.feature1Title}
          </h3>

          <p>
            {home.feature1Desc}
          </p>

        </div>

        <div className="feature-item">

          <i
            className={home.feature2Icon}
          ></i>

          <h3>
            {home.feature2Title}
          </h3>

          <p>
            {home.feature2Desc}
          </p>

        </div>

        <div className="feature-item">

          <i
            className={home.feature3Icon}
          ></i>

          <h3>
            {home.feature3Title}
          </h3>

          <p>
            {home.feature3Desc}
          </p>

        </div>

      </section>

      {/* =========================================================
          BRAND STORY / CTA
      ========================================================= */}

      <section
        style={{
          padding: '90px 20px',
          textAlign: 'center',
          background:
            'linear-gradient(rgba(28,17,11,.94),rgba(28,17,11,.98))',
          borderTop:
            '1px solid rgba(212,175,55,.15)',
          borderBottom:
            '1px solid rgba(212,175,55,.15)',
        }}
      >

        <span
          style={{
            color: '#d4af37',
            fontFamily:
              'Montserrat, sans-serif',
            fontSize: '12px',
            letterSpacing: '4px',
          }}
        >
          UM-AREX LEATHER
        </span>

        <h2
          style={{
            marginTop: '15px',
            fontFamily:
              'Playfair Display, serif',
            fontSize:
              'clamp(32px, 5vw, 55px)',
            fontWeight: 500,
          }}
        >
          WHERE QUALITY
          <br />
          MEETS ELEGANCE
        </h2>

        <p
          style={{
            maxWidth: '650px',
            margin:
              '20px auto 30px',
            color: '#bdb3ac',
            fontFamily:
              'Montserrat, sans-serif',
            lineHeight: 1.8,
          }}
        >
          From everyday essentials to refined
          accessories, UM-AREX Leather brings
          together craftsmanship, functionality,
          and timeless style.
        </p>

        <Link
          href="/about"
          className="btn-secondary"
        >
          DISCOVER OUR STORY
        </Link>

      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <StoreFooter />

      {/* =========================================================
          HIDDEN ADMIN ACCESS
      ========================================================= */}

      <div
        className="admin-trigger"
        onClick={accessAdmin}
        title="Admin Login"
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '30px',
          height: '30px',
          background: 'transparent',
          cursor: 'pointer',
          zIndex: 9999,
        }}
      />

    </main>
  );
}