'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StoreFooter from '../../components/StoreFooter';
import { supabase } from '@/lib/supabase';

export default function WalletsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWallets() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', 'wallet')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to load wallets:', error);
          setProducts([]);
          return;
        }

        const formattedProducts = (data || []).map((product) => ({
          ...product,

          imageUrls: Array.isArray(product.image_urls)
            ? product.image_urls
            : product.image_url
              ? [product.image_url]
              : [],

          specs: Array.isArray(product.specs)
            ? product.specs
            : [],

          collectionTag: product.collection_tag || '',

          imageUrl: product.image_url || '',
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error('Unexpected wallets error:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchWallets();
  }, []);

  const getProductImage = (product) => {
    if (
      product.imageUrls &&
      product.imageUrls.length > 0
    ) {
      return product.imageUrls[0];
    }

    if (product.imageUrl) {
      return product.imageUrl;
    }

    return 'https://via.placeholder.com/600x600?text=UM-AREX+LEATHER';
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString('en-PK');
  };

  return (
    <main className="min-h-screen bg-[#1c110b] text-[#f5f0eb]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header>
        <div className="nav-container">

          <div className="logo-wrapper">
            <Link href="/" className="logo-brand">
              <img
                src="https://imgur.com/7zyXbkn.jpg"
                alt="UM-AREX Leather"
                className="brand-logo-img"
              />
            </Link>
          </div>

          <nav>
            <ul>

              <li>
                <Link href="/">
                  HOME
                </Link>
              </li>

              <li>
                <Link href="/collections">
                  COLLECTIONS
                </Link>
              </li>

              <li>
                <Link
                  href="/wallets"
                  className="active"
                >
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

        </div>
      </header>


      {/* =====================================================
          PAGE HERO
      ===================================================== */}

      <section
        className="hero"
        style={{
          minHeight: '45vh',
        }}
      >
        <div className="hero-content">

          <span className="sub-title">
            UM-AREX LEATHER
          </span>

          <h1>
            PREMIUM WALLETS
          </h1>

          <p>
            Discover our collection of handcrafted
            leather wallets designed for timeless
            elegance and everyday functionality.
          </p>

        </div>
      </section>


      {/* =====================================================
          WALLET COLLECTION
      ===================================================== */}

      <section
        className="products-section"
        style={{
          paddingTop: '70px',
        }}
      >

        <div className="section-header">

          <h2>
            WALLET COLLECTION
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
            Premium leather wallets crafted
            with attention to detail and timeless
            sophistication.
          </p>

          <div className="divider"></div>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div
            style={{
              textAlign: 'center',
              padding: '70px 20px',
            }}
          >
            <i
              className="fa-solid fa-spinner fa-spin"
              style={{
                fontSize: '30px',
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
              Loading wallet collection...
            </p>
          </div>
        )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          products.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '70px 20px',
              }}
            >

              <i
                className="fa-solid fa-wallet"
                style={{
                  fontSize: '45px',
                  color: '#d4af37',
                  marginBottom: '20px',
                }}
              ></i>

              <h3
                style={{
                  fontFamily:
                    'Playfair Display, serif',
                  fontSize: '26px',
                  marginBottom: '10px',
                }}
              >
                Wallet Collection Coming Soon
              </h3>

              <p
                style={{
                  color: '#aaa',
                  fontFamily:
                    'Montserrat, sans-serif',
                }}
              >
                Our premium wallet collection
                is being prepared.
              </p>

            </div>
          )}


        {/* =================================================
            PRODUCT GRID
        ================================================= */}

        {!loading &&
          products.length > 0 && (
            <div className="product-grid">

              {products.map((product, index) => {

                const productImage =
                  getProductImage(product);

                return (
                  <div
                    key={product.id}
                    className="product-card"
                    style={{
                      animationDelay:
                        `${index * 0.1}s`,
                    }}
                  >

                    {/* IMAGE */}

                    <div className="product-image">

                      <img
                        src={productImage}
                        alt={
                          product.name ||
                          'UM-AREX Leather Wallet'
                        }
                        className="wallet-img"
                        loading="lazy"
                      />

                      <span className="badge">
                        HANDCRAFTED
                      </span>

                      {product.imageUrls &&
                        product.imageUrls.length > 1 && (
                          <span
                            className="image-count-pill"
                          >
                            <i className="fa-solid fa-images"></i>{' '}
                            {product.imageUrls.length}
                          </span>
                        )}

                    </div>


                    {/* INFORMATION */}

                    <div className="product-info">

                      <span className="collection-tag">
                        {product.collectionTag ||
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


                      {/* SPECS */}

                      {product.specs &&
                        product.specs.length > 0 && (
                          <ul className="spec-list">

                            {product.specs
                              .slice(0, 3)
                              .map(
                                (
                                  spec,
                                  specIndex
                                ) => (
                                  <li
                                    key={`${product.id}-${specIndex}`}
                                  >
                                    <i className="fa-solid fa-circle-check"></i>
                                    {' '}
                                    {spec}
                                  </li>
                                )
                              )}

                          </ul>
                        )}


                      {/* FOOTER */}

                      <div className="card-footer">

                        <p className="price">
                          PKR{' '}
                          {formatPrice(
                            product.price
                          )}
                        </p>

                        <Link
                          href={`/product?id=${product.id}`}
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
          )}

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <StoreFooter />

    </main>
  );
}