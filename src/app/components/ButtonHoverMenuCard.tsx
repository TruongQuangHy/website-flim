"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { NavItem } from "../types/navType";
import { MovieAPI } from "../lib/api";
import { useStore } from "../store/useStore";
import { ChevronDown } from "lucide-react";

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
    if (navItem.slug === "the-loai") return categories;
    if (navItem.slug === "quoc-gia") return countries;
    if (navItem.slug === "nam-phat-hanh") return years;
    return [];
  };

  const displayItems = getDisplayItems();

  if (isMobile) {
    return (
      <div className="border-b border-white/10">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 text-white hover:bg-white/5 rounded-lg transition-all duration-200"
          aria-expanded={isExpanded}
        >
          <span className="font-medium">{navItem.name}</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {isMounted && (
            <div className="bg-black/40 overflow-y-auto max-h-72">
              {displayItems.map((item, index) => (
                <Link
                  key={`${navItem.slug}-${item._id}`}
                  href={`/${navItem.slug}/${item.slug}`}
                  onClick={onItemClick}
                  className="block px-6 py-2.5 text-sm text-white/70 hover:bg-brand/20 hover:text-white transition-colors duration-150 animate-fadeInUp"
                  style={{ animationDelay: `${index * 15}ms` }}
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

  return (
    <div className="relative inline-block text-left group">
      <button className="inline-flex items-center gap-1 px-3 py-2 text-sm text-white/80 hover:text-white rounded-md hover:bg-white/5 transition-colors cursor-pointer">
        {navItem.name}
        <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
      </button>
      {isMounted && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-[min(90vw,720px)] grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 p-4 mt-1 bg-[#141414]/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 max-h-[70vh] overflow-y-auto">
          {displayItems.map((item) => (
            <Link
              key={`${navItem.slug}-${item._id}`}
              href={`/${navItem.slug}/${item.slug}`}
              className="px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-brand/20 rounded-md transition-colors truncate"
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ButtonHoverMenuCard;
