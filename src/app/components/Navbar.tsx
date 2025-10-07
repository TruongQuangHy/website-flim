"use client";

import ButtonHoverMenuCard from "./ButtonHoverMenuCard";
import { NavItem } from "../types/navType";
import Link from "next/link";
import { useState } from "react";
import { SearchBar } from "./SearchBar";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { name: "Thể loại", slug: "the-loai" },
    { name: "Quốc gia", slug: "quoc-gia" },
    // { name: "Danh sách", slug: "danh-sach" },
    // { name: "Năm phát hành", slug: "nam-phat-hanh" },
  ];

  return (
    <nav className="bg-black/70">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between p-4 max-w-7xl mx-auto">
        <div className="text-white text-2xl font-bold">
          <Link href="/">
            <img
              src="/logo.png"
              alt="FilmHub Logo"
              className="logo object-cover"
              style={{ width: "60px", height: "auto" }}
            />
          </Link>
        </div>
        <div className="flex space-x-4 border-2 border-[var(--color-gray-700)] rounded-lg px-3 py-2">
          {navItems.map((item) => (
            <ButtonHoverMenuCard key={item.slug} navItem={item} />
          ))}
        </div>
        <div>
          <SearchBar />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-between p-4">
        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white p-2 focus:outline-none z-50"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Logo - Centered */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link href="/">
            <img
              src="/logo.png"
              alt="FilmHub Logo"
              className="logo object-cover"
              style={{ width: "50px", height: "auto" }}
            />
          </Link>
        </div>

        {/* Search Icon */}
        <div>
          <SearchBar />
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fadeIn"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 left-0 h-full w-64 bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out md:hidden overflow-y-auto animate-slideInLeft shadow-2xl">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <img
                    src="/logo.png"
                    alt="FilmHub Logo"
                    className="logo object-cover"
                    style={{ width: "50px", height: "auto" }}
                  />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Mobile Menu Items */}
              <div className="flex flex-col space-y-2">
                {navItems.map((item, index) => (
                  <div
                    key={item.slug}
                    className="animate-slideInLeft"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ButtonHoverMenuCard
                      navItem={item}
                      isMobile={true}
                      onItemClick={() => setIsMobileMenuOpen(false)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
