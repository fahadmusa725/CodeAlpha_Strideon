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
  const [brands, setBrands] = useState([]);
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
        const brandSet = new Set();

        for (const cat of CATEGORIES) {
          const matchingProducts = allProducts.filter((p) => p.category === cat.name);
          countMap[cat.name] = matchingProducts.length;
          const matchWithImage = matchingProducts.find((p) => p.images?.[0]);
          if (matchWithImage) {
            catMap[cat.name] = matchWithImage.images[0];
          }
        }

        allProducts.forEach((p) => {
          if (p.brand) brandSet.add(p.brand);
        });

        setCategoryImages(catMap);
        setCategoryCounts(countMap);
        setBrands(Array.from(brandSet).sort());
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const gridProducts = featured.slice(0, 4);

  return (
    <div className="home">
      {/* 1. Hero: two columns on flat --clr-ink */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__media-col">
            <img
              src="/products/hero.avif"
              alt="White and red high-top sneakers on grass"
              className="hero__image"
              fetchPriority="high"
            />
          </div>

          <div className="hero__content">
            <span className="hero__eyebrow">Running / Basketball / Lifestyle / Skate</span>
            <h1 className="hero__headline">Shoes for the track, the court and the street.</h1>
            <p className="hero__sub">
              Running, basketball, lifestyle and skate footwear, with stock tracked per size.
            </p>
            <div className="hero__ctas">
              <Link to="/products" className="btn btn-hero-primary btn-lg" id="hero-shop-btn">
                Shop collection
              </Link>
              <Link to="/products?category=Basketball" className="btn btn-hero-outline btn-lg">
                Shop basketball
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Brand strip under hero */}
      {brands.length > 0 && (
        <section className="brand-strip-section" aria-label="Brands">
          <div className="container">
            <div className="brand-strip">
              {brands.map((brand) => (
                <Link
                  key={brand}
                  to={`/products?brand=${encodeURIComponent(brand)}`}
                  className="brand-strip__item"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Shop by category */}
      <section className="home-section home-section--categories">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">Categories</span>
              <h2 className="text-headline">Shop by category</h2>
            </div>
            <Link to="/products" className="text-sm font-semibold home-header-link">
              View all
            </Link>
          </div>

          <div className="categories-grid categories-slider">
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
                    <div className="category-tile__scrim" aria-hidden="true" />
                    <div className="category-tile__overlay-body">
                      <h3 className="category-tile__title">{cat.label}</h3>
                      {countLabel && (
                        <span className="category-tile__count">{countLabel}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Featured products */}
      <section className="home-section home-section--featured">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">Featured</span>
              <h2 className="text-headline">Featured products</h2>
            </div>
            <Link to="/products" className="text-sm font-semibold home-header-link">
              View all
            </Link>
          </div>

          <div className="grid-4 featured-slider" style={{ marginTop: '2rem' }}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : gridProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </section>

      {/* 6. Promo banners */}
      <section className="home-section home-section--promos">
        <div className="container">
          <div className="promo-grid">
            <div className="promo-banner promo-banner--shipping">
              <img
                src="/products/running2.jpeg"
                alt="Running shoes in motion"
                className="promo-banner__media"
                loading="lazy"
                decoding="async"
              />
              <div className="promo-banner__scrim" aria-hidden="true" />
              <div className="promo-banner__content">
                <h3 className="promo-banner__title">Free shipping on orders over $150</h3>
                <div className="promo-banner__action">
                  <Link to="/products" className="btn btn-primary btn-sm">
                    Shop all
                  </Link>
                </div>
              </div>
            </div>

            <div className="promo-banner promo-banner--lifestyle">
              <img
                src="/products/lifestyle2.avif"
                alt="Lifestyle sneakers"
                className="promo-banner__media"
                loading="lazy"
                decoding="async"
              />
              <div className="promo-banner__scrim" aria-hidden="true" />
              <div className="promo-banner__content">
                <h3 className="promo-banner__title">Lifestyle</h3>
                <div className="promo-banner__action">
                  <Link to="/products?category=Lifestyle" className="btn btn-primary btn-sm">
                    Shop lifestyle
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Trust strip section */}
      <section className="home-section home-section--info">
        <div className="container">
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
        </div>
      </section>
    </div>
  );
}

