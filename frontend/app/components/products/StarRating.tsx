"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const starSizeClass = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };
  
  const renderStar = (position: number) => {
    const isActiveRating = position <= (interactive && hoverRating > 0 ? hoverRating : rating);
    
    return (
      <Star
        key={position}
        className={`${starSizeClass[size]} ${
          isActiveRating ? "text-amber-400 fill-amber-400" : "text-gray-300"
        } ${interactive ? "cursor-pointer" : ""}`}
        onMouseEnter={() => interactive && setHoverRating(position)}
        onMouseLeave={() => interactive && setHoverRating(0)}
        onClick={() => interactive && onRatingChange && onRatingChange(position)}
      />
    );
  };

  return (
    <div className="flex gap-0.5" onMouseLeave={() => interactive && setHoverRating(0)}>
      {[...Array(maxRating)].map((_, i) => renderStar(i + 1))}
    </div>
  );
}