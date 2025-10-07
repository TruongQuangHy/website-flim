import Link from "next/link";
import React, { useEffect, useState } from "react";
import { NavItem } from "../types/navType";
import { MovieAPI } from "../lib/api";
import { useStore } from "../store/useStore";

interface ButtonHoverMenuCardProps {
  navItem: NavItem;
  isMobile?: boolean;
  onItemClick?: () => void;
}

function ButtonHoverMenuCard({
  navItem,
  isMobile = false,
  onItemClick,
}: ButtonHoverMenuCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    categories,
    setCategories,
    setIsLoadingCategories,
    countries,
    setCountries,
    setIsLoadingCountries,
    years,
    setYears,
    setIsLoadingYears,
  } = useStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Fetch categories
    if (navItem.slug === "the-loai" && categories.length === 0) {
      const fetchCategories = async () => {
        setIsLoadingCategories(true);
        try {
          await MovieAPI.getOphimCategories(setCategories);
        } catch (error) {
          console.error("Failed to fetch categories:", error);
        } finally {
          setIsLoadingCategories(false);
        }
      };
      fetchCategories();
    }

    // Fetch countries
    if (navItem.slug === "quoc-gia" && countries.length === 0) {
      const fetchCountries = async () => {
        setIsLoadingCountries(true);
        try {
          await MovieAPI.getOphimCountries(setCountries);
        } catch (error) {
          console.error("Failed to fetch countries:", error);
        } finally {
          setIsLoadingCountries(false);
        }
      };
      fetchCountries();
    }

    // Fetch years
    if (navItem.slug === "nam-phat-hanh" && years.length === 0) {
      const fetchYears = async () => {
        setIsLoadingYears(true);
        try {
          await MovieAPI.getOphimYears(setYears);
        } catch (error) {
          console.error("Failed to fetch years:", error);
        } finally {
          setIsLoadingYears(false);
        }
      };
      fetchYears();
    }
  }, [
    navItem.slug,
    categories.length,
    setCategories,
    setIsLoadingCategories,
    countries.length,
    setCountries,
    setIsLoadingCountries,
    years.length,
    setYears,
    setIsLoadingYears,
  ]);

  const getDisplayItems = () => {
    if (!isMounted) return [];
    if (navItem.slug === "the-loai") {
      return categories;
    }
    if (navItem.slug === "quoc-gia") {
      return countries;
    }
    if (navItem.slug === "nam-phat-hanh") {
      return years;
    }
    return [];
  };

  const displayItems = getDisplayItems();

  // Mobile version with accordion
  if (isMobile) {
    return (
      <div className="border-b border-gray-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 text-white hover:bg-gray-800 rounded transition-all duration-200"
        >
          <span className="font-medium">{navItem.name}</span>
          <svg
            className={`w-5 h-5 transform transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {isMounted && (
            <div className="bg-gray-800/50 overflow-y-auto">
              {displayItems.map((item, index) => (
                <Link
                  key={`${navItem.slug}-${item._id}`}
                  href={`/${navItem.slug}/${item.slug}`}
                  onClick={onItemClick}
                  className="block px-6 py-2.5 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150 animate-fadeInUp"
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop version with hover menu
  return (
    <div className="relative inline-block text-left group">
      <button className="hover:bg-[var(--color-gray-600)] p-2 rounded cursor-pointer duration-500 ease-in-out">
        {navItem.name}
      </button>
      {isMounted && (
        <div className="absolute top-2 -left-1/2 -translate-x-1/2 w-[750px] grid grid-cols-5 gap-3 p-4 mt-8 bg-[var(--color-gray-700)] border border-gray-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 z-10">
          {displayItems.map((item) => (
            <div
              key={`${navItem.slug}-${item._id}`}
              className="hover:bg-[var(--color-gray-300)] p-2 rounded"
            >
              <Link className="" href={`/${navItem.slug}/${item.slug}`}>
                {item.name}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ButtonHoverMenuCard;
