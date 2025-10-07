"use client";

import React, { useEffect } from "react";
import { useStore } from "../store/useStore";
import { MovieAPI } from "../lib/api";
import { Film, MoveRight, Play } from "lucide-react";
import Link from "next/link";

interface SliderListFilmSectionProps {
  slug: string;
  title: string;
  category?: string;
}

const SliderListFilmSection: React.FC<SliderListFilmSectionProps> = ({
  slug,
  title,
  category = "danh-sach",
}) => {
  const { listDataBySlug, setListData, isLoadingList, setIsLoadingList } =
    useStore();

  const listData = listDataBySlug[slug];
  const isLoading = isLoadingList[slug] || false;

  useEffect(() => {
    if (!listData) {
      const fetchListData = async () => {
        setIsLoadingList(slug, true);
        try {
          await MovieAPI.getOphimList(category, slug, 1, (data) => {
            setListData(slug, data);
          });
        } catch (error) {
          console.error(`Failed to fetch list data for ${slug}:`, error);
        } finally {
          setIsLoadingList(slug, false);
        }
      };
      fetchListData();
    }
  }, [slug, listData, setListData, setIsLoadingList, category]);

  if (isLoading) {
    return (
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="flex justify-center items-center h-48">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!listData || listData.items.length === 0) {
    return null;
  }

  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3 mb-5">
          <Film />
          <h1 className="font-semibold text-xl">
            {listData.titlePage || title}
          </h1>
        </div>
        <Link href={`/${category}/${slug}`}>
          <button className="text-sm text-blue-500 flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors">
            Xem tất cả <MoveRight />
          </button>
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {listData.items.slice(0, 12).map((item) => (
          <div
            key={item._id}
            className="relative group cursor-pointer overflow-hidden rounded-lg h-[280px]"
          >
            <img
              src={`${listData.appDomains.cdnImage}/uploads/movies/${item.thumb_url}`}
              alt={item.name}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
              <h3 className="text-white text-sm font-semibold line-clamp-2">
                {item.name}
              </h3>
              <p className="text-gray-300 text-xs">{item.year}</p>
            </div>
            {item.episode_current && (
              <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                {item.episode_current}
              </div>
            )}
            <Link
              href={`/movie/${item.slug}`}
              className="absolute cursor-pointer top-0 left-0 group-hover:opacity-100 opacity-0 transition-opacity duration-300 bg-black/50 flex items-center justify-center w-full h-full "
            >
              <button className="p-2 items-center justify-center flex ">
                <Play />
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SliderListFilmSection;
