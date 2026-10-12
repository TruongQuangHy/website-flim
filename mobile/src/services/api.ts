import axios from 'axios';
import {
  MovieItem,
  MovieListResponse,
  MovieDetailResponse,
  MoviePagination,
} from '../types';
import {
  findMobileCustomMovie,
  searchMobileCustomMovies,
  getMobileCustomMoviesForList,
} from '../data/customMovies';

const VSMOV_BASE_URL = 'https://vsmov.com/api';
const CDN_FALLBACK = 'https://vsmov.com/uploads/movies/';

const api = axios.create({
  baseURL: VSMOV_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

/**
 * Normalizes movie image URLs from VSMOV / Ophim API
 */
export function getMovieImageUrl(
  url?: string | null,
  fallback = 'https://vsmov.com/logo.png'
): string {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return fallback;
  }
  const clean = url.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  if (clean.startsWith('/')) {
    return `https://vsmov.com${clean}`;
  }
  return `${CDN_FALLBACK}${clean}`;
}

export function cleanServerName(name: string): string {
  if (!name) return 'VIP Server';
  return name.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export const MovieAPI = {
  /**
   * Fetch movie list by slug (e.g. phim-moi-cap-nhat, phim-chieu-rap, phim-bo, phim-le, hoat-hinh)
   */
  async getList(slug: string, page = 1): Promise<MovieListResponse> {
    const customMatches = page === 1 ? getMobileCustomMoviesForList(slug) : [];
    try {
      const response = await api.get(`/danh-sach/${slug}`, {
        params: { page },
      });
      const data = response.data;
      const apiItems = data.items || [];
      const items =
        customMatches.length > 0
          ? [
              ...customMatches,
              ...apiItems.filter(
                (it: MovieItem) => !customMatches.some((c) => c.slug === it.slug)
              ),
            ]
          : apiItems;

      return {
        status: data.status ?? true,
        items,
        pagination: data.pagination || {
          totalItems: items.length,
          totalItemsPerPage: 24,
          currentPage: page,
        },
        titlePage: data.titlePage || slug,
      };
    } catch (error) {
      console.error(`Error fetching list ${slug}:`, error);
      return {
        status: customMatches.length > 0,
        items: customMatches,
        pagination: { totalItems: customMatches.length, totalItemsPerPage: 24, currentPage: page },
        titlePage: slug,
      };
    }
  },

  /**
   * Fetch movie details and episodes by slug
   */
  async getDetail(slug: string): Promise<MovieItem | null> {
    const custom = findMobileCustomMovie(slug);
    if (custom) {
      return custom;
    }

    try {
      const response = await api.get(`/phim/${slug}`);
      const data = response.data as MovieDetailResponse;
      if (data && data.movie) {
        const movie = data.movie;
        movie.episodes = data.episodes || [];
        return movie;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching movie detail ${slug}:`, error);
      return findMobileCustomMovie(slug) || null;
    }
  },

  /**
   * Search movies by keyword
   */
  async search(keyword: string, page = 1): Promise<MovieListResponse> {
    const customMatches = page === 1 ? searchMobileCustomMovies(keyword) : [];
    try {
      const response = await api.get('/tim-kiem', {
        params: { keyword, page },
      });
      const data = response.data;
      const apiItems = data.items || [];
      const items =
        customMatches.length > 0
          ? [
              ...customMatches,
              ...apiItems.filter(
                (it: MovieItem) => !customMatches.some((c) => c.slug === it.slug)
              ),
            ]
          : apiItems;

      return {
        status: data.status ?? true,
        items,
        pagination: data.pagination || {
          totalItems: items.length,
          totalItemsPerPage: 24,
          currentPage: page,
        },
      };
    } catch (error) {
      console.error(`Error searching movies ${keyword}:`, error);
      return {
        status: customMatches.length > 0,
        items: customMatches,
        pagination: { totalItems: customMatches.length, totalItemsPerPage: 24, currentPage: page },
      };
    }
  },

  /**
   * Fetch movies by category or country
   */
  async getByCategory(type: 'the-loai' | 'quoc-gia', slug: string, page = 1): Promise<MovieListResponse> {
    const customMatches = page === 1 ? getMobileCustomMoviesForList(slug) : [];
    try {
      const response = await api.get(`/${type}/${slug}`, {
        params: { page },
      });
      const data = response.data;
      const apiItems = data.items || [];
      const items =
        customMatches.length > 0
          ? [
              ...customMatches,
              ...apiItems.filter(
                (it: MovieItem) => !customMatches.some((c) => c.slug === it.slug)
              ),
            ]
          : apiItems;

      return {
        status: data.status ?? true,
        items,
        pagination: data.pagination || {
          totalItems: items.length,
          totalItemsPerPage: 24,
          currentPage: page,
        },
      };
    } catch (error) {
      console.error(`Error fetching ${type}/${slug}:`, error);
      return {
        status: customMatches.length > 0,
        items: customMatches,
        pagination: { totalItems: customMatches.length, totalItemsPerPage: 24, currentPage: page },
      };
    }
  },
};
