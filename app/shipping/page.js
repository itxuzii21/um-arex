'use client';

import { useState, useEffect } from 'react';
import StoreHeader from '../../components/StoreHeader';
import StoreFooter from '../../components/StoreFooter';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ShippingPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*')
          .eq('id', 'shipping')
          .maybeSingle();

        if (error) {
          console.error('Failed to load shipping content:', error);
          return;
        }

        if (data) {
          setContent(data);
        }
      } catch (err) {
        console.error('Failed to load shipping content:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-[#1c110b] text-[#f5f0eb]">

      <StoreHeader activePage="" />

      {/* ==========================================
          HERO
      ========================================== */}
      <section className="info-hero">
        <div className="info-hero-content">

          <span className="sub-title">
            Customer Service
          </span>

          <h1>
            {content?.title || 'Shipping & Returns'}
          </h1>

          <div className="info-hero-divider"></div>

          <p>
            Your satisfaction is our priority. Learn about
            our delivery process and return policy.
          </p>

        </div>
      </section>

      {/* ==========================================
          DATABASE CONTENT
      ========================================== */}

      {loading ? (

        <section className="info-content">
          <div
            className="info-section"
            style={{
              textAlign: 'center',
              padding: '60px 20px',
            }}
          >
            <div className="info-icon-box">
              <i className="fa-solid fa-spinner fa-spin"></i>
            </div>

            <h2>
              Loading Information...
            </h2>

            <div className="info-divider"></div>

            <p>
              Please wait while we load our shipping
              and return information.
            </p>
          </div>
        </section>

      ) : content?.content ? (

        <section className="info-content">

          <div className="info-section">

            <h2>
              {content.title || 'Shipping & Returns'}
            </h2>

            <div className="info-divider"></div>

            {String(content.content)
              .split('\n\n')
              .map((paragraph, i) => (
                <p
                  key={i}
                  style={{
                    marginBottom: '16px',
                    lineHeight: '1.8',
                  }}
                >
                  {paragraph}
                </p>
              ))}

          </div>

          {/* CTA */}

          <div className="info-cta">

            <h3>
              Need Help with Your Order?
            </h3>

            <p>
              Our customer support team is available
              to assist you with any shipping or
              return queries.
            </p>

            <div className="info-cta-actions">

              <a
                href="https://wa.me/923279595329"
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                <i className="fa-brands fa-whatsapp"></i>
                {' '}
                Chat on WhatsApp
              </a>

              <Link
                href="/contact"
                className="btn-secondary-dark"
              >
                Contact Support
              </Link>

            </div>

          </div>

        </section>

      ) : (

        /* ==========================================
           DEFAULT SHIPPING + RETURN CONTENT
        ========================================== */

        <section className="info-content">

          {/* SHIPPING POLICY */}

          <div className="info-section">

            <div className="info-icon-box">
              <i className="fa-solid fa-truck-fast"></i>
            </div>

            <h2>
              Shipping Policy
            </h2>

            <div className="info-divider"></div>

            <p>
              We take pride in swift, reliable delivery
              across Pakistan. Every order is carefully
              packaged to ensure your leather product
              arrives in pristine condition.
            </p>

            <div className="info-card-grid">

              <div className="info-card">

                <i className="fa-solid fa-clock"></i>

                <h4>
                  Dispatch Time
                </h4>

                <p>
                  All orders are dispatched within
                  <strong> 24 hours </strong>
                  of confirmation.
                </p>

              </div>

              <div className="info-card">

                <i className="fa-solid fa-money-bill-wave"></i>

                <h4>
                  Delivery Charges
                </h4>

                <p>
                  A flat delivery charge of
                  <strong> Rs 250/- </strong>
                  is applicable for all orders
                  across Pakistan.
                </p>

              </div>

              <div className="info-card">

                <i className="fa-solid fa-map-location-dot"></i>

                <h4>
                  Coverage Area
                </h4>

                <p>
                  We deliver
                  <strong> nationwide </strong>
                  across Pakistan. Delivery typically
                  takes 2-5 business days.
                </p>

              </div>

              <div className="info-card">

                <i className="fa-solid fa-box-open"></i>

                <h4>
                  Order Tracking
                </h4>

                <p>
                  You will receive tracking details
                  on WhatsApp once your order
                  has been dispatched.
                </p>

              </div>

            </div>

          </div>

          {/* RETURN POLICY */}

          <div className="info-section">

            <div className="info-icon-box">
              <i className="fa-solid fa-rotate-left"></i>
            </div>

            <h2>
              Return Policy
            </h2>

            <div className="info-divider"></div>

            <p>
              We want you to be completely satisfied
              with your purchase.
            </p>

            {/* RETURN WARNING */}

            <div className="info-highlight-box warning">

              <i className="fa-solid fa-triangle-exclamation"></i>

              <div>

                <h4>
                  2-Day Return Window
                </h4>

                <p>
                  Returns are only accepted within
                  <strong> 2 days (48 hours) </strong>
                  of receiving your order.
                </p>

              </div>

            </div>

            {/* ELIGIBILITY */}

            <h3>
              Eligibility for Returns
            </h3>

            <ul className="info-checklist">

              <li>
                <i className="fa-solid fa-circle-check"></i>
                {' '}
                Product must be
                <strong> unused, undamaged </strong>
                and in original packaging.
              </li>

              <li>
                <i className="fa-solid fa-circle-check"></i>
                {' '}
                All tags and accessories must
                be intact.
              </li>

              <li>
                <i className="fa-solid fa-circle-check"></i>
                {' '}
                Return request must be made within
                <strong> 48 hours </strong>
                of delivery.
              </li>

            </ul>

            {/* HOW TO RETURN */}

            <h3>
              How to Initiate a Return
            </h3>

            <div className="info-steps">

              <div className="info-step">

                <span className="step-num">
                  1
                </span>

                <div>

                  <h4>
                    Contact Us
                  </h4>

                  <p>
                    Message us on WhatsApp within
                    48 hours with your order number
                    and reason for return.
                  </p>

                </div>

              </div>

              <div className="info-step">

                <span className="step-num">
                  2
                </span>

                <div>

                  <h4>
                    Approval
                  </h4>

                  <p>
                    Our team will provide return
                    instructions within 24 hours.
                  </p>

                </div>

              </div>

              <div className="info-step">

                <span className="step-num">
                  3
                </span>

                <div>

                  <h4>
                    Ship Back
                  </h4>

                  <p>
                    Package the product securely
                    and ship it to the provided
                    return address.
                  </p>

                </div>

              </div>

              <div className="info-step">

                <span className="step-num">
                  4
                </span>

                <div>

                  <h4>
                    Refund
                  </h4>

                  <p>
                    Refund is processed within
                    5-7 business days after
                    inspection.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* ==========================================
              CTA
          ========================================== */}

          <div className="info-cta">

            <h3>
              Need Help with Your Order?
            </h3>

            <p>
              Our customer support team is available
              to assist you.
            </p>

            <div className="info-cta-actions">

              <a
                href="https://wa.me/923279595329"
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                <i className="fa-brands fa-whatsapp"></i>
                {' '}
                Chat on WhatsApp
              </a>

              <Link
                href="/contact"
                className="btn-secondary-dark"
              >
                Contact Support
              </Link>

            </div>

          </div>

        </section>

      )}

      <StoreFooter />

    </div>
  );
}