export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-card__image" />
      <div className="skeleton-card__body">
        <div className="skeleton skeleton-card__brand" />
        <div className="skeleton skeleton-card__name" />
        <div className="skeleton skeleton-card__price" />
      </div>
    </div>
  );
}
