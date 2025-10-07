"use client";

import React from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "../styles.css";

// import required modules
import {
  Navigation,
  Pagination,
  Mousewheel,
  Keyboard,
  Autoplay,
} from "swiper/modules";
import { OphimHomeItem } from "../types/navType";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";
import Link from "next/link";

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
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      <button className="swiper-button-prev absolute left-2 top-1/2 translate-y-1/2 z-10 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700">
        <ArrowLeft size={5} />
      </button>

      <button className="swiper-button-next absolute right-2 top-1/2 translate-y-1/2 z-10 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700">
        <ArrowRight size={5} />
      </button>
      <Swiper
        cssMode={true}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        pagination={true}
        mousewheel={true}
        keyboard={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        modules={[Navigation, Pagination, Mousewheel, Keyboard, Autoplay]}
        className="mySwiper h-full"
      >
        {homeItems.slice(0, 5).map((item) => (
          <SwiperSlide key={item._id} className="relative group">
            <img
              src={`${homeAppDomains.cdnImage}/uploads/movies/${item.thumb_url}`}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute w-full h-full top-0 left-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 p-4 flex flex-col gap-2">
              <div>
                <h3 className="text-white text-xl font-bold mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-300 text-sm mb-2">{item.origin_name}</p>
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-xs bg-red-600 px-2 py-1 rounded mr-2">
                    {item.quality}
                  </span>
                  <span className="text-gray-300 text-xs">{item.year}</span>
                  <span className="text-gray-300 text-xs">
                    {item.episode_current}
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-black/50 w-full h-full flex justify-center items-center group-hover:opacity-100 opacity-0 transition-opacity duration-300">
              <Link
                href={`/movie/${item.slug}`}
                className="bg-red-600 text-white p-4 rounded-full text-sm flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors duration-300"
              >
                <Play className="inline-block" size={20} />
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default SliderBannerCard;
