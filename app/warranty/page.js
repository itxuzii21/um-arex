'use client';

import { useState, useEffect } from 'react';
import StoreHeader from '../../components/StoreHeader';
import StoreFooter from '../../components/StoreFooter';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function WarrantyPage() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        /*
         * SITE CONTENT
         * Supabase table: site_content
         *
         * Supabase expects:
         * id = warranty
         */
        const { data, error } = await supabase
          .from('site_content')
          .select('*')
          .eq('id', 'warranty')
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data) {
          const warrantyContent =
            data.content && typeof data.content === 'object'
              ? data.content
              : data;

          setContent(warrantyContent);
        }
      } catch (err) {
        console.error('Failed to load warranty content:', err);
      }
    }

    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-[#1c110b] text-[#f5f0eb]">

      <StoreHeader activePage="" />

      {/* =========================
          HERO
      ========================== */}
      <section className="info-hero">
        <div className="info-hero-content">

          <span className="sub-title">
            Our Promise
          </span>

          <h1>
            {content?.title || 'Warranty Information'}
          </h1>

          <div className="info-hero-divider"></div>

          <p>
            Every UM-AREX product is built to last. Learn about our warranty
            coverage and what it protects.
          </p>

        </div>
      </section>

      {/* =========================
          DYNAMIC CONTENT
      ========================== */}
      {content?.content ? (

        <section className="info-content">

          <div className="info-section">

            <h2>
              {content.title || 'Warranty Information'}
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

          <div className="info-cta">

            <h3>
              Have a Warranty Question?
            </h3>

            <p>
              Our team is happy to help you understand your coverage.
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

        /* =========================
           DEFAULT WARRANTY CONTENT
        ========================== */

        <section className="info-content">

          {/* Warranty Coverage */}
          <div className="info-section">

            <div className="info-icon-box">
              <i className="fa-solid fa-shield-halved"></i>
            </div>

            <h2>
              Warranty Coverage
            </h2>

            <div className="info-divider"></div>

            <p>
              We stand behind the quality of our craftsmanship. Every
              UM-AREX leather product comes with a limited warranty that
              covers manufacturing defects.
            </p>

            <div className="info-card-grid">

              <div className="info-card">
                <i className="fa-solid fa-calendar-check"></i>

                <h4>
                  Warranty Period
                </h4>

                <p>
                  All products are covered for{' '}
                  <strong>6 months</strong> from delivery against
                  manufacturing defects.
                </p>
              </div>

              <div className="info-card">
                <i className="fa-solid fa-hammer"></i>

                <h4>
                  What&apos;s Covered
                </h4>

                <p>
                  Loose stitching, hardware malfunction, leather peeling,
                  and color bleeding under normal usage.
                </p>
              </div>

              <div className="info-card">
                <i className="fa-solid fa-arrows-rotate"></i>

                <h4>
                  Repair or Replace
                </h4>

                <p>
                  We will either <strong>repair</strong> or{' '}
                  <strong>replace</strong> the product at our discretion.
                </p>
              </div>

              <div className="info-card">
                <i className="fa-solid fa-handshake"></i>

                <h4>
                  Hassle-Free Claims
                </h4>

                <p>
                  Contact us via WhatsApp with photos. We respond within{' '}
                  <strong>48 hours</strong>.
                </p>
              </div>

            </div>

          </div>

          {/* Warranty Void Conditions */}
          <div className="info-section">

            <div className="info-icon-box danger">
              <i className="fa-solid fa-ban"></i>
            </div>

            <h2>
              Warranty Void Conditions
            </h2>

            <div className="info-divider"></div>

            <div className="info-highlight-box danger">

              <i className="fa-solid fa-scissors"></i>

              <div>

                <h4>
                  Any Cut or Alteration Voids the Warranty
                </h4>

                <p>
                  If the product has been{' '}
                  <strong>
                    cut, sliced, torn, burned, or altered
                  </strong>{' '}
                  in any way, the warranty is void.
                </p>

              </div>

            </div>

            <h3>
              The warranty does NOT cover:
            </h3>

            <ul className="info-checklist negative">

              <li>
                <i className="fa-solid fa-circle-xmark"></i>
                {' '}
                Cuts, scratches, or punctures on the leather
              </li>

              <li>
                <i className="fa-solid fa-circle-xmark"></i>
                {' '}
                Damage from sharp objects or unauthorized repairs
              </li>

              <li>
                <i className="fa-solid fa-circle-xmark"></i>
                {' '}
                Water exposure, chemical contact, or extreme heat
              </li>

              <li>
                <i className="fa-solid fa-circle-xmark"></i>
                {' '}
                Normal wear and tear including natural patina
              </li>

              <li>
                <i className="fa-solid fa-circle-xmark"></i>
                {' '}
                Damage from overloading or improper care
              </li>

            </ul>

          </div>

          {/* How to Claim */}
          <div className="info-section">

            <div className="info-icon-box">
              <i className="fa-solid fa-clipboard-list"></i>
            </div>

            <h2>
              How to Claim Warranty
            </h2>

            <div className="info-divider"></div>

            <div className="info-steps">

              <div className="info-step">

                <span className="step-num">
                  1
                </span>

                <div>
                  <h4>
                    Document the Issue
                  </h4>

                  <p>
                    Take clear photos of the defect from multiple angles.
                  </p>
                </div>

              </div>

              <div className="info-step">

                <span className="step-num">
                  2
                </span>

                <div>
                  <h4>
                    Contact Support
                  </h4>

                  <p>
                    Send photos + order number to our WhatsApp or email.
                  </p>
                </div>

              </div>

              <div className="info-step">

                <span className="step-num">
                  3
                </span>

                <div>
                  <h4>
                    Assessment
                  </h4>

                  <p>
                    Our team reviews within 48 hours and provides
                    instructions.
                  </p>
                </div>

              </div>

              <div className="info-step">

                <span className="step-num">
                  4
                </span>

                <div>
                  <h4>
                    Resolution
                  </h4>

                  <p>
                    Repair or replacement within 7-14 business days.
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* CTA */}
          <div className="info-cta">

            <h3>
              Have a Warranty Question?
            </h3>

            <p>
              Our team is happy to help you understand your coverage.
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