"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserSession, WatchProgressItem } from "../types/userHistory";

interface UserHistoryState {
  user: UserSession | null;
  history: Record<string, WatchProgressItem>;

  // Auth actions
  login: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;

  // History actions
  saveProgress: (data: {
    movieSlug: string;
    movieName: string;
    originName?: string;
    posterUrl: string;
    quality?: string;
    year?: string | number;
    lastEpisodeSlug: string;
    lastEpisodeName: string;
    lastPositionSeconds: number;
    durationSeconds: number;
    totalEpisodes?: number;
  }) => void;
  markCompleted: (movieSlug: string, isCompleted?: boolean) => void;
  removeMovie: (movieSlug: string) => void;
  clearAllHistory: () => void;

  // Backup / restore
  exportHistoryJson: () => string;
  importHistoryJson: (jsonStr: string) => { success: boolean; count?: number; error?: string };
}

export const useUserHistoryStore = create<UserHistoryState>()(
  persist(
    (set, get) => ({
      user: null,
      history: {},

      login: (username, password) => {
        const cleanUser = username.trim().toLowerCase();
        const cleanPass = password.trim();

        if (cleanUser === "haiyen" && cleanPass === "12345678") {
          const session: UserSession = {
            username: "haiyen",
            name: "Hải Yến",
            isLoggedIn: true,
            lastLogin: Date.now(),
          };
          set({ user: session });
          return { success: true };
        }

        return {
          success: false,
          message: "Tên đăng nhập hoặc mật khẩu không chính xác!",
        };
      },

      logout: () => {
        set({ user: null });
      },

      saveProgress: (data) => {
        const { user, history } = get();
        // Only save when user Hai Yen is logged in
        if (!user?.isLoggedIn) return;

        const duration = Math.max(1, data.durationSeconds);
        const position = Math.max(0, data.lastPositionSeconds);
        const progressPercent = Math.min(100, Math.round((position / duration) * 1000) / 10);

        const existing = history[data.movieSlug];
        const watchedEpisodesSet = new Set<string>(existing?.watchedEpisodes || []);

        // If watched >= 85%, mark this episode as watched
        if (progressPercent >= 85) {
          watchedEpisodesSet.add(data.lastEpisodeSlug);
        }

        const watchedEpisodes = Array.from(watchedEpisodesSet);
        const total = data.totalEpisodes || existing?.totalEpisodes || 1;

        // Auto mark complete if all episodes are watched or last episode is finished
        let isCompleted = existing?.isCompleted || false;
        if (total > 0 && watchedEpisodes.length >= total) {
          isCompleted = true;
        }

        const updatedItem: WatchProgressItem = {
          movieSlug: data.movieSlug,
          movieName: data.movieName,
          originName: data.originName || existing?.originName,
          posterUrl: data.posterUrl || existing?.posterUrl || "",
          quality: data.quality || existing?.quality,
          year: data.year || existing?.year,
          lastEpisodeSlug: data.lastEpisodeSlug,
          lastEpisodeName: data.lastEpisodeName,
          lastPositionSeconds: position,
          durationSeconds: duration,
          progressPercent,
          totalEpisodes: total,
          watchedEpisodes,
          isCompleted,
          updatedAt: Date.now(),
        };

        set({
          history: {
            ...history,
            [data.movieSlug]: updatedItem,
          },
        });
      },

      markCompleted: (movieSlug, isCompleted = true) => {
        const { history } = get();
        const existing = history[movieSlug];
        if (!existing) return;

        set({
          history: {
            ...history,
            [movieSlug]: {
              ...existing,
              isCompleted,
              updatedAt: Date.now(),
            },
          },
        });
      },

      removeMovie: (movieSlug) => {
        const { history } = get();
        const newHistory = { ...history };
        delete newHistory[movieSlug];
        set({ history: newHistory });
      },

      clearAllHistory: () => {
        set({ history: {} });
      },

      exportHistoryJson: () => {
        const { user, history } = get();
        const exportData = {
          user: user?.name || "Hải Yến",
          username: "haiyen",
          exportedAt: new Date().toISOString(),
          items: Object.values(history),
        };
        return JSON.stringify(exportData, null, 2);
      },

      importHistoryJson: (jsonStr) => {
        try {
          const parsed = JSON.parse(jsonStr);
          const items: WatchProgressItem[] = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed?.items)
            ? parsed.items
            : [];

          if (items.length === 0) {
            return { success: false, error: "Dữ liệu JSON không chứa danh sách phim hợp lệ." };
          }

          const { history } = get();
          const newHistory = { ...history };

          items.forEach((item) => {
            if (item.movieSlug) {
              newHistory[item.movieSlug] = {
                ...item,
                updatedAt: item.updatedAt || Date.now(),
              };
            }
          });

          set({ history: newHistory });
          return { success: true, count: items.length };
        } catch {
          return { success: false, error: "Định dạng JSON không hợp lệ." };
        }
      },
    }),
    {
      name: "haiyen_user_history_store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
