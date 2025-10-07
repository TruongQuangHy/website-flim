"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "../store/useStore";
import { MovieAPI } from "../lib/api";
import MovieCard from "../components/MovieCard";
import { Movie } from "../store/useStore";

// Loading component for suspense
const SearchPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { searchFilters, setSearchFilters } = useStore();

  // Search function
  const performSearch = useCallback(
    async (searchQuery: string, page: number = 1) => {
      if (!searchQuery.trim()) {
        setMovies([]);
        setTotalResults(0);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await MovieAPI.searchMovies(searchQuery, page, {
          year: searchFilters.year,
          genre: searchFilters.genre,
          sortBy: searchFilters.sortBy,
        });

        setMovies(response.results);
        setTotalResults(response.total_results);
        setTotalPages(response.total_pages);
        setCurrentPage(page);
      } catch (err) {
        setError("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.");
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [searchFilters.year, searchFilters.genre, searchFilters.sortBy]
  );

  // Search when query or filters change
  useEffect(() => {
    if (query) {
      setSearchFilters({ query });
      performSearch(query, 1);
    }
  }, [query, performSearch, setSearchFilters]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    performSearch(query, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setSearchFilters({ [filterType]: value });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-900 pt-16">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <svg
              className="w-24 h-24 text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h1 className="text-4xl font-bold text-white mb-4">
              Tìm kiếm phim
            </h1>
            <p className="text-gray-400 text-lg">
              Nhập từ khóa vào thanh tìm kiếm để tìm phim yêu thích của bạn
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Kết quả tìm kiếm cho: &ldquo;{query}&rdquo;
          </h1>
          {!isLoading && (
            <p className="text-gray-400">
              {totalResults > 0
                ? `Tìm thấy ${totalResults.toLocaleString()} kết quả`
                : "Không tìm thấy kết quả nào"}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Bộ lọc</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Năm phát hành
              </label>
              <select
                value={searchFilters.year}
                onChange={(e) => handleFilterChange("year", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Tất cả năm</option>
                {Array.from(
                  { length: 30 },
                  (_, i) => new Date().getFullYear() - i
                ).map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thể loại
              </label>
              <select
                value={searchFilters.genre}
                onChange={(e) => handleFilterChange("genre", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Tất cả thể loại</option>
                <option value="28">Hành động</option>
                <option value="12">Phiêu lưu</option>
                <option value="16">Hoạt hình</option>
                <option value="35">Hài kịch</option>
                <option value="80">Tội phạm</option>
                <option value="18">Chính kịch</option>
                <option value="14">Viễn tưởng</option>
                <option value="27">Kinh dị</option>
                <option value="10749">Lãng mạn</option>
                <option value="878">Khoa học viễn tưởng</option>
                <option value="53">Gây cấn</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sắp xếp theo
              </label>
              <select
                value={searchFilters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="popularity.desc">Phổ biến nhất</option>
                <option value="release_date.desc">Mới nhất</option>
                <option value="vote_average.desc">Điểm cao nhất</option>
                <option value="title.asc">Tên phim (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
            {[...Array(20)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg overflow-hidden animate-pulse"
              >
                <div className="aspect-[2/3] bg-gray-700" />
                <div className="p-4">
                  <div className="h-4 bg-gray-700 rounded mb-2" />
                  <div className="h-3 bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-red-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Movies Grid */}
        {!isLoading && !error && movies.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  Trước
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg ${
                      page === currentPage
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-white hover:bg-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!isLoading && !error && movies.length === 0 && totalResults === 0 && (
          <div className="text-center py-16">
            <svg
              className="w-24 h-24 text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.084-2.327C4.088 13.033 4 14.089 4 15.085V16c0 1.105.895 2 2 2h8c1.105 0 2-.895 2-2v-.915c0-.996-.088-2.052-.916-2.412z"
              />
            </svg>
            <h3 className="text-2xl font-semibold text-white mb-4">
              Không tìm thấy phim nào
            </h3>
            <p className="text-gray-400 mb-8">
              Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Quay lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main component with Suspense
const SearchPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 pt-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
};

export default SearchPage;
