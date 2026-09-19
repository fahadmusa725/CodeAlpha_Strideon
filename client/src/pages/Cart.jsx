import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import useAuth from '../hooks/useAuth';
import { formatPrice } from '../utils/formatters';
import './Cart.css';

export default function Cart() {
  const { cart, cartSubtotal, updateItem, removeItem } = useContext(CartContext);
  const { user } = useAuth();

  if (cart.items.length === 0) {
    return (
      <div className="cart-page-empty container">
        <span className="cart-empty-icon">🛍️</span>
        <h1 className="text-headline">Your Bag is Empty</h1>
        <p className="text-muted">Explore the collection and grab your favorite drops.</p>
        <Link to="/products" className="btn btn-primary btn-lg" style={{ marginTop: '1rem' }}>
          Discover Sneakers
        </Link>
      </div>
    );
  }

  const shipping = cartSubtotal > 150 ? 0 : 15;
  const estimatedTotal = cartSubtotal + shipping;

  return (
    <div className="cart-page container">
      <h1 className="text-headline" style={{ marginBottom: '2rem' }}>Shopping Bag ({cart.items.length})</h1>

      <div className="cart-page__layout">
        {/* Item List */}
        <div className="cart-page__list">
          {cart.items.map((item, idx) => {
            const product = item.product;
            const name = typeof product === 'object' ? product?.name : 'Product';
            const image = typeof product === 'object' ? product?.images?.[0] : '';
            const slug = typeof product === 'object' ? product?.slug : '';
            const productId = typeof product === 'object' ? product?._id : product;

            return (
              <div key={`${productId}-${item.colorway}-${item.size}-${idx}`} className="cart-page-item">
                <Link to={`/products/${slug}`} className="cart-page-item__img-wrap">
                  <img src={image} alt={name} />
                </Link>

                <div className="cart-page-item__details">
                  <Link to={`/products/${slug}`} className="cart-page-item__name">
                    {name}
                  </Link>
                  <p className="cart-page-item__meta">
                    Color: <span className="text-white">{item.colorway}</span> · Size: <span className="text-white">{item.size}</span>
                  </p>
                  <p className="cart-page-item__unit-price text-muted text-sm">
                    {formatPrice(item.price)} each
                  </p>

                  <div className="cart-page-item__controls">
                    <div className="qty-stepper">
                      <button
                        className="qty-btn"
                        onClick={() => updateItem(productId, item.colorway, item.size, item.qty - 1)}
                      >
                        −
                      </button>
                      <span className="qty-value">{item.qty}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateItem(productId, item.colorway, item.size, item.qty + 1)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="cart-page-item__remove-btn"
                      onClick={() => removeItem(productId, item.colorway, item.size)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="cart-page-item__total">
                  {formatPrice(item.price * item.qty)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <aside className="cart-page__summary">
          <h2 className="summary-title">Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(cartSubtotal)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? <span className="text-success">FREE</span> : formatPrice(shipping)}</span>
          </div>

          {shipping > 0 && (
            <p className="text-xs text-muted">
              Add {formatPrice(150 - cartSubtotal)} more for free shipping!
            </p>
          )}

          <div className="summary-divider" />

          <div className="summary-row summary-row--total">
            <span>Estimated Total</span>
            <span className="text-orange">{formatPrice(estimatedTotal)}</span>
          </div>

          {user ? (
            <Link to="/checkout" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '1.5rem' }}>
              Proceed to Checkout
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '1.5rem' }}>
              Sign In to Checkout
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
