"use client";

import React from "react";
import { useStore } from "../store/useStore";
import SearchBar from "./SearchBar";

const SearchModal: React.FC = () => {
  const { showSearchModal, setShowSearchModal } = useStore();

  if (!showSearchModal) return null;

  const closeModal = () => {
    setShowSearchModal(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-75 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl mt-16 p-6 animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Tìm kiếm phim</h2>
          <button
            onClick={closeModal}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <SearchBar />
        </div>

        {/* Quick suggestions */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Gợi ý tìm kiếm
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              "Avatar",
              "Spider-Man",
              "Marvel",
              "Disney",
              "Action",
              "Comedy",
              "Horror",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  // Handle suggestion click
                  window.location.href = `/search?q=${encodeURIComponent(
                    suggestion
                  )}`;
                }}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
