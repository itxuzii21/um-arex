'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import StoreFooter from '../../components/StoreFooter';

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  /*
   * ============================================================
   * LOAD PRODUCT
   * ============================================================
   */

  useEffect(() => {
    async function loadProductDetails() {
      const urlParams = new URLSearchParams(
        window.location.search
      );

      const productId = urlParams.get('id');

      if (!productId) {
        setErrorMsg(
          'Missing product selection ID parameter.'
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) {
          console.error(
            'Supabase product error:',
            error
          );

          if (error.code === 'PGRST116') {
            setErrorMsg(
              'The requested product could not be found.'
            );
          } else {
            setErrorMsg(
              `Unable to load product: ${error.message}`
            );
          }

          return;
        }

        if (!data) {
          setErrorMsg(
            'The requested product could not be found.'
          );
          return;
        }

        /*
         * Store product
         */
        setProduct(data);

        /*
         * Update browser title
         */
        if (data.name) {
          document.title =
            `${data.name} | UM-AREX LEATHER`;
        }

        /*
         * ========================================================
         * PREPARE IMAGES
         *
         * Supabase columns:
         * image_urls
         * image_url
         * ========================================================
         */

        let imageryArray = [];

        if (
          Array.isArray(data.image_urls) &&
          data.image_urls.length > 0
        ) {
          imageryArray = data.image_urls.filter(
            (url) =>
              typeof url === 'string' &&
              url.trim().length > 0
          );
        }

        if (
          imageryArray.length === 0 &&
          data.image_url
        ) {
          imageryArray = [
            data.image_url,
          ];
        }

        if (imageryArray.length === 0) {
          imageryArray = [
            'https://via.placeholder.com/800x800?text=UM-AREX+LEATHER',
          ];
        }

        setSelectedImage(imageryArray[0]);
      } catch (error) {
        console.error(
          'Critical fault processing product page:',
          error
        );

        setErrorMsg(
          `Error loading product: ${
            error?.message || 'Unknown error'
          }`
        );
      } finally {
        setLoading(false);
      }
    }

    loadProductDetails();
  }, []);

  /*
   * ============================================================
   * PRODUCT IMAGES
   * ============================================================
   */

  let imageryArray = [];

  if (product) {
    if (
      Array.isArray(product.image_urls) &&
      product.image_urls.length > 0
    ) {
      imageryArray = product.image_urls.filter(
        (url) =>
          typeof url === 'string' &&
          url.trim().length > 0
      );
    }

    if (
      imageryArray.length === 0 &&
      product.image_url
    ) {
      imageryArray = [
        product.image_url,
      ];
    }

    if (imageryArray.length === 0) {
      imageryArray = [
        'https://via.placeholder.com/800x800?text=UM-AREX+LEATHER',
      ];
    }
  }

  /*
   * ============================================================
   * PRODUCT PRICE
   * ============================================================
   */

  const productPrice = Number(
    product?.price || 0
  );

  const totalPrice =
    productPrice * quantity;

  /*
   * ============================================================
   * WHATSAPP ORDER
   * ============================================================
   */

  const whatsappMsg = product
    ? encodeURIComponent(
        `Aslam-o-Alaikum, I want to order the following product:\n\nProduct: ${
          product.name
        }\nQuantity: ${quantity}\nPrice: PKR ${totalPrice.toLocaleString(
          'en-PK'
        )}`
      )
    : '';

  const whatsappLink =
    `https://wa.me/923279595329?text=${whatsappMsg}`;

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="product-page">

      {/* ========================================================
          CUSTOM PRODUCT PAGE CSS
      ======================================================== */}

      <style jsx global>{`

        /* ======================================================
           PRODUCT DETAIL LAYOUT
        ====================================================== */

        .product-detail-container {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
          gap: 50px !important;
          width: 100% !important;
          max-width: 1200px !important;
          margin: 40px auto !important;
          padding: 20px !important;
          align-items: start !important;
          box-sizing: border-box !important;
        }

        /* ======================================================
           PRODUCT GALLERY
        ====================================================== */

        .product-gallery {
          width: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 15px !important;
          min-width: 0 !important;
        }

        /*
         * IMPORTANT:
         * No fixed height.
         *
         * The wrapper automatically follows the
         * original image aspect ratio.
         */

        .main-image-wrapper {
          width: 100% !important;
          height: auto !important;
          min-height: 300px !important;
          overflow: hidden !important;
          border: 1px solid #1a1a1a !important;
          background: #0b0b0b !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-sizing: border-box !important;
        }

        /*
         * The image keeps its original proportions.
         */

        .main-image-wrapper img {
          display: block !important;
          width: 100% !important;
          height: auto !important;
          max-width: 100% !important;
          object-fit: contain !important;
          background: transparent !important;
        }

        /*
         * Prevent extremely tall images from taking
         * over the entire screen.
         */

        .main-image-wrapper img.portrait-image {
          max-height: 750px !important;
          width: auto !important;
          max-width: 100% !important;
        }

        /* ======================================================
           THUMBNAILS
        ====================================================== */

        .gallery-thumbnails {
          display: flex !important;
          gap: 10px !important;
          flex-wrap: wrap !important;
          margin-top: 5px !important;
        }

        .thumbnail-item {
          width: 80px !important;
          height: 80px !important;
          flex: 0 0 80px !important;
          border: 1px solid #222 !important;
          cursor: pointer !important;
          overflow: hidden !important;
          background: #0b0b0b !important;
          opacity: 0.6 !important;
          transition:
            opacity 0.3s ease,
            border-color 0.3s ease,
            transform 0.3s ease !important;
          box-sizing: border-box !important;
        }

        .thumbnail-item img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          display: block !important;
        }

        .thumbnail-item:hover {
          opacity: 1 !important;
          border-color: #d4af37 !important;
          transform: translateY(-2px) !important;
        }

        .thumbnail-item.active-thumb {
          opacity: 1 !important;
          border-color: #d4af37 !important;
        }

        /* ======================================================
           PRODUCT INFORMATION
        ====================================================== */

        .product-order-info {
          width: 100% !important;
          min-width: 0 !important;
          display: block !important;
        }

        .detail-title {
          word-break: break-word !important;
        }

        .detail-description {
          white-space: pre-line !important;
        }

        /* ======================================================
           QUANTITY
        ====================================================== */

        .quantity-selector {
          display: flex !important;
          align-items: center !important;
          border: 1px solid #333 !important;
          background: #111 !important;
        }

        .qty-btn {
          background: none !important;
          border: none !important;
          color: #fff !important;
          padding: 10px 15px !important;
          cursor: pointer !important;
          font-size: 18px !important;
          transition: color 0.2s ease !important;
        }

        .qty-btn:hover {
          color: #d4af37 !important;
        }

        .quantity-selector input {
          width: 40px !important;
          text-align: center !important;
          background: none !important;
          border: none !important;
          color: #fff !important;
          outline: none !important;
          font-family: 'Montserrat', sans-serif !important;
        }

        /* ======================================================
           WHATSAPP BUTTON
        ====================================================== */

        .btn-whatsapp-order {
          background: #25d366 !important;
          color: #fff !important;
          padding: 12px 25px !important;
          text-decoration: none !important;
          font-weight: 600 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 10px !important;
          font-family: 'Montserrat', sans-serif !important;
          font-size: 14px !important;
          border-radius: 4px !important;
          transition:
            transform 0.2s ease,
            opacity 0.2s ease !important;
        }

        .btn-whatsapp-order:hover {
          transform: translateY(-2px) !important;
          opacity: 0.9 !important;
        }

        /* ======================================================
           MOBILE
        ====================================================== */

        @media (max-width: 768px) {

          .product-detail-container {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
            margin: 20px auto !important;
            padding: 15px !important;
          }

          .main-image-wrapper {
            min-height: 200px !important;
          }

          .main-image-wrapper img {
            width: 100% !important;
            height: auto !important;
          }

          .thumbnail-item {
            width: 70px !important;
            height: 70px !important;
            flex-basis: 70px !important;
          }

          .purchase-actions {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .quantity-selector {
            width: fit-content !important;
          }

          .btn-whatsapp-order {
            width: 100% !important;
            box-sizing: border-box !important;
          }

          .detail-title {
            font-size: 26px !important;
          }

        }

        /* ======================================================
           SMALL MOBILE
        ====================================================== */

        @media (max-width: 480px) {

          .product-detail-container {
            padding: 10px !important;
          }

          .main-image-wrapper {
            min-height: 160px !important;
          }

          .thumbnail-item {
            width: 60px !important;
            height: 60px !important;
            flex-basis: 60px !important;
          }

        }

      `}</style>

      {/* ========================================================
          NAVIGATION HEADER
      ======================================================== */}

      <header>
        <div className="nav-container">

          {/* LOGO */}

          <div className="logo-wrapper">
            <Link
              href="/"
              className="logo-brand"
            >
              <img
                src="https://imgur.com/7zyXbkn.jpg"
                alt="UM-AREX LEATHER"
                className="brand-logo-img"
              />
            </Link>
          </div>

          {/* DESKTOP NAVIGATION */}

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

        </div>
      </header>

      {/* ========================================================
          PRODUCT DETAIL
      ======================================================== */}

      <section
        className="product-detail-container"
        id="detail-loading-box"
      >

        {/* ======================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '70px 20px',
            }}
          >

            <i
              className="fa-solid fa-spinner fa-spin"
              style={{
                color: '#d4af37',
                fontSize: '32px',
                marginBottom: '20px',
              }}
            ></i>

            <p
              style={{
                color: '#d4af37',
                fontFamily:
                  "'Montserrat', sans-serif",
              }}
            >
              Retrieving master craftsmanship details...
            </p>

          </div>
        )}

        {/* ======================================================
            ERROR
        ====================================================== */}

        {!loading && errorMsg && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '70px 20px',
              fontFamily:
                "'Montserrat', sans-serif",
            }}
          >

            <i
              className="fa-solid fa-circle-exclamation"
              style={{
                color: '#d4af37',
                fontSize: '42px',
                marginBottom: '20px',
              }}
            ></i>

            <p
              style={{
                color: '#bbb',
                fontSize: '16px',
                lineHeight: '1.6',
              }}
            >
              {errorMsg}
            </p>

            <Link
              href="/collections"
              className="btn-primary"
              style={{
                display: 'inline-block',
                marginTop: '20px',
                padding: '12px 25px',
                textDecoration: 'none',
              }}
            >
              BACK TO COLLECTIONS
            </Link>

          </div>
        )}

        {/* ======================================================
            PRODUCT
        ====================================================== */}

        {!loading &&
          !errorMsg &&
          product && (
            <>

              {/* ==================================================
                  PRODUCT GALLERY
              ================================================== */}

              <div className="product-gallery">

                <div className="main-image-wrapper">

                  <img
                    src={selectedImage}
                    alt={
                      product.name ||
                      'UM-AREX Leather Product'
                    }
                    id="main-product-img"
                    onError={(event) => {
                      event.currentTarget.src =
                        'https://via.placeholder.com/800x800?text=UM-AREX+LEATHER';
                    }}
                  />

                </div>

                {/* THUMBNAILS */}

                {imageryArray.length > 1 && (
                  <div className="gallery-thumbnails">

                    {imageryArray.map(
                      (url, index) => (
                        <div
                          key={`${url}-${index}`}
                          className={`thumbnail-item ${
                            selectedImage === url
                              ? 'active-thumb'
                              : ''
                          }`}
                          onClick={() =>
                            setSelectedImage(url)
                          }
                          role="button"
                          tabIndex={0}
                          aria-label={`View product image ${
                            index + 1
                          }`}
                          onKeyDown={(event) => {
                            if (
                              event.key ===
                                'Enter' ||
                              event.key === ' '
                            ) {
                              setSelectedImage(
                                url
                              );
                            }
                          }}
                        >

                          <img
                            src={url}
                            alt={`${product.name || 'Product'} preview ${
                              index + 1
                            }`}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.src =
                                'https://via.placeholder.com/100x100?text=Image';
                            }}
                          />

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* ==================================================
                  PRODUCT INFORMATION
              ================================================== */}

              <div className="product-order-info">

                {/* COLLECTION TAG */}

                <span
                  className="detail-collection-tag"
                  style={{
                    color: '#d4af37',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontFamily:
                      "'Montserrat', sans-serif",
                  }}
                >
                  {product.collection_tag ||
                    'Premium Luxury'}
                </span>

                {/* PRODUCT NAME */}

                <h1
                  className="detail-title"
                  style={{
                    color: '#fff',
                    fontFamily:
                      "'Cinzel', serif",
                    margin: '10px 0',
                    fontSize: '32px',
                    fontWeight: 500,
                  }}
                >
                  {product.name}
                </h1>

                {/* PRICE */}

                <p
                  className="detail-price"
                  style={{
                    color: '#d4af37',
                    fontSize: '24px',
                    fontWeight: 600,
                    marginBottom: '20px',
                    fontFamily:
                      "'Montserrat', sans-serif",
                  }}
                >
                  PKR{' '}
                  {totalPrice.toLocaleString(
                    'en-PK'
                  )}
                </p>

                {/* DIVIDER */}

                <div
                  className="detail-divider"
                  style={{
                    height: '1px',
                    background: '#222',
                    margin: '20px 0',
                  }}
                ></div>

                {/* DESCRIPTION */}

                <p
                  className="detail-description"
                  style={{
                    color: '#bbb',
                    lineHeight: '1.7',
                    marginBottom: '20px',
                    fontFamily:
                      "'Montserrat', sans-serif",
                  }}
                >
                  {product.description || ''}
                </p>

                {/* ==================================================
                    PRODUCT SPECIFICATIONS
                ================================================== */}

                {Array.isArray(product.specs) &&
                  product.specs.length > 0 && (
                    <ul
                      className="detail-spec-list"
                      style={{
                        listStyle: 'none',
                        padding: 0,
                        marginBottom: '30px',
                        color: '#fff',
                        fontFamily:
                          "'Montserrat', sans-serif",
                      }}
                    >

                      {product.specs.map(
                        (spec, index) => (
                          <li
                            key={`${product.id}-detail-spec-${index}`}
                            style={{
                              marginBottom:
                                '10px',
                              display: 'flex',
                              alignItems:
                                'flex-start',
                              gap: '10px',
                              lineHeight: '1.5',
                            }}
                          >

                            <i
                              className="fa-solid fa-circle-check"
                              style={{
                                color:
                                  '#d4af37',
                                marginTop:
                                  '3px',
                                flexShrink: 0,
                              }}
                            ></i>

                            <span>
                              {spec}
                            </span>

                          </li>
                        )
                      )}

                    </ul>
                  )}

                {/* ==================================================
                    PURCHASE ACTIONS
                ================================================== */}

                <div
                  className="purchase-actions"
                  style={{
                    display: 'flex',
                    gap: '20px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    marginBottom: '25px',
                  }}
                >

                  {/* QUANTITY */}

                  <div className="quantity-selector">

                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() =>
                        setQuantity(
                          (current) =>
                            Math.max(
                              1,
                              current - 1
                            )
                        )
                      }
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <input
                      type="number"
                      value={quantity}
                      readOnly
                      aria-label="Quantity"
                    />

                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() =>
                        setQuantity(
                          (current) =>
                            current + 1
                        )
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>

                  </div>

                  {/* WHATSAPP */}

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp-order"
                  >
                    <i className="fa-brands fa-whatsapp"></i>
                    ORDER VIA WHATSAPP
                  </a>

                </div>

                {/* ==================================================
                    SHIPPING INFORMATION
                ================================================== */}

                <div
                  className="shipping-info-box"
                  style={{
                    background: '#0b0b0b',
                    border:
                      '1px solid #1a1a1a',
                    padding: '20px',
                    color: '#aaa',
                    fontSize: '14px',
                    fontFamily:
                      "'Montserrat', sans-serif",
                    lineHeight: '1.6',
                  }}
                >

                  <p
                    style={{
                      marginBottom: '10px',
                    }}
                  >

                    <i
                      className="fa-solid fa-truck-fast"
                      style={{
                        color: '#d4af37',
                        marginRight: '8px',
                      }}
                    ></i>

                    <strong>
                      Nationwide Delivery:
                    </strong>{' '}
                    Dispatched securely
                    within 24 hours.

                  </p>

                  <p
                    style={{
                      margin: 0,
                    }}
                  >

                    <i
                      className="fa-solid fa-wallet"
                      style={{
                        color: '#d4af37',
                        marginRight: '8px',
                      }}
                    ></i>

                    <strong>
                      Advance Payment Required:
                    </strong>{' '}
                    Rs 250/- delivery
                    fee collected in
                    advance to confirm
                    order processing.

                  </p>

                </div>

              </div>

            </>
          )}

      </section>

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <StoreFooter />

    </div>
  );
}