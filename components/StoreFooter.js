'use client';

import Link from 'next/link';

export default function StoreFooter() {
  return (
    <footer className="store-footer">
      <div className="footer-container">

        {/* =========================
            BRAND
        ========================= */}
        <div className="footer-column footer-brand">

          <Link href="/" className="footer-logo">
            <img
              src="https://imgur.com/7zyXbkn.jpg"
              alt="UM-AREX Leather"
              className="footer-logo-img"
            />
          </Link>

          <p>
            Premium leather goods crafted with timeless
            elegance, refined details, and exceptional
            attention to quality.
          </p>

          {/* =========================
              OUR SOCIAL MEDIA
          ========================= */}
          <div className="footer-social-section">

            <h4 className="footer-social-title">
              OUR SOCIAL MEDIA
            </h4>

            <div className="footer-socials">

              {/* WHATSAPP */}
              <a
                href="https://wa.me/923279595329"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="footer-social-icon"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </a>

              {/* INSTAGRAM */}
              <a
                href="https://www.instagram.com/um__arex"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="footer-social-icon"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>

              {/* TIKTOK */}
              <a
                href="https://www.tiktok.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="footer-social-icon"
              >
                <i className="fa-brands fa-tiktok"></i>
              </a>

              {/* FACEBOOK */}
              <a
                href="https://www.facebook.com/share/19M3uiKEqD/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="footer-social-icon"
              >
                <i className="fa-brands fa-facebook-f"></i>
              </a>

            </div>
          </div>

        </div>

        {/* =========================
            SHOP
        ========================= */}
        <div className="footer-column">

          <h4>SHOP</h4>

          <ul>
            <li>
              <Link href="/collections">
                Collections
              </Link>
            </li>

            <li>
              <Link href="/wallets">
                Wallets
              </Link>
            </li>

            <li>
              <Link href="/accessories">
                Accessories
              </Link>
            </li>

            <li>
              <Link href="/search">
                Search Products
              </Link>
            </li>
          </ul>

        </div>

        {/* =========================
            INFORMATION
        ========================= */}
        <div className="footer-column">

          <h4>INFORMATION</h4>

          <ul>
            <li>
              <Link href="/about">
                About Us
              </Link>
            </li>

            <li>
              <Link href="/contact">
                Contact Us
              </Link>
            </li>

            <li>
              <Link href="/shipping">
                Shipping & Returns
              </Link>
            </li>

            <li>
              <Link href="/leather-care">
                Leather Care
              </Link>
            </li>

            <li>
              <Link href="/warranty">
                Warranty
              </Link>
            </li>
          </ul>

        </div>

        {/* =========================
            CUSTOMER SERVICE
        ========================= */}
        <div className="footer-column">

          <h4>CUSTOMER SERVICE</h4>

          <p>
            Need help with your order?
            <br />
            Our team is here to assist you.
          </p>

          <a
  href="https://wa.me/923279595329"
  target="_blank"
  rel="noopener noreferrer"
  className="footer-whatsapp"
>
  <i className="fa-brands fa-whatsapp"></i>
  Chat on WhatsApp
</a>

<a
  href="https://share.google/yT7gOdAVU3Z1rRYXi"
  target="_blank"
  rel="noopener noreferrer"
  className="footer-contact"
>
  <i className="fa-solid fa-location-dot"></i>
  SHAKARGARH
</a>

        </div>

      </div>

      {/* =========================
          BOTTOM
      ========================= */}
      <div className="footer-bottom">

        <div>
          © {new Date().getFullYear()} UM-AREX LUXURY PVT LTD.
          All Rights Reserved.
        </div>

        <div className="footer-bottom-links">

          <Link href="/shipping">
            Shipping & Returns
          </Link>

          <Link href="/warranty">
            Warranty
          </Link>

          <Link href="/leather-care">
            Leather Care
          </Link>

        </div>

      </div>

    </footer>
  );
}