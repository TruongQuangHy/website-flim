"use client";

import React, { useEffect } from "react";
import SliderBannerCard from "./components/SliderBannerCard";
import { useStore } from "./store/useStore";
import { MovieAPI } from "./lib/api";
import SliderListFilmSection from "./components/SliderListFilmSection";
import { Skeleton } from "@/components/ui/skeleton";

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
        {/* Banner Skeleton */}
        <div className="mt-8">
          <Skeleton className="w-full h-[400px] rounded-xl" />
        </div>

        {/* Film Lists Skeleton */}
        <div className="mt-8 space-y-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="w-full aspect-[2/3] rounded-lg" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          ))}
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
