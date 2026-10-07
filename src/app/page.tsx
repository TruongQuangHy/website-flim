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

  const itemsListFilm = [
    { title: "Phim Chiếu Rạp Mới Nhất", slug: "phim-chieu-rap", category: "danh-sach" },
    { title: "Phim Mới Cập Nhật", slug: "phim-moi-cap-nhat", category: "danh-sach" },
    { title: "Phim Bộ Đặc Sắc", slug: "phim-bo", category: "danh-sach" },
    { title: "Phim Lẻ Tuyển Chọn", slug: "phim-le", category: "danh-sach" },
    { title: "Phim Hoạt Hình & Anime", slug: "hoat-hinh", category: "danh-sach" },
    { title: "Chương Trình TV Shows", slug: "tv-shows", category: "danh-sach" },
    { title: "Phim Subteam Đặc Sắc", slug: "subteam", category: "danh-sach" },
  ];

  if (isLoadingHomeItems) {
    return (
      <div className="w-full">
        <Skeleton className="w-full h-[60vh] min-h-[380px] rounded-none bg-white/5" />
        <div className="mt-8 space-y-8 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-7 w-52 bg-white/10" />
              <div className="flex gap-3 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <Skeleton
                    key={j}
                    className="w-[160px] aspect-[2/3] rounded-xl flex-shrink-0 bg-white/10"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {homeItems.length > 0 && (
        <SliderBannerCard
          homeItems={homeItems}
          homeAppDomains={homeAppDomains}
        />
      )}

      <div className="relative z-10 -mt-4 sm:-mt-14 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto pb-12 space-y-2">
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
