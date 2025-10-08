"use client";

import React, { useEffect, useState, use } from "react";
import { useStore } from "@/app/store/useStore";
import { MovieAPI } from "@/app/lib/api";
import { ChevronRight, Film, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export default function CategorySlugPage({ params }: PageProps) {
  const { category, slug } = use(params);
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
        {/* Title Skeleton */}
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="w-8 h-8 rounded" />
          <Skeleton className="h-9 w-64" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-full h-[280px] rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex justify-center items-center gap-2 mt-8">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
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
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className={`flex items-center gap-1 mr-10 ${
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }`}
              >
                <ChevronRight className="w-4 h-4 ml-1 rotate-180" />
                Trang đầu
              </PaginationLink>
            </PaginationItem>

            {/* First page */}
            {currentPage > 2 && (
              <PaginationItem>
                <PaginationLink
                  onClick={() => setCurrentPage(1)}
                  isActive={currentPage === 1}
                  className="cursor-pointer"
                >
                  1
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Ellipsis before current */}
            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Previous page */}
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationLink
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="cursor-pointer"
                >
                  {currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Current page */}
            <PaginationItem>
              <PaginationLink isActive className="cursor-pointer">
                {currentPage}
              </PaginationLink>
            </PaginationItem>

            {/* Next page */}
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationLink
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="cursor-pointer"
                >
                  {currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Ellipsis after current */}
            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Last page */}
            {currentPage < totalPages - 1 && (
              <PaginationItem>
                <PaginationLink
                  onClick={() => setCurrentPage(totalPages)}
                  isActive={currentPage === totalPages}
                  className="cursor-pointer"
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationLink
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                className={`flex items-center gap-1 ml-10 ${
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }`}
              >
                Trang cuối
                <ChevronRight className="w-4 h-4" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
