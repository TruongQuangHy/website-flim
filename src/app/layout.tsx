import Script from "next/script";
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
  title: "FilmHub - Khám phá thế giới điện ảnh",
  /* ...bỏ phần còn lại để ngắn gọn... */
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      {/* --- Thêm Script AdSense ở đây --- */}
      <Script
        id="adsense-script"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5905557948463114"
        crossOrigin="anonymous"
        strategy="beforeInteractive"
      />
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-900 text-white min-h-screen`}
      >
        {/* Navigation */}
        <Navbar />

        {/* Main Content */}
        <main className="pt-5">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-16">
          {/* ...footer như cũ... */}
        </footer>
      </body>
    </html>
  );
}
