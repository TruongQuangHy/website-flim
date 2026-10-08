export interface UserSession {
  username: string; // 'haiyen'
  name: string; // 'Hải Yến'
  isLoggedIn: boolean;
  lastLogin?: number;
}

export interface WatchProgressItem {
  movieSlug: string;
  movieName: string;
  originName?: string;
  posterUrl: string;
  quality?: string;
  year?: string | number;

  // Episode tracking
  lastEpisodeSlug: string; // e.g. 'tap-6'
  lastEpisodeName: string; // e.g. 'Tập 6'
  lastPositionSeconds: number; // e.g. 1420
  durationSeconds: number; // e.g. 2800
  progressPercent: number; // e.g. 50.7 (%)

  // Total and completed episodes tracking
  totalEpisodes?: number; // e.g. 12
  watchedEpisodes: string[]; // ['tap-1', 'tap-2', 'tap-3', 'tap-4', 'tap-5']
  isCompleted: boolean; // true if finished all episodes or marked complete

  updatedAt: number; // Date.now()
}

export interface HistoryExportData {
  user: string;
  exportedAt: string;
  items: WatchProgressItem[];
}
