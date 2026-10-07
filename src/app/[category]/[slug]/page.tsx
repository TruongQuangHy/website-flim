"use client";

import React, { useEffect, useState, use } from "react";
import { useStore } from "@/app/store/useStore";
import { MovieAPI } from "@/app/lib/api";
import { ChevronRight, Film } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import MovieCard from "@/app/components/MovieCard";

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
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="w-8 h-8 rounded bg-white/10" />
          <Skeleton className="h-9 w-64 bg-white/10" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-full aspect-[2/3] rounded-md bg-white/10"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!listData || listData.items.length === 0) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-20 text-center">
        <Film className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">Không tìm thấy phim nào</p>
      </div>
    );
  }

  const totalItems = Number(listData.pagination?.totalItems) || 0;
  const itemsPerPage = Number(listData.pagination?.totalItemsPerPage) || 24;
  const totalPages =
    listData.pagination?.totalPages ||
    (totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : 1);

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-8">
      <div className="relative mb-10 overflow-hidden rounded-xl bg-gradient-to-r from-brand/20 via-[#1a1a1a] to-[#141414] border border-white/5 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand/20 text-brand">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-2xl sm:text-3xl tracking-tight">
              {listData.titlePage}
            </h1>
            {listData.pagination && (
              <p className="text-sm text-muted-foreground mt-1">
                {listData.pagination.totalItems.toLocaleString("vi-VN")} phim
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 justify-items-center sm:justify-items-stretch">
        {listData.items.map((item) => (
          <MovieCard
            key={item._id}
            item={item}
            cdnImage={listData.appDomains.cdnImage}
            className="w-full max-w-[220px] sm:max-w-none"
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-10">
          <PaginationContent className="flex-wrap justify-center gap-1">
            <PaginationItem>
              <PaginationLink
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className={`flex items-center gap-1 ${
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer hover:bg-brand/20"
                }`}
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span className="hidden sm:inline">Trước</span>
              </PaginationLink>
            </PaginationItem>

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

            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

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

            <PaginationItem>
              <PaginationLink
                isActive
                className="cursor-pointer bg-brand border-brand text-white hover:bg-brand-hover"
              >
                {currentPage}
              </PaginationLink>
            </PaginationItem>

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

            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

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
                className={`flex items-center gap-1 ${
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer hover:bg-brand/20"
                }`}
              >
                <span className="hidden sm:inline">Sau</span>
                <ChevronRight className="w-4 h-4" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
