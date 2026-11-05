'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import StoreFooter from '../../components/StoreFooter';

const SUBJECT_OPTIONS = [
  'General Inquiry',
  'Order Status',
  'Custom Order',
  'Returns & Warranty',
  'Wholesale Partnership',
];

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

const DEFAULT_CONTACT = {
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

  faq1Question:
    'What are your delivery charges and timeline?',
  faq1Answer:
    'Nationwide delivery is Rs 250/- payable in advance. Orders are dispatched within 24 hours of confirmation.',

  faq2Question:
    'Do you accept custom leather orders?',
  faq2Answer:
    'Yes. Share your requirements via the form or WhatsApp and our team will provide a quote and production timeline.',

  faq3Question:
    'What is your response time?',
  faq3Answer:
    'We aim to respond to all inquiries within 24 hours on business days. WhatsApp messages typically receive a faster reply.',
};

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [openFaq, setOpenFaq] = useState(null);
  const [siteContent, setSiteContent] = useState({});

  /*
   * Merge Supabase content with defaults.
   * If the contact content doesn't exist in Supabase,
   * the default values above will be displayed.
   */
  const contact = {
    ...DEFAULT_CONTACT,
    ...(siteContent.contact || {}),
  };

  /*
   * Load Contact page content from Supabase
   */
  useEffect(() => {
    let mounted = true;

    async function fetchContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*');

        if (error) {
          console.error(
            'Failed to load contact content:',
            error
          );
          return;
        }

        if (!mounted) return;

        const content = {};

        (data || []).forEach((row) => {
          if (!row.id) return;

          /*
           * Expected Supabase structure:
           *
           * id = contact
           * content = {
           *   phone: "...",
           *   email: "...",
           *   heroTitle: "...",
           *   ...
           * }
           */

          if (
            row.content &&
            typeof row.content === 'object'
          ) {
            content[row.id] = row.content;
          } else {
            /*
             * Fallback if fields are stored directly
             * inside the Supabase row.
             */
            content[row.id] = row;
          }
        });

        setSiteContent(content);
      } catch (error) {
        console.error(
          'Failed to load site content:',
          error
        );
      }
    }

    fetchContent();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Dynamic contact details
   */
  const dynamicContactDetails = [
    {
      icon: 'fa-solid fa-phone',
      label: 'Phone',
      value: contact.phone,
      href: `tel:${String(contact.phone).replace(/\s/g, '')}`,
    },
    {
      icon: 'fa-solid fa-envelope',
      label: 'Email',
      value: contact.email,
      href: `mailto:${contact.email}`,
    },
    {
      icon: 'fa-brands fa-whatsapp',
      label: 'WhatsApp',
      value: 'Chat with us instantly',
      href: `https://wa.me/${contact.whatsapp}`,
    },
    {
      icon: 'fa-solid fa-location-dot',
      label: 'Location',
      value: contact.location,
      href: null,
    },
  ];

  /*
   * Dynamic FAQ content
   */
  const dynamicFaqItems = [
    {
      question: contact.faq1Question,
      answer: contact.faq1Answer,
    },
    {
      question: contact.faq2Question,
      answer: contact.faq2Answer,
    },
    {
      question: contact.faq3Question,
      answer: contact.faq3Answer,
    },
  ];

  /*
   * Handle form input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * Submit contact form
   *
   * IMPORTANT:
   * This currently keeps the same behavior as your
   * original page. It does NOT save messages to Supabase.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 900)
    );

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData(INITIAL_FORM);
  };

  /*
   * Send another message
   */
  const handleSendAnother = () => {
    setSubmitted(false);
    setFormData(INITIAL_FORM);
  };

  return (
    <div className="min-h-screen bg-[#1c110b] text-[#f5f0eb]">

      {/* =========================
          HEADER
      ========================= */}
      <header>
        <div className="nav-container">

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
                <Link
                  href="/contact"
                  className="active"
                >
                  CONTACT
                </Link>
              </li>
            </ul>
          </nav>

          <div className="nav-icons">

            <Link
              href="/"
              aria-label="Search"
            >
              <i className="fa-solid fa-magnifying-glass"></i>
            </Link>

            <Link
              href="/"
              aria-label="Cart"
            >
              <i className="fa-solid fa-bag-shopping"></i>
            </Link>

          </div>
        </div>
      </header>

      {/* =========================
          HERO
      ========================= */}
      <section className="contact-hero">
        <div className="contact-hero-content">

          <span className="sub-title">
            {contact.heroSubtitle}
          </span>

          <h1>
            {contact.heroTitle}
          </h1>

          <div className="contact-hero-divider"></div>

          <p>
            {contact.heroDescription}
          </p>

        </div>
      </section>

      {/* =========================
          CONTACT SECTION
      ========================= */}
      <section className="contact-section">
        <div className="contact-grid">

          {/* CONTACT INFORMATION */}
          <aside className="contact-info-panel">

            <div className="contact-info-header">
              <h2>
                {contact.reachTitle}
              </h2>

              <p>
                {contact.reachDesc}
              </p>
            </div>

            <div className="contact-cards">

              {dynamicContactDetails.map(
                (item) => (
                  <div
                    key={item.label}
                    className="contact-card"
                  >

                    <div className="contact-card-icon">
                      <i className={item.icon}></i>
                    </div>

                    <div>
                      <span className="contact-card-label">
                        {item.label}
                      </span>

                      {item.href ? (
                        <a
                          href={item.href}
                          target={
                            item.href.startsWith(
                              'http'
                            )
                              ? '_blank'
                              : undefined
                          }
                          rel={
                            item.href.startsWith(
                              'http'
                            )
                              ? 'noreferrer'
                              : undefined
                          }
                          className="contact-card-value"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="contact-card-value">
                          {item.value}
                        </p>
                      )}
                    </div>

                  </div>
                )
              )}

            </div>

            {/* BUSINESS HOURS */}
            <div className="contact-hours">

              <h3>
                {contact.businessHoursTitle}
              </h3>

              <ul>

                <li>
                  <span>
                    {contact.hoursDay1}
                  </span>

                  <span>
                    {contact.hoursTime1}
                  </span>
                </li>

                <li>
                  <span>
                    {contact.hoursDay2}
                  </span>

                  <span>
                    {contact.hoursTime2}
                  </span>
                </li>

              </ul>

            </div>

            {/* WHATSAPP */}
            <a
              href={`https://wa.me/${contact.whatsapp}?text=Hello%20UM-AREX%2C%20I%20would%20like%20to%20inquire%20about%20your%20leather%20products.`}
              target="_blank"
              rel="noreferrer"
              className="contact-whatsapp-btn"
            >
              <i className="fa-brands fa-whatsapp"></i>
              Message on WhatsApp
            </a>

          </aside>

          {/* =========================
              CONTACT FORM
          ========================= */}
          <div className="contact-form-panel">

            {submitted ? (

              <div className="contact-success">

                <div className="contact-success-icon">
                  <i className="fa-solid fa-circle-check"></i>
                </div>

                <h3>
                  Message Received
                </h3>

                <p>
                  Thank you for contacting
                  UM-AREX. A member of our
                  team will respond to your
                  inquiry within 24 hours.
                </p>

                <button
                  type="button"
                  onClick={handleSendAnother}
                  className="contact-reset-btn"
                >
                  Send another message
                </button>

              </div>

            ) : (

              <form
                onSubmit={handleSubmit}
                className="contact-form"
                noValidate
              >

                <div className="contact-form-header">

                  <h3>
                    Send a Message
                  </h3>

                  <p>
                    Complete the form and
                    we will get back to you
                    shortly.
                  </p>

                </div>

                {/* NAME + PHONE */}
                <div className="form-row">

                  <div className="form-group">

                    <label htmlFor="fullName">
                      Full Name
                    </label>

                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder="Your full name"
                      autoComplete="name"
                    />

                  </div>

                  <div className="form-group">

                    <label htmlFor="phone">
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="+92 300 0000000"
                      autoComplete="tel"
                    />

                  </div>

                </div>

                {/* EMAIL */}
                <div className="form-group">

                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />

                </div>

                {/* SUBJECT */}
                <div className="form-group">

                  <label htmlFor="subject">
                    Subject
                  </label>

                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="form-control form-select"
                  >

                    <option
                      value=""
                      disabled
                    >
                      Select a topic
                    </option>

                    {SUBJECT_OPTIONS.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* MESSAGE */}
                <div className="form-group">

                  <label htmlFor="message">
                    Message
                  </label>

                  <textarea
                    id="message"
                    rows="5"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="form-control form-textarea"
                    placeholder="Tell us how we can help you..."
                  ></textarea>

                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  className="contact-submit-btn"
                  disabled={isSubmitting}
                >

                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Sending...
                    </>
                  ) : (
                    'Submit Inquiry'
                  )}

                </button>

              </form>

            )}

          </div>

        </div>
      </section>

      {/* =========================
          FAQ
      ========================= */}
      <section className="contact-faq">

        <div className="contact-faq-inner">

          <div className="section-header">

            <span className="sub-title">
              Support
            </span>

            <h2>
              Frequently Asked Questions
            </h2>

            <div className="divider"></div>

          </div>

          <div className="faq-list">

            {dynamicFaqItems.map(
              (item, index) => (

                <div
                  key={item.question}
                  className={`faq-item${
                    openFaq === index
                      ? ' open'
                      : ''
                  }`}
                >

                  <button
                    type="button"
                    className="faq-question"
                    onClick={() =>
                      setOpenFaq(
                        openFaq === index
                          ? null
                          : index
                      )
                    }
                    aria-expanded={
                      openFaq === index
                    }
                  >

                    <span>
                      {item.question}
                    </span>

                    <i
                      className={`fa-solid ${
                        openFaq === index
                          ? 'fa-minus'
                          : 'fa-plus'
                      }`}
                    ></i>

                  </button>

                  <div className="faq-answer">

                    <p>
                      {item.answer}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>

      {/* =========================
          FOOTER
      ========================= */}
      <StoreFooter />

    </div>
  );
}