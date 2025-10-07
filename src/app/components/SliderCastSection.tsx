"use client";
import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { MoviePerson } from "../types/navType";

interface SliderCastSectionProps {
  actors: MoviePerson[];
}

export default function SliderCastSection({ actors }: SliderCastSectionProps) {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="relative overflow-hidden">
      {/* Custom navigation buttons */}
      <button
        ref={prevRef}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-gray-900/70 hover:bg-gray-800 p-2 rounded-full"
      >
        <ChevronLeft className="text-white w-6 h-6" />
      </button>

      <button
        ref={nextRef}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-gray-900/70 hover:bg-gray-800 p-2 rounded-full"
      >
        <ChevronRight className="text-white w-6 h-6" />
      </button>

      <Swiper
        slidesPerView={4}
        spaceBetween={10}
        modules={[Navigation]}
        onInit={(swiper) => {
          // Kết nối Swiper với nút custom
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          swiper.params.navigation.prevEl = prevRef.current;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.navigation.init();
          swiper.navigation.update();
        }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        className="mySwiper w-full"
      >
        {actors.map((actor) => (
          <SwiperSlide
            key={actor.tmdb_people_id}
            className="!w-auto flex justify-center bg-gray-800 rounded-lg p-4"
          >
            <div className="flex flex-col items-center gap-2 w-46">
              <div className="size-20 border-2 border-gray-600 rounded-full overflow-hidden">
                {actor.profile_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                    alt={actor.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No Image</span>
                  </div>
                )}
              </div>
              <h1 className="text-sm font-bold text-center">{actor.name}</h1>
              <h1 className="text-sm font-light text-center text-gray-300">
                {actor.character}
              </h1>
              <p className="text-sm text-gray-400">
                {actor.known_for_department}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
