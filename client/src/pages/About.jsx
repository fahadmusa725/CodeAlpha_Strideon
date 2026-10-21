import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const HOW_IT_WORKS = [
  {
    title: 'Browse by category',
    description: 'Running, Basketball, Lifestyle and Skate, with size and price filters.',
  },
  {
    title: 'Pick your size',
    description: 'Stock is tracked per colorway and size.',
  },
  {
    title: 'Free shipping over $150',
    description: 'Applied automatically at checkout.',
  },
  {
    title: 'Secure checkout',
    description: 'Card payments are processed by Stripe.',
  },
];

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero__content">
          <span className="about-hero__eyebrow">About Strideon</span>
          <h1 className="about-hero__title">
            Footwear for every kind of day.
          </h1>
          <p className="about-hero__sub">
            Strideon is an online footwear store covering running, basketball, lifestyle and skate. Every style lists its colorways and sizes, and stock is shown per size so you know what is available before you add it to your bag.
          </p>
        </div>
      </section>

      {/* Image Strip */}
      <section className="about-image-strip">
        <div className="about-strip-grid">
          <div className="about-strip-item">
            <img 
              src="/products/running2.jpeg" 
              alt="Performance running shoes on road" 
              className="about-strip-img" 
              loading="lazy"
            />
          </div>
          <div className="about-strip-item">
            <img 
              src="/products/lifestyle2.avif" 
              alt="Lifestyle sneakers on pavement" 
              className="about-strip-img" 
              loading="lazy"
            />
          </div>
          <div className="about-strip-item">
            <img 
              src="/products/skate3.jpeg" 
              alt="Low-top skate shoes" 
              className="about-strip-img" 
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* How Shopping Works */}
      <section className="about-how-it-works">
        <div className="about-section-header">
          <h2 className="about-section-title">How shopping works</h2>
        </div>
        <div className="about-pillars-grid">
          {HOW_IT_WORKS.map((item, idx) => (
            <div key={idx} className="pillar-card">
              <h3 className="pillar-card__title">{item.title}</h3>
              <p className="pillar-card__desc">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing Band */}
      <section className="about-closing-band">
        <div className="about-closing-inner">
          <h2 className="about-closing-title">Find your pair</h2>
          <p className="about-closing-sub">Browse the full range or get in touch if you need help.</p>
          <div className="about-closing-actions">
            <Link to="/products" className="btn about-btn-shop">
              Shop all
            </Link>
            <Link to="/contact" className="btn about-btn-contact">
              Contact
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
