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
import { OphimHomeItem } from "../types/navType";
import { Info, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function SliderBannerCard({
  homeItems,
  homeAppDomains,
}: {
  homeItems: OphimHomeItem[];
  homeAppDomains: {
    cdnImage: string;
  };
}) {
  return (
    <div className="relative w-full h-[56vh] min-h-[320px] max-h-[720px] overflow-hidden hero-swiper">
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
        {homeItems.slice(0, 8).map((item, idx) => (
          <SwiperSlide key={item._id} className="relative !bg-[#0a0a0a] h-full">
            <Image
              src={`${homeAppDomains.cdnImage}/uploads/movies/${item.thumb_url || item.poster_url}`}
              alt={item.name}
              fill
              sizes="100vw"
              priority={idx === 0}
              className="object-cover object-top scale-105"
            />

            {/* Multi-layer cinematic gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent h-32" />

            <div className="absolute inset-0 flex items-end sm:items-center pb-16 sm:pb-0">
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 animate-fadeInUp">
                <div className="max-w-xl space-y-3 sm:space-y-4 text-left">
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                    {item.quality && (
                      <span className="bg-brand text-white px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                        {item.quality}
                      </span>
                    )}
                    <span className="text-white/80">{item.year}</span>
                    {item.episode_current && (
                      <>
                        <span className="text-white/40">•</span>
                        <span className="text-white/80">
                          {item.episode_current}
                        </span>
                      </>
                    )}
                    {item.lang && (
                      <>
                        <span className="text-white/40">•</span>
                        <span className="text-white/80">{item.lang}</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-2xl line-clamp-2">
                    {item.name}
                  </h2>

                  {item.origin_name && item.origin_name !== item.name && (
                    <p className="text-white/60 text-sm sm:text-base line-clamp-1">
                      {item.origin_name}
                    </p>
                  )}

                  {item.category && item.category.length > 0 && (
                    <p className="text-white/50 text-xs sm:text-sm hidden sm:block">
                      {item.category.map((c) => c.name).join(" · ")}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href={`/movie/${item.slug}`}
                      className="inline-flex items-center gap-2 bg-white text-black font-semibold px-5 sm:px-7 py-2.5 sm:py-3 rounded-md hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Xem ngay
                    </Link>
                    <Link
                      href={`/movie/${item.slug}`}
                      className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-md hover:bg-white/30 transition-all border border-white/10"
                    >
                      <Info className="w-5 h-5" />
                      Chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Fade into content below */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
    </div>
  );
}

export default SliderBannerCard;
