"use client";
import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import Image from "next/image";
import { MoviePerson } from "../types/navType";

interface SliderCastSectionProps {
  actors: MoviePerson[];
}

export default function SliderCastSection({ actors }: SliderCastSectionProps) {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="relative group/cast">
      <button
        ref={prevRef}
        type="button"
        aria-label="Diễn viên trước"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/70 border border-white/15 hover:bg-brand hover:border-brand opacity-0 group-hover/cast:opacity-100 transition-all"
      >
        <ChevronLeft className="text-white w-5 h-5" />
      </button>

      <button
        ref={nextRef}
        type="button"
        aria-label="Diễn viên sau"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/70 border border-white/15 hover:bg-brand hover:border-brand opacity-0 group-hover/cast:opacity-100 transition-all"
      >
        <ChevronRight className="text-white w-5 h-5" />
      </button>

      <Swiper
        spaceBetween={12}
        modules={[Navigation]}
        breakpoints={{
          0: { slidesPerView: 2.4 },
          480: { slidesPerView: 3.2 },
          640: { slidesPerView: 4.2 },
          768: { slidesPerView: 5.2 },
          1024: { slidesPerView: 6.2 },
        }}
        onInit={(swiper) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          swiper.params.navigation.prevEl = prevRef.current;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.navigation.init();
          swiper.navigation.update();
        }}
        className="w-full !px-1"
      >
        {actors.map((actor) => (
          <SwiperSlide key={actor.tmdb_people_id} className="!h-auto">
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200 h-full">
              <div className="size-20 sm:size-24 border-2 border-white/10 rounded-full overflow-hidden bg-[#1a1a1a] shrink-0">
                {actor.profile_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                    alt={actor.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-center line-clamp-2 leading-snug">
                {actor.name}
              </h3>
              {actor.character && (
                <p className="text-[11px] sm:text-xs text-muted-foreground text-center line-clamp-2">
                  {actor.character}
                </p>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
