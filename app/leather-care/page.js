'use client';

import { useState, useEffect } from 'react';
import StoreHeader from '../../components/StoreHeader';
import StoreFooter from '../../components/StoreFooter';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LeatherCarePage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*')
          .eq('id', 'leathercare')
          .maybeSingle();

        if (error) {
          console.error('Failed to load leather care content:', error);
          setContent(null);
        } else {
          setContent(data);
        }
      } catch (err) {
        console.error('Leather care content error:', err);
        setContent(null);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-[#1c110b] text-[#f5f0eb]">
      <StoreHeader activePage="" />

      {/* Hero */}
      <section className="info-hero">
        <div className="info-hero-content">
          <span className="sub-title">Product Care</span>

          <h1>
            {loading
              ? 'Leather Care Guide'
              : content?.title || 'Leather Care Guide'}
          </h1>

          <div className="info-hero-divider"></div>

          <p>
            Proper care extends the life and beauty of your leather. Follow
            these guidelines to keep your UM-AREX product looking its best.
          </p>
        </div>
      </section>

      {loading ? (
        <section className="info-content">
          <div className="info-section">
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#d4af37',
              }}
            >
              <i
                className="fa-solid fa-spinner fa-spin"
                style={{ fontSize: '28px', marginBottom: '15px' }}
              ></i>

              <p>Loading leather care guide...</p>
            </div>
          </div>
        </section>
      ) : content?.content ? (
        /* Dynamic Supabase Content */
        <section className="info-content">
          <div className="info-section">
            <div className="info-icon-box">
              <i className="fa-solid fa-leather"></i>
            </div>

            <h2>{content.title || 'Leather Care Guide'}</h2>

            <div className="info-divider"></div>

            {content.content.split('\n\n').map((paragraph, index) => (
              <p
                key={index}
                style={{
                  marginBottom: '16px',
                  lineHeight: '1.8',
                  whiteSpace: 'pre-line',
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="info-cta">
            <h3>Need Specific Care Advice?</h3>

            <p>
              Every leather type has unique care needs. Reach out for
              personalized recommendations.
            </p>

            <div className="info-cta-actions">
              <a
                href="https://wa.me/923279595329"
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                <i className="fa-brands fa-whatsapp"></i>
                Chat on WhatsApp
              </a>

              <Link href="/contact" className="btn-secondary-dark">
                Contact Support
              </Link>
            </div>
          </div>
        </section>
      ) : (
        /* Default Content */
        <section className="info-content">

          {/* Understanding Leather */}
          <div className="info-section">
            <div className="info-icon-box">
              <i className="fa-solid fa-droplet"></i>
            </div>

            <h2>Understanding Your Leather</h2>

            <div className="info-divider"></div>

            <p>
              Genuine leather is a natural material that ages beautifully
              with proper care.
            </p>

            <div className="info-card-grid">

              <div className="info-card">
                <i className="fa-solid fa-leaf"></i>
                <h4>Natural Material</h4>
                <p>
                  Slight variations in color and texture are normal and add
                  to the <strong>character</strong> of your product.
                </p>
              </div>

              <div className="info-card">
                <i className="fa-solid fa-sun"></i>
                <h4>Ages with Grace</h4>
                <p>
                  Quality leather develops a rich{' '}
                  <strong>patina over time</strong> — natural and desirable.
                </p>
              </div>

              <div className="info-card">
                <i className="fa-solid fa-hand-sparkles"></i>
                <h4>Unique Texture</h4>
                <p>
                  No two leather pieces are identical. Each UM-AREX product
                  is <strong>truly unique</strong>.
                </p>
              </div>

              <div className="info-card">
                <i className="fa-solid fa-infinity"></i>
                <h4>Built to Last</h4>
                <p>
                  With proper care, premium leather can last{' '}
                  <strong>decades</strong>.
                </p>
              </div>

            </div>
          </div>

          {/* Daily Care */}
          <div className="info-section">
            <div className="info-icon-box">
              <i className="fa-solid fa-spray-can-sparkles"></i>
            </div>

            <h2>Daily Care Routine</h2>

            <div className="info-divider"></div>

            <ul className="info-checklist">

              <li>
                <i className="fa-solid fa-circle-check"></i>
                <strong>Wipe gently</strong> with a soft, dry cloth after
                each use.
              </li>

              <li>
                <i className="fa-solid fa-circle-check"></i>
                <strong>Store properly</strong> in a cool, dry place away
                from direct sunlight.
              </li>

              <li>
                <i className="fa-solid fa-circle-check"></i>
                <strong>Avoid overstuffing</strong> — stretching can weaken
                leather and stitching.
              </li>

              <li>
                <i className="fa-solid fa-circle-check"></i>
                <strong>Keep away from moisture</strong> — if wet, allow it
                to air dry naturally.
              </li>

              <li>
                <i className="fa-solid fa-circle-check"></i>
                <strong>Rotate usage</strong> between products when possible.
              </li>

            </ul>
          </div>

          {/* Cleaning & Conditioning */}
          <div className="info-section">
            <div className="info-icon-box">
              <i className="fa-solid fa-pump-soap"></i>
            </div>

            <h2>Cleaning & Conditioning</h2>

            <div className="info-divider"></div>

            <div className="info-steps">

              <div className="info-step">
                <span className="step-num">1</span>

                <div>
                  <h4>Dust Off</h4>
                  <p>
                    Use a soft-bristled brush or microfiber cloth to remove
                    surface dust.
                  </p>
                </div>
              </div>

              <div className="info-step">
                <span className="step-num">2</span>

                <div>
                  <h4>Clean Gently</h4>
                  <p>
                    Dampen a cloth with water and wipe gently. Use a suitable
                    leather cleaner for stains.
                  </p>
                </div>
              </div>

              <div className="info-step">
                <span className="step-num">3</span>

                <div>
                  <h4>Condition</h4>
                  <p>
                    Apply leather conditioner according to the
                    manufacturer&apos;s instructions, then buff gently.
                  </p>
                </div>
              </div>

              <div className="info-step">
                <span className="step-num">4</span>

                <div>
                  <h4>Protect</h4>
                  <p>
                    Use a leather protector suitable for your leather type
                    when additional protection is needed.
                  </p>
                </div>
              </div>

            </div>

            <div className="info-highlight-box warning">
              <i className="fa-solid fa-triangle-exclamation"></i>

              <div>
                <h4>Important</h4>

                <p>
                  Always test any leather cleaning or conditioning product
                  on a small, hidden area first.
                </p>
              </div>
            </div>
          </div>

          {/* What to Avoid */}
          <div className="info-section">

            <div className="info-icon-box danger">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>

            <h2>What to Avoid</h2>

            <div className="info-divider"></div>

            <ul className="info-checklist negative">

              <li>
                <i className="fa-solid fa-circle-xmark"></i>
                <strong>Direct sunlight</strong> — prolonged exposure can
                fade and dry leather.
              </li>

              <li>
                <i className="fa-solid fa-circle-xmark"></i>
                <strong>Water immersion</strong> — never submerge or machine
                wash leather products.
              </li>

              <li>
                <i className="fa-solid fa-circle-xmark"></i>
                <strong>Harsh chemicals</strong> — avoid bleach, acetone,
                and unsuitable cleaning agents.
              </li>

              <li>
                <i className="fa-solid fa-circle-xmark"></i>
                <strong>Heat sources</strong> — keep leather away from
                radiators, heaters, and hairdryers.
              </li>

              <li>
                <i className="fa-solid fa-circle-xmark"></i>
                <strong>Perfume & cologne</strong> — direct contact can
                cause discoloration.
              </li>

              <li>
                <i className="fa-solid fa-circle-xmark"></i>
                <strong>Plastic wrapping</strong> — use breathable storage
                instead.
              </li>

            </ul>
          </div>

          {/* Storage */}
          <div className="info-section">

            <div className="info-icon-box">
              <i className="fa-solid fa-box-archive"></i>
            </div>

            <h2>Storage Tips</h2>

            <div className="info-divider"></div>

            <div className="info-card-grid">

              <div className="info-card">
                <i className="fa-solid fa-bag-shopping"></i>

                <h4>Use a Dust Bag</h4>

                <p>
                  Store your product in a <strong>cotton dust bag</strong>
                  or breathable fabric pouch.
                </p>
              </div>

              <div className="info-card">
                <i className="fa-solid fa-temperature-low"></i>

                <h4>Cool & Dry</h4>

                <p>
                  Keep leather in a <strong>cool, dry environment</strong>
                  away from excessive humidity.
                </p>
              </div>

              <div className="info-card">
                <i className="fa-solid fa-shapes"></i>

                <h4>Maintain Shape</h4>

                <p>
                  Use <strong>clean tissue paper</strong> to help retain the
                  shape of larger leather products when stored.
                </p>
              </div>

              <div className="info-card">
                <i className="fa-solid fa-layer-group"></i>

                <h4>Don&apos;t Stack</h4>

                <p>
                  Avoid placing heavy items on top of leather products.
                </p>
              </div>

            </div>
          </div>

          {/* CTA */}
          <div className="info-cta">

            <h3>Need Specific Care Advice?</h3>

            <p>
              Every leather type has unique care needs. Reach out for
              personalized recommendations.
            </p>

            <div className="info-cta-actions">

              <a
                href="https://wa.me/923279595329"
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                <i className="fa-brands fa-whatsapp"></i>
                Chat on WhatsApp
              </a>

              <Link href="/contact" className="btn-secondary-dark">
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