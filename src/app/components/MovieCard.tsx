"use client";

import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { OphimHomeItem } from "../types/navType";

interface MovieCardProps {
  item: OphimHomeItem;
  cdnImage: string;
  priority?: boolean;
  className?: string;
}

export default function MovieCard({
  item,
  cdnImage,
  priority = false,
  className = "",
}: MovieCardProps) {
  const imageUrl = `${cdnImage}/uploads/movies/${item.thumb_url || item.poster_url}`;

  return (
    <Link
      href={`/movie/${item.slug}`}
      className={`group relative block flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md overflow-hidden ${className}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-[#1a1a1a] ring-1 ring-white/5 group-hover:ring-brand/40 transition-all duration-300 shadow-lg shadow-black/40 group-hover:shadow-xl group-hover:shadow-black/60 group-hover:z-10 group-hover:scale-[1.05]">
        {cdnImage ? (
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
          <div className="absolute inset-0 bg-muted" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-brand/90 text-white shadow-lg shadow-brand/30 scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </span>
        </div>

        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1 z-[1]">
          {item.quality && (
            <span className="bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shadow">
              {item.quality}
            </span>
          )}
          {item.episode_current && (
            <span className="bg-black/75 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded ml-auto truncate max-w-[70%]">
              {item.episode_current}
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2.5 z-[1]">
          <h3 className="text-white text-xs sm:text-sm font-semibold line-clamp-2 leading-snug drop-shadow-md">
            {item.name}
          </h3>
          <p className="text-white/60 text-[10px] sm:text-xs mt-0.5">
            {item.year}
          </p>
        </div>
      </div>
    </Link>
  );
}
