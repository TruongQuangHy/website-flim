import Script from "next/script";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HyFlim - Khám phá thế giới điện ảnh",
  description:
    "Xem phim chiếu rạp, phim mới cập nhật mỗi ngày. Kho phim bộ, phim lẻ, hoạt hình và TV Shows chất lượng cao.",
  keywords: [
    "xem phim",
    "phim chiếu rạp",
    "phim mới",
    "phim bộ",
    "phim lẻ",
    "HyFlim",
  ],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <Script
        id="adsense-script"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5905557948463114"
        crossOrigin="anonymous"
        strategy="beforeInteractive"
      />
      <body
        className={`${inter.variable} font-sans antialiased bg-[#0a0a0a] text-white min-h-screen`}
      >
        <Navbar />
        <main className="pt-16 min-h-[calc(100vh-16rem)]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
