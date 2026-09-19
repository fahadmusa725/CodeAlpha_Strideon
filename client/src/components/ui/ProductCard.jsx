import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { name, brand, price, images, slug, isFeatured, stock, colorways } = product;

  const totalStock = stock
    ? Object.values(
        typeof stock === 'object' && !(stock instanceof Map) ? stock : {}
      ).reduce((a, b) => a + b, 0)
    : null;

  const isLowStock = totalStock !== null && totalStock > 0 && totalStock <= 15;
  const isOutOfStock = totalStock === 0;

  return (
    <Link to={`/products/${slug}`} className="product-card" id={`product-${slug}`}>
      <div className="product-card__image-wrap">
        <img
          src={images?.[0]}
          alt={name}
          className="product-card__img"
          loading="lazy"
        />
        {images?.[1] && (
          <img
            src={images[1]}
            alt={`${name} alt view`}
            className="product-card__img product-card__img--hover"
            loading="lazy"
          />
        )}
        <div className="product-card__badges">
          {isFeatured && <span className="badge badge-orange">New Drop</span>}
          {isLowStock && <span className="badge badge-warning">Low Stock</span>}
          {isOutOfStock && <span className="badge badge-surface">Sold Out</span>}
        </div>
      </div>

      <div className="product-card__body">
        <p className="product-card__brand text-upper text-muted">{brand}</p>
        <h3 className="product-card__name">{name}</h3>
        <div className="product-card__footer">
          <span className="product-card__price">{formatPrice(price)}</span>
          {colorways && colorways.length > 1 && (
            <span className="product-card__variants text-sm text-muted">
              {colorways.length} colors
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
