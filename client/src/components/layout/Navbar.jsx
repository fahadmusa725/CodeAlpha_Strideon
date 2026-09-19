import { useState, useEffect, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import useAuth from '../../hooks/useAuth';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, setDrawerOpen } = useContext(CartContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--solid' : ''}`}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
          <span className="navbar__logo-text">STRIDEON</span>
          <span className="navbar__logo-tag">NYC</span>
        </Link>

        <nav className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            end
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={() => setMenuOpen(false)}
          >
            Shop
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={() => setMenuOpen(false)}
          >
            About Us
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </NavLink>

          <div className="navbar__category-pills">
            <span className="category-pill-label">Categories:</span>
            <NavLink to="/products?category=Running" className="nav-pill" onClick={() => setMenuOpen(false)}>Running</NavLink>
            <NavLink to="/products?category=Basketball" className="nav-pill" onClick={() => setMenuOpen(false)}>Basketball</NavLink>
            <NavLink to="/products?category=Lifestyle" className="nav-pill" onClick={() => setMenuOpen(false)}>Lifestyle</NavLink>
            <NavLink to="/products?category=Skate" className="nav-pill" onClick={() => setMenuOpen(false)}>Skate</NavLink>
          </div>
        </nav>

        <div className="navbar__actions">
          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            className="navbar__icon-btn theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <button
            id="cart-toggle"
            className="navbar__icon-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open cart"
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount > 9 ? '9+' : cartCount}</span>
            )}
          </button>

          {user ? (
            <div className="user-menu">
              <button
                className="navbar__icon-btn user-menu__trigger"
                onClick={() => setUserMenuOpen((p) => !p)}
                id="user-menu-btn"
              >
                <span className="user-avatar">{user.name[0].toUpperCase()}</span>
              </button>
              {userMenuOpen && (
                <div className="user-menu__dropdown" id="user-dropdown">
                  <span className="user-menu__name">{user.name}</span>
                  <Link to="/orders" className="user-menu__item" onClick={() => setUserMenuOpen(false)}>
                    Order History
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="user-menu__item" onClick={() => setUserMenuOpen(false)}>
                      Admin
                    </Link>
                  )}
                  <button className="user-menu__item user-menu__logout" onClick={handleLogout}>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline btn-sm">
              Sign In
            </Link>
          )}

          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Toggle menu"
            id="hamburger-btn"
          >
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
