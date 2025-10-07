import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import SearchModal from "./components/SearchModal";

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
        <SearchModal />

        {/* Main Content */}
        <main className="pt-5">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-xl font-bold text-white mb-4">
                  🎬 FilmHub
                </h3>
                <p className="text-gray-400 mb-4">
                  Khám phá thế giới điện ảnh với hàng ngàn bộ phim từ khắp nơi
                  trên thế giới. Tìm hiểu thông tin chi tiết, xem trailer và
                  quản lý danh sách yêu thích của bạn.
                </p>
                <p className="text-sm text-gray-500">
                  Dữ liệu phim được cung cấp bởi The Movie Database (TMDB).
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
                  Liên kết
                </h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a href="/" className="hover:text-white transition-colors">
                      Trang chủ
                    </a>
                  </li>
                  <li>
                    <a
                      href="/favorites"
                      className="hover:text-white transition-colors"
                    >
                      Yêu thích
                    </a>
                  </li>
                  <li>
                    <a
                      href="/about"
                      className="hover:text-white transition-colors"
                    >
                      Giới thiệu
                    </a>
                  </li>
                  <li>
                    <a
                      href="/contact"
                      className="hover:text-white transition-colors"
                    >
                      Liên hệ
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
                  Thể loại phim
                </h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a
                      href="/genre/action"
                      className="hover:text-white transition-colors"
                    >
                      Hành động
                    </a>
                  </li>
                  <li>
                    <a
                      href="/genre/comedy"
                      className="hover:text-white transition-colors"
                    >
                      Hài kịch
                    </a>
                  </li>
                  <li>
                    <a
                      href="/genre/drama"
                      className="hover:text-white transition-colors"
                    >
                      Chính kịch
                    </a>
                  </li>
                  <li>
                    <a
                      href="/genre/horror"
                      className="hover:text-white transition-colors"
                    >
                      Kinh dị
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 FilmHub. Tất cả quyền được bảo lưu.</p>
              <p className="mt-2 text-sm">
                Dữ liệu được cung cấp bởi{" "}
                <a
                  href="https://www.themoviedb.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  The Movie Database
                </a>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
