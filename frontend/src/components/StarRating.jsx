import React from "react";

const StarRating = ({ rating, setRating, readonly = false }) => {
  const stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type={readonly ? "button" : "button"}
          onClick={() => !readonly && setRating(star)}
          className={`text-2xl transition-colors ${
            readonly ? "cursor-default" : "cursor-pointer hover:text-yellow-400"
          } ${star <= rating ? "text-yellow-400" : "text-gray-400"}`}
          disabled={readonly}
        >
          ★
        </button>
      ))}
      {!readonly && (
        <span className="ml-2 text-sm text-gray-400">{rating}/10</span>
      )}
    </div>
  );
};

export default StarRating;
