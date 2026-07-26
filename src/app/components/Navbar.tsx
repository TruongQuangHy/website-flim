"use client";

import ButtonHoverMenuCard from "./ButtonHoverMenuCard";
import { NavItem } from "../types/navType";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";
import { Menu, X } from "lucide-react";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems: NavItem[] = [
    { name: "Thể loại", slug: "the-loai" },
    { name: "Quốc gia", slug: "quoc-gia" },
  ];

  const quickLinks = [
    { name: "Phim mới", href: "/danh-sach/phim-moi-phat-hanh" },
    { name: "Chiếu rạp", href: "/danh-sach/phim-chieu-rap" },
    { name: "Phim bộ", href: "/danh-sach/phim-bo" },
    { name: "Phim lẻ", href: "/danh-sach/phim-le" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isMobileMenuOpen
          ? "bg-black/95 backdrop-blur-md shadow-lg shadow-black/40"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between px-6 lg:px-10 py-3 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo.png"
              alt="HyFlim"
              width={40}
              height={40}
              className="h-9 w-9 object-contain rounded-md"
              priority
            />
            <span className="text-brand font-extrabold text-xl tracking-tight hidden lg:inline">
              HyFlim
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-white/80 hover:text-white transition-colors rounded-md hover:bg-white/5"
              >
                {link.name}
              </Link>
            ))}
            {navItems.map((item) => (
              <ButtonHoverMenuCard key={item.slug} navItem={item} />
            ))}
          </div>
        </div>

        <SearchBar />
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 relative">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
          aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2"
        >
          <Image
            src="/logo.png"
            alt="HyFlim"
            width={32}
            height={32}
            className="h-8 w-8 object-contain rounded-md"
            priority
          />
          <span className="text-brand font-bold text-lg">HyFlim</span>
        </Link>

        <SearchBar />
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden animate-fadeIn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden
          />
          <div className="fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-[#141414] z-50 md:hidden overflow-y-auto animate-slideInLeft shadow-2xl border-r border-white/10">
            <div className="p-4 pt-16">
              <div className="flex flex-col gap-1 mb-6">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-3 text-white/90 hover:bg-white/5 hover:text-brand rounded-lg transition-colors font-medium"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="border-t border-white/10 pt-2 flex flex-col">
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
