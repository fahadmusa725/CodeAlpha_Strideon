import { useState, useEffect, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import useAuth from '../../hooks/useAuth';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, setDrawerOpen } = useContext(CartContext);
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
          STRIDEON
        </Link>

        <nav className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
            Shop
          </NavLink>
          <NavLink to="/products?category=Running" className="nav-link" onClick={() => setMenuOpen(false)}>Running</NavLink>
          <NavLink to="/products?category=Basketball" className="nav-link" onClick={() => setMenuOpen(false)}>Basketball</NavLink>
          <NavLink to="/products?category=Lifestyle" className="nav-link" onClick={() => setMenuOpen(false)}>Lifestyle</NavLink>
          <NavLink to="/products?category=Skate" className="nav-link" onClick={() => setMenuOpen(false)}>Skate</NavLink>
        </nav>

        <div className="navbar__actions">
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

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
