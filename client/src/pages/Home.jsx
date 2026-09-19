import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ui/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import './Home.css';

const CATEGORIES = [
  { label: 'Running', emoji: '⚡', desc: 'Performance & Velocity', count: '14 Drops' },
  { label: 'Basketball', emoji: '🏀', desc: 'Court Dominance & Grip', count: '18 Drops' },
  { label: 'Lifestyle', emoji: '✦', desc: 'Underground Street Style', count: '26 Drops' },
  { label: 'Skate', emoji: '🛹', desc: 'Reinforced Board Feel', count: '12 Drops' },
];

const PERKS = [
  { icon: '🚀', title: 'FAST WORLDWIDE DISPATCH', desc: 'Orders packed within 24h' },
  { icon: '🛡️', title: '100% VERIFIED AUTHENTIC', desc: 'Double checked by our sneaker lab' },
  { icon: '🔄', title: '30-DAY EASY RETURNS', desc: 'Hassle-free size & color swaps' },
  { icon: '🔥', title: 'EXCLUSIVE MEMBER DROPS', desc: 'Early access to rare colorways' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/featured')
      .then(({ data }) => setFeatured(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__glow-sphere" aria-hidden="true" />
        
        <div className="hero__content container">
          <div className="hero__badge-row">
            <span className="badge badge-orange hero__live-pill">
              <span className="pulse-dot" /> LIVE DROP // SS26
            </span>
            <span className="hero__tagline-sub">LIMITED PRODUCTION BATCH</span>
          </div>

          <h1 className="text-display hero__headline">
            MOVE<br />
            <span className="hero__headline--accent">DIFFERENTLY.</span>
          </h1>

          <p className="hero__sub">
            Precision-engineered athletic kicks and curated streetwear grails. 
            Elevating sneaker culture through authenticity, uncompromising design, and underground energy.
          </p>

          <div className="hero__ctas">
            <Link to="/products" className="btn btn-primary btn-lg hero__cta-primary" id="hero-shop-btn">
              <span>Shop All Drops</span>
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/products?category=Lifestyle" className="btn btn-outline btn-lg hero__cta-secondary">
              Explore Lifestyle
            </Link>
            <Link to="/about" className="btn btn-ghost btn-lg">
              Our Story
            </Link>
          </div>

          {/* Hero Quick Stats */}
          <div className="hero__stats-row">
            <div className="hero-stat-item">
              <strong>100%</strong>
              <span>Verified Authentic</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <strong>24H</strong>
              <span>Express Dispatch</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <strong>4.9★</strong>
              <span>Community Rating</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Graphic element */}
        <div className="hero__visual-wrap" aria-hidden="true">
          <div className="hero__floating-card hero__floating-card--1">
            <span className="floating-tag">NYC // SOHO</span>
            <span className="floating-sub">Archive Drop 004</span>
          </div>
          <div className="hero__floating-card hero__floating-card--2">
            <span className="floating-tag">✓ VERIFIED</span>
            <span className="floating-sub">Authentic Guarantee</span>
          </div>
          <div className="hero__circle-graphic" />
        </div>

        <div className="hero__scroll-hint">
          <span className="text-upper text-muted text-xs">Scroll to explore</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* Value Perks Strip */}
      <section className="perks-strip">
        <div className="container perks-grid">
          {PERKS.map((perk, idx) => (
            <div key={idx} className="perk-item">
              <span className="perk-icon">{perk.icon}</span>
              <div className="perk-info">
                <h4 className="perk-title">{perk.title}</h4>
                <p className="perk-desc">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Drops — 4 cards per row */}
      <section className="section container">
        <div className="section-header">
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
              <span className="badge badge-orange">Hot Right Now</span>
              <span className="text-upper text-muted text-xs">Updated Daily</span>
            </div>
            <h2 className="text-headline">WHAT'S HOT RIGHT NOW</h2>
          </div>
          <Link to="/products" className="btn btn-outline btn-sm">
            View All Drops ({featured.length || '8+'}) →
          </Link>
        </div>

        <div className="grid-4" style={{ marginTop: '2.5rem' }}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : featured.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="section container" style={{ paddingTop: '1rem' }}>
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <div>
            <p className="text-upper text-orange" style={{ marginBottom: '0.25rem' }}>Curated Selections</p>
            <h2 className="text-headline">SHOP BY DISCIPLINE</h2>
          </div>
          <Link to="/products" className="text-orange text-sm font-semibold">
            All Categories →
          </Link>
        </div>

        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <Link
              to={`/products?category=${cat.label}`}
              key={cat.label}
              className="category-card"
              id={`cat-${cat.label.toLowerCase()}`}
            >
              <div className="category-card__header">
                <span className="category-card__emoji">{cat.emoji}</span>
                <span className="category-card__count">{cat.count}</span>
              </div>
              <h3 className="category-card__label">{cat.label}</h3>
              <p className="category-card__desc text-sm">{cat.desc}</p>
              <div className="category-card__action">
                <span>Explore Series</span>
                <span className="category-card__arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial Streetwear Banner */}
      <section className="section container" style={{ paddingTop: '1rem' }}>
        <div className="editorial-banner">
          <div className="editorial-banner__content">
            <span className="badge badge-orange">Editorial Spotlight</span>
            <h2 className="text-headline" style={{ marginTop: '1rem', fontSize: 'clamp(1.8rem, 4vw, 2.75rem)' }}>
              THE UNDERGROUND<br />STREETWEAR ARCHIVE
            </h2>
            <p className="editorial-banner__desc">
              Explore rare prototypes, deadstock heritage silhouettes, and artist collaborative colorways that defined modern sneaker culture.
            </p>
            <div className="editorial-banner__actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                Explore The Archive →
              </Link>
              <Link to="/about" className="btn btn-outline btn-lg">
                Read The Manifesto
              </Link>
            </div>
          </div>
          <div className="editorial-banner__art" aria-hidden="true">
            <div className="art-box">
              <span className="art-box__title">STRIDEON LAB</span>
              <span className="art-box__code">BATCH // 0984-NYC</span>
              <div className="art-box__specs">
                <span>[HIGH TRACTION]</span>
                <span>[PRO-FOAM CUSHION]</span>
                <span>[BREATHABLE MESH]</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee strip */}
      <div className="marquee-strip" aria-hidden="true">
        <div className="marquee-track">
          {['STRIDEON', 'AUTHENTIC ONLY', 'NEW DROPS', 'PREMIUM KICKS', 'STREET CULTURE', 'LIMITED PRODUCTION', 'MOVE DIFFERENT'].map(
            (t, i) => (
              <span key={i} className="marquee-item">{t} <span className="text-orange">·</span> </span>
            )
          )}
          {['STRIDEON', 'AUTHENTIC ONLY', 'NEW DROPS', 'PREMIUM KICKS', 'STREET CULTURE', 'LIMITED PRODUCTION', 'MOVE DIFFERENT'].map(
            (t, i) => (
              <span key={`dup-${i}`} className="marquee-item">{t} <span className="text-orange">·</span> </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

