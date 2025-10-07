"use client";

import React from "react";
import { useStore } from "../store/useStore";
import { Movie } from "../store/useStore";

interface FavoriteButtonProps {
  movie: Movie;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  movie,
  className = "",
  size = "md",
}) => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useStore();
  const isMovieFavorite = isFavorite(movie.id);

  const handleToggleFavorite = () => {
    if (isMovieFavorite) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie);
    }
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      onClick={handleToggleFavorite}
      className={`
        ${sizeClasses[size]}
        ${
          isMovieFavorite
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-gray-700 hover:bg-red-600 text-white"
        }
        rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center
        ${className}
      `}
      title={isMovieFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
    >
      <svg
        className={`${iconSizes[size]} mr-2`}
        fill={isMovieFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {isMovieFavorite ? "Đã yêu thích" : "Yêu thích"}
    </button>
  );
};

export default FavoriteButton;
