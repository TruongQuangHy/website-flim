"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "@/app/store/useStore";
import { MovieAPI } from "@/app/lib/api";
import { Film, Play } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: {
    category: string;
    slug: string;
  };
}

export default function CategorySlugPage({ params }: PageProps) {
  const { category, slug } = params;
  const { listDataBySlug, setListData, isLoadingList, setIsLoadingList } =
    useStore();
  const [currentPage, setCurrentPage] = useState(1);

  const listData = listDataBySlug[slug];
  const isLoading = isLoadingList[slug] || false;

  useEffect(() => {
    const fetchListData = async () => {
      setIsLoadingList(slug, true);
      try {
        await MovieAPI.getOphimList(category, slug, currentPage, (data) => {
          setListData(slug, data);
        });
      } catch (error) {
        console.error(`Failed to fetch list data for ${slug}:`, error);
      } finally {
        setIsLoadingList(slug, false);
      }
    };
    fetchListData();
  }, [category, slug, currentPage, setListData, setIsLoadingList]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-96">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!listData || listData.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Không tìm thấy phim nào</div>
      </div>
    );
  }

  const totalPages = listData.pagination
    ? Math.ceil(
        listData.pagination.totalItems / listData.pagination.totalItemsPerPage
      )
    : 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Film className="w-8 h-8" />
        <h1 className="font-bold text-3xl">{listData.titlePage}</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {listData.items.map((item) => (
          <Link key={item._id} href={`/movie/${item.slug}`}>
            <div className="relative group cursor-pointer overflow-hidden rounded-lg h-[280px]">
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
              <div className="absolute top-0 left-0 group-hover:opacity-100 cursor-pointer opacity-0 transition-opacity duration-300 bg-black/50 flex items-center justify-center w-full h-full">
                <button className="p-2 items-center justify-center flex">
                  <Play />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            Trang trước
          </button>
          <span className="px-4 py-2">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}
