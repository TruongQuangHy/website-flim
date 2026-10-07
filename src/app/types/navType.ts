export interface NavItem {
  name: string;
  slug: string;
}

export interface VsmovCategory {
  _id: number | string;
  name: string;
  slug: string;
}

export interface VsmovCountry {
  _id: number | string;
  name: string;
  slug: string;
}

export interface VsmovYear {
  year: number;
  _id: string;
  name: string;
  slug: string;
}

export interface VsmovPagination {
  totalItems: number;
  totalItemsPerPage: number | string;
  currentPage: number;
  totalPages?: number;
  pageRanges?: number;
}

export interface VsmovTmdb {
  type?: string | null;
  id?: string | number | null;
  season?: number | null;
  vote_average?: string | number;
  vote_count?: number;
}

export interface VsmovImdb {
  id?: string | null;
  vote_average?: number;
  vote_count?: number;
}

export interface VsmovEpisodeItem {
  name: string;
  slug: string;
  filename: string;
  link_embed?: string;
  link_m3u8?: string;
}

export interface VsmovEpisodeServer {
  server_name: string;
  server_data: VsmovEpisodeItem[];
}

export interface VsmovMovieItem {
  _id: number | string;
  name: string;
  slug: string;
  origin_name?: string;
  poster_url?: string | Record<string, unknown> | null;
  thumb_url: string;
  year: number;
  quality?: string;
  lang?: string;
  type?: string;
  time?: string;
  episode_current?: string;
  episode_total?: string;
  content?: string;
  status?: string;
  view?: number;
  chieurap?: boolean;
  sub_docquyen?: boolean;
  trailer_url?: string | null;
  actor?: string[];
  director?: string[];
  category?: Array<{
    id: number | string;
    name: string;
    slug: string;
  }>;
  country?: Array<{
    id: number | string;
    name: string;
    slug: string;
  }>;
  tmdb?: VsmovTmdb;
  imdb?: VsmovImdb;
  modified?: {
    time: string;
  };
  created?: {
    time: string;
  };
  episodes?: VsmovEpisodeServer[];
}

export interface VsmovListResponse {
  status: boolean | string;
  msg?: string;
  message?: string;
  items: VsmovMovieItem[];
  pathImage?: string;
  pagination: VsmovPagination;
  titlePage?: string;
  appDomains?: {
    frontend?: string;
    cdnImage: string;
  };
}

export interface VsmovDetailResponse {
  status: boolean | string;
  msg?: string;
  message?: string;
  movie: VsmovMovieItem;
  episodes: VsmovEpisodeServer[];
}

export interface VsmovCategoriesResponse {
  status: string | boolean;
  message?: string;
  data?: {
    items: VsmovCategory[];
  };
  items?: VsmovCategory[];
}

export interface VsmovCountriesResponse {
  status: string | boolean;
  message?: string;
  data?: {
    items: VsmovCountry[];
  };
  items?: VsmovCountry[];
}

// Movie Peoples Types (backward compatibility)
export interface MoviePerson {
  tmdb_people_id: number;
  adult?: boolean;
  gender?: number;
  gender_name?: string;
  name: string;
  original_name?: string;
  character?: string;
  known_for_department?: string;
  profile_path?: string;
  also_known_as?: string[];
}

export interface MoviePeoplesResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: {
    tmdb_id: number;
    tmdb_type: string;
    ophim_id: string;
    slug: string;
    imdb_id: string;
    profile_sizes: {
      h632: string;
      original: string;
      w185: string;
      w45: string;
    };
    peoples: MoviePerson[];
  };
}

// Aliases for compatibility
export type OphimCategory = VsmovCategory;
export type OphimCategoriesResponse = VsmovCategoriesResponse;
export type OphimCountry = VsmovCountry;
export type OphimCountriesResponse = VsmovCountriesResponse;
export type OphimYear = VsmovYear;
export type OphimHomeItem = VsmovMovieItem;
export type OphimMovieItem = VsmovMovieItem;
export type OphimPagination = VsmovPagination;
export type OphimListResponse = VsmovListResponse;

export interface OphimAppDomains {
  frontend?: string;
  cdnImage: string;
}

export interface OphimSeoOnPage {
  titleHead?: string;
  descriptionHead?: string;
  og_type?: string;
  og_image?: string[];
}
