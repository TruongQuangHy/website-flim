export interface NavItem {
  name: string;
  slug: string;
}

export interface OphimCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface OphimCategoriesResponse {
  status: string;
  message: string;
  data: {
    items: OphimCategory[];
  };
}

export interface OphimCountry {
  _id: string;
  name: string;
  slug: string;
}

export interface OphimYear {
  year: number;
}

export interface OphimCountriesResponse {
  status: string;
  message: string;
  data: {
    items: OphimCountry[];
  };
}

export interface OphimYearsResponse {
  status: string;
  message: string;
  data: {
    items: OphimYear[];
  };
}

export interface OphimHomeItem {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  poster_url?: string;
  thumb_url: string;
  year: number;
  quality: string;
  lang: string;
  type: string;
  time: string;
  episode_current: string;
  sub_docquyen: boolean;
  tmdb?: {
    type: string;
    id: string;
    season?: number | null;
    vote_average: number;
    vote_count: number;
  };
  imdb?: {
    id: string;
    vote_average: number;
    vote_count: number;
  };
  modified: {
    time: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  }[];
  country: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export interface OphimPagination {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  pageRanges: number;
}

export interface OphimSeoOnPage {
  titleHead: string;
  descriptionHead: string;
  og_type: string;
  og_image: string[];
}

export interface OphimAppDomains {
  frontend: string;
  cdnImage: string;
}

export interface OphimHomeParams {
  type_slug: string;
  filterCategory: string[];
  filterCountry: string[];
  filterYear: string;
  sortField: string;
  pagination: OphimPagination;
  itemsUpdateInDay: number;
  totalSportsVideos: number;
  itemsSportsVideosUpdateInDay: number;
}

export interface OphimHomeResponse {
  status: string;
  message: string;
  data: {
    seoOnPage: OphimSeoOnPage;
    items: OphimHomeItem[];
    itemsSportsVideos: unknown[];
    params: OphimHomeParams;
    type_list: string;
    APP_DOMAIN_FRONTEND: string;
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

export interface OphimListResponse {
  status: string;
  message: string;
  data: {
    seoOnPage: OphimSeoOnPage;
    breadCrumb: Array<{
      name: string;
      slug?: string;
      isCurrent?: boolean;
      position?: number;
    }>;
    titlePage: string;
    items: OphimHomeItem[];
    params: {
      type_slug: string;
      filterCategory: string[];
      filterCountry: string[];
      filterYear: string;
      filterType: string;
      sortField: string;
      sortType: string;
      pagination: OphimPagination;
    };
    type_list: string;
    APP_DOMAIN_FRONTEND: string;
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

// Movie Details Types from Ophim API
export interface OphimMovieItem {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  content: string;
  type: string;
  status: string;
  thumb_url: string;
  poster_url: string;
  is_copyright: boolean;
  sub_docquyen: boolean;
  chieurap: boolean;
  trailer_url: string;
  time: string;
  episode_current: string;
  episode_total: string;
  quality: string;
  lang: string;
  notify: string;
  showtimes: string;
  year: number;
  view: number;
  actor: string[];
  director: string[];
  category: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  country: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  tmdb?: {
    type: string;
    id: string | number;
    season?: number | null;
    vote_average: number;
    vote_count: number;
  };
  imdb?: {
    id: string;
    vote_average: number;
    vote_count: number;
  };
  episodes?: Array<{
    server_name: string;
    server_data: Array<{
      name: string;
      slug: string;
      filename: string;
      link_embed: string;
      link_m3u8: string;
    }>;
  }>;
  created: {
    time: string;
  };
  modified: {
    time: string;
  };
}

export interface OphimMovieDetailsResponse {
  status: string;
  message: string;
  data: {
    seoOnPage: OphimSeoOnPage;
    breadCrumb: Array<{
      name: string;
      slug?: string;
      isCurrent?: boolean;
      position?: number;
    }>;
    params: {
      slug: string;
    };
    item: OphimMovieItem;
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

// Movie Peoples Types
export interface MoviePerson {
  tmdb_people_id: number;
  adult: boolean;
  gender: number;
  gender_name: string;
  name: string;
  original_name: string;
  character: string;
  known_for_department: string;
  profile_path: string;
  also_known_as: string[];
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
