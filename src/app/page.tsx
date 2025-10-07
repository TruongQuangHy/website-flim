"use client";

import React, { useEffect } from "react";
import SliderBannerCard from "./components/SliderBannerCard";
import { useStore } from "./store/useStore";
import { MovieAPI } from "./lib/api";
import SliderListFilmSection from "./components/SliderListFilmSection";

export default function HomePage() {
  const {
    homeItems,
    setHomeData,
    isLoadingHomeItems,
    setIsLoadingHomeItems,
    homeAppDomains,
  } = useStore();

  useEffect(() => {
    if (homeItems.length === 0) {
      const fetchHomeData = async () => {
        setIsLoadingHomeItems(true);
        try {
          await MovieAPI.getOphimHome(setHomeData);
        } catch (error) {
          console.error("Failed to fetch home data:", error);
        } finally {
          setIsLoadingHomeItems(false);
        }
      };
      fetchHomeData();
    }
  }, [homeItems.length, setHomeData, setIsLoadingHomeItems]);

  if (isLoadingHomeItems) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  const itemsListFilm = [
    { title: "Phim mới", slug: "phim-moi-phat-hanh", category: "danh-sach" },
    { title: "Phim bộ", slug: "phim-bo", category: "danh-sach" },
    { title: "Phim lẻ", slug: "phim-le", category: "danh-sach" },
    { title: "Phim hoạt hình", slug: "hoat-hinh", category: "danh-sach" },
    { title: "TV Shows", slug: "tv-shows", category: "danh-sach" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {homeItems.length > 0 && (
        <SliderBannerCard
          homeItems={homeItems}
          homeAppDomains={homeAppDomains}
        />
      )}

      {/* Display film lists by category */}
      <div className="mt-8">
        {itemsListFilm.map((item) => (
          <SliderListFilmSection
            key={item.slug}
            slug={item.slug}
            title={item.title}
            category={item.category}
          />
        ))}
      </div>
    </div>
  );
}
