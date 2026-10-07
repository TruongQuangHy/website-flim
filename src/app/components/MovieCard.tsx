"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Star } from "lucide-react";
import { VsmovMovieItem } from "../types/navType";
import { getMovieImageUrl } from "../lib/api";

interface MovieCardProps {
  item: VsmovMovieItem;
  cdnImage?: string;
  priority?: boolean;
  className?: string;
}

export default function MovieCard({
  item,
  cdnImage = "",
  priority = false,
  className = "",
}: MovieCardProps) {
  const imageUrl = getMovieImageUrl(item, cdnImage);

  // Format TMDB rating
  const tmdbRating = item.tmdb?.vote_average
    ? Number(item.tmdb.vote_average).toFixed(1)
    : null;

  const isCustomWidth = className.includes("w-");
  const defaultWidthClass = isCustomWidth
    ? ""
    : "w-[135px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-shrink-0";

  return (
    <Link
      href={`/movie/${item.slug}`}
      className={`group relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-xl overflow-hidden ${defaultWidthClass} ${className}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[#141414] ring-1 ring-white/10 group-hover:ring-brand/50 transition-all duration-300 shadow-lg shadow-black/60 group-hover:shadow-2xl group-hover:shadow-brand/20 group-hover:scale-[1.04]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 140px, (max-width: 1024px) 180px, 200px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading={priority ? "eager" : "lazy"}
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 bg-[#1e1e1e]" />
        )}

        {/* Ambient gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

        {/* Play Icon hover effect */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-brand text-white shadow-xl shadow-brand/50 scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </span>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1 z-[2]">
          <div className="flex flex-col gap-1 items-start">
            {item.quality && (
              <span className="bg-brand text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-md">
                {item.quality}
              </span>
            )}
            {item.chieurap && (
              <span className="bg-amber-500/90 text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase shadow-md">
                Rạp
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 items-end">
            {tmdbRating && Number(tmdbRating) > 0 && (
              <span className="inline-flex items-center gap-0.5 bg-black/80 backdrop-blur-md text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md ring-1 ring-amber-400/30">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                {tmdbRating}
              </span>
            )}
            {item.episode_current && (
              <span className="bg-black/75 backdrop-blur-sm text-white/90 text-[9px] font-medium px-1.5 py-0.5 rounded truncate max-w-[80px]">
                {item.episode_current}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Details */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-[2]">
          <h3 className="text-white text-xs sm:text-sm font-bold line-clamp-2 leading-tight drop-shadow-md group-hover:text-red-400 transition-colors">
            {item.name}
          </h3>
          <div className="flex items-center justify-between text-white/60 text-[10px] sm:text-xs mt-1">
            <span>{item.year}</span>
            {item.time && (
              <span className="truncate max-w-[80px]">{item.time}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
