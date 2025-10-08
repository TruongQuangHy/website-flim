import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FilmHub - Khám phá thế giới điện ảnh ádasdasd",
  description:
    "Website xem thông tin phim, trailer, đánh giá và quản lý danh sách yêu thích. Khám phá những bộ phim hay nhất từ TMDB.",
  keywords: "phim, movie, trailer, đánh giá phim, TMDB, cinema",
  authors: [{ name: "FilmHub Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#111827",
  robots: "index, follow",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "FilmHub - Khám phá thế giới điện ảnh",
    description:
      "Website xem thông tin phim, trailer, đánh giá và quản lý danh sách yêu thích",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-900 text-white min-h-screen`}
      >
        {/* Navigation */}
        <Navbar />

        {/* Search Modal */}

        {/* Main Content */}
        <main className="pt-5">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <img src="/logo.png" alt="FilmHub Logo" className="h-30 mb-4" />
                <p className="text-gray-400 mb-4">
                  Khám phá thế giới điện ảnh với hàng ngàn bộ phim từ khắp nơi
                  trên thế giới. Tìm hiểu thông tin chi tiết, xem trailer và
                  quản lý danh sách yêu thích của bạn.
                </p>
                <p className="text-sm text-gray-500">
                  Dữ liệu phim được cung cấp bởi Ổ Phim (OPhim.live).
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
                  Liên kết
                </h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link
                      href="/"
                      className="hover:text-white transition-colors"
                    >
                      Trang chủ
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="hover:text-white transition-colors"
                    >
                      Giới thiệu
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="hover:text-white transition-colors"
                    >
                      Liên hệ
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
                  Thể loại phim
                </h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link
                      href="/the-loai/hanh-dong"
                      className="hover:text-white transition-colors"
                    >
                      Hành động
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/the-loai/hai-huoc"
                      className="hover:text-white transition-colors"
                    >
                      Hài kịch
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/the-loai/chinh-kich"
                      className="hover:text-white transition-colors"
                    >
                      Chính kịch
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/the-loai/kinh-di"
                      className="hover:text-white transition-colors"
                    >
                      Kinh dị
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 HyFlim. Tất cả quyền được bảo lưu.</p>
              <p className="mt-2 text-sm">
                Dữ liệu được cung cấp bởi{" "}
                <a
                  href="https://ophim16.cc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Ổ phim
                </a>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
