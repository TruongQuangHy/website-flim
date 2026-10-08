"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserSession, WatchProgressItem } from "../types/userHistory";
import { supabaseHistoryService } from "../lib/supabase";

interface UserHistoryState {
  user: UserSession | null;
  history: Record<string, WatchProgressItem>;

  // Auth actions
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;

  // Supabase sync
  syncFromDatabase: () => Promise<void>;

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

      syncFromDatabase: async () => {
        const { user, history } = get();
        if (!user?.isLoggedIn) return;

        try {
          const remoteHistory = await supabaseHistoryService.fetchHistory(user.username);
          if (remoteHistory && Object.keys(remoteHistory).length > 0) {
            set({
              history: {
                ...history,
                ...remoteHistory,
              },
            });
          }
        } catch (e) {
          console.warn("Failed to sync from Supabase:", e);
        }
      },

      login: async (username, password) => {
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

          // Fetch watch history from Supabase database in background
          setTimeout(async () => {
            try {
              const remote = await supabaseHistoryService.fetchHistory("haiyen");
              if (remote && Object.keys(remote).length > 0) {
                const current = get().history;
                set({ history: { ...current, ...remote } });
              }
            } catch (err) {
              console.warn("Supabase initial sync error:", err);
            }
          }, 100);

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
        if (!user?.isLoggedIn) return;

        const duration = Math.max(1, data.durationSeconds);
        const position = Math.max(0, data.lastPositionSeconds);
        const progressPercent = Math.min(100, Math.round((position / duration) * 1000) / 10);

        const existing = history[data.movieSlug];
        const watchedEpisodesSet = new Set<string>(existing?.watchedEpisodes || []);

        if (progressPercent >= 85) {
          watchedEpisodesSet.add(data.lastEpisodeSlug);
        }

        const watchedEpisodes = Array.from(watchedEpisodesSet);
        const total = data.totalEpisodes || existing?.totalEpisodes || 1;

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

        // 1. Update local reactive state
        set({
          history: {
            ...history,
            [data.movieSlug]: updatedItem,
          },
        });

        // 2. Persist to Supabase Database
        supabaseHistoryService.saveProgress(updatedItem, user.username).catch((err) => {
          console.warn("Supabase background save error:", err);
        });
      },

      markCompleted: (movieSlug, isCompleted = true) => {
        const { user, history } = get();
        const existing = history[movieSlug];
        if (!existing) return;

        const updated: WatchProgressItem = {
          ...existing,
          isCompleted,
          updatedAt: Date.now(),
        };

        set({
          history: {
            ...history,
            [movieSlug]: updated,
          },
        });

        if (user?.isLoggedIn) {
          supabaseHistoryService.markCompleted(movieSlug, isCompleted, user.username).catch((err) => {
            console.warn("Supabase markCompleted error:", err);
          });
        }
      },

      removeMovie: (movieSlug) => {
        const { user, history } = get();
        const newHistory = { ...history };
        delete newHistory[movieSlug];
        set({ history: newHistory });

        if (user?.isLoggedIn) {
          supabaseHistoryService.deleteItem(movieSlug, user.username).catch((err) => {
            console.warn("Supabase deleteItem error:", err);
          });
        }
      },

      clearAllHistory: () => {
        const { user } = get();
        set({ history: {} });

        if (user?.isLoggedIn) {
          supabaseHistoryService.clearAll(user.username).catch((err) => {
            console.warn("Supabase clearAll error:", err);
          });
        }
      },

      exportHistoryJson: () => {
        const { user, history } = get();
        const exportData = {
          user: user?.name || "Hải Yến",
          username: user?.username || "haiyen",
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

          const { user, history } = get();
          const newHistory = { ...history };

          items.forEach((item) => {
            if (item.movieSlug) {
              const fullItem: WatchProgressItem = {
                ...item,
                updatedAt: item.updatedAt || Date.now(),
              };
              newHistory[item.movieSlug] = fullItem;

              if (user?.isLoggedIn) {
                supabaseHistoryService.saveProgress(fullItem, user.username).catch(() => {});
              }
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
