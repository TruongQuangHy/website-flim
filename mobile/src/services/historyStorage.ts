import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSession, WatchProgressItem } from '../types';

const STORAGE_KEY_SESSION = '@haiyen_user_session';
const STORAGE_KEY_HISTORY = '@haiyen_watch_history';

export const historyStorage = {
  // Session / Auth
  async getUserSession(): Promise<UserSession | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async login(username: string, password: string): Promise<{ success: boolean; message?: string }> {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanUser === 'haiyen' && cleanPass === '12345678') {
      const session: UserSession = {
        username: 'haiyen',
        name: 'Hải Yến',
        isLoggedIn: true,
        lastLogin: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
      return { success: true };
    }

    return {
      success: false,
      message: 'Tên đăng nhập hoặc mật khẩu không chính xác!',
    };
  },

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_SESSION);
    } catch (e) {
      console.error('Failed to logout:', e);
    }
  },

  // Watch History
  async getWatchHistory(): Promise<Record<string, WatchProgressItem>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  async saveWatchProgress(data: {
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
  }): Promise<void> {
    try {
      const session = await this.getUserSession();
      if (!session?.isLoggedIn) return;

      const duration = Math.max(1, data.durationSeconds);
      const position = Math.max(0, data.lastPositionSeconds);
      const progressPercent = Math.min(100, Math.round((position / duration) * 1000) / 10);

      const history = await this.getWatchHistory();
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
        posterUrl: data.posterUrl || existing?.posterUrl || '',
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

      history[data.movieSlug] = updatedItem;
      await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save watch progress:', e);
    }
  },

  async markCompleted(movieSlug: string, isCompleted: boolean = true): Promise<void> {
    try {
      const history = await this.getWatchHistory();
      const existing = history[movieSlug];
      if (!existing) return;

      history[movieSlug] = {
        ...existing,
        isCompleted,
        updatedAt: Date.now(),
      };

      await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to mark completed:', e);
    }
  },

  async deleteHistoryItem(movieSlug: string): Promise<void> {
    try {
      const history = await this.getWatchHistory();
      delete history[movieSlug];
      await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to delete history item:', e);
    }
  },

  async clearAllHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  },
};
