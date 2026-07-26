import Link from "next/link";
import Image from "next/image";
import { Film } from "lucide-react";

const quickLinks = [
  { name: "Phim mới", href: "/danh-sach/phim-moi-phat-hanh" },
  { name: "Phim chiếu rạp", href: "/danh-sach/phim-chieu-rap" },
  { name: "Phim bộ", href: "/danh-sach/phim-bo" },
  { name: "Phim lẻ", href: "/danh-sach/phim-le" },
  { name: "Hoạt hình", href: "/danh-sach/hoat-hinh" },
  { name: "TV Shows", href: "/danh-sach/tv-shows" },
];

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <Image
                src="/logo.png"
                alt="HyFlim"
                width={40}
                height={40}
                className="h-10 w-10 object-contain rounded-md"
              />
              <span className="text-xl font-bold tracking-tight group-hover:text-brand transition-colors">
                HyFlim
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Khám phá thế giới điện ảnh với kho phim chiếu rạp, phim mới cập
              nhật mỗi ngày. Trải nghiệm xem phim mượt mà, giao diện hiện đại.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Film className="w-4 h-4 text-brand" />
              Khám phá
            </h3>
            <ul className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Thông tin
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              HyFlim mang đến trải nghiệm xem phim trực tuyến chất lượng cao.
              Nội dung được cập nhật liên tục từ nhiều nguồn.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} HyFlim. All rights reserved.</p>
          <p>Xem phim giải trí — vui lòng tôn trọng bản quyền.</p>
        </div>
      </div>
    </footer>
  );
}
