"use client";

import ButtonHoverMenuCard from "./ButtonHoverMenuCard";
import { NavItem } from "../types/navType";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { SearchBar } from "./SearchBar";
import { Menu, X, History, User, LogOut } from "lucide-react";
import { useUserHistoryStore } from "../store/useUserHistoryStore";
import { LoginModal } from "./LoginModal";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const { user, logout, history } = useUserHistoryStore();
  const watchingCount = Object.values(history).filter((i) => !i.isCompleted).length;

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

          <div className="flex items-center gap-3">
            <SearchBar />

            {/* Desktop User Hai Yen / Login */}
            {user?.isLoggedIn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-brand/30 text-white transition-all text-xs font-medium"
                >
                  <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand to-pink-500 flex items-center justify-center text-white text-[10px] font-bold">
                    HY
                  </span>
                  <span className="font-semibold text-white">Hải Yến</span>
                  {watchingCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-brand text-[10px] font-bold flex items-center justify-center text-white">
                      {watchingCount}
                    </span>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-[#16181f] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-scaleUp"
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-white/10">
                      <p className="text-xs font-semibold text-white">Hải Yến</p>
                      <p className="text-[11px] text-white/50">VIP Member • haiyen</p>
                    </div>

                    <Link
                      href="/lich-su"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <History className="w-4 h-4 text-brand" />
                        Lịch sử xem phim
                      </span>
                      {watchingCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-brand/20 text-brand text-[10px] font-semibold">
                          {watchingCount} đang xem
                        </span>
                      )}
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand hover:bg-brand/90 text-white font-medium text-xs shadow-md shadow-brand/20 transition-all active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
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

          <div className="flex items-center gap-1.5">
            {user?.isLoggedIn ? (
              <Link
                href="/lich-su"
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-pink-500 flex items-center justify-center text-white text-[11px] font-bold shadow-md"
                title="Lịch sử xem của Hải Yến"
              >
                HY
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="p-1.5 rounded-lg bg-white/10 text-white"
                title="Đăng nhập Hải Yến"
              >
                <User className="w-4 h-4" />
              </button>
            )}
            <SearchBar />
          </div>
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
                {/* Mobile User Status Card */}
                <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                  {user?.isLoggedIn ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                            HY
                          </span>
                          <div>
                            <p className="text-xs font-bold text-white">Hải Yến</p>
                            <p className="text-[10px] text-white/50">VIP Member</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="p-1.5 text-xs text-red-400 hover:text-red-300"
                          title="Đăng xuất"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      </div>

                      <Link
                        href="/lich-su"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="mt-3 flex items-center justify-between px-3 py-2 rounded-lg bg-brand/20 text-brand text-xs font-semibold"
                      >
                        <span className="flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5" />
                          Lịch sử xem phim
                        </span>
                        <span>{watchingCount} đang xem</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-1">
                      <p className="text-xs text-white/70 mb-2">
                        Đăng nhập tài khoản Hải Yến để lưu lịch sử
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsLoginModalOpen(true);
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-brand hover:bg-brand/90 text-white text-xs font-semibold shadow-md shadow-brand/20"
                      >
                        Đăng nhập Hải Yến
                      </button>
                    </div>
                  )}
                </div>

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
                  {user?.isLoggedIn && (
                    <Link
                      href="/lich-su"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2.5 text-brand bg-brand/10 hover:bg-brand/20 rounded-lg transition-colors font-semibold text-sm flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Lịch sử xem phim
                      </span>
                      {watchingCount > 0 && (
                        <span className="text-xs bg-brand text-white px-1.5 py-0.5 rounded-full">
                          {watchingCount}
                        </span>
                      )}
                    </Link>
                  )}
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

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
