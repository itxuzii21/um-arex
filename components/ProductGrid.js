import Link from 'next/link';

export default function ProductGrid({
  products = [],
  loading,
  emptyMessage,
}) {
  if (loading) {
    return (
      <div className="catalog-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <p>Loading luxury inventory...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="catalog-empty">
        <i className="fa-solid fa-box-open"></i>

        <p>
          {emptyMessage ||
            'No products available in this category yet.'}
        </p>

        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => {
        /*
         * =====================================================
         * NORMALIZE SUPABASE DATA
         * =====================================================
         *
         * Supabase normally returns:
         *
         * image_urls
         * image_url
         * collection_tag
         *
         * But some older parts of the project may use:
         *
         * imageUrls
         * imageUrl
         * collectionTag
         *
         * We support BOTH.
         */

        // -----------------------------
        // PRODUCT IMAGES
        // -----------------------------

        let imageUrls = [];

        if (
          Array.isArray(product.image_urls) &&
          product.image_urls.length > 0
        ) {
          imageUrls = product.image_urls;
        } else if (
          Array.isArray(product.imageUrls) &&
          product.imageUrls.length > 0
        ) {
          imageUrls = product.imageUrls;
        }

        const mainDisplayImg =
          imageUrls[0] ||
          product.image_url ||
          product.imageUrl ||
          'https://via.placeholder.com/600x450?text=UM-AREX';

        const hasMultipleImages =
          imageUrls.length > 1;

        // -----------------------------
        // COLLECTION
        // -----------------------------

        const collectionTag =
          product.collection_tag ||
          product.collectionTag ||
          'Signature Premium';

        // -----------------------------
        // DESCRIPTION
        // -----------------------------

        const description =
          product.description || '';

        // -----------------------------
        // SPECIFICATIONS
        // -----------------------------

        const specs = Array.isArray(product.specs)
          ? product.specs
          : [];

        // -----------------------------
        // PRICE
        // -----------------------------

        const price = Number(product.price || 0);

        return (
          <div
            key={product.id}
            className="product-card"
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >

            {/* =================================================
                PRODUCT IMAGE
            ================================================= */}

            <div className="product-image">

              <img
                src={mainDisplayImg}
                alt={
                  product.name ||
                  'UM-AREX Leather Product'
                }
                className="wallet-img"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://via.placeholder.com/600x450?text=UM-AREX';
                }}
              />

              {/* HANDCRAFTED BADGE */}

              <span className="badge">
                HANDCRAFTED
              </span>

              {/* IMAGE COUNT */}

              {hasMultipleImages && (
                <span className="image-count-pill">
                  <i className="fa-solid fa-images"></i>{' '}
                  {imageUrls.length}
                </span>
              )}

            </div>

            {/* =================================================
                PRODUCT INFORMATION
            ================================================= */}

            <div className="product-info">

              {/* COLLECTION TAG */}

              <span className="collection-tag">
                {collectionTag}
              </span>

              {/* PRODUCT NAME */}

              <h3>
                {product.name ||
                  'Premium Leather Product'}
              </h3>

              {/* DESCRIPTION */}

              {description && (
                <p className="product-desc">
                  {description}
                </p>
              )}

              {/* =================================================
                  SPECIFICATIONS
              ================================================= */}

              {specs.length > 0 && (
                <ul className="spec-list">

                  {specs
                    .slice(0, 3)
                    .map((spec, i) => (
                      <li key={i}>

                        <i className="fa-solid fa-circle-check"></i>{' '}

                        {spec}

                      </li>
                    ))}

                </ul>
              )}

              {/* =================================================
                  CARD FOOTER
              ================================================= */}

              <div className="card-footer">

                {/* PRICE */}

                <p className="price">
                  PKR{' '}
                  {price.toLocaleString()}
                </p>

                {/* VIEW DETAILS */}

                <Link
                  href={`/product?id=${encodeURIComponent(
                    product.id
                  )}`}
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
  );
}