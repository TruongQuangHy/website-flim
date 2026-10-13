import Link from "next/link";
import { Film, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
          <Film className="w-12 h-12" />
        </div>
        <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-brand text-white text-xs font-bold shadow-lg">
          404
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
        Trang không tồn tại
      </h1>
      <p className="text-white/60 text-sm sm:text-base max-w-md mb-8">
        Đường dẫn bạn truy cập có thể đã bị xóa hoặc không khả dụng trên hệ thống HyFlim.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-semibold shadow-lg shadow-brand/30 transition-all active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>
    </div>
  );
}
