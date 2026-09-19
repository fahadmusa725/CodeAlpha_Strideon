import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ui/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import './Home.css';

const CATEGORIES = [
  { label: 'Running', emoji: '🏃', desc: 'Built for miles' },
  { label: 'Basketball', emoji: '🏀', desc: 'Court-ready kicks' },
  { label: 'Lifestyle', emoji: '✦', desc: 'Street-certified' },
  { label: 'Skate', emoji: '🛹', desc: 'Made to grind' },
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
    <main className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__content container">
          <p className="text-upper text-orange hero__eyebrow">New Season · New Drops</p>
          <h1 className="text-display hero__headline">
            MOVE<br />
            <span className="hero__headline--outline">DIFFERENTLY.</span>
          </h1>
          <p className="hero__sub">
            Curated sneakers and streetwear for those who take the game seriously.
          </p>
          <div className="hero__ctas">
            <Link to="/products" className="btn btn-primary btn-lg" id="hero-shop-btn">
              Shop All Drops
            </Link>
            <Link to="/products?category=Lifestyle" className="btn btn-outline btn-lg">
              Explore Lifestyle
            </Link>
          </div>
        </div>
        <div className="hero__scroll-hint">
          <span className="text-upper text-muted">Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* Categories */}
      <section className="section container">
        <p className="text-upper text-muted" style={{ marginBottom: '1.5rem' }}>Shop by Category</p>
        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <Link
              to={`/products?category=${cat.label}`}
              key={cat.label}
              className="category-card"
              id={`cat-${cat.label.toLowerCase()}`}
            >
              <span className="category-card__emoji">{cat.emoji}</span>
              <h3 className="category-card__label">{cat.label}</h3>
              <p className="category-card__desc text-sm text-muted">{cat.desc}</p>
              <span className="category-card__arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Drops */}
      <section className="section container">
        <div className="section-header">
          <div>
            <p className="text-upper text-orange" style={{ marginBottom: '0.5rem' }}>Featured Drops</p>
            <h2 className="text-headline">What's Hot Right Now</h2>
          </div>
          <Link to="/products" className="btn btn-outline btn-sm">View All</Link>
        </div>

        <div className="grid-3" style={{ marginTop: '2rem' }}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* Marquee strip */}
      <div className="marquee-strip" aria-hidden="true">
        <div className="marquee-track">
          {['STRIDEON', 'NEW DROPS', 'PREMIUM KICKS', 'STREET CULTURE', 'LIMITED STOCK', 'MOVE DIFFERENT'].map(
            (t, i) => (
              <span key={i} className="marquee-item">{t} <span className="text-orange">·</span> </span>
            )
          )}
          {['STRIDEON', 'NEW DROPS', 'PREMIUM KICKS', 'STREET CULTURE', 'LIMITED STOCK', 'MOVE DIFFERENT'].map(
            (t, i) => (
              <span key={`dup-${i}`} className="marquee-item">{t} <span className="text-orange">·</span> </span>
            )
          )}
        </div>
      </div>
    </main>
  );
}
