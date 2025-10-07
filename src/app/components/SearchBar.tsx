"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../store/useStore";
import { MovieAPI } from "../lib/api";
import { Movie } from "../store/useStore";
import { SearchIcon } from "lucide-react";

const SearchBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await MovieAPI.searchMovies(searchQuery, 1);
      setGlobalSearchResults(response.results);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMovie = (movie: Movie) => {
    addToRecentlyViewed(movie);
    router.push(`/movie/${movie.id}`);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim()) {
      setIsOpen(true);
    }
  };

  return (
    <div>
      <button>
        <SearchIcon />
      </button>
    </div>
  );
};

export default SearchBar;
