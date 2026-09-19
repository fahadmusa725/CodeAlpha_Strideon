import { Link } from 'react-router-dom';
import './About.css';

const STATS = [
  { value: '100%', label: 'Verified Authentic' },
  { value: '50K+', label: 'Community Members' },
  { value: '24/7', label: 'Worldwide Dispatch' },
  { value: '150+', label: 'Exclusive Drops' },
];

const VALUES = [
  {
    icon: '⚡',
    title: 'Drop Culture First',
    desc: 'We operate at the intersection of sneaker obsession and streetwear heritage. Every release is handpicked, rare, and engineered for those who move differently.',
  },
  {
    icon: '🛡️',
    title: 'Zero Counterfeits',
    desc: 'Every silhouette passes a multi-point authentication check before hitting our warehouse. We guarantee 100% genuine kicks or double your money back.',
  },
  {
    icon: '🌐',
    title: 'Global Underground',
    desc: 'From Tokyo to NYC, London to Paris, we curate aesthetics that transcend borders while staying grounded in true urban skate and court lineage.',
  },
  {
    icon: '♻️',
    title: 'Conscious Future',
    desc: 'We are actively transitioning our logistics and packaging to 100% recycled biodegradable materials to ensure street culture leaves zero toxic footprints.',
  },
];

export default function About() {
  return (
    <div className="about-page">
      {/* Hero Banner */}
      <section className="about-hero">
        <div className="container about-hero__content">
          <span className="badge badge-orange about-hero__badge">Origin & Manifesto</span>
          <h1 className="text-display about-hero__title">
            BUILT FOR THE<br />
            <span className="text-orange">UNAPOLOGETIC.</span>
          </h1>
          <p className="about-hero__sub">
            STRIDEON was born out of pure frustration with generic retail and corporate sneaker culture. 
            We build high-grade footwear drops for rule-breakers, skaters, creators, and athletes.
          </p>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="about-stats-bar">
        <div className="container about-stats-grid">
          {STATS.map((s, idx) => (
            <div key={idx} className="stat-box">
              <span className="stat-box__val text-orange">{s.value}</span>
              <span className="stat-box__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="section container">
        <div className="about-story-grid">
          <div className="about-story__text">
            <p className="text-upper text-orange">Our Journey</p>
            <h2 className="text-headline">FROM UNDERGROUND MEETS TO GLOBAL RADAR</h2>
            <p className="text-body" style={{ marginTop: '1.25rem' }}>
              Founded in New York City in 2023, STRIDEON started as an underground sneaker swap community 
              among collectors, artists, and competitive runners who wanted footwear that stood for something real.
            </p>
            <p className="text-body" style={{ marginTop: '1rem' }}>
              Today, STRIDEON represents the definitive hub for limited edition athletic footwear, court essentials, 
              and lifestyle grails. We partner directly with emerging designers and tier-1 sportswear manufacturers 
              to bring curated silhouettes straight to your rotation.
            </p>
            <div style={{ marginTop: '2rem' }}>
              <Link to="/products" className="btn btn-primary btn-lg">
                Explore The Collection →
              </Link>
            </div>
          </div>

          <div className="about-story__visual">
            <div className="about-story__card">
              <div className="story-card__tag">STRIDEON ARCHIVE</div>
              <h3 className="story-card__quote">
                “Footwear isn’t just equipment. It is your statement before you ever speak a word.”
              </h3>
              <div className="story-card__author">
                <span className="author-name">STRIDEON COLLECTIVE</span>
                <span className="author-loc">NEW YORK // TOKYO // BERLIN</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values / Pillars */}
      <section className="section container" style={{ paddingTop: '0' }}>
        <div className="section-header" style={{ marginBottom: '2.5rem' }}>
          <div>
            <p className="text-upper text-orange">What Sets Us Apart</p>
            <h2 className="text-headline">OUR PILLARS</h2>
          </div>
        </div>

        <div className="about-pillars-grid">
          {VALUES.map((val, idx) => (
            <div key={idx} className="pillar-card">
              <span className="pillar-card__icon">{val.icon}</span>
              <h3 className="pillar-card__title">{val.title}</h3>
              <p className="pillar-card__desc text-muted text-sm">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta-section container">
        <div className="about-cta-card">
          <h2 className="text-headline">READY TO LEVEL UP YOUR ROTATION?</h2>
          <p className="text-muted" style={{ maxWidth: '540px', margin: '0.75rem auto 1.75rem' }}>
            Check out our latest seasonal drops, limited restocks, and exclusive colorways before they sell out.
          </p>
          <div className="flex items-center justify-center gap-3" style={{ flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary btn-lg">
              Shop All Drops
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg">
              Contact The Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
