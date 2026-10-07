"use client";

import ButtonHoverMenuCard from "./ButtonHoverMenuCard";
import { NavItem } from "../types/navType";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { SearchBar } from "./SearchBar";
import { Menu, X } from "lucide-react";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

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
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
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

        {/* Mobile Navbar Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 relative">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-white p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Mở menu"
          >
            <Menu className="w-6 h-6" />
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
      </nav>

      {/* Mobile Drawer (Portaled directly to document.body to avoid backdrop-filter containing block trap) */}
      {mounted &&
        isMobileMenuOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] md:hidden">
            {/* Dark blur backdrop overlay */}
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-fadeIn"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden
            />
            {/* Drawer container */}
            <div className="fixed top-0 left-0 bottom-0 h-[100dvh] w-72 max-w-[85vw] bg-[#141414] z-10 flex flex-col animate-slideInLeft shadow-2xl border-r border-white/10">
              {/* Drawer Header with Logo & Close Button */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 shrink-0 bg-[#161616]">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Image
                    src="/logo.png"
                    alt="HyFlim"
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain rounded-md"
                  />
                  <span className="text-brand font-bold text-lg">HyFlim</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Đóng menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Nav Items */}
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-1 mb-4">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2.5 text-white/90 hover:bg-white/5 hover:text-brand rounded-lg transition-colors font-medium text-sm"
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
          </div>,
          document.body
        )}
    </>
  );
};

export default Navbar;
