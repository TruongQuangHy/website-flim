"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../styles.css";
import {
  Navigation,
  Pagination,
  Keyboard,
  Autoplay,
  EffectFade,
} from "swiper/modules";
import "swiper/css/effect-fade";
import { VsmovMovieItem } from "../types/navType";
import { getMovieImageUrl } from "../lib/api";
import { Info, Play, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function SliderBannerCard({
  homeItems,
  homeAppDomains,
}: {
  homeItems: VsmovMovieItem[];
  homeAppDomains?: {
    cdnImage: string;
  };
}) {
  const cdnImage = homeAppDomains?.cdnImage || "";

  return (
    <div className="relative w-full h-[52vh] sm:h-[60vh] min-h-[360px] sm:min-h-[420px] max-h-[720px] overflow-hidden hero-swiper">
      <Swiper
        navigation
        pagination={{ clickable: true }}
        keyboard
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        modules={[Navigation, Pagination, Keyboard, Autoplay, EffectFade]}
        className="h-full w-full"
        loop={homeItems.length > 1}
      >
        {homeItems.slice(0, 8).map((item, idx) => {
          const bannerImg = getMovieImageUrl(item, cdnImage);
          const tmdbRating = item.tmdb?.vote_average
            ? Number(item.tmdb.vote_average).toFixed(1)
            : null;

          return (
            <SwiperSlide key={item._id} className="relative !bg-[#0a0a0a] h-full">
              {bannerImg && (
                <Image
                  src={bannerImg}
                  alt={item.name}
                  fill
                  sizes="100vw"
                  priority={idx === 0}
                  className="object-cover object-top scale-105"
                />
              )}

              {/* Multi-layer cinematic gradients */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/40" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent h-32" />

              <div className="absolute inset-0 flex items-end sm:items-center pb-12 sm:pb-0">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 animate-fadeInUp">
                  <div className="max-w-xl space-y-2.5 sm:space-y-4 text-left">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm">
                      {item.quality && (
                        <span className="bg-brand text-white px-2 py-0.5 rounded font-extrabold uppercase tracking-wide text-[10px] sm:text-xs">
                          {item.quality}
                        </span>
                      )}
                      {item.chieurap && (
                        <span className="bg-amber-500/90 text-black px-1.5 py-0.5 rounded font-bold text-[10px] sm:text-xs uppercase">
                          Chiếu Rạp
                        </span>
                      )}
                      {tmdbRating && Number(tmdbRating) > 0 && (
                        <span className="inline-flex items-center gap-1 bg-black/70 backdrop-blur text-amber-400 font-bold px-1.5 py-0.5 rounded ring-1 ring-amber-400/30 text-[10px] sm:text-xs">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {tmdbRating} TMDB
                        </span>
                      )}
                      <span className="text-white/80">{item.year}</span>
                      {item.episode_current && (
                        <>
                          <span className="text-white/40">•</span>
                          <span className="text-white/80 truncate max-w-[120px]">
                            {item.episode_current}
                          </span>
                        </>
                      )}
                    </div>

                    <h1 className="text-xl sm:text-4xl lg:text-5xl font-black text-white leading-tight drop-shadow-xl tracking-tight line-clamp-2">
                      {item.name}
                    </h1>

                    {item.origin_name && item.origin_name !== item.name && (
                      <p className="text-xs sm:text-base text-white/70 italic drop-shadow line-clamp-1">
                        {item.origin_name}
                      </p>
                    )}

                    <div className="flex items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                      <Link
                        href={`/movie/${item.slug}`}
                        className="inline-flex items-center gap-1.5 sm:gap-2 bg-brand hover:bg-brand-hover text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold text-xs sm:text-base shadow-xl shadow-brand/40 transition-all hover:scale-105 active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current" />
                        Xem ngay
                      </Link>
                      <Link
                        href={`/movie/${item.slug}`}
                        className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/15 hover:bg-white/25 text-white backdrop-blur-md px-3.5 sm:px-5 py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-base transition-colors active:scale-95"
                      >
                        <Info className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

export default SliderBannerCard;
