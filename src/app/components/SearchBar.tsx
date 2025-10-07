"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { MovieAPI } from "@/app/lib/api";
import { OphimHomeItem } from "@/app/types/navType";
import Link from "next/link";

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<OphimHomeItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [cdnDomain, setCdnDomain] = useState("");
  const [open, setOpen] = useState(false);

  // Tự động gọi API khi searchTerm thay đổi (với debounce 500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch(searchTerm);
      } else {
        setSearchResults([]);
        setTotalItems(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = async (keyword: string) => {
    setIsLoading(true);
    try {
      const result = await MovieAPI.searchMovies(keyword);
      setSearchResults(result.items);
      setTotalItems(result.pagination.totalItems);
      setCdnDomain(result.appDomains.cdnImage);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Search />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] h-[500px] ">
          <DialogHeader>
            <DialogTitle>Tìm kiếm</DialogTitle>
            <Input
              id=""
              name="name"
              placeholder="Nhập từ khóa"
              className="mt-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </DialogHeader>
          <div className="flex flex-col gap-2 overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex gap-4 w-full border border-gray-700 rounded-lg p-2"
                  >
                    <Skeleton className="w-20 h-28 rounded-lg flex-shrink-0" />
                    <div className="flex flex-col gap-2 flex-1">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <p>
                  Hiển thị {searchResults.length}/{totalItems} kết quả cho
                  &quot;{searchTerm}&quot;
                </p>
                <div className="flex flex-col gap-4">
                  {searchResults.map((movie) => (
                    <Link
                      href={`/movie/${movie.slug}`}
                      key={movie._id}
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex gap-4 w-full border border-gray-700 rounded-lg p-2 cursor-pointer hover:bg-gray-800/50 transition-colors">
                        <div className="w-20 h-28 border-2 border-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={`${cdnDomain}/uploads/movies/${movie.thumb_url}`}
                            alt={movie.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <h1 className="text-lg font-bold">{movie.name}</h1>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <p>{movie.origin_name}</p>
                            <div className="size-1 bg-gray-400 rounded-full"></div>
                            <p>{movie.year}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <p>{movie.quality}</p>
                            <div className="size-1 bg-gray-400 rounded-full"></div>
                            <p>{movie.episode_current}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : searchTerm ? (
              <p className="text-gray-400 text-center">
                Không tìm thấy kết quả
              </p>
            ) : (
              <p className="text-gray-400 text-center">
                Nhập từ khóa để tìm kiếm
              </p>
            )}
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}
