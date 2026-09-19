import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import useAuth from '../../hooks/useAuth';
import { formatPrice } from '../../utils/formatters';
import './CartDrawer.css';

export default function CartDrawer() {
  const { cart, cartSubtotal, drawerOpen, setDrawerOpen, updateItem, removeItem } =
    useContext(CartContext);
  const { user } = useAuth();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${drawerOpen ? 'drawer-backdrop--visible' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      <aside className={`cart-drawer ${drawerOpen ? 'cart-drawer--open' : ''}`} id="cart-drawer">
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">Your Bag ({cart.items.length})</h2>
          <button
            className="cart-drawer__close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close cart"
            id="close-cart-btn"
          >
            <CloseIcon />
          </button>
        </div>

        {cart.items.length === 0 ? (
          <div className="cart-drawer__empty">
            <p>Your bag is empty.</p>
            <Link to="/products" className="btn btn-primary btn-sm" onClick={() => setDrawerOpen(false)}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart-drawer__items">
              {cart.items.map((item, i) => (
                <CartItem
                  key={`${item.product?._id ?? item.product}-${item.colorway}-${item.size}-${i}`}
                  item={item}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                />
              ))}
            </ul>

            <div className="cart-drawer__footer">
              <div className="cart-drawer__subtotal">
                <span>Subtotal</span>
                <span className="cart-drawer__total">{formatPrice(cartSubtotal)}</span>
              </div>
              <p className="cart-drawer__note">Shipping calculated at checkout</p>
              {user ? (
                <Link
                  to="/checkout"
                  className="btn btn-primary btn-full btn-lg"
                  onClick={() => setDrawerOpen(false)}
                  id="checkout-btn"
                >
                  Checkout
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-primary btn-full btn-lg"
                  onClick={() => setDrawerOpen(false)}
                >
                  Sign In to Checkout
                </Link>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function CartItem({ item, onUpdate, onRemove }) {
  const product = item.product;
  const name = typeof product === 'object' ? product?.name : 'Product';
  const image = typeof product === 'object' ? product?.images?.[0] : '';
  const slug = typeof product === 'object' ? product?.slug : '';
  const productId = typeof product === 'object' ? product?._id : product;

  return (
    <li className="cart-item">
      <div className="cart-item__img">
        {image && <img src={image} alt={name} />}
      </div>
      <div className="cart-item__info">
        <p className="cart-item__name">{name}</p>
        <p className="cart-item__meta">
          {item.colorway} · Size {item.size}
        </p>
        <div className="cart-item__actions">
          <div className="qty-stepper">
            <button
              className="qty-btn"
              onClick={() => onUpdate(productId, item.colorway, item.size, item.qty - 1)}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="qty-value">{item.qty}</span>
            <button
              className="qty-btn"
              onClick={() => onUpdate(productId, item.colorway, item.size, item.qty + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            className="cart-item__remove"
            onClick={() => onRemove(productId, item.colorway, item.size)}
            aria-label="Remove item"
          >
            Remove
          </button>
        </div>
      </div>
      <span className="cart-item__price">{formatPrice(item.price * item.qty)}</span>
    </li>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
