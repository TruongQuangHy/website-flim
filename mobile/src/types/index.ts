export interface MovieCategory {
  id?: string;
  name: string;
  slug: string;
}

export interface MovieCountry {
  id?: string;
  name: string;
  slug: string;
}

export interface EpisodeData {
  name: string;
  slug: string;
  filename?: string;
  link_embed: string;
  link_m3u8: string;
}

export interface EpisodeServer {
  server_name: string;
  server_data: EpisodeData[];
}

export interface MovieItem {
  _id: string;
  name: string;
  origin_name: string;
  slug: string;
  thumb_url: string;
  poster_url: string;
  year?: number | string;
  time?: string;
  episode_current?: string;
  quality?: string;
  lang?: string;
  type?: string;
  content?: string;
  view?: number;
  actor?: string[];
  director?: string[];
  category?: MovieCategory[];
  country?: MovieCountry[];
  episodes?: EpisodeServer[];
  vote_average?: number;
  tmdb?: {
    vote_average?: number;
    vote_count?: number;
  };
}

export interface MoviePagination {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  totalPages?: number;
}

export interface MovieListResponse {
  status: boolean;
  items: MovieItem[];
  pagination: MoviePagination;
  titlePage?: string;
}

export interface MovieDetailResponse {
  status: boolean;
  msg?: string;
  movie: MovieItem;
  episodes: EpisodeServer[];
}
