import React from "react";
import { FiStar } from "react-icons/fi";

const Rating = ({
  rating = 4.5,
  totalReviews = 128,
  size = "sm",
  showReviews = true,
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const starSize =
    size === "lg" ? "w-5 h-5" : size === "sm" ? "w-4 h-4" : "w-3 h-3";
  const textSize =
    size === "lg" ? "text-base" : size === "sm" ? "text-sm" : "text-xs";

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, index) => (
          <FiStar
            key={`full-${index}`}
            className={`${starSize} text-yellow-400 fill-current`}
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <FiStar className={`${starSize} text-muted-foreground`} />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: "50%" }}
            >
              <FiStar className={`${starSize} text-yellow-400 fill-current`} />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, index) => (
          <FiStar
            key={`empty-${index}`}
            className={`${starSize} text-muted-foreground`}
          />
        ))}
      </div>

      {showReviews && (
        <div className={`${textSize} ml-1 text-muted-foreground`}>
          <span className="font-medium">{parseFloat(rating).toFixed(1)}</span>
          <span className="hidden lg:inline-block"> ( {totalReviews} reviews )</span>
        </div>
      )}
    </div>
  );
};

export default Rating;
