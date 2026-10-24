import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">STRIDEON<span className="brand-dot">.</span></span>
          <p className="footer__tagline">
            Athletic and lifestyle footwear.
          </p>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-heading">Shop</h4>
          <Link to="/products?category=Running">Running</Link>
          <Link to="/products?category=Basketball">Basketball</Link>
          <Link to="/products?category=Lifestyle">Lifestyle</Link>
          <Link to="/products?category=Skate">Skate</Link>
          <Link to="/products">All products</Link>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-heading">Account</h4>
          <Link to="/login">Sign in</Link>
          <Link to="/register">Create account</Link>
          <Link to="/orders">Order history</Link>
          <Link to="/cart">Bag</Link>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-heading">Help</h4>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copy">
            (c) 2026 Strideon. All rights reserved.
          </p>
          <p className="footer__payments">
            Payments processed by Stripe
          </p>
        </div>
      </div>
    </footer>
  );
}

