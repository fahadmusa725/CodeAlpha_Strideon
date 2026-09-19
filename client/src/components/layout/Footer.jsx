import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

/* ── Inline SVG social icons ─────────────────────────── */
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.321 5.562a5.124 5.124 0 01-.443-.258 6.228 6.228 0 01-1.137-.966c-1.034-1.198-1.42-2.404-1.554-3.245h.005C16.148.861 16.2.5 16.2.5h-4.168v15.139c0 .203-.004.402-.013.597a2.948 2.948 0 01-.077.641 2.966 2.966 0 01-2.878 2.258 2.971 2.971 0 01-2.971-2.971 2.971 2.971 0 012.971-2.971c.29 0 .572.041.84.118V8.978a7.284 7.284 0 00-.84-.048 7.142 7.142 0 00-7.142 7.142 7.142 7.142 0 007.142 7.142 7.142 7.142 0 007.142-7.142V8.628a10.285 10.285 0 006.025 1.912V6.36a6.306 6.306 0 01-2.9-.798z" />
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="footer">
      {/* Accent top border */}
      <div className="footer__accent-bar" aria-hidden="true" />

      <div className="footer__main">
        <div className="container footer__inner">
          {/* Brand Column */}
          <div className="footer__brand">
            <span className="footer__logo">STRIDEON</span>
            <p className="footer__tagline">
              Premium sneakers &amp; streetwear.<br />
              Move with intent.
            </p>

            {/* Social icons */}
            <div className="footer__socials">
              <a href="#" className="footer__social-link" aria-label="Instagram" rel="noopener noreferrer">
                <InstagramIcon />
              </a>
              <a href="#" className="footer__social-link" aria-label="X / Twitter" rel="noopener noreferrer">
                <XIcon />
              </a>
              <a href="#" className="footer__social-link" aria-label="TikTok" rel="noopener noreferrer">
                <TikTokIcon />
              </a>
            </div>
          </div>

          {/* Nav columns */}
          <div className="footer__links">
            <div className="footer__col">
              <h4 className="footer__col-heading">Shop</h4>
              <Link to="/products?category=Running">Running</Link>
              <Link to="/products?category=Basketball">Basketball</Link>
              <Link to="/products?category=Lifestyle">Lifestyle</Link>
              <Link to="/products?category=Skate">Skate</Link>
            </div>

            <div className="footer__col">
              <h4 className="footer__col-heading">Account</h4>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Register</Link>
              <Link to="/orders">My Orders</Link>
              <Link to="/cart">Bag</Link>
            </div>

            <div className="footer__col">
              <h4 className="footer__col-heading">Brand</h4>
              <Link to="/about">About Us</Link>
              <Link to="/about#pillars">Sustainability</Link>
              <Link to="/about#careers">Careers</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="footer__newsletter">
            <h4 className="footer__col-heading">Get Early Access</h4>
            <p className="footer__newsletter-desc">
              Drop alerts, exclusive restocks, and members-only deals — straight to your inbox.
            </p>
            {subscribed ? (
              <p className="footer__newsletter-success">
                🎉 You&apos;re on the list. Watch your inbox.
              </p>
            ) : (
              <form className="footer__newsletter-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="footer__newsletter-input"
                  aria-label="Email for newsletter"
                  required
                />
                <button type="submit" className="footer__newsletter-btn">
                  Join
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copy">
            © {new Date().getFullYear()} Strideon. All rights reserved.
          </p>
          <div className="footer__legal-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
