import { useState, useEffect, useRef, useContext } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import useAuth from '../../hooks/useAuth';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, setDrawerOpen } = useContext(CartContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    if (location.pathname === '/products') {
      setSearchQuery(q);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  // Close account dropdown and mobile menu on outside click, Escape, or route change.
  useEffect(() => {
    setUserMenuOpen(false);
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/products?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/products');
    }
    setMenuOpen(false);
  };

  return (
    <>
      {menuOpen && (
        <div
          className="navbar__backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className="header-wrapper">
        <aside className="topbar" aria-label="Announcement">
          <div className="container topbar__inner">
            <span className="topbar__item">Free shipping on orders over $150</span>
            <span className="topbar__sep">·</span>
            <span className="topbar__item">Secure checkout with Stripe</span>
          </div>
        </aside>

        <header ref={navRef} className={`navbar ${scrolled ? 'navbar--solid' : ''}`}>
          <div className="container navbar__inner">
            <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
              <span className="navbar__logo-text">STRIDEON<span className="brand-dot">.</span></span>
            </Link>

            <nav className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
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
                About
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </NavLink>

              <form className="navbar__search navbar__search--mobile" onSubmit={handleSearchSubmit}>
                <SearchIcon />
                <input
                  type="search"
                  className="navbar__search-input"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              <div className="navbar__mobile-auth">
                {user ? (
                  <div className="navbar__mobile-user-box">
                    <div className="navbar__mobile-user-header">
                      <span className="user-avatar">{user.name[0].toUpperCase()}</span>
                      <span className="navbar__mobile-user-name">{user.name}</span>
                    </div>
                    <div className="navbar__mobile-user-actions">
                      <Link to="/orders" className="nav-link" onClick={() => setMenuOpen(false)}>
                        Order history
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>
                          Admin dashboard
                        </Link>
                      )}
                      <button className="nav-link navbar__mobile-logout" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="btn btn-primary navbar__mobile-auth-btn"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </nav>

            <form className="navbar__search navbar__search--desktop" onSubmit={handleSearchSubmit}>
              <SearchIcon />
              <input
                type="search"
                className="navbar__search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="navbar__actions">
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
                <div className="user-menu user-menu--desktop" ref={userMenuRef}>
                  <button
                    className="navbar__icon-btn user-menu__trigger"
                    onClick={() => setUserMenuOpen((p) => !p)}
                    id="user-menu-btn"
                    aria-label="Account menu"
                    aria-haspopup="true"
                    aria-expanded={userMenuOpen}
                  >
                    <span className="user-avatar">{user.name[0].toUpperCase()}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="user-menu__dropdown" id="user-dropdown">
                      <span className="user-menu__name">{user.name}</span>
                      <Link to="/orders" className="user-menu__item" onClick={() => setUserMenuOpen(false)}>
                        Order history
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="user-menu__item" onClick={() => setUserMenuOpen(false)}>
                          Admin dashboard
                        </Link>
                      )}
                      <button className="user-menu__item user-menu__logout" onClick={handleLogout}>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn btn-outline btn-sm navbar__desktop-signin">
                  Sign in
                </Link>
              )}

              <button
                className="navbar__hamburger"
                onClick={() => setMenuOpen((p) => !p)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                id="hamburger-btn"
              >
                <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
                <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
                <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
              </button>
            </div>
          </div>
        </header>
      </div>
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
