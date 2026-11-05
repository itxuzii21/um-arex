'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { value: 'wallet', label: 'Wallet' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'collection', label: 'Collection Item' },
];

const CATEGORY_LABELS = {
  wallet: 'Wallet',
  accessory: 'Accessory',
  collection: 'Collection',
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [toast, setToast] = useState(null);

  // Add product
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('wallet');
  const [prodCollection, setProdCollection] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [imageUrls, setImageUrls] = useState(['']);
  const [prodDesc, setProdDesc] = useState('');
  const [prodSpecs, setProdSpecs] = useState('');

  // Edit product
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('wallet');
  const [editCollection, setEditCollection] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSpecs, setEditSpecs] = useState('');
  const [editImageUrls, setEditImageUrls] = useState(['']);

  // Site content
  const [contentPage, setContentPage] = useState('shipping');
  const [catalogPage, setCatalogPage] = useState('wallets');
  const [siteContent, setSiteContent] = useState({});
  const [contentLoading, setContentLoading] = useState(false);

  // ============================================================
  // DEFAULT SITE CONTENT
  // ============================================================

  const DEFAULT_CONTENT = {
    home: {
      heroSubtitle: 'PREMIUM LEATHER',
      heroTitle: 'CRAFTED FOR LEGACY',
      heroDescription:
        'Experience the finest quality leather craftsmanship with timeless elegance.',
      heroButtonText: 'SHOP NOW',
      sectionTitle: 'SIGNATURE COLLECTION',
      announcementLines:
        'Free Delivery on Orders Above PKR 3,000 | Premium Leather Goods | Handcrafted in Pakistan',
      featuresSectionTitle: 'Why Choose UM-AREX',

      feature1Icon: 'fa-solid fa-gem',
      feature1Title: 'Premium Quality',
      feature1Desc: 'Sourced from the finest select tanneries.',

      feature2Icon: 'fa-solid fa-scroll',
      feature2Title: 'Timeless Heritage',
      feature2Desc: 'Designs constructed to last generations.',

      feature3Icon: 'fa-solid fa-scissors',
      feature3Title: 'Handcrafted Detail',
      feature3Desc: 'Every stitch executed with absolute perfection.',
    },

    about: {
      heroSubtitle: 'Our Heritage',
      heroTitle: 'The Essence of UM-AREX',
      heroDescription:
        'A Pakistani leather house devoted to craftsmanship, quality, and timeless style — creating wallets and accessories for those who value the finer details.',

      storyTitle: 'Built on Craft, Defined by Quality',

      storyParagraph1:
        'UM-AREX was founded with a clear purpose: to deliver premium leather goods that combine traditional craftsmanship with modern elegance. Based in Shakargarh, we serve customers across Pakistan with products designed to last.',

      storyParagraph2:
        'From selecting the finest hides to the final stitch, every UM-AREX piece reflects our commitment to excellence. We believe luxury is not about excess — it is about materials that age beautifully, construction that endures, and service you can trust.',

      establishedYear: 'Est. 2024',
      location: 'Shakargarh, Pakistan',

      valuesSectionSubtitle: 'What We Stand For',
      valuesSectionTitle: 'Our Core Values',
      valuesSectionDesc:
        'The principles that guide every product we create and every customer we serve.',

      value1Icon: 'fa-solid fa-gem',
      value1Title: 'Premium Quality',
      value1Desc:
        'Full-grain leather sourced from select tanneries, chosen for durability, texture, and lasting character.',

      value2Icon: 'fa-solid fa-scissors',
      value2Title: 'Handcrafted Detail',
      value2Desc:
        'Each wallet and accessory is finished by skilled artisans with precise stitching and refined edge work.',

      value3Icon: 'fa-solid fa-leaf',
      value3Title: 'Timeless Design',
      value3Desc:
        'Classic silhouettes that transcend trends — made to complement your lifestyle for years to come.',

      value4Icon: 'fa-solid fa-shield-halved',
      value4Title: 'Trusted Service',
      value4Desc:
        'Nationwide delivery within 24 hours and dedicated support through WhatsApp, phone, and email.',

      statsSectionSubtitle: 'By The Numbers',
      statsSectionTitle: 'Our Impact',

      stat1Value: '5000+',
      stat1Label: 'Happy Customers',

      stat2Value: '24hr',
      stat2Label: 'Dispatch Time',

      stat3Value: '100%',
      stat3Label: 'Hand-Finished',

      stat4Value: 'PK',
      stat4Label: 'Nationwide Delivery',

      processSectionSubtitle: 'How We Create',
      processSectionTitle: 'The Craftsmanship Process',
      processSectionDesc:
        'From raw leather to a finished piece — every step is handled with care and precision.',

      step1Title: 'Material Selection',
      step1Desc:
        'We inspect every hide for consistency, grain quality, and structural integrity before production begins.',

      step2Title: 'Precision Cutting',
      step2Desc:
        'Patterns are cut with accuracy to minimize waste and ensure each piece maintains its intended form.',

      step3Title: 'Artisan Assembly',
      step3Desc:
        'Experienced craftspeople stitch, burnish, and assemble each product with meticulous attention to detail.',

      step4Title: 'Quality Inspection',
      step4Desc:
        'Every item passes a final review before packaging — ensuring it meets the UM-AREX standard of excellence.',

      storyList1: 'Full-grain and top-grain leather collections',
      storyList2: 'Hand-finished wallets and accessories',
      storyList3: 'Custom orders available on request',

      ctaSubtitle: 'Experience UM-AREX',
      ctaTitle: 'Discover Our Collection',
      ctaDesc:
        'Browse our latest wallets and accessories, or reach out for custom orders and personalized recommendations from our team.',
    },

    contact: {
      phone: '+92 327 9595329',
      email: 'umarex.store1@gmail.com',
      whatsapp: '923279595329',
      location: 'Shakargarh, Pakistan',

      heroSubtitle: 'Customer Support',
      heroTitle: 'Contact UM-AREX',
      heroDescription:
        'Questions about our leather collections, orders, or custom craftsmanship? Our team is here to assist you with a personalized response.',

      reachTitle: 'Reach Our Team',
      reachDesc:
        'Prefer a direct line? Connect with us through any channel below. For the fastest reply, message us on WhatsApp.',

      businessHoursTitle: 'Business Hours',

      hoursDay1: 'Monday – Saturday',
      hoursTime1: '10:00 AM – 8:00 PM',

      hoursDay2: 'Sunday',
      hoursTime2: '12:00 PM – 6:00 PM',

      faq1Question: 'What are your delivery charges and timeline?',
      faq1Answer:
        'Nationwide delivery is Rs 250/- payable in advance. Orders are dispatched within 24 hours of confirmation.',

      faq2Question: 'Do you accept custom leather orders?',
      faq2Answer:
        'Yes. Share your requirements via the form or WhatsApp and our team will provide a quote and production timeline.',

      faq3Question: 'What is your response time?',
      faq3Answer:
        'We aim to respond to all inquiries within 24 hours on business days. WhatsApp messages typically receive a faster reply.',
    },

    shipping: {
      title: 'Shipping & Returns',
      content:
        'We offer nationwide delivery across Pakistan.\n\nDelivery Charges: PKR 250 (payable in advance)\nDispatch Time: Within 24 hours of order confirmation\nEstimated Delivery: 2-4 business days depending on your city\n\nReturns Policy:\nWe accept returns within 7 days of delivery for defective items only. The product must be unused and in its original packaging. Contact us via WhatsApp or email to initiate a return.\n\nExchanges:\nIf you receive a damaged or incorrect item, we will exchange it at no extra cost. Please report any issues within 48 hours of receiving your order.',
    },

    warranty: {
      title: 'Warranty Information',
      content:
        'Every UM-AREX product is backed by our quality guarantee.\n\nCoverage:\nAll UM-AREX leather products come with a 6-month craftsmanship warranty covering manufacturing defects such as stitching failure, hardware malfunction, or leather peeling under normal use.\n\nNot Covered:\n- Normal wear and tear (scratches, color fading, patina development)\n- Damage from improper care, water exposure, or chemical contact\n- Accidental damage or misuse\n\nClaims:\nTo file a warranty claim, contact us via WhatsApp with photos of the issue. Our team will assess and respond within 48 hours.',
    },

    leathercare: {
      title: 'Leather Care Guide',
      content:
        'Proper care ensures your UM-AREX leather goods age beautifully and last for years.\n\nDaily Care:\n- Wipe with a soft, dry cloth after use\n- Avoid prolonged exposure to direct sunlight\n- Keep away from water and moisture\n\nWeekly Care:\n- Apply a small amount of leather conditioner using a soft cloth\n- Buff gently in circular motions\n- Allow to air dry naturally\n\nStorage Tips:\n- Store in a cool, dry place away from humidity\n- Use the provided dust bag when not in use\n- Stuff wallets with tissue paper to maintain shape\n\nAvoid:\n- Harsh chemicals, perfumes, or alcohol-based products\n- Machine washing or submerging in water\n- Excessive heat from hairdryers or radiators',
    },

    wallets: {
      heroSubtitle: 'Everyday Carry',
      heroTitle: 'Premium Wallets',
      heroDescription:
        'Slim, durable, and elegantly crafted — our wallets are designed to age beautifully while keeping your essentials organized. Each piece develops a unique patina over time, making it truly yours.',
      heroButtonText: 'SHOP WALLETS',

      strip1Icon: 'fa-solid fa-shield-halved',
      strip1Title: 'RFID Protection',
      strip1Desc:
        'Built-in RFID blocking technology keeps your cards safe from digital theft.',

      strip2Icon: 'fa-solid fa-feather',
      strip2Title: 'Slim Profile',
      strip2Desc:
        'Engineered to carry more while staying thin enough for front or back pocket.',

      strip3Icon: 'fa-solid fa-infinity',
      strip3Title: 'Ages Beautifully',
      strip3Desc:
        'Premium leather develops a rich patina that tells the story of your journey.',

      strip4Icon: 'fa-solid fa-hand-sparkles',
      strip4Title: 'Hand Stitched',
      strip4Desc:
        'Every seam is saddle-stitched by hand for unmatched durability and strength.',

      showcaseTitle: 'WHY CHOOSE UM-AREX WALLETS',

      showcase1Title: 'Full-Grain Leather',
      showcase1Desc:
        "We use only the highest quality leather — the full top layer of the hide. It's stronger, more durable, and develops character with every use.",

      showcase2Title: 'Hand-Burnished Edges',
      showcase2Desc:
        "Every edge is burnished by hand using traditional techniques, creating smooth, sealed edges that won't fray or deteriorate over time.",

      showcase3Title: 'Waxed Thread Stitching',
      showcase3Desc:
        'Our wallets are stitched with premium waxed polyester thread — stronger than machine stitching and virtually impossible to unravel.',

      showcase4Title: 'Thoughtful Design',
      showcase4Desc:
        'Multiple card slots, bill compartments, and ID windows — designed to organize your essentials without adding bulk to your pocket.',

      productsSectionTitle: 'ALL WALLETS',

      ctaTitle: 'Need Something Custom Made?',
      ctaDesc:
        'We craft bespoke wallets tailored to your exact specifications — choose your leather, color, and layout.',
    },

    accessories: {
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
    },

    collections: {
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
    },

    footer: {
      tagline: 'Premium Leather. Timeless Elegance.',

      instagramUrl:
        'https://www.instagram.com/um__arex?igsh=MWJmbWxvdWZweWc1NQ==',

      tiktokUrl:
        'https://www.tiktok.com/@um__arex?_r=1&_t=ZS-9888c4kH4uS',

      facebookUrl:
        'https://www.facebook.com/profile.php?id=61592505966869',

      whatsappUrl:
        'https://wa.me/923279595329',

      footerLink1: 'Shipping & Returns',
      footerLink1Url: '/shipping',

      footerLink2: 'Warranty Info',
      footerLink2Url: '/warranty',

      footerLink3: 'Leather Care Guide',
      footerLink3Url: '/leather-care',

      footerLink4: 'Contact Support',
      footerLink4Url: '/contact',

      contactPhone: '+92 327 9595329',
      contactEmail: 'umarex.store1@gmail.com',
      contactLocation: 'Shakargarh, Pakistan',

      copyrightText: '© 2026 UM-AREX Luxury Group. All rights reserved.',
    },
  };

  // ============================================================
  // EFFECTS
  // ============================================================

  useEffect(() => {
    fetchLiveInventory();
  }, []);

  useEffect(() => {
    fetchSiteContent();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  // ============================================================
  // TOAST
  // ============================================================

  function showToast(message, type = 'success') {
    setToast({ message, type });
  }

  // ============================================================
  // SUPABASE SITE CONTENT
  // ============================================================

  async function fetchSiteContent() {
    setContentLoading(true);

    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('id, content');

      if (error) {
        throw error;
      }

      const contentData = {};

      (data || []).forEach((row) => {
        contentData[row.id] = row.content || {};
      });

      setSiteContent(contentData);
    } catch (error) {
      console.error('Failed to fetch site content:', error);
      showToast('Failed to load site content.', 'error');
    } finally {
      setContentLoading(false);
    }
  }

  const getContentForPage = (page) => {
    return {
      ...(DEFAULT_CONTENT[page] || {}),
      ...(siteContent[page] || {}),
    };
  };

  const handleContentChange = (page, field, value) => {
    setSiteContent((prev) => ({
      ...prev,
      [page]: {
        ...(prev[page] || {}),
        [field]: value,
      },
    }));
  };

  async function handleSaveContent(page) {
    setContentLoading(true);

    try {
      const data = siteContent[page] || {};

      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: page,
          content: data,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Save failed.');
      }

      showToast(
        `${page.charAt(0).toUpperCase() + page.slice(1)} page content saved!`,
        'success'
      );

      await fetchSiteContent();
    } catch (error) {
      console.error('Failed to save content:', error);
      showToast('Failed to save page content.', 'error');
    } finally {
      setContentLoading(false);
    }
  }

  // ============================================================
  // PRODUCTS
  // ============================================================

  async function fetchLiveInventory() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const items = (data || []).map((product) => ({
        ...product,
        collectionTag: product.collection_tag || '',
        imageUrls: product.image_urls || [],
        imageUrl: product.image_url || '',
        specs: product.specs || [],
      }));

      setProducts(items);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      showToast('Failed to load inventory.', 'error');
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const collectionTags = new Set();

    products.forEach((product) => {
      if (product.collectionTag) {
        collectionTags.add(product.collectionTag);
      }
    });

    return {
      total: products.length,
      wallets: products.filter((p) => p.category === 'wallet').length,
      accessories: products.filter((p) => p.category === 'accessory').length,
      collections: collectionTags.size,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        prod.name?.toLowerCase().includes(query) ||
        prod.collectionTag?.toLowerCase().includes(query);

      const matchesCategory =
        filterCategory === 'all' ||
        prod.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, filterCategory]);

  // ============================================================
  // ADD PRODUCT
  // ============================================================

  const handleAddImageUrlField = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleImageUrlChange = (index, value) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const handleRemoveImageUrlField = (index) => {
    setImageUrls(
      imageUrls.filter((_, i) => i !== index)
    );
  };

  async function handleAddProductSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const filteredImages = imageUrls
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const specsArray = prodSpecs
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const { error } = await supabase
        .from('products')
        .insert({
          name: prodName.trim(),
          category: prodCategory,
          collection_tag: prodCollection.trim(),
          price: Number(prodPrice),
          image_urls: filteredImages,
          image_url: filteredImages[0] || '',
          description: prodDesc.trim(),
          specs: specsArray,
        });

      if (error) {
        throw error;
      }

      showToast('Product published successfully.');

      setProdName('');
      setProdCategory('wallet');
      setProdCollection('');
      setProdPrice('');
      setImageUrls(['']);
      setProdDesc('');
      setProdSpecs('');

      setActiveTab('catalogView');

      await fetchLiveInventory();
    } catch (error) {
      console.error('Failed to publish product:', error);
      showToast('Failed to publish product.', 'error');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // DELETE PRODUCT
  // ============================================================

  async function handleDeleteProduct(id) {
    if (!confirm('Remove this product from the catalog?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      showToast('Product removed.');

      await fetchLiveInventory();
    } catch (error) {
      console.error('Failed to delete product:', error);
      showToast('Failed to delete product.', 'error');
    }
  }

  // ============================================================
  // EDIT PRODUCT
  // ============================================================

  const openEditModal = (prod) => {
    setEditId(prod.id);
    setEditName(prod.name || '');
    setEditCategory(prod.category || 'wallet');
    setEditCollection(prod.collectionTag || '');
    setEditPrice(prod.price || '');
    setEditDescription(prod.description || '');
    setEditSpecs(prod.specs?.join('\n') || '');
    setEditImageUrls(
      prod.imageUrls?.length > 0
        ? [...prod.imageUrls]
        : ['']
    );

    setIsEditModalOpen(true);
  };

  async function handleEditSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const filteredEditImages = editImageUrls
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const editSpecsArray = editSpecs
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const { error } = await supabase
        .from('products')
        .update({
          name: editName.trim(),
          category: editCategory,
          collection_tag: editCollection.trim(),
          price: Number(editPrice),
          description: editDescription.trim(),
          specs: editSpecsArray,
          image_urls: filteredEditImages,
          image_url: filteredEditImages[0] || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', editId);

      if (error) {
        throw error;
      }

      showToast('Product updated successfully.');

      setIsEditModalOpen(false);

      await fetchLiveInventory();
    } catch (error) {
      console.error('Failed to save changes:', error);
      showToast('Failed to save changes.', 'error');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // PAGE TITLES
  // ============================================================

  const pageTitles = {
    dashboard: 'Dashboard',
    catalogView: 'Product Catalog',
    addView: 'Add New Product',
    contentHome: 'Home Page Content',
    contentAbout: 'About Page Content',
    contentContact: 'Contact Page Content',
    contentPolicies: 'Policies & Info Pages',
    contentCatalog: 'Catalog Pages',
    contentFooter: 'Footer & Global Settings',
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="admin-body">
      <div className="admin-container">

        {/* =====================================================
            SIDEBAR
        ====================================================== */}

        <aside className="admin-sidebar">

          <div className="sidebar-header">
            <img
              src="https://imgur.com/7zyXbkn.jpg"
              alt="UM-AREX"
            />
          </div>

          <ul className="sidebar-menu">

            <li>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`sidebar-link ${
                  activeTab === 'dashboard' ? 'active' : ''
                }`}
              >
                <i className="fa-solid fa-chart-pie"></i>
                Dashboard
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => setActiveTab('catalogView')}
                className={`sidebar-link ${
                  activeTab === 'catalogView' ? 'active' : ''
                }`}
              >
                <i className="fa-solid fa-box"></i>
                Products
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => setActiveTab('addView')}
                className={`sidebar-link ${
                  activeTab === 'addView' ? 'active' : ''
                }`}
              >
                <i className="fa-solid fa-plus"></i>
                Add Product
              </button>
            </li>

            <li className="sidebar-divider"></li>

            <li>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('contentHome');
                  setContentPage('home');
                }}
                className={`sidebar-link ${
                  activeTab === 'contentHome' ? 'active' : ''
                }`}
              >
                <i className="fa-solid fa-pen-to-square"></i>
                Home Page
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('contentAbout');
                  setContentPage('about');
                }}
                className={`sidebar-link ${
                  activeTab === 'contentAbout' ? 'active' : ''
                }`}
              >
                <i className="fa-solid fa-building"></i>
                About Page
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('contentContact');
                  setContentPage('contact');
                }}
                className={`sidebar-link ${
                  activeTab === 'contentContact' ? 'active' : ''
                }`}
              >
                <i className="fa-solid fa-address-book"></i>
                Contact Page
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('contentPolicies');
                  setContentPage('shipping');
                }}
                className={`sidebar-link ${
                  activeTab === 'contentPolicies' ? 'active' : ''
                }`}
              >
                <i className="fa-solid fa-file-lines"></i>
                Policies & Info
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('contentCatalog');
                  setCatalogPage('wallets');
                }}
                className={`sidebar-link ${
                  activeTab === 'contentCatalog' ? 'active' : ''
                }`}
              >
                <i className="fa-solid fa-store"></i>
                Catalog Pages
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => setActiveTab('contentFooter')}
                className={`sidebar-link ${
                  activeTab === 'contentFooter' ? 'active' : ''
                }`}
              >
                <i className="fa-solid fa-columns"></i>
                Footer & Global
              </button>
            </li>

            <li className="sidebar-divider"></li>

            <li>
              <Link
                href="/"
                target="_blank"
                className="sidebar-link sidebar-link--external"
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
                View Storefront
              </Link>
            </li>

          </ul>
        </aside>

        {/* =====================================================
            MAIN
        ====================================================== */}

        <main className="admin-main">

          <header className="admin-topbar">

            <div>
              <h2>
                {pageTitles[activeTab] || 'Admin'}
              </h2>

              <p>
                Manage your UM-AREX leather catalog
              </p>
            </div>

            <div className="admin-user">
              <span style={{ color: 'var(--text-muted)' }}>
                Administrator
              </span>

              <div className="admin-user-badge">
                <i className="fa-solid fa-user"></i>
              </div>
            </div>

          </header>

          {/* ===================================================
              DASHBOARD
          ==================================================== */}

          <section
            className={`admin-view ${
              activeTab === 'dashboard'
                ? 'active-view'
                : ''
            }`}
          >

            <div className="admin-stats-grid">

              <div className="admin-stat-card">
                <i className="fa-solid fa-box stat-icon"></i>

                <div className="stat-label">
                  Total Products
                </div>

                <div className="stat-value">
                  {stats.total}
                </div>

                <div className="stat-meta">
                  Live from Supabase
                </div>
              </div>

              <div className="admin-stat-card">
                <i className="fa-solid fa-wallet stat-icon"></i>

                <div className="stat-label">
                  Wallets
                </div>

                <div className="stat-value">
                  {stats.wallets}
                </div>

                <div className="stat-meta">
                  Listed on /wallets
                </div>
              </div>

              <div className="admin-stat-card">
                <i className="fa-solid fa-briefcase stat-icon"></i>

                <div className="stat-label">
                  Accessories
                </div>

                <div className="stat-value">
                  {stats.accessories}
                </div>

                <div className="stat-meta">
                  Listed on /accessories
                </div>
              </div>

              <div className="admin-stat-card">
                <i className="fa-solid fa-layer-group stat-icon"></i>

                <div className="stat-label">
                  Collections
                </div>

                <div className="stat-value">
                  {stats.collections}
                </div>

                <div className="stat-meta">
                  Unique collection tags
                </div>
              </div>

            </div>

            <div className="admin-card">

              <div className="admin-card-header">
                <h3>
                  <i className="fa-solid fa-bolt"></i>
                  Quick Actions
                </h3>
              </div>

              <div className="admin-dashboard-quick">

                <button
                  type="button"
                  className="admin-quick-action"
                  onClick={() => setActiveTab('addView')}
                >
                  <i className="fa-solid fa-plus"></i>

                  <div>
                    <strong>
                      Add New Product
                    </strong>

                    <span>
                      Publish a wallet or accessory listing
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  className="admin-quick-action"
                  onClick={() => setActiveTab('catalogView')}
                >
                  <i className="fa-solid fa-pen"></i>

                  <div>
                    <strong>
                      Manage Catalog
                    </strong>

                    <span>
                      Edit or remove existing products
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  className="admin-quick-action"
                  onClick={fetchLiveInventory}
                >
                  <i className="fa-solid fa-rotate"></i>

                  <div>
                    <strong>
                      Refresh Inventory
                    </strong>

                    <span>
                      Sync latest data from Supabase
                    </span>
                  </div>
                </button>

              </div>
            </div>

          </section>

          {/* ===================================================
              PRODUCT CATALOG
          ==================================================== */}

          <section
            className={`admin-view ${
              activeTab === 'catalogView'
                ? 'active-view'
                : ''
            }`}
          >

            <div className="admin-card">

              <div className="admin-card-header">

                <h3>
                  <i className="fa-solid fa-boxes-stacked"></i>
                  Live Inventory
                </h3>

                <div className="admin-toolbar">

                  <div className="admin-search">

                    <i className="fa-solid fa-magnifying-glass"></i>

                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                    />

                  </div>

                  <div className="admin-filter">

                    <select
                      value={filterCategory}
                      onChange={(e) =>
                        setFilterCategory(e.target.value)
                      }
                    >

                      <option value="all">
                        All Categories
                      </option>

                      {CATEGORIES.map((cat) => (
                        <option
                          key={cat.value}
                          value={cat.value}
                        >
                          {cat.label}
                        </option>
                      ))}

                    </select>

                  </div>

                </div>
              </div>

              <div className="admin-prod-grid">

                {loading && products.length === 0 ? (

                  <div className="admin-empty">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Loading inventory...
                  </div>

                ) : filteredProducts.length === 0 ? (

                  <div className="admin-empty">

                    <i className="fa-solid fa-box-open"></i>

                    {products.length === 0
                      ? 'No products in your database yet. Add your first product to get started.'
                      : 'No products match your search or filter.'}

                  </div>

                ) : (

                  filteredProducts.map((prod) => {

                    const imgList =
                      prod.imageUrls?.length > 0
                        ? prod.imageUrls
                        : [
                            prod.imageUrl ||
                              'https://via.placeholder.com/300',
                          ];

                    const mainImg = imgList[0];

                    return (
                      <div
                        key={prod.id}
                        className="admin-prod-card"
                      >

                        <div className="prod-image-wrap">

                          <span className="category-badge">
                            {CATEGORY_LABELS[prod.category] ||
                              'Uncategorized'}
                          </span>

                          <span className="image-count-badge">
                            <i className="fa-regular fa-images"></i>
                            {' '}
                            {imgList.length}
                          </span>

                          <img
                            src={mainImg}
                            alt={prod.name}
                          />

                        </div>

                        <div className="admin-prod-body">

                          <span className="collection-tag">
                            {prod.collectionTag || 'Premium'}
                          </span>

                          <h4>
                            {prod.name}
                          </h4>

                          <p className="price">
                            PKR{' '}
                            {Number(prod.price).toLocaleString()}
                          </p>

                          {prod.description && (
                            <p className="admin-prod-desc">
                              {prod.description}
                            </p>
                          )}

                          {prod.specs?.length > 0 && (
                            <ul className="admin-prod-specs">

                              {prod.specs
                                .slice(0, 3)
                                .map((spec, i) => (
                                  <li key={i}>
                                    <i className="fa-solid fa-circle-check"></i>
                                    {' '}
                                    {spec}
                                  </li>
                                ))}

                            </ul>
                          )}

                        </div>

                        <div className="admin-prod-actions">

                          <button
                            type="button"
                            className="btn-admin-edit"
                            onClick={() =>
                              openEditModal(prod)
                            }
                          >
                            <i className="fa-solid fa-pen"></i>
                            {' '}
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn-admin-delete"
                            onClick={() =>
                              handleDeleteProduct(prod.id)
                            }
                          >
                            <i className="fa-solid fa-trash-can"></i>
                            {' '}
                            Remove
                          </button>

                        </div>

                      </div>
                    );
                  })

                )}

              </div>

            </div>

          </section>

          {/* ===================================================
              ADD PRODUCT
          ==================================================== */}

          <section
            className={`admin-view ${
              activeTab === 'addView'
                ? 'active-view'
                : ''
            }`}
          >

            <div className="admin-card">

              <div className="admin-card-header">
                <h3>
                  <i className="fa-solid fa-plus"></i>
                  Create Product Listing
                </h3>
              </div>

              <form
                onSubmit={handleAddProductSubmit}
                className="admin-form"
              >

                <div className="admin-form-grid">

                  <div className="form-group">

                    <label>
                      Product Title
                    </label>

                    <input
                      type="text"
                      value={prodName}
                      onChange={(e) =>
                        setProdName(e.target.value)
                      }
                      placeholder="e.g., Slimline Card Holder"
                      required
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Category
                    </label>

                    <select
                      value={prodCategory}
                      onChange={(e) =>
                        setProdCategory(e.target.value)
                      }
                      required
                    >

                      {CATEGORIES.map((cat) => (
                        <option
                          key={cat.value}
                          value={cat.value}
                        >
                          {cat.label}
                        </option>
                      ))}

                    </select>

                  </div>

                  <div className="form-group">

                    <label>
                      Collection Tag
                    </label>

                    <input
                      type="text"
                      value={prodCollection}
                      onChange={(e) =>
                        setProdCollection(e.target.value)
                      }
                      placeholder="e.g., Everyday Elegance"
                      required
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Price (PKR)
                    </label>

                    <input
                      type="number"
                      value={prodPrice}
                      onChange={(e) =>
                        setProdPrice(e.target.value)
                      }
                      placeholder="e.g., 3500"
                      required
                    />

                  </div>

                </div>

                <div className="form-group">

                  <label>
                    Product Images
                    {' '}
                    (URL links ending in .jpg or .png)
                  </label>

                  {imageUrls.map((url, idx) => (

                    <div
                      key={idx}
                      className="image-url-row"
                    >

                      <input
                        type="url"
                        value={url}
                        onChange={(e) =>
                          handleImageUrlChange(
                            idx,
                            e.target.value
                          )
                        }
                        placeholder={
                          idx === 0
                            ? 'Primary image URL'
                            : 'Gallery image URL'
                        }
                        required={idx === 0}
                      />

                      {idx > 0 && (
                        <button
                          type="button"
                          className="btn-remove-url"
                          onClick={() =>
                            handleRemoveImageUrlField(idx)
                          }
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      )}

                    </div>

                  ))}

                  <button
                    type="button"
                    className="btn-add-image"
                    onClick={handleAddImageUrlField}
                  >
                    <i className="fa-solid fa-plus"></i>
                    {' '}
                    Add Gallery Image
                  </button>

                </div>

                <div className="form-group">

                  <label>
                    Short Description
                  </label>

                  <input
                    type="text"
                    value={prodDesc}
                    onChange={(e) =>
                      setProdDesc(e.target.value)
                    }
                    placeholder="Brief subtitle for product card"
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Specifications (one per line)
                  </label>

                  <textarea
                    value={prodSpecs}
                    onChange={(e) =>
                      setProdSpecs(e.target.value)
                    }
                    rows={4}
                    placeholder={
                      'Premium Genuine Leather\nSlim & Compact Pocket Fit\nMulti Card Slots Layout'
                    }
                    required
                  />

                </div>

                <button
                  type="submit"
                  className="btn-admin-submit"
                  disabled={loading}
                >
                  {loading
                    ? 'Publishing...'
                    : 'Publish Product'}
                </button>

              </form>

            </div>

          </section>

          {/* ===================================================
              HOME CONTENT
          ==================================================== */}

          <section
            className={`admin-view ${
              activeTab === 'contentHome'
                ? 'active-view'
                : ''
            }`}
          >

            <div className="admin-card">

              <div className="admin-card-header">
                <h3>
                  <i className="fa-solid fa-house"></i>
                  Edit Home Page
                </h3>
              </div>

              <div className="content-form">

                <div className="form-group">
                  <label>Announcement Bar Text</label>

                  <textarea
                    value={
                      getContentForPage('home')
                        .announcementLines
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'home',
                        'announcementLines',
                        e.target.value
                      )
                    }
                    rows={2}
                    placeholder="Lines separated by | will scroll on announcement bar"
                  />
                </div>

                <div className="form-group">
                  <label>Hero Subtitle</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('home')
                        .heroSubtitle
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'home',
                        'heroSubtitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Hero Title</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('home')
                        .heroTitle
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'home',
                        'heroTitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Hero Description</label>

                  <textarea
                    value={
                      getContentForPage('home')
                        .heroDescription
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'home',
                        'heroDescription',
                        e.target.value
                      )
                    }
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label>Hero Button Text</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('home')
                        .heroButtonText
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'home',
                        'heroButtonText',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Products Section Title</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('home')
                        .sectionTitle
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'home',
                        'sectionTitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    margin: '24px 0 16px',
                  }}
                >
                  Features Section
                </h4>

                <div className="form-group">
                  <label>Section Title</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('home')
                        .featuresSectionTitle
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'home',
                        'featuresSectionTitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                {[1, 2, 3].map((n) => (

                  <div
                    key={n}
                    className="content-faq-block"
                  >

                    <h5
                      style={{
                        color: '#f5f0eb',
                        marginBottom: 8,
                      }}
                    >
                      Feature {n}
                    </h5>

                    <div className="form-group">
                      <label>
                        Icon (FontAwesome class)
                      </label>

                      <input
                        type="text"
                        value={
                          getContentForPage('home')[
                            `feature${n}Icon`
                          ]
                        }
                        onChange={(e) =>
                          handleContentChange(
                            'home',
                            `feature${n}Icon`,
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Title</label>

                      <input
                        type="text"
                        value={
                          getContentForPage('home')[
                            `feature${n}Title`
                          ]
                        }
                        onChange={(e) =>
                          handleContentChange(
                            'home',
                            `feature${n}Title`,
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>

                      <input
                        type="text"
                        value={
                          getContentForPage('home')[
                            `feature${n}Desc`
                          ]
                        }
                        onChange={(e) =>
                          handleContentChange(
                            'home',
                            `feature${n}Desc`,
                            e.target.value
                          )
                        }
                      />
                    </div>

                  </div>

                ))}

                <button
                  type="button"
                  className="btn-admin-submit"
                  onClick={() =>
                    handleSaveContent('home')
                  }
                  disabled={contentLoading}
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  {' '}
                  {contentLoading
                    ? 'Saving...'
                    : 'Save Home Page'}
                </button>

              </div>
            </div>

          </section>

          {/* ===================================================
              ABOUT CONTENT
          ==================================================== */}

          <section
            className={`admin-view ${
              activeTab === 'contentAbout'
                ? 'active-view'
                : ''
            }`}
          >

            <div className="admin-card">

              <div className="admin-card-header">
                <h3>
                  <i className="fa-solid fa-building"></i>
                  Edit About Page
                </h3>
              </div>

              <div className="content-form">

                <div className="form-group">
                  <label>Hero Subtitle</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('about')
                        .heroSubtitle
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'about',
                        'heroSubtitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Hero Title</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('about')
                        .heroTitle
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'about',
                        'heroTitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Hero Description</label>

                  <textarea
                    value={
                      getContentForPage('about')
                        .heroDescription
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'about',
                        'heroDescription',
                        e.target.value
                      )
                    }
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Story Section Title</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('about')
                        .storyTitle
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'about',
                        'storyTitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Story Paragraph 1</label>

                  <textarea
                    value={
                      getContentForPage('about')
                        .storyParagraph1
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'about',
                        'storyParagraph1',
                        e.target.value
                      )
                    }
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Story Paragraph 2</label>

                  <textarea
                    value={
                      getContentForPage('about')
                        .storyParagraph2
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'about',
                        'storyParagraph2',
                        e.target.value
                      )
                    }
                    rows={3}
                  />
                </div>

                <div className="admin-form-grid">

                  <div className="form-group">
                    <label>Established Year Badge</label>

                    <input
                      type="text"
                      value={
                        getContentForPage('about')
                          .establishedYear
                      }
                      onChange={(e) =>
                        handleContentChange(
                          'about',
                          'establishedYear',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>

                    <input
                      type="text"
                      value={
                        getContentForPage('about')
                          .location
                      }
                      onChange={(e) =>
                        handleContentChange(
                          'about',
                          'location',
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    margin: '24px 0 16px',
                  }}
                >
                  Story Checklist
                </h4>

                {[1, 2, 3].map((n) => (

                  <div
                    key={n}
                    className="form-group"
                  >
                    <label>
                      Story Item {n}
                    </label>

                    <input
                      type="text"
                      value={
                        getContentForPage('about')[
                          `storyList${n}`
                        ]
                      }
                      onChange={(e) =>
                        handleContentChange(
                          'about',
                          `storyList${n}`,
                          e.target.value
                        )
                      }
                    />
                  </div>

                ))}

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    margin: '24px 0 16px',
                  }}
                >
                  Values Section
                </h4>

                <div className="form-group">
                  <label>Section Subtitle</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('about')
                        .valuesSectionSubtitle
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'about',
                        'valuesSectionSubtitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Section Title</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('about')
                        .valuesSectionTitle
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'about',
                        'valuesSectionTitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Section Description</label>

                  <textarea
                    value={
                      getContentForPage('about')
                        .valuesSectionDesc
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'about',
                        'valuesSectionDesc',
                        e.target.value
                      )
                    }
                    rows={2}
                  />
                </div>

                {[1, 2, 3, 4].map((n) => (

                  <div
                    key={n}
                    className="content-faq-block"
                  >

                    <h5
                      style={{
                        color: '#f5f0eb',
                        marginBottom: 8,
                      }}
                    >
                      Value {n}
                    </h5>

                    <div className="admin-form-grid">

                      <div className="form-group">
                        <label>
                          Icon (FontAwesome)
                        </label>

                        <input
                          type="text"
                          value={
                            getContentForPage('about')[
                              `value${n}Icon`
                            ]
                          }
                          onChange={(e) =>
                            handleContentChange(
                              'about',
                              `value${n}Icon`,
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Title</label>

                        <input
                          type="text"
                          value={
                            getContentForPage('about')[
                              `value${n}Title`
                            ]
                          }
                          onChange={(e) =>
                            handleContentChange(
                              'about',
                              `value${n}Title`,
                              e.target.value
                            )
                          }
                        />
                      </div>

                    </div>

                    <div className="form-group">
                      <label>Description</label>

                      <textarea
                        value={
                          getContentForPage('about')[
                            `value${n}Desc`
                          ]
                        }
                        onChange={(e) =>
                          handleContentChange(
                            'about',
                            `value${n}Desc`,
                            e.target.value
                          )
                        }
                        rows={2}
                      />
                    </div>

                  </div>

                ))}

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    margin: '24px 0 16px',
                  }}
                >
                  Stats Section
                </h4>

                <div className="admin-form-grid">

                  <div className="form-group">
                    <label>Section Subtitle</label>

                    <input
                      type="text"
                      value={
                        getContentForPage('about')
                          .statsSectionSubtitle
                      }
                      onChange={(e) =>
                        handleContentChange(
                          'about',
                          'statsSectionSubtitle',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Section Title</label>

                    <input
                      type="text"
                      value={
                        getContentForPage('about')
                          .statsSectionTitle
                      }
                      onChange={(e) =>
                        handleContentChange(
                          'about',
                          'statsSectionTitle',
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>

                {[1, 2, 3, 4].map((n) => (

                  <div
                    key={n}
                    className="admin-form-grid"
                  >

                    <div className="form-group">
                      <label>
                        Stat {n} Value
                      </label>

                      <input
                        type="text"
                        value={
                          getContentForPage('about')[
                            `stat${n}Value`
                          ]
                        }
                        onChange={(e) =>
                          handleContentChange(
                            'about',
                            `stat${n}Value`,
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Stat {n} Label
                      </label>

                      <input
                        type="text"
                        value={
                          getContentForPage('about')[
                            `stat${n}Label`
                          ]
                        }
                        onChange={(e) =>
                          handleContentChange(
                            'about',
                            `stat${n}Label`,
                            e.target.value
                          )
                        }
                      />
                    </div>

                  </div>

                ))}

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    margin: '24px 0 16px',
                  }}
                >
                  Process Section
                </h4>

                <div className="form-group">
                  <label>Section Subtitle</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('about')
                        .processSectionSubtitle
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'about',
                        'processSectionSubtitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Section Title</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('about')
                        .processSectionTitle
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'about',
                        'processSectionTitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Section Description</label>

                  <textarea
                    value={
                      getContentForPage('about')
                        .processSectionDesc
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'about',
                        'processSectionDesc',
                        e.target.value
                      )
                    }
                    rows={2}
                  />
                </div>

                {[1, 2, 3, 4].map((n) => (

                  <div
                    key={n}
                    className="content-faq-block"
                  >

                    <h5
                      style={{
                        color: '#f5f0eb',
                        marginBottom: 8,
                      }}
                    >
                      Step {n}
                    </h5>

                    <div className="form-group">
                      <label>Title</label>

                      <input
                        type="text"
                        value={
                          getContentForPage('about')[
                            `step${n}Title`
                          ]
                        }
                        onChange={(e) =>
                          handleContentChange(
                            'about',
                            `step${n}Title`,
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>

                      <textarea
                        value={
                          getContentForPage('about')[
                            `step${n}Desc`
                          ]
                        }
                        onChange={(e) =>
                          handleContentChange(
                            'about',
                            `step${n}Desc`,
                            e.target.value
                          )
                        }
                        rows={2}
                      />
                    </div>

                  </div>

                ))}

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    margin: '24px 0 16px',
                  }}
                >
                  CTA Section
                </h4>

                <div className="form-group">
                  <label>CTA Subtitle</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('about')
                        .ctaSubtitle
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'about',
                        'ctaSubtitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>CTA Title</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('about')
                        .ctaTitle
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'about',
                        'ctaTitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>CTA Description</label>

                  <textarea
                    value={
                      getContentForPage('about')
                        .ctaDesc
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'about',
                        'ctaDesc',
                        e.target.value
                      )
                    }
                    rows={2}
                  />
                </div>

                <button
                  type="button"
                  className="btn-admin-submit"
                  onClick={() =>
                    handleSaveContent('about')
                  }
                  disabled={contentLoading}
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  {' '}
                  {contentLoading
                    ? 'Saving...'
                    : 'Save About Page'}
                </button>

              </div>
            </div>

          </section>

          {/* ===================================================
              CONTACT CONTENT
          ==================================================== */}

          <section
            className={`admin-view ${
              activeTab === 'contentContact'
                ? 'active-view'
                : ''
            }`}
          >

            <div className="admin-card">

              <div className="admin-card-header">
                <h3>
                  <i className="fa-solid fa-address-book"></i>
                  Edit Contact Page
                </h3>
              </div>

              <div className="content-form">

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    marginBottom: '16px',
                  }}
                >
                  Hero Section
                </h4>

                <div className="form-group">
                  <label>Hero Subtitle</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('contact')
                        .heroSubtitle
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'contact',
                        'heroSubtitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Hero Title</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('contact')
                        .heroTitle
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'contact',
                        'heroTitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Hero Description</label>

                  <textarea
                    value={
                      getContentForPage('contact')
                        .heroDescription
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'contact',
                        'heroDescription',
                        e.target.value
                      )
                    }
                    rows={2}
                  />
                </div>

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    margin: '24px 0 16px',
                  }}
                >
                  Reach Section
                </h4>

                <div className="form-group">
                  <label>Section Title</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('contact')
                        .reachTitle
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'contact',
                        'reachTitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Section Description</label>

                  <textarea
                    value={
                      getContentForPage('contact')
                        .reachDesc
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'contact',
                        'reachDesc',
                        e.target.value
                      )
                    }
                    rows={2}
                  />
                </div>

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    margin: '24px 0 16px',
                  }}
                >
                  Contact Details
                </h4>

                <div className="admin-form-grid">

                  <div className="form-group">
                    <label>Phone Number</label>

                    <input
                      type="text"
                      value={
                        getContentForPage('contact')
                          .phone
                      }
                      onChange={(e) =>
                        handleContentChange(
                          'contact',
                          'phone',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>

                    <input
                      type="text"
                      value={
                        getContentForPage('contact')
                          .email
                      }
                      onChange={(e) =>
                        handleContentChange(
                          'contact',
                          'email',
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>

                <div className="admin-form-grid">

                  <div className="form-group">
                    <label>
                      WhatsApp Number (no + sign)
                    </label>

                    <input
                      type="text"
                      value={
                        getContentForPage('contact')
                          .whatsapp
                      }
                      onChange={(e) =>
                        handleContentChange(
                          'contact',
                          'whatsapp',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>

                    <input
                      type="text"
                      value={
                        getContentForPage('contact')
                          .location
                      }
                      onChange={(e) =>
                        handleContentChange(
                          'contact',
                          'location',
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    margin: '24px 0 16px',
                  }}
                >
                  Business Hours
                </h4>

                <div className="form-group">
                  <label>Section Title</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('contact')
                        .businessHoursTitle
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'contact',
                        'businessHoursTitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="admin-form-grid">

                  <div className="form-group">
                    <label>Day Range 1</label>

                    <input
                      type="text"
                      value={
                        getContentForPage('contact')
                          .hoursDay1
                      }
                      onChange={(e) =>
                        handleContentChange(
                          'contact',
                          'hoursDay1',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Time Range 1</label>

                    <input
                      type="text"
                      value={
                        getContentForPage('contact')
                          .hoursTime1
                      }
                      onChange={(e) =>
                        handleContentChange(
                          'contact',
                          'hoursTime1',
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>

                <div className="admin-form-grid">

                  <div className="form-group">
                    <label>Day Range 2</label>

                    <input
                      type="text"
                      value={
                        getContentForPage('contact')
                          .hoursDay2
                      }
                      onChange={(e) =>
                        handleContentChange(
                          'contact',
                          'hoursDay2',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Time Range 2</label>

                    <input
                      type="text"
                      value={
                        getContentForPage('contact')
                          .hoursTime2
                      }
                      onChange={(e) =>
                        handleContentChange(
                          'contact',
                          'hoursTime2',
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    margin: '24px 0 16px',
                  }}
                >
                  FAQ Section
                </h4>

                {[1, 2, 3].map((n) => (

                  <div
                    key={n}
                    className="content-faq-block"
                  >

                    <div className="form-group">
                      <label>
                        FAQ {n} - Question
                      </label>

                      <input
                        type="text"
                        value={
                          getContentForPage('contact')[
                            `faq${n}Question`
                          ]
                        }
                        onChange={(e) =>
                          handleContentChange(
                            'contact',
                            `faq${n}Question`,
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        FAQ {n} - Answer
                      </label>

                      <textarea
                        value={
                          getContentForPage('contact')[
                            `faq${n}Answer`
                          ]
                        }
                        onChange={(e) =>
                          handleContentChange(
                            'contact',
                            `faq${n}Answer`,
                            e.target.value
                          )
                        }
                        rows={2}
                      />
                    </div>

                  </div>

                ))}

                <button
                  type="button"
                  className="btn-admin-submit"
                  onClick={() =>
                    handleSaveContent('contact')
                  }
                  disabled={contentLoading}
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  {' '}
                  {contentLoading
                    ? 'Saving...'
                    : 'Save Contact Page'}
                </button>

              </div>
            </div>

          </section>

          {/* ===================================================
              POLICIES
          ==================================================== */}

          <section
            className={`admin-view ${
              activeTab === 'contentPolicies'
                ? 'active-view'
                : ''
            }`}
          >

            <div className="admin-card">

              <div className="admin-card-header">

                <h3>
                  <i className="fa-solid fa-file-lines"></i>
                  Edit Policies & Info Pages
                </h3>

                <div className="policy-tabs">

                  <button
                    type="button"
                    className={`policy-tab ${
                      contentPage === 'shipping'
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      setContentPage('shipping')
                    }
                  >
                    Shipping
                  </button>

                  <button
                    type="button"
                    className={`policy-tab ${
                      contentPage === 'warranty'
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      setContentPage('warranty')
                    }
                  >
                    Warranty
                  </button>

                  <button
                    type="button"
                    className={`policy-tab ${
                      contentPage === 'leathercare'
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      setContentPage('leathercare')
                    }
                  >
                    Leather Care
                  </button>

                </div>
              </div>

              <div className="content-form">

                <div className="form-group">

                  <label>
                    Page Title
                  </label>

                  <input
                    type="text"
                    value={
                      getContentForPage(contentPage)
                        .title || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        contentPage,
                        'title',
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    Page Content
                  </label>

                  <textarea
                    value={
                      getContentForPage(contentPage)
                        .content || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        contentPage,
                        'content',
                        e.target.value
                      )
                    }
                    rows={12}
                    placeholder="Write your page content here. Use blank lines to separate paragraphs."
                  />

                </div>

                <button
                  type="button"
                  className="btn-admin-submit"
                  onClick={() =>
                    handleSaveContent(contentPage)
                  }
                  disabled={contentLoading}
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  {' '}
                  {contentLoading
                    ? 'Saving...'
                    : `Save ${
                        contentPage
                          .charAt(0)
                          .toUpperCase() +
                        contentPage.slice(1)
                      } Page`}
                </button>

              </div>
            </div>

          </section>

          {/* ===================================================
              CATALOG PAGE CONTENT
          ==================================================== */}

          <section
            className={`admin-view ${
              activeTab === 'contentCatalog'
                ? 'active-view'
                : ''
            }`}
          >

            <div className="admin-card">

              <div className="admin-card-header">

                <h3>
                  <i className="fa-solid fa-store"></i>
                  Edit Catalog Pages
                </h3>

                <div className="policy-tabs">

                  <button
                    type="button"
                    className={`policy-tab ${
                      catalogPage === 'wallets'
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      setCatalogPage('wallets')
                    }
                  >
                    Wallets
                  </button>

                  <button
                    type="button"
                    className={`policy-tab ${
                      catalogPage === 'accessories'
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      setCatalogPage('accessories')
                    }
                  >
                    Accessories
                  </button>

                  <button
                    type="button"
                    className={`policy-tab ${
                      catalogPage === 'collections'
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      setCatalogPage('collections')
                    }
                  >
                    Collections
                  </button>

                </div>
              </div>

              <div className="content-form">

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    marginBottom: '16px',
                  }}
                >
                  Hero Section
                </h4>

                <div className="form-group">
                  <label>Hero Subtitle</label>

                  <input
                    type="text"
                    value={
                      getContentForPage(catalogPage)
                        .heroSubtitle || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        catalogPage,
                        'heroSubtitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Hero Title</label>

                  <input
                    type="text"
                    value={
                      getContentForPage(catalogPage)
                        .heroTitle || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        catalogPage,
                        'heroTitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Hero Description</label>

                  <textarea
                    value={
                      getContentForPage(catalogPage)
                        .heroDescription || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        catalogPage,
                        'heroDescription',
                        e.target.value
                      )
                    }
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Hero Button Text</label>

                  <input
                    type="text"
                    value={
                      getContentForPage(catalogPage)
                        .heroButtonText || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        catalogPage,
                        'heroButtonText',
                        e.target.value
                      )
                    }
                  />
                </div>

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    margin: '24px 0 16px',
                  }}
                >
                  Brand Strip (4 Features)
                </h4>

                {[1, 2, 3, 4].map((n) => (

                  <div
                    key={n}
                    className="content-faq-block"
                  >

                    <h5
                      style={{
                        color: '#f5f0eb',
                        marginBottom: 8,
                      }}
                    >
                      Strip Item {n}
                    </h5>

                    <div className="admin-form-grid">

                      <div className="form-group">
                        <label>
                          Icon (FontAwesome)
                        </label>

                        <input
                          type="text"
                          value={
                            getContentForPage(
                              catalogPage
                            )[
                              `strip${n}Icon`
                            ] || ''
                          }
                          onChange={(e) =>
                            handleContentChange(
                              catalogPage,
                              `strip${n}Icon`,
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Title</label>

                        <input
                          type="text"
                          value={
                            getContentForPage(
                              catalogPage
                            )[
                              `strip${n}Title`
                            ] || ''
                          }
                          onChange={(e) =>
                            handleContentChange(
                              catalogPage,
                              `strip${n}Title`,
                              e.target.value
                            )
                          }
                        />
                      </div>

                    </div>

                    <div className="form-group">
                      <label>Description</label>

                      <textarea
                        value={
                          getContentForPage(
                            catalogPage
                          )[
                            `strip${n}Desc`
                          ] || ''
                        }
                        onChange={(e) =>
                          handleContentChange(
                            catalogPage,
                            `strip${n}Desc`,
                            e.target.value
                          )
                        }
                        rows={2}
                      />
                    </div>

                  </div>

                ))}

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    margin: '24px 0 16px',
                  }}
                >
                  Showcase Section
                </h4>

                <div className="form-group">
                  <label>
                    Showcase Section Title
                  </label>

                  <input
                    type="text"
                    value={
                      getContentForPage(catalogPage)
                        .showcaseTitle || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        catalogPage,
                        'showcaseTitle',
                        e.target.value
                      )
                    }
                  />
                </div>

                {[1, 2, 3, 4].map((n) => (

                  <div
                    key={n}
                    className="content-faq-block"
                  >

                    <h5
                      style={{
                        color: '#f5f0eb',
                        marginBottom: 8,
                      }}
                    >
                      Showcase Item {n}
                    </h5>

                    <div className="form-group">
                      <label>Title</label>

                      <input
                        type="text"
                        value={
                          getContentForPage(
                            catalogPage
                          )[
                            `showcase${n}Title`
                          ] || ''
                        }
                        onChange={(e) =>
                          handleContentChange(
                            catalogPage,
                            `showcase${n}Title`,
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>

                      <textarea
                        value={
                          getContentForPage(
                            catalogPage
                          )[
                            `showcase${n}Desc`
                          ] || ''
                        }
                        onChange={(e) =>
                          handleContentChange(
                            catalogPage,
                            `showcase${n}Desc`,
                            e.target.value
                          )
                        }
                        rows={2}
                      />
                    </div>

                  </div>

                ))}

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    margin: '24px 0 16px',
                  }}
                >
                  Products Section
                </h4>

                <div className="form-group">

                  <label>
                    Products Section Title
                  </label>

                  <input
                    type="text"
                    value={
                      getContentForPage(catalogPage)
                        .productsSectionTitle || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        catalogPage,
                        'productsSectionTitle',
                        e.target.value
                      )
                    }
                  />

                </div>

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    margin: '24px 0 16px',
                  }}
                >
                  CTA Section
                </h4>

                <div className="form-group">

                  <label>
                    CTA Title
                  </label>

                  <input
                    type="text"
                    value={
                      getContentForPage(catalogPage)
                        .ctaTitle || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        catalogPage,
                        'ctaTitle',
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    CTA Description
                  </label>

                  <textarea
                    value={
                      getContentForPage(catalogPage)
                        .ctaDesc || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        catalogPage,
                        'ctaDesc',
                        e.target.value
                      )
                    }
                    rows={2}
                  />

                </div>

                <button
                  type="button"
                  className="btn-admin-submit"
                  onClick={() =>
                    handleSaveContent(catalogPage)
                  }
                  disabled={contentLoading}
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  {' '}
                  {contentLoading
                    ? 'Saving...'
                    : `Save ${
                        catalogPage
                          .charAt(0)
                          .toUpperCase() +
                        catalogPage.slice(1)
                      } Page`}
                </button>

              </div>
            </div>

          </section>

          {/* ===================================================
              FOOTER
          ==================================================== */}

          <section
            className={`admin-view ${
              activeTab === 'contentFooter'
                ? 'active-view'
                : ''
            }`}
          >

            <div className="admin-card">

              <div className="admin-card-header">
                <h3>
                  <i className="fa-solid fa-columns"></i>
                  Edit Footer & Global Settings
                </h3>
              </div>

              <div className="content-form">

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    marginBottom: '16px',
                  }}
                >
                  Footer Branding
                </h4>

                <div className="form-group">
                  <label>Tagline</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('footer')
                        .tagline || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'footer',
                        'tagline',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Copyright Text</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('footer')
                        .copyrightText || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'footer',
                        'copyrightText',
                        e.target.value
                      )
                    }
                  />
                </div>

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    margin: '24px 0 16px',
                  }}
                >
                  Social Media Links
                </h4>

                <div className="form-group">
                  <label>Instagram URL</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('footer')
                        .instagramUrl || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'footer',
                        'instagramUrl',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>TikTok URL</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('footer')
                        .tiktokUrl || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'footer',
                        'tiktokUrl',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Facebook URL</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('footer')
                        .facebookUrl || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'footer',
                        'facebookUrl',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>WhatsApp URL</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('footer')
                        .whatsappUrl || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'footer',
                        'whatsappUrl',
                        e.target.value
                      )
                    }
                  />
                </div>

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    margin: '24px 0 16px',
                  }}
                >
                  Customer Service Links
                </h4>

                {[1, 2, 3, 4].map((n) => (

                  <div
                    key={n}
                    className="admin-form-grid"
                  >

                    <div className="form-group">
                      <label>
                        Link {n} Text
                      </label>

                      <input
                        type="text"
                        value={
                          getContentForPage(
                            'footer'
                          )[
                            `footerLink${n}`
                          ] || ''
                        }
                        onChange={(e) =>
                          handleContentChange(
                            'footer',
                            `footerLink${n}`,
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Link {n} URL
                      </label>

                      <input
                        type="text"
                        value={
                          getContentForPage(
                            'footer'
                          )[
                            `footerLink${n}Url`
                          ] || ''
                        }
                        onChange={(e) =>
                          handleContentChange(
                            'footer',
                            `footerLink${n}Url`,
                            e.target.value
                          )
                        }
                      />
                    </div>

                  </div>

                ))}

                <h4
                  style={{
                    color: 'var(--accent-gold)',
                    margin: '24px 0 16px',
                  }}
                >
                  Contact Info (Footer)
                </h4>

                <div className="form-group">
                  <label>Phone</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('footer')
                        .contactPhone || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'footer',
                        'contactPhone',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('footer')
                        .contactEmail || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'footer',
                        'contactEmail',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>

                  <input
                    type="text"
                    value={
                      getContentForPage('footer')
                        .contactLocation || ''
                    }
                    onChange={(e) =>
                      handleContentChange(
                        'footer',
                        'contactLocation',
                        e.target.value
                      )
                    }
                  />
                </div>

                <button
                  type="button"
                  className="btn-admin-submit"
                  onClick={() =>
                    handleSaveContent('footer')
                  }
                  disabled={contentLoading}
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  {' '}
                  {contentLoading
                    ? 'Saving...'
                    : 'Save Footer Settings'}
                </button>

              </div>
            </div>

          </section>

        </main>
      </div>

      {/* =======================================================
          EDIT PRODUCT MODAL
      ======================================================== */}

      {isEditModalOpen && (

        <div
          className="admin-modal-overlay"
          onClick={() =>
            setIsEditModalOpen(false)
          }
        >

          <div
            className="admin-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h3>
              <i className="fa-solid fa-pen-to-square"></i>
              Edit Product
            </h3>

            <form onSubmit={handleEditSubmit}>

              <div className="form-group">

                <label>
                  Product Name
                </label>

                <input
                  type="text"
                  value={editName}
                  onChange={(e) =>
                    setEditName(e.target.value)
                  }
                  required
                />

              </div>

              <div className="admin-modal-row">

                <div className="form-group">

                  <label>
                    Category
                  </label>

                  <select
                    value={editCategory}
                    onChange={(e) =>
                      setEditCategory(e.target.value)
                    }
                    required
                  >

                    {CATEGORIES.map((cat) => (
                      <option
                        key={cat.value}
                        value={cat.value}
                      >
                        {cat.label}
                      </option>
                    ))}

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Price (PKR)
                  </label>

                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) =>
                      setEditPrice(e.target.value)
                    }
                    required
                  />

                </div>

              </div>

              <div className="form-group">

                <label>
                  Collection Tag
                </label>

                <input
                  type="text"
                  value={editCollection}
                  onChange={(e) =>
                    setEditCollection(e.target.value)
                  }
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  value={editDescription}
                  onChange={(e) =>
                    setEditDescription(e.target.value)
                  }
                  rows={2}
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Specifications (one per line)
                </label>

                <textarea
                  value={editSpecs}
                  onChange={(e) =>
                    setEditSpecs(e.target.value)
                  }
                  rows={3}
                  placeholder={
                    'Premium Genuine Leather\nSlim & Compact Pocket Fit'
                  }
                />

              </div>

              <div className="form-group">

                <label>
                  Product Images (URL links)
                </label>

                {editImageUrls.map((url, idx) => (

                  <div
                    key={idx}
                    className="image-url-row"
                  >

                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {

                        const updated = [
                          ...editImageUrls,
                        ];

                        updated[idx] =
                          e.target.value;

                        setEditImageUrls(
                          updated
                        );
                      }}
                      placeholder={
                        idx === 0
                          ? 'Primary image URL'
                          : 'Gallery image URL'
                      }
                      required={idx === 0}
                    />

                    {idx > 0 && (

                      <button
                        type="button"
                        className="btn-remove-url"
                        onClick={() =>
                          setEditImageUrls(
                            editImageUrls.filter(
                              (_, i) =>
                                i !== idx
                            )
                          )
                        }
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>

                    )}

                  </div>

                ))}

                <button
                  type="button"
                  className="btn-add-image"
                  onClick={() =>
                    setEditImageUrls([
                      ...editImageUrls,
                      '',
                    ])
                  }
                >
                  <i className="fa-solid fa-plus"></i>
                  {' '}
                  Add Image
                </button>

              </div>

              <div className="admin-modal-actions">

                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() =>
                    setIsEditModalOpen(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-modal-save"
                  disabled={loading}
                >
                  {loading
                    ? 'Saving...'
                    : 'Save Changes'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =======================================================
          TOAST
      ======================================================== */}

      {toast && (

        <div
          className={`admin-toast admin-toast--${toast.type}`}
        >

          <i
            className={`fa-solid ${
              toast.type === 'success'
                ? 'fa-circle-check'
                : 'fa-circle-exclamation'
            }`}
          ></i>

          {toast.message}

        </div>

      )}

    </div>
  );
}