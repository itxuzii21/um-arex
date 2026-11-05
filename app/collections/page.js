'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import StoreHeader from '@/components/StoreHeader';
import StoreFooter from '@/components/StoreFooter';
import ProductGrid from '@/components/ProductGrid';

const DEFAULT_COLLECTIONS = {
  heroSubtitle: 'Curated Selection',
  heroTitle: 'Our Collections',
  heroDescription:
    'Each UM-AREX collection tells a unique story — handcrafted from premium leather, designed to age gracefully and elevate your everyday carry.',
  heroButtonText: 'EXPLORE COLLECTIONS',

  strip1Icon: 'fa-solid fa-gem',
  strip1Title: 'Premium Materials',
  strip1Desc:
    'Sourced from the finest tanneries — only genuine full-grain and top-grain leather.',

  strip2Icon: 'fa-solid fa-scissors',
  strip2Title: 'Artisan Crafted',
  strip2Desc:
    'Every stitch, cut, and edge is finished by skilled hands with decades of experience.',

  strip3Icon: 'fa-solid fa-award',
  strip3Title: 'Quality Guaranteed',
  strip3Desc:
    'Built to last generations — backed by our 6-month craftsmanship warranty.',

  strip4Icon: 'fa-solid fa-truck-fast',
  strip4Title: 'Nationwide Delivery',
  strip4Desc:
    'Dispatched within 24 hours to every city across Pakistan.',

  productsSectionTitle: 'ALL COLLECTIONS',

  ctaTitle: "Can't Find What You're Looking For?",
  ctaDesc:
    'We accept custom orders — let us craft the perfect piece for you.',
};

export default function CollectionsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteContent, setSiteContent] = useState({});

  /*
   * ============================================================
   * CONTENT
   * ============================================================
   */

  const c = {
    ...DEFAULT_COLLECTIONS,
    ...(siteContent.collections || {}),
  };

  /*
   * ============================================================
   * LOAD PRODUCTS
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setLoading(true);

        /*
         * IMPORTANT:
         *
         * Do NOT order by timestamp here.
         *
         * We simply load ALL products from Supabase.
         */

        const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error) {
          console.error(
            'COLLECTIONS - Supabase product error:',
            error
          );

          if (mounted) {
            setProducts([]);
          }

          return;
        }

        console.log(
          'COLLECTIONS - Products loaded:',
          data
        );

        if (mounted) {
          setProducts(data || []);
        }
      } catch (error) {
        console.error(
          'COLLECTIONS - Failed to load products:',
          error
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

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ============================================================
   * LOAD SITE CONTENT
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadSiteContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*');

        if (error) {
          console.error(
            'Collections site content error:',
            error
          );
          return;
        }

        if (!mounted) return;

        const content = {};

        (data || []).forEach((row) => {
          if (!row.id) return;

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
      } catch (error) {
        console.error(
          'Failed to load collections content:',
          error
        );
      }
    }

    loadSiteContent();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ============================================================
   * PRODUCT COUNT
   * ============================================================
   */

  const totalProducts = products.length;

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

      <StoreHeader activePage="collections" />

      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="catalog-hero catalog-hero--collections">

        <div className="catalog-hero-content">

          <span className="sub-title">
            {c.heroSubtitle}
          </span>

          <h1>
            {c.heroTitle}
          </h1>

          <div className="catalog-hero-divider"></div>

          <p>
            {c.heroDescription}
          </p>

          <div className="catalog-hero-actions">

            <a
              href="#all-collections"
              className="btn-primary"
            >
              {c.heroButtonText}
            </a>

          </div>

        </div>

      </section>

      {/* ========================================================
          ALL PRODUCTS
      ======================================================== */}

      <section
        id="all-collections"
        className="products-section"
      >

        <div className="section-header">

          <h2>
            {c.productsSectionTitle}
          </h2>

          <div className="divider"></div>

          {!loading && totalProducts > 0 && (
            <span className="product-count-badge">
              {totalProducts}{' '}
              Product
              {totalProducts !== 1 ? 's' : ''}
            </span>
          )}

        </div>

        <ProductGrid
          products={products}
          loading={loading}
          emptyMessage="No collections available yet. Check back soon."
        />

      </section>

      {/* ========================================================
          BRAND PROMISE STRIP
      ======================================================== */}

      <section className="catalog-brand-strip">

        {[1, 2, 3, 4].map((n) => (

          <div
            className="brand-strip-item"
            key={n}
          >

            <div className="brand-strip-icon">

              <i
                className={c[`strip${n}Icon`]}
              ></i>

            </div>

            <h4>
              {c[`strip${n}Title`]}
            </h4>

            <p>
              {c[`strip${n}Desc`]}
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
            {c.ctaTitle}
          </h2>

          <p>
            {c.ctaDesc}
          </p>

          <div className="catalog-cta-actions">

            <Link
              href="/contact"
              className="btn-primary"
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