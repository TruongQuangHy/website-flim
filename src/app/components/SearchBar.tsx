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
import Image from "next/image";

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<OphimHomeItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [cdnDomain, setCdnDomain] = useState("");
  const [open, setOpen] = useState(false);

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
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-white/10 text-white"
          aria-label="Tìm kiếm phim"
        >
          <Search className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px] h-[min(80vh,560px)] bg-[#141414] border-white/10 text-white p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-white/10 space-y-3">
          <DialogTitle className="text-lg font-semibold">
            Tìm kiếm phim
          </DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Nhập tên phim, diễn viên..."
              className="pl-10 bg-white/5 border-white/10 focus-visible:ring-brand h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-2 overflow-y-auto px-5 py-4 flex-1">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex gap-3 w-full rounded-lg p-2 bg-white/5"
                >
                  <Skeleton className="w-16 h-24 rounded-md flex-shrink-0 bg-white/10" />
                  <div className="flex flex-col gap-2 flex-1 py-1">
                    <Skeleton className="h-5 w-3/4 bg-white/10" />
                    <Skeleton className="h-4 w-1/2 bg-white/10" />
                    <Skeleton className="h-4 w-2/3 bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <p className="text-xs text-muted-foreground mb-1">
                Hiển thị {searchResults.length}/{totalItems} kết quả cho &quot;
                {searchTerm}&quot;
              </p>
              <div className="flex flex-col gap-2">
                {searchResults.map((movie) => (
                  <Link
                    href={`/movie/${movie.slug}`}
                    key={movie._id}
                    onClick={() => setOpen(false)}
                    className="flex gap-3 w-full rounded-lg p-2 hover:bg-white/10 transition-colors group"
                  >
                    <div className="relative w-16 h-24 rounded-md overflow-hidden flex-shrink-0 bg-muted ring-1 ring-white/10 group-hover:ring-brand/50 transition-all">
                      {cdnDomain && (
                        <Image
                          src={`${cdnDomain}/uploads/movies/${movie.thumb_url}`}
                          alt={movie.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 min-w-0 py-0.5">
                      <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-brand transition-colors">
                        {movie.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate">{movie.origin_name}</span>
                        <span className="size-1 bg-muted-foreground rounded-full shrink-0" />
                        <span className="shrink-0">{movie.year}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {movie.quality && (
                          <span className="bg-brand/90 text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
                            {movie.quality}
                          </span>
                        )}
                        {movie.episode_current && (
                          <span className="text-muted-foreground">
                            {movie.episode_current}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : searchTerm ? (
            <p className="text-muted-foreground text-center py-12 text-sm">
              Không tìm thấy kết quả
            </p>
          ) : (
            <p className="text-muted-foreground text-center py-12 text-sm">
              Nhập từ khóa để tìm kiếm
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
