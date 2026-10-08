import { createClient } from "@supabase/supabase-js";
import { WatchProgressItem } from "../types/userHistory";

// Direct in-code configuration (no .env required)
export const SUPABASE_URL = "https://pqqimfaplmdhdmpkkmlq.supabase.co";

// Supabase anon / publishable public key
// Thay thế bằng anon key từ Supabase Dashboard (Settings -> API) nếu có
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcWltZmFwbG1kaGRtcGtrbWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NjE4NDksImV4cCI6MjEwNjEzNzg0OX0.placeholder";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseWatchHistoryRow {
  id?: string;
  user_id: string; // 'haiyen'
  movie_slug: string;
  movie_name: string;
  origin_name?: string | null;
  poster_url: string;
  quality?: string | null;
  year?: string | number | null;
  last_episode_slug: string;
  last_episode_name: string;
  last_position_seconds: number;
  duration_seconds: number;
  progress_percent: number;
  total_episodes: number;
  watched_episodes: string[];
  is_completed: boolean;
  updated_at: string;
}

export const supabaseHistoryService = {
  // Lấy toàn bộ lịch sử từ database Supabase
  async fetchHistory(userId: string = "haiyen"): Promise<Record<string, WatchProgressItem>> {
    try {
      const { data, error } = await supabase
        .from("watch_history")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.warn("Supabase fetchHistory error:", error.message);
        return {};
      }

      const result: Record<string, WatchProgressItem> = {};
      if (Array.isArray(data)) {
        (data as unknown as SupabaseWatchHistoryRow[]).forEach((row) => {
          result[row.movie_slug] = {
            movieSlug: row.movie_slug,
            movieName: row.movie_name,
            originName: row.origin_name || undefined,
            posterUrl: row.poster_url || "",
            quality: row.quality || undefined,
            year: row.year || undefined,
            lastEpisodeSlug: row.last_episode_slug,
            lastEpisodeName: row.last_episode_name,
            lastPositionSeconds: Number(row.last_position_seconds) || 0,
            durationSeconds: Number(row.duration_seconds) || 1,
            progressPercent: Number(row.progress_percent) || 0,
            totalEpisodes: Number(row.total_episodes) || 1,
            watchedEpisodes: Array.isArray(row.watched_episodes)
              ? row.watched_episodes
              : typeof row.watched_episodes === "string"
              ? JSON.parse(row.watched_episodes)
              : [],
            isCompleted: Boolean(row.is_completed),
            updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
          };
        });
      }
      return result;
    } catch (err) {
      console.warn("Failed to fetch history from Supabase:", err);
      return {};
    }
  },

  // Lưu hoặc cập nhật tiến trình vào database Supabase (UPSERT)
  async saveProgress(item: WatchProgressItem, userId: string = "haiyen"): Promise<boolean> {
    try {
      const row: Partial<SupabaseWatchHistoryRow> = {
        user_id: userId,
        movie_slug: item.movieSlug,
        movie_name: item.movieName,
        origin_name: item.originName || null,
        poster_url: item.posterUrl,
        quality: item.quality || null,
        year: item.year || null,
        last_episode_slug: item.lastEpisodeSlug,
        last_episode_name: item.lastEpisodeName,
        last_position_seconds: item.lastPositionSeconds,
        duration_seconds: item.durationSeconds,
        progress_percent: item.progressPercent,
        total_episodes: item.totalEpisodes || 1,
        watched_episodes: item.watchedEpisodes || [],
        is_completed: item.isCompleted,
        updated_at: new Date(item.updatedAt || Date.now()).toISOString(),
      };

      const { error } = await supabase
        .from("watch_history")
        .upsert(row, { onConflict: "user_id,movie_slug" });

      if (error) {
        console.warn("Supabase saveProgress error:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn("Failed to save progress to Supabase:", err);
      return false;
    }
  },

  // Đánh dấu hoàn thành phim trên Supabase
  async markCompleted(movieSlug: string, isCompleted: boolean, userId: string = "haiyen"): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("watch_history")
        .update({
          is_completed: isCompleted,
          updated_at: new Date().toISOString(),
        })
        .match({ user_id: userId, movie_slug: movieSlug });

      if (error) {
        console.warn("Supabase markCompleted error:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn("Failed to mark completed on Supabase:", err);
      return false;
    }
  },

  // Xóa phim khỏi lịch sử trên Supabase
  async deleteItem(movieSlug: string, userId: string = "haiyen"): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("watch_history")
        .delete()
        .match({ user_id: userId, movie_slug: movieSlug });

      if (error) {
        console.warn("Supabase deleteItem error:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn("Failed to delete item on Supabase:", err);
      return false;
    }
  },

  // Xóa toàn bộ lịch sử trên Supabase
  async clearAll(userId: string = "haiyen"): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("watch_history")
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.warn("Supabase clearAll error:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn("Failed to clear all on Supabase:", err);
      return false;
    }
  },
};
