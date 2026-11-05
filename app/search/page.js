'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import StoreHeader from '@/components/StoreHeader';
import StoreFooter from '@/components/StoreFooter';
import ProductGrid from '@/components/ProductGrid';

export default function SearchPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [category, setCategory] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState('all');

  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const debounceRef = useRef(null);
  const searchInputRef = useRef(null);

  /*
   * ==========================================
   * LOAD PRODUCTS FROM SUPABASE
   * ==========================================
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
          console.error('Failed to load products:', error);
          setAllProducts([]);
          return;
        }

        setAllProducts(data || []);
      } catch (err) {
        console.error('Failed to load products:', err);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  /*
   * ==========================================
   * DEBOUNCE SEARCH
   * ==========================================
   */
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  /*
   * ==========================================
   * FOCUS SEARCH BOX
   * ==========================================
   */
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  /*
   * ==========================================
   * COLLECTION TAGS
   * ==========================================
   */
  const collectionTags = useMemo(() => {
    const tags = new Set();

    allProducts.forEach((product) => {
      if (product.collectionTag) {
        tags.add(product.collectionTag);
      }

      // Also support snake_case if your Supabase
      // column is named collection_tag
      if (product.collection_tag) {
        tags.add(product.collection_tag);
      }
    });

    return Array.from(tags).sort();
  }, [allProducts]);

  /*
   * ==========================================
   * FILTER + SORT PRODUCTS
   * ==========================================
   */
  const filteredProducts = useMemo(() => {
    let results = [...allProducts];

    /*
     * SEARCH
     */
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase().trim();

      results = results.filter((product) => {
        const name = String(product.name || '').toLowerCase();

        const description = String(
          product.description || ''
        ).toLowerCase();

        const collectionTag = String(
          product.collectionTag ||
            product.collection_tag ||
            ''
        ).toLowerCase();

        let specsMatch = false;

        if (Array.isArray(product.specs)) {
          specsMatch = product.specs.some((spec) =>
            String(spec).toLowerCase().includes(q)
          );
        } else if (typeof product.specs === 'string') {
          specsMatch = product.specs.toLowerCase().includes(q);
        }

        return (
          name.includes(q) ||
          description.includes(q) ||
          collectionTag.includes(q) ||
          specsMatch
        );
      });
    }

    /*
     * CATEGORY
     */
    if (category !== 'all') {
      results = results.filter(
        (product) =>
          product.category === category
      );
    }

    /*
     * COLLECTION
     */
    if (selectedCollection !== 'all') {
      results = results.filter((product) => {
        const collection =
          product.collectionTag ||
          product.collection_tag ||
          '';

        return collection === selectedCollection;
      });
    }

    /*
     * PRICE MIN
     */
    if (priceMin !== '') {
      results = results.filter(
        (product) =>
          Number(product.price || 0) >=
          Number(priceMin)
      );
    }

    /*
     * PRICE MAX
     */
    if (priceMax !== '') {
      results = results.filter(
        (product) =>
          Number(product.price || 0) <=
          Number(priceMax)
      );
    }

    /*
     * SORT
     */
    switch (sortBy) {
      case 'price-low':
        results.sort(
          (a, b) =>
            Number(a.price || 0) -
            Number(b.price || 0)
        );
        break;

      case 'price-high':
        results.sort(
          (a, b) =>
            Number(b.price || 0) -
            Number(a.price || 0)
        );
        break;

      case 'name-az':
        results.sort((a, b) =>
          String(a.name || '').localeCompare(
            String(b.name || '')
          )
        );
        break;

      case 'name-za':
        results.sort((a, b) =>
          String(b.name || '').localeCompare(
            String(a.name || '')
          )
        );
        break;

      case 'newest':
      default:
        // Already sorted by created_at from Supabase
        break;
    }

    return results;
  }, [
    allProducts,
    debouncedQuery,
    category,
    selectedCollection,
    priceMin,
    priceMax,
    sortBy,
  ]);

  /*
   * ==========================================
   * ACTIVE FILTER COUNT
   * ==========================================
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (category !== 'all') count++;
    if (selectedCollection !== 'all') count++;
    if (priceMin !== '') count++;
    if (priceMax !== '') count++;
    if (sortBy !== 'newest') count++;

    return count;
  }, [
    category,
    selectedCollection,
    priceMin,
    priceMax,
    sortBy,
  ]);

  /*
   * ==========================================
   * CLEAR FILTERS
   * ==========================================
   */
  const clearAllFilters = useCallback(() => {
    setCategory('all');
    setSelectedCollection('all');
    setPriceMin('');
    setPriceMax('');
    setSortBy('newest');
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  /*
   * ==========================================
   * QUICK PRICE FILTER
   * ==========================================
   */
  const setQuickPrice = (min, max) => {
    setPriceMin(min);
    setPriceMax(max);
  };

  return (
    <div className="min-h-screen bg-[#1c110b] text-[#f5f0eb]">

      <StoreHeader activePage="search" />

      {/* ==========================================
          SEARCH HERO
      ========================================== */}
      <section className="search-hero">

        <div className="search-hero-content">

          <span className="sub-title">
            Find Your Perfect Piece
          </span>

          <h1>
            Search Our Collection
          </h1>

          <div className="catalog-hero-divider"></div>

          <p>
            Browse our handcrafted leather goods —
            search by name, style, or filter by
            price and category.
          </p>

        </div>

        {/* SEARCH BAR */}
        <div className="search-bar-wrapper">

          <div className="search-bar">

            <i className="fa-solid fa-magnifying-glass search-bar-icon"></i>

            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search wallets, accessories, collections..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="search-input"
            />

            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setSearchQuery('');
                  setDebouncedQuery('');
                }}
                aria-label="Clear search"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}

          </div>

          {/* MOBILE FILTER BUTTON */}
          <button
            type="button"
            className="filter-toggle-btn"
            onClick={() =>
              setShowFilters(!showFilters)
            }
          >
            <i className="fa-solid fa-sliders"></i>

            <span>
              Filters
            </span>

            {activeFilterCount > 0 && (
              <span className="filter-badge">
                {activeFilterCount}
              </span>
            )}
          </button>

        </div>
      </section>

      {/* ==========================================
          MAIN SEARCH AREA
      ========================================== */}
      <div className="search-main-layout">

        {/* ==========================================
            SIDEBAR
        ========================================== */}
        <aside
          className={`search-sidebar ${
            showFilters
              ? 'search-sidebar--open'
              : ''
          }`}
        >

          <div className="search-sidebar-header">

            <h3>
              <i className="fa-solid fa-sliders"></i>
              {' '}
              Filters
            </h3>

            {activeFilterCount > 0 && (
              <button
                type="button"
                className="clear-filters-btn"
                onClick={clearAllFilters}
              >
                Clear All
              </button>
            )}

          </div>

          {/* ==========================================
              CATEGORY
          ========================================== */}
          <div className="filter-group">

            <h4 className="filter-label">
              Category
            </h4>

            <div className="filter-options">

              {[
                {
                  value: 'all',
                  label: 'All Products',
                },
                {
                  value: 'wallet',
                  label: 'Wallets',
                },
                {
                  value: 'accessory',
                  label: 'Accessories',
                },
              ].map((option) => (

                <label
                  key={option.value}
                  className="filter-radio"
                >

                  <input
                    type="radio"
                    name="category"
                    value={option.value}
                    checked={
                      category === option.value
                    }
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                  />

                  <span>
                    {option.label}
                  </span>

                </label>

              ))}

            </div>
          </div>

          {/* ==========================================
              COLLECTION
          ========================================== */}
          {collectionTags.length > 0 && (

            <div className="filter-group">

              <h4 className="filter-label">
                Collection
              </h4>

              <div className="filter-options">

                <label className="filter-radio">

                  <input
                    type="radio"
                    name="collection"
                    value="all"
                    checked={
                      selectedCollection === 'all'
                    }
                    onChange={() =>
                      setSelectedCollection('all')
                    }
                  />

                  <span>
                    All Collections
                  </span>

                </label>

                {collectionTags.map((tag) => (

                  <label
                    key={tag}
                    className="filter-radio"
                  >

                    <input
                      type="radio"
                      name="collection"
                      value={tag}
                      checked={
                        selectedCollection === tag
                      }
                      onChange={(e) =>
                        setSelectedCollection(
                          e.target.value
                        )
                      }
                    />

                    <span>
                      {tag}
                    </span>

                  </label>

                ))}

              </div>

            </div>

          )}

          {/* ==========================================
              PRICE
          ========================================== */}
          <div className="filter-group">

            <h4 className="filter-label">
              Price Range (PKR)
            </h4>

            <div className="price-range-inputs">

              <div className="price-input-wrapper">

                <span className="price-label">
                  Min
                </span>

                <input
                  type="number"
                  placeholder="0"
                  value={priceMin}
                  onChange={(e) =>
                    setPriceMin(e.target.value)
                  }
                  className="price-input"
                  min="0"
                />

              </div>

              <span className="price-divider">
                —
              </span>

              <div className="price-input-wrapper">

                <span className="price-label">
                  Max
                </span>

                <input
                  type="number"
                  placeholder="Any"
                  value={priceMax}
                  onChange={(e) =>
                    setPriceMax(e.target.value)
                  }
                  className="price-input"
                  min="0"
                />

              </div>

            </div>

            {/* QUICK PRICE BUTTONS */}
            <div className="quick-price-btns">

              <button
                type="button"
                onClick={() =>
                  setQuickPrice('', '1000')
                }
              >
                Under 1,000
              </button>

              <button
                type="button"
                onClick={() =>
                  setQuickPrice('1000', '3000')
                }
              >
                1,000 - 3,000
              </button>

              <button
                type="button"
                onClick={() =>
                  setQuickPrice('3000', '')
                }
              >
                3,000+
              </button>

            </div>

          </div>

          {/* ==========================================
              SORT
          ========================================== */}
          <div className="filter-group">

            <h4 className="filter-label">
              Sort By
            </h4>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
              className="sort-select"
            >
              <option value="newest">
                Newest First
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="name-az">
                Name: A to Z
              </option>

              <option value="name-za">
                Name: Z to A
              </option>

            </select>

          </div>

        </aside>

        {/* ==========================================
            RESULTS
        ========================================== */}
        <main className="search-results">

          <div className="search-results-header">

            {!loading && (
              <span className="product-count-badge">

                {filteredProducts.length}

                {' '}

                Result
                {filteredProducts.length !== 1
                  ? 's'
                  : ''}

                {debouncedQuery && (
                  <span>
                    {' '}
                    for &quot;
                    {debouncedQuery}
                    &quot;
                  </span>
                )}

              </span>
            )}

            {/* ACTIVE FILTER CHIPS */}
            {activeFilterCount > 0 && (

              <div className="active-filter-chips">

                {category !== 'all' && (

                  <span className="filter-chip">

                    {category === 'wallet'
                      ? 'Wallets'
                      : 'Accessories'}

                    <button
                      type="button"
                      onClick={() =>
                        setCategory('all')
                      }
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>

                  </span>

                )}

                {selectedCollection !== 'all' && (

                  <span className="filter-chip">

                    {selectedCollection}

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedCollection('all')
                      }
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>

                  </span>

                )}

                {(priceMin || priceMax) && (

                  <span className="filter-chip">

                    PKR {priceMin || '0'}
                    {' '}
                    —
                    {' '}
                    {priceMax || '∞'}

                    <button
                      type="button"
                      onClick={() => {
                        setPriceMin('');
                        setPriceMax('');
                      }}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>

                  </span>

                )}

                {sortBy !== 'newest' && (

                  <span className="filter-chip">

                    {sortBy === 'price-low'
                      ? 'Price: Low to High'
                      : sortBy === 'price-high'
                      ? 'Price: High to Low'
                      : sortBy === 'name-az'
                      ? 'Name: A to Z'
                      : 'Name: Z to A'}

                    <button
                      type="button"
                      onClick={() =>
                        setSortBy('newest')
                      }
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>

                  </span>

                )}

              </div>

            )}

          </div>

          {/* PRODUCT GRID */}
          <ProductGrid
            products={filteredProducts}
            loading={loading}
            emptyMessage={
              debouncedQuery
                ? `No products found for "${debouncedQuery}". Try adjusting your filters or search terms.`
                : 'No products match your filters. Try adjusting your criteria.'
            }
          />

        </main>

      </div>

      {/* ==========================================
          MOBILE OVERLAY
      ========================================== */}
      {showFilters && (

        <div
          className="filter-overlay-backdrop"
          onClick={() =>
            setShowFilters(false)
          }
        />

      )}

      <StoreFooter />

    </div>
  );
}