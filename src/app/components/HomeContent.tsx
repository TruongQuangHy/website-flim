"use client";

import React, { useEffect } from "react";
import { MovieAPI } from "../lib/api";
import { useStore } from "../store/useStore";
import SliderBannerCard from "./SliderBannerCard";

function HomeContent() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SliderBannerCard />

      {/* Display home items */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Phim mới cập nhật</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {homeItems.slice(0, 12).map((item) => (
            <div
              key={item._id}
              className="bg-gray-800 rounded-lg overflow-hidden"
            >
              <img
                src={`${homeAppDomains.cdnImage}/uploads/movies/${item.thumb_url}`}
                alt={item.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-3">
                <h3 className="text-sm font-medium truncate">{item.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{item.year}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs bg-red-600 px-2 py-1 rounded">
                    {item.quality}
                  </span>
                  <span className="text-xs text-gray-400">
                    {item.episode_current}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomeContent;
