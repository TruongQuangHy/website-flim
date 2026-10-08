"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUserHistoryStore } from "../store/useUserHistoryStore";
import { LoginModal } from "../components/LoginModal";
import {
  Play,
  CheckCircle2,
  Clock,
  Trash2,
  Download,
  Upload,
  Film,
  ArrowRight,
  Heart,
  RotateCcw,
} from "lucide-react";

export default function WatchHistoryPage() {
  const {
    user,
    history,
    syncFromDatabase,
    markCompleted,
    removeMovie,
    clearAllHistory,
    exportHistoryJson,
    importHistoryJson,
  } = useUserHistoryStore();

  const [activeTab, setActiveTab] = useState<"watching" | "completed">("watching");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user?.isLoggedIn) {
      syncFromDatabase();
    }
  }, [user?.isLoggedIn, syncFromDatabase]);

  // Group movies
  const historyList = useMemo(() => {
    return Object.values(history).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [history]);

  const watchingMovies = useMemo(() => {
    return historyList.filter((m) => !m.isCompleted);
  }, [historyList]);

  const completedMovies = useMemo(() => {
    return historyList.filter((m) => m.isCompleted);
  }, [historyList]);

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleExport = () => {
    const jsonStr = exportHistoryJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `haiyen_lich_su_xem_phim_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importHistoryJson(content);
        if (res.success) {
          setImportStatus(`Đã khôi phục thành công ${res.count} phim!`);
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus(`Lỗi: ${res.error}`);
          setTimeout(() => setImportStatus(null), 4000);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem phim của Hải Yến không?")) {
      clearAllHistory();
    }
  };

  if (!user?.isLoggedIn) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 max-w-lg mx-auto flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand mb-6 shadow-2xl shadow-brand/20">
          <Heart className="w-10 h-10 fill-brand/30 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Lịch Sử Xem Phim Hải Yến
        </h1>
        <p className="text-sm text-white/60 mb-6 leading-relaxed">
          Vui lòng đăng nhập tài khoản dành riêng cho Hải Yến (tài khoản: <span className="text-brand font-semibold">haiyen</span>) để xem danh sách phim đang xem dở, phim đã xem và tự động tiếp tục xem đúng tập.
        </p>

        <button
          type="button"
          onClick={() => setIsLoginModalOpen(true)}
          className="py-3 px-8 rounded-xl bg-gradient-to-r from-brand to-red-600 hover:from-brand/90 hover:to-red-600/90 text-white font-semibold text-sm shadow-xl shadow-brand/25 transition-all transform active:scale-95"
        >
          Đăng nhập tài khoản Hải Yến
        </button>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </div>
    );
  }

  const currentDisplayList = activeTab === "watching" ? watchingMovies : completedMovies;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Profile Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#171923] via-[#14151b] to-[#1a1215] border border-white/10 p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-brand via-pink-500 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand/30">
                HY
              </div>
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full ring-2 ring-[#171923]" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Hải Yến
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-brand/20 border border-brand/40 text-brand text-[11px] font-semibold">
                  VIP Member
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/60 mt-1">
                Lịch sử xem phim cá nhân • Tự động ghi nhớ tập và thời gian xem dở
              </p>
            </div>
          </div>

          {/* Backup / Export / Import Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-medium transition-all"
              title="Tải về file sao lưu lịch sử JSON"
            >
              <Download className="w-3.5 h-3.5 text-brand" />
              <span>Sao lưu JSON</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-medium transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Khôi phục JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            {historyList.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-white/60 hover:text-red-400 text-xs font-medium transition-all"
                title="Xóa tất cả lịch sử"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa hết</span>
              </button>
            )}
          </div>
        </div>

        {importStatus && (
          <div className="mt-4 p-3 rounded-xl bg-brand/20 border border-brand/40 text-brand text-xs font-medium animate-fadeIn">
            {importStatus}
          </div>
        )}
      </div>

      {/* Tabs Switcher: Đang xem vs Đã xem */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("watching")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
              activeTab === "watching"
                ? "bg-brand text-white shadow-lg shadow-brand/25"
                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Phim Đang Xem</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeTab === "watching" ? "bg-white/20 text-white" : "bg-white/10 text-white/70"
              }`}
            >
              {watchingMovies.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
              activeTab === "completed"
                ? "bg-brand text-white shadow-lg shadow-brand/25"
                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Phim Đã Xem</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeTab === "completed" ? "bg-white/20 text-white" : "bg-white/10 text-white/70"
              }`}
            >
              {completedMovies.length}
            </span>
          </button>
        </div>

        <p className="text-xs text-white/40 hidden sm:block">
          {activeTab === "watching"
            ? "Tự động phát tiếp tập & vị trí xem dở"
            : "Các phim Hải Yến đã xem hoàn thành"}
        </p>
      </div>

      {/* Movie Grid */}
      {currentDisplayList.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Film className="w-16 h-16 text-white/20 mb-4 stroke-1" />
          <h3 className="text-base font-bold text-white mb-1">
            {activeTab === "watching"
              ? "Chưa có phim nào đang xem dở"
              : "Chưa có phim nào đã xem xong"}
          </h3>
          <p className="text-xs text-white/50 max-w-sm mb-6">
            {activeTab === "watching"
              ? "Khi bạn xem bất kỳ bộ phim nào trên web hoặc app, hệ thống sẽ tự động lưu lại tập và tiến trình tại đây."
              : "Các phim bạn xem hết tập cuối hoặc đánh dấu hoàn tất sẽ xuất hiện ở mục này."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand/90 text-white text-xs font-semibold shadow-lg shadow-brand/20 transition-all"
          >
            <span>Khám phá phim ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {currentDisplayList.map((item) => {
            const resumeUrl = `/movie/${item.movieSlug}`;

            return (
              <div
                key={item.movieSlug}
                className="group relative bg-[#15171e] hover:bg-[#1a1d26] border border-white/10 hover:border-brand/40 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col"
              >
                {/* Poster & Overlay */}
                <div className="relative aspect-video w-full bg-black/60 overflow-hidden">
                  {item.posterUrl ? (
                    <Image
                      src={item.posterUrl}
                      alt={item.movieName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30">
                      <Film className="w-10 h-10" />
                    </div>
                  )}

                  {/* Top badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
                      {item.quality || "HD"}
                    </span>

                    {item.isCompleted ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[10px] font-bold shadow-md">
                        <CheckCircle2 className="w-3 h-3" />
                        Đã xem xong
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand/90 text-white text-[10px] font-bold shadow-md">
                        <Clock className="w-3 h-3" />
                        {item.lastEpisodeName}
                      </span>
                    )}
                  </div>

                  {/* Play Button Overlay */}
                  <Link
                    href={resumeUrl}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </Link>

                  {/* Progress Bar (Netflix Red Style) */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                    <div
                      className={`h-full ${
                        item.isCompleted ? "bg-emerald-500" : "bg-brand"
                      } transition-all`}
                      style={{ width: `${item.progressPercent || 0}%` }}
                    />
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <Link
                      href={resumeUrl}
                      className="font-bold text-white text-sm line-clamp-1 hover:text-brand transition-colors"
                      title={item.movieName}
                    >
                      {item.movieName}
                    </Link>

                    {item.originName && (
                      <p className="text-xs text-white/50 line-clamp-1 mt-0.5">
                        {item.originName}
                      </p>
                    )}

                    {/* Episode & Progress text */}
                    <div className="flex items-center justify-between text-xs text-white/70 mt-2.5 pt-2 border-t border-white/5">
                      <span className="font-semibold text-brand">
                        {item.lastEpisodeName}
                        {item.totalEpisodes ? ` / ${item.totalEpisodes} tập` : ""}
                      </span>

                      <span>
                        {formatSeconds(item.lastPositionSeconds)} / {formatSeconds(item.durationSeconds)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-white/40 mt-1">
                      <span>Tiến độ: {item.progressPercent}%</span>
                      <span>
                        {new Date(item.updatedAt).toLocaleDateString("vi-VN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <Link
                      href={resumeUrl}
                      className="flex-1 py-2 px-3 rounded-xl bg-brand hover:bg-brand/90 text-white font-semibold text-xs text-center flex items-center justify-center gap-1.5 shadow-md shadow-brand/20 transition-all active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{item.isCompleted ? "Xem lại" : "Tiếp tục xem"}</span>
                    </Link>

                    {!item.isCompleted ? (
                      <button
                        type="button"
                        onClick={() => markCompleted(item.movieSlug, true)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-emerald-400 transition-colors"
                        title="Đánh dấu đã xem xong"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markCompleted(item.movieSlug, false)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-brand transition-colors"
                        title="Đánh dấu đang xem dở"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeMovie(item.movieSlug)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
                      title="Xóa khỏi lịch sử"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
