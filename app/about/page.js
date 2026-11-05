'use client';

import Link from 'next/link';
import StoreFooter from '../../components/StoreFooter';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#1c110b] text-[#f5f0eb]">

      {/* =========================================================
          HEADER
      ========================================================= */}

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
                <Link href="/about" className="active">
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

      {/* =========================================================
          ABOUT HERO
      ========================================================= */}

      <section
        className="about-hero"
        style={{
          minHeight: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '100px 20px',
          position: 'relative',
          background:
            'linear-gradient(rgba(28,17,11,.70), rgba(28,17,11,.96)), url("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1800&q=85") center/cover no-repeat',
        }}
      >

        <div
          style={{
            maxWidth: '850px',
            position: 'relative',
            zIndex: 2,
          }}
        >

          <span
            style={{
              color: '#d4af37',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '12px',
              letterSpacing: '5px',
            }}
          >
            THE UM-AREX STORY
          </span>

          <h1
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(42px, 7vw, 82px)',
              fontWeight: 500,
              margin: '18px 0',
              lineHeight: 1.05,
            }}
          >
            CRAFTED FOR
            <br />
            <span style={{ color: '#d4af37' }}>
              LEGACY
            </span>
          </h1>

          <p
            style={{
              maxWidth: '680px',
              margin: '0 auto',
              color: '#ddd2ca',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '15px',
              lineHeight: 1.9,
            }}
          >
            UM-AREX Leather represents a passion for
            timeless design, premium craftsmanship,
            and the belief that the things we carry
            should become part of our story.
          </p>

        </div>

      </section>

      {/* =========================================================
          OUR STORY
      ========================================================= */}

      <section
        style={{
          padding: '100px 20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '70px',
            alignItems: 'center',
          }}
        >

          {/* IMAGE */}

          <div
            style={{
              position: 'relative',
            }}
          >

            <div
              style={{
                position: 'absolute',
                top: '-15px',
                left: '-15px',
                width: '100%',
                height: '100%',
                border: '1px solid rgba(212,175,55,.35)',
                zIndex: 0,
              }}
            />

            <img
              src="https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=85"
              alt="Premium leather craftsmanship"
              style={{
                width: '100%',
                height: '520px',
                objectFit: 'cover',
                position: 'relative',
                zIndex: 1,
              }}
            />

          </div>

          {/* TEXT */}

          <div>

            <span
              style={{
                color: '#d4af37',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '12px',
                letterSpacing: '4px',
              }}
            >
              OUR STORY
            </span>

            <h2
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(34px, 5vw, 52px)',
                fontWeight: 500,
                margin: '15px 0 25px',
                lineHeight: 1.15,
              }}
            >
              MORE THAN
              <br />
              <span style={{ color: '#d4af37' }}>
                LEATHER
              </span>
            </h2>

            <p
              style={{
                color: '#bdb3ac',
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.9,
                marginBottom: '20px',
              }}
            >
              At UM-AREX Leather, we believe true
              luxury is found in the details. Our
              collection is created for people who
              appreciate refined design, dependable
              quality, and products that stand the
              test of time.
            </p>

            <p
              style={{
                color: '#bdb3ac',
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.9,
                marginBottom: '20px',
              }}
            >
              From carefully selected materials to
              thoughtful finishing touches, every
              piece is designed to combine elegance
              with everyday functionality.
            </p>

            <p
              style={{
                color: '#bdb3ac',
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.9,
              }}
            >
              We are building UM-AREX as more than
              a leather brand. We are creating a
              collection of timeless essentials that
              can become part of your everyday
              journey.
            </p>

          </div>

        </div>

      </section>

      {/* =========================================================
          PHILOSOPHY
      ========================================================= */}

      <section
        style={{
          background: '#21140d',
          borderTop: '1px solid rgba(212,175,55,.15)',
          borderBottom: '1px solid rgba(212,175,55,.15)',
          padding: '100px 20px',
        }}
      >

        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >

          <span
            style={{
              color: '#d4af37',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '12px',
              letterSpacing: '4px',
            }}
          >
            OUR PHILOSOPHY
          </span>

          <h2
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(34px, 5vw, 55px)',
              fontWeight: 500,
              margin: '18px 0 20px',
            }}
          >
            SIMPLE.
            <br />
            REFINED.
            <br />
            <span style={{ color: '#d4af37' }}>
              TIMELESS.
            </span>
          </h2>

          <p
            style={{
              maxWidth: '700px',
              margin: '0 auto',
              color: '#bdb3ac',
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.9,
            }}
          >
            We focus on the essentials — quality
            materials, thoughtful design, practical
            functionality, and a refined aesthetic.
            Nothing unnecessary. Nothing ordinary.
          </p>

        </div>

      </section>

      {/* =========================================================
          VALUES
      ========================================================= */}

      <section
        style={{
          padding: '100px 20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >

        <div
          style={{
            textAlign: 'center',
            marginBottom: '60px',
          }}
        >

          <span
            style={{
              color: '#d4af37',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '12px',
              letterSpacing: '4px',
            }}
          >
            WHAT DEFINES US
          </span>

          <h2
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(34px, 5vw, 52px)',
              fontWeight: 500,
              marginTop: '15px',
            }}
          >
            OUR VALUES
          </h2>

          <div className="divider"></div>

        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '25px',
          }}
        >

          {/* QUALITY */}

          <div className="about-value-card">

            <div className="about-value-icon">
              <i className="fa-solid fa-gem"></i>
            </div>

            <h3>
              QUALITY
            </h3>

            <p>
              We believe quality should be felt,
              seen, and experienced in every detail.
            </p>

          </div>

          {/* CRAFTSMANSHIP */}

          <div className="about-value-card">

            <div className="about-value-icon">
              <i className="fa-solid fa-scissors"></i>
            </div>

            <h3>
              CRAFTSMANSHIP
            </h3>

            <p>
              Every detail matters. We pursue
              refined finishing and thoughtful
              construction.
            </p>

          </div>

          {/* DESIGN */}

          <div className="about-value-card">

            <div className="about-value-icon">
              <i className="fa-solid fa-pen-ruler"></i>
            </div>

            <h3>
              DESIGN
            </h3>

            <p>
              Our designs balance modern elegance
              with timeless character.
            </p>

          </div>

          {/* TRUST */}

          <div className="about-value-card">

            <div className="about-value-icon">
              <i className="fa-solid fa-handshake"></i>
            </div>

            <h3>
              TRUST
            </h3>

            <p>
              We aim to build lasting relationships
              with every person who chooses UM-AREX.
            </p>

          </div>

        </div>

      </section>

      {/* =========================================================
          BRAND STATEMENT
      ========================================================= */}

      <section
        style={{
          padding: '110px 20px',
          textAlign: 'center',
          background:
            'linear-gradient(rgba(28,17,11,.94), rgba(28,17,11,.98))',
        }}
      >

        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >

          <i
            className="fa-solid fa-quote-left"
            style={{
              color: '#d4af37',
              fontSize: '30px',
              marginBottom: '25px',
            }}
          ></i>

          <h2
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(30px, 5vw, 50px)',
              fontWeight: 400,
              lineHeight: 1.35,
            }}
          >
            “THE BEST THINGS WE CARRY
            <br />
            BECOME PART OF WHO WE ARE.”
          </h2>

          <div
            style={{
              width: '60px',
              height: '1px',
              background: '#d4af37',
              margin: '30px auto',
            }}
          />

          <span
            style={{
              color: '#d4af37',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '11px',
              letterSpacing: '4px',
            }}
          >
            UM-AREX LEATHER
          </span>

        </div>

      </section>

      {/* =========================================================
          CTA
      ========================================================= */}

      <section
        style={{
          padding: '90px 20px',
          textAlign: 'center',
        }}
      >

        <span
          style={{
            color: '#d4af37',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '12px',
            letterSpacing: '4px',
          }}
        >
          DISCOVER THE COLLECTION
        </span>

        <h2
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(32px, 5vw, 50px)',
            fontWeight: 500,
            margin: '15px 0 25px',
          }}
        >
          FIND YOUR SIGNATURE PIECE
        </h2>

        <Link
          href="/collections"
          className="btn-primary"
        >
          EXPLORE COLLECTION
        </Link>

      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <StoreFooter />

    </main>
  );
}