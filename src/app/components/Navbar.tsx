"use client";

import SearchBar from "./SearchBar";
import ButtonHoverMenuCard from "./ButtonHoverMenuCard";
import { NavItem } from "../types/navType";
import Link from "next/link";

const Navbar: React.FC = () => {
  const navItems: NavItem[] = [
    { name: "Thể loại", slug: "the-loai" },
    { name: "Quốc gia", slug: "quoc-gia" },
    // { name: "Danh sách", slug: "danh-sach" },
    { name: "Năm phát hành", slug: "nam-phat-hanh" },
  ];

  return (
    <nav className="bg-black/70">
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
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
    </nav>
  );
};

export default Navbar;
