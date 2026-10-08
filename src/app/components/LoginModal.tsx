"use client";

import React, { useState } from "react";
import { useUserHistoryStore } from "../store/useUserHistoryStore";
import { X, Lock, User, CheckCircle2, AlertCircle, Heart } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { login } = useUserHistoryStore();
  const [username, setUsername] = useState("haiyen");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await login(username, password);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPassword("");
        onClose();
        onSuccess?.();
      }, 1000);
    } else {
      setError(res.message || "Tên đăng nhập hoặc mật khẩu không đúng.");
    }
  };

  const handleQuickFill = () => {
    setUsername("haiyen");
    setPassword("12345678");
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-[#16181f] border border-white/10 rounded-2xl shadow-2xl p-6 z-10 animate-scaleUp overflow-hidden">
        {/* Decorative ambient gradient */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
              <Heart className="w-5 h-5 fill-brand/30" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Đăng Nhập Tài Khoản
              </h3>
              <p className="text-xs text-white/60">Dành riêng cho Hải Yến</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce" />
            <h4 className="text-lg font-bold text-white">
              Chào mừng Hải Yến đã trở lại!
            </h4>
            <p className="text-xs text-white/70">
              Đang đồng bộ lịch sử xem phim và tiến trình...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5">
                Tài khoản
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên tài khoản"
                  className="w-full bg-[#0d0e12] border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand/70 focus:ring-1 focus:ring-brand/50 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full bg-[#0d0e12] border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand/70 focus:ring-1 focus:ring-brand/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-brand hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>⚡ Điền nhanh tài khoản Hải Yến</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand to-red-600 hover:from-brand/90 hover:to-red-600/90 text-white font-semibold text-sm shadow-lg shadow-brand/25 transition-all transform active:scale-98"
            >
              Đăng nhập
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
