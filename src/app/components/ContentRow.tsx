"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OphimHomeItem } from "../types/navType";
import MovieCard from "./MovieCard";
import SectionHeader from "./SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentRowProps {
  title: string;
  items: OphimHomeItem[];
  cdnImage: string;
  seeAllHref?: string;
  isLoading?: boolean;
  maxItems?: number;
}

export default function ContentRow({
  title,
  items,
  cdnImage,
  seeAllHref,
  isLoading = false,
  maxItems = 16,
}: ContentRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, items, isLoading]);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.85, 900);
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <section className="group/row relative my-6 sm:my-8">
        <SectionHeader title={title} href={seeAllHref} />
        <div className="flex gap-3 overflow-hidden pl-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] space-y-2"
            >
              <Skeleton className="w-full aspect-[2/3] rounded-md bg-white/10" />
              <Skeleton className="h-3 w-3/4 bg-white/10" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  const displayItems = items.slice(0, maxItems);

  return (
    <section className="group/row relative my-6 sm:my-8">
      <SectionHeader title={title} href={seeAllHref} />

      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollBy("left")}
            className="absolute left-0 top-0 bottom-6 z-20 w-10 sm:w-12 flex items-center justify-center bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="Cuộn trái"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-black/70 border border-white/20 hover:bg-brand hover:border-brand transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </span>
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollBy("right")}
            className="absolute right-0 top-0 bottom-6 z-20 w-10 sm:w-12 flex items-center justify-center bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="Cuộn phải"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-black/70 border border-white/20 hover:bg-brand hover:border-brand transition-colors">
              <ChevronRight className="w-5 h-5" />
            </span>
          </button>
        )}

        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar pb-4 pl-1 pr-4"
        >
          {displayItems.map((item, idx) => (
            <div key={item._id} className="snap-start">
              <MovieCard
                item={item}
                cdnImage={cdnImage}
                priority={idx < 4}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
