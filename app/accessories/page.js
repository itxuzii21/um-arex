'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import StoreHeader from '@/components/StoreHeader';
import StoreFooter from '@/components/StoreFooter';
import ProductGrid from '@/components/ProductGrid';

const DEFAULT_ACCESSORIES = {
  heroSubtitle: 'Finishing Touches',

  heroTitle: 'Leather Accessories',

  heroDescription:
    'From card holders to key organizers — discover leather accessories that complement your style with the same premium craftsmanship. Every detail matters.',

  heroButtonText: 'SHOP ACCESSORIES',

  strip1Icon: 'fa-solid fa-hand-sparkles',
  strip1Title: 'Handcrafted',
  strip1Desc:
    'Each accessory is meticulously crafted by hand — no two pieces are exactly alike.',

  strip2Icon: 'fa-solid fa-cow',
  strip2Title: 'Genuine Leather',
  strip2Desc:
    '100% genuine leather — no synthetic substitutes, no compromises on quality.',

  strip3Icon: 'fa-solid fa-palette',
  strip3Title: 'Unique Designs',
  strip3Desc:
    'Distinctive styles that blend tradition with modern aesthetics for everyday elegance.',

  strip4Icon: 'fa-solid fa-truck-fast',
  strip4Title: 'Fast Delivery',
  strip4Desc:
    'Dispatched within 24 hours — premium accessories delivered to your doorstep nationwide.',

  showcaseTitle: 'THE UM-AREX DIFFERENCE',

  showcase1Icon: 'fa-solid fa-key',
  showcase1Title: 'Key Organizers',
  showcase1Desc:
    'Say goodbye to jingling keys. Our leather key organizers keep everything compact, silent, and scratch-free — protecting your phone and cards.',

  showcase2Icon: 'fa-solid fa-credit-card',
  showcase2Title: 'Card Holders',
  showcase2Desc:
    'Slim, sophisticated card holders designed for the minimalist — carry only what matters in genuine leather luxury.',

  showcase3Icon: 'fa-solid fa-gift',
  showcase3Title: 'Perfect Gifts',
  showcase3Desc:
    'Leather accessories make timeless gifts — for birthdays, anniversaries, or any occasion that deserves something special.',

  showcase4Icon: 'fa-solid fa-screwdriver-wrench',
  showcase4Title: 'Built to Last',
  showcase4Desc:
    'Reinforced stitching and premium hardware ensure our accessories withstand years of daily use while looking better with age.',

  productsSectionTitle: 'ALL ACCESSORIES',

  ctaTitle: 'Looking for the Perfect Gift?',

  ctaDesc:
    "Let us help you find or create a personalized leather accessory that they'll treasure forever.",
};

export default function AccessoriesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteContent, setSiteContent] = useState({});

  /*
   * ============================================================
   * PAGE CONTENT
   * ============================================================
   */

  const a = {
    ...DEFAULT_ACCESSORIES,
    ...(siteContent.accessories || {}),
  };

  /*
   * ============================================================
   * LOAD PRODUCTS FROM SUPABASE
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    async function fetchProducts() {
      try {
        setLoading(true);

        /*
         * Load ALL products from Supabase.
         *
         * We filter the category below so the page can handle
         * existing products even if their category was saved as:
         *
         * accessories
         * accessory
         * Accessories
         * ACCESSORIES
         *
         */

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', {
            ascending: false,
          });

        if (error) {
          console.error(
            'Failed to load products:',
            error
          );

          if (mounted) {
            setProducts([]);
          }

          return;
        }

        if (mounted) {
          setProducts(data || []);
        }
      } catch (err) {
        console.error(
          'Failed to load accessories:',
          err
        );

        if (mounted) {
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    /*
     * ============================================================
     * LOAD SITE CONTENT
     * ============================================================
     */

    async function fetchSiteContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*');

        if (error) {
          console.error(
            'Failed to load site content:',
            error
          );

          return;
        }

        if (!mounted) {
          return;
        }

        const content = {};

        (data || []).forEach((row) => {
          if (!row.id) {
            return;
          }

          if (
            row.content &&
            typeof row.content === 'object'
          ) {
            content[row.id] = row.content;
          } else {
            content[row.id] = row;
          }
        });

        setSiteContent(content);
      } catch (err) {
        console.error(
          'Failed to load site content:',
          err
        );
      }
    }

    /*
     * LOAD EVERYTHING
     */

    async function loadPage() {
      await Promise.all([
        fetchProducts(),
        fetchSiteContent(),
      ]);
    }

    loadPage();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ============================================================
   * FILTER ACCESSORIES
   * ============================================================
   *
   * Admin should save:
   *
   * accessories
   *
   * But this also supports old values:
   *
   * accessory
   * accessories
   * Accessories
   * ACCESSORIES
   *
   */

  const accessoryProducts = useMemo(() => {
    return products.filter((product) => {
      const category = String(
        product?.category || ''
      )
        .trim()
        .toLowerCase();

      return (
        category === 'accessories' ||
        category === 'accessory'
      );
    });
  }, [products]);

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-[#1c110b] text-[#f5f0eb]">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <StoreHeader activePage="accessories" />

      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="catalog-hero catalog-hero--accessories">

        <div className="catalog-hero-content">

          <span className="sub-title">
            {a.heroSubtitle}
          </span>

          <h1>
            {a.heroTitle}
          </h1>

          <div className="catalog-hero-divider"></div>

          <p>
            {a.heroDescription}
          </p>

          <div className="catalog-hero-actions">

            <a
              href="#accessory-collection"
              className="btn-primary"
            >
              {a.heroButtonText}
            </a>

          </div>

        </div>

      </section>

      {/* ========================================================
          ACCESSORIES HIGHLIGHTS
      ======================================================== */}

      <section className="accessory-highlights-section">

        <div className="section-header">

          <h2>
            {a.showcaseTitle}
          </h2>

          <div className="divider"></div>

        </div>

        <div className="accessory-highlights-grid">

          {[1, 2, 3, 4].map((n) => (

            <div
              className="accessory-highlight-card"
              key={n}
            >

              {a[`showcase${n}Icon`] && (
                <div className="accessory-highlight-icon">

                  <i
                    className={
                      a[`showcase${n}Icon`]
                    }
                  ></i>

                </div>
              )}

              <h3>
                {a[`showcase${n}Title`]}
              </h3>

              <p>
                {a[`showcase${n}Desc`]}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* ========================================================
          ACCESSORY PRODUCTS
      ======================================================== */}

      <section
        id="accessory-collection"
        className="products-section"
      >

        <div className="section-header">

          <h2>
            {a.productsSectionTitle}
          </h2>

          <div className="divider"></div>

          {!loading &&
            accessoryProducts.length > 0 && (

              <span className="product-count-badge">

                {accessoryProducts.length}{' '}

                Product
                {accessoryProducts.length !== 1
                  ? 's'
                  : ''}

              </span>

            )}

        </div>

        <ProductGrid
          products={accessoryProducts}
          loading={loading}
          emptyMessage="No accessories listed yet. Browse our collections or check back soon."
        />

      </section>

      {/* ========================================================
          FEATURE STRIP
      ======================================================== */}

      <section className="catalog-brand-strip">

        {[1, 2, 3, 4].map((n) => (

          <div
            className="brand-strip-item"
            key={n}
          >

            <div className="brand-strip-icon">

              <i
                className={
                  a[`strip${n}Icon`]
                }
              ></i>

            </div>

            <h4>
              {a[`strip${n}Title`]}
            </h4>

            <p>
              {a[`strip${n}Desc`]}
            </p>

          </div>

        ))}

      </section>

      {/* ========================================================
          CTA
      ======================================================== */}

      <section className="catalog-cta-section">

        <div className="catalog-cta-content">

          <h2>
            {a.ctaTitle}
          </h2>

          <p>
            {a.ctaDesc}
          </p>

          <div className="catalog-cta-actions">

            <a
              href="https://wa.me/923279595329"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >

              <i className="fa-brands fa-whatsapp"></i>

              {' '}

              Order on WhatsApp

            </a>

            <Link
              href="/contact"
              className="btn-secondary-dark"
            >

              <i className="fa-solid fa-envelope"></i>

              {' '}

              Contact Us

            </Link>

          </div>

        </div>

      </section>

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <StoreFooter />

    </div>
  );
}