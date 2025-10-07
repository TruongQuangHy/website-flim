"use client";

import React, { Suspense } from "react";

// Main component with Suspense
const SearchPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 pt-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      }
    ></Suspense>
  );
};

export default SearchPage;
