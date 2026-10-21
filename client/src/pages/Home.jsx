import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ui/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import './Home.css';

const CATEGORIES = [
  { name: 'Running', label: 'Running' },
  { name: 'Basketball', label: 'Basketball' },
  { name: 'Lifestyle', label: 'Lifestyle' },
  { name: 'Skate', label: 'Skate' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categoryImages, setCategoryImages] = useState({});
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.get('/products/featured'),
      api.get('/products?limit=100'),
    ])
      .then(([featuredRes, allRes]) => {
        if (!isMounted) return;
        const featList = featuredRes.data || [];
        setFeatured(featList);

        const allProducts = allRes.data?.products || [];
        const catMap = {};
        const countMap = {};

        for (const cat of CATEGORIES) {
          const matchingProducts = allProducts.filter((p) => p.category === cat.name);
          countMap[cat.name] = matchingProducts.length;
          const matchWithImage = matchingProducts.find((p) => p.images?.[0]);
          if (matchWithImage) {
            catMap[cat.name] = matchWithImage.images[0];
          }
        }
        setCategoryImages(catMap);
        setCategoryCounts(countMap);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const gridProducts = featured.slice(1, 9);
  const promoProduct = featured[1] || featured[0] || null;

  return (
    <div className="home">
      {/* 3. Hero: two columns */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            <h1 className="hero__headline">Shoes for the track, the court and the street.</h1>
            <p className="hero__sub">
              Running, basketball, lifestyle and skate footwear, with stock tracked per size.
            </p>
            <div className="hero__ctas">
              <Link to="/products" className="btn btn-primary btn-lg" id="hero-shop-btn">
                Shop collection
              </Link>
              <Link to="/products?category=Basketball" className="btn btn-outline btn-lg">
                Shop basketball
              </Link>
            </div>
          </div>

          <div className="hero__media-col">
            <img
              src="/products/hero.avif"
              alt="White and red high-top sneakers on grass"
              className="hero__image"
              fetchpriority="high"
            />
          </div>
        </div>
      </section>

      {/* 4. Category row: four image tiles */}
      <section className="section container">
        <div className="section-header">
          <div>
            <h2 className="text-headline">Shop by category</h2>
          </div>
          <Link to="/products" className="text-sm font-semibold">
            All categories
          </Link>
        </div>

        <div className="categories-grid">
          {CATEGORIES.map((cat) => {
            const imgSrc = categoryImages[cat.name];
            const count = categoryCounts[cat.name];
            const countLabel =
              typeof count === 'number'
                ? `${count} ${count === 1 ? 'product' : 'products'}`
                : '';
            return (
              <Link
                to={`/products?category=${cat.name}`}
                key={cat.name}
                className="category-tile"
                id={`cat-${cat.name.toLowerCase()}`}
              >
                <div className="category-tile__media">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={cat.label}
                      className="category-tile__img"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="category-tile__placeholder" />
                  )}
                </div>
                <div className="category-tile__body">
                  <h3 className="category-tile__title">{cat.label}</h3>
                  {countLabel && (
                    <span className="category-tile__link text-sm">{countLabel}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. Featured products grid */}
      <section className="section container" style={{ paddingTop: '0' }}>
        <div className="section-header">
          <div>
            <h2 className="text-headline">Featured products</h2>
          </div>
          <Link to="/products" className="btn btn-outline btn-sm">
            View all
          </Link>
        </div>

        <div className="grid-4" style={{ marginTop: '2rem' }}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : gridProducts.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* 6. Two promo banners side by side */}
      <section className="section container" style={{ paddingTop: '0' }}>
        <div className="promo-grid">
          <div className="promo-card promo-card--shipping">
            <span className="promo-card__eyebrow text-upper">Delivery benefit</span>
            <h3 className="promo-card__title">Complimentary shipping on orders over $150</h3>
            <p className="promo-card__desc">
              Automatic free standard delivery applied at checkout across all orders.
            </p>
            <div className="promo-card__action">
              <Link to="/products" className="btn btn-primary btn-sm">
                Shop all footwear
              </Link>
            </div>
          </div>

          <div className="promo-card promo-card--category">
            <div className="promo-card__content">
              <span className="promo-card__eyebrow text-upper">Featured category</span>
              <h3 className="promo-card__title">Lifestyle & court classics</h3>
              <p className="promo-card__desc">
                Everyday low-top and mid-top shoes for casual wear.
              </p>
              <div className="promo-card__action">
                <Link to="/products?category=Lifestyle" className="btn btn-outline btn-sm">
                  Explore Lifestyle
                </Link>
              </div>
            </div>
            {promoProduct && promoProduct.images?.[0] && (
              <div className="promo-card__thumb">
                <img
                  src={promoProduct.images[0]}
                  alt={promoProduct.name}
                  className="promo-card__img"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. Trust strip section */}
      <section className="trust-strip-section container">
        <div className="info-strip">
          <div className="info-strip__inner">
            <div className="info-strip__item">
              <span className="info-strip__title">Free shipping</span>
              <span className="info-strip__desc">Orders over $150 qualify for complimentary delivery</span>
            </div>
            <div className="info-strip__divider" />
            <div className="info-strip__item">
              <span className="info-strip__title">Secure checkout</span>
              <span className="info-strip__desc">Encrypted payment processing powered by Stripe</span>
            </div>
            <div className="info-strip__divider" />
            <div className="info-strip__item">
              <span className="info-strip__title">Live inventory</span>
              <span className="info-strip__desc">Stock tracked per size and colorway</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

