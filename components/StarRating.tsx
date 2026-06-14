interface StarRatingProps {
  rating: number;
  size?: number;
  showNumber?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  size = 16,
  showNumber = true,
  className = "",
}: StarRatingProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="#f59e0b"
        aria-hidden="true"
      >
        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
      {showNumber && (
        <span className="font-semibold text-slate-900">
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}
