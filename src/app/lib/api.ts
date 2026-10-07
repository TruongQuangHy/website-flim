import axios from "axios";
import {
  VsmovCategory,
  VsmovCountry,
  VsmovYear,
  VsmovMovieItem,
  VsmovPagination,
  VsmovCategoriesResponse,
  VsmovCountriesResponse,
  VsmovListResponse,
  VsmovDetailResponse,
  MoviePerson,
  OphimAppDomains,
  OphimSeoOnPage,
} from "../types/navType";

// =======================
// 🔧 API Configuration
// =======================
const VSMOV_BASE_URL = "https://vsmov.com/api";

const vsmovApi = axios.create({
  baseURL: VSMOV_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

// Title mapping for known lists
const LIST_TITLES: Record<string, string> = {
  "phim-moi-cap-nhat": "Phim Mới Cập Nhật",
  "phim-moi-phat-hanh": "Phim Mới Phát Hành",
  "phim-chieu-rap": "Phim Chiếu Rạp",
  "phim-bo": "Phim Bộ",
  "phim-le": "Phim Lẻ",
  "hoat-hinh": "Phim Hoạt Hình",
  "tv-shows": "TV Shows",
  subteam: "Phim Subteam",
};

/**
 * Robust helper to extract a clean image URL from a VSMOV/Ophim movie item.
 * Handles cases where poster_url is an empty object {} or relative URL.
 */
export function getMovieImageUrl(
  item?: { thumb_url?: unknown; poster_url?: unknown },
  cdnImage?: string,
  fallback = "/logo.png"
): string {
  if (!item) return fallback;

  const thumb =
    typeof item.thumb_url === "string" && item.thumb_url.trim().length > 0
      ? item.thumb_url.trim()
      : "";
  const poster =
    typeof item.poster_url === "string" && item.poster_url.trim().length > 0
      ? item.poster_url.trim()
      : "";

  const target = thumb || poster;
  if (!target) return fallback;

  // Local static asset (e.g. /logo.png)
  if (target.startsWith("/")) {
    return target;
  }

  // Already a full absolute URL
  if (target.startsWith("http://") || target.startsWith("https://")) {
    return target;
  }

  // Legacy Ophim format
  if (cdnImage && cdnImage.includes("ophim")) {
    return `${cdnImage.replace(/\/$/, "")}/uploads/movies/${target.replace(/^\//, "")}`;
  }

  return `https://vsmov.com/storage/images/${target.replace(/^\//, "")}`;
}

// =======================
// 🎬 MovieAPI Class (VSMOV)
// =======================
export class MovieAPI {
  /**
   * Get all categories from VSMOV
   */
  static async getOphimCategories(
    saveToStore?: (categories: VsmovCategory[]) => void
  ): Promise<VsmovCategory[]> {
    try {
      const response = await vsmovApi.get("/the-loai");
      const data = response.data as VsmovCategoriesResponse;
      const categories: VsmovCategory[] = data.data?.items || data.items || [];

      if (saveToStore) {
        saveToStore(categories);
      }
      return categories;
    } catch (error) {
      console.error("Error fetching VSMOV categories:", error);
      return [];
    }
  }

  static getCategories = MovieAPI.getOphimCategories;

  /**
   * Get all countries from VSMOV
   */
  static async getOphimCountries(
    saveToStore?: (countries: VsmovCountry[]) => void
  ): Promise<VsmovCountry[]> {
    try {
      const response = await vsmovApi.get("/quoc-gia");
      const data = response.data as VsmovCountriesResponse;
      const countries: VsmovCountry[] = data.data?.items || data.items || [];

      if (saveToStore) {
        saveToStore(countries);
      }
      return countries;
    } catch (error) {
      console.error("Error fetching VSMOV countries:", error);
      return [];
    }
  }

  static getCountries = MovieAPI.getOphimCountries;

  /**
   * Get years (generate 15 recent years since VSMOV does not have dedicated endpoint)
   */
  static async getOphimYears(
    saveToStore?: (years: VsmovYear[]) => void
  ): Promise<VsmovYear[]> {
    const currentYear = new Date().getFullYear();
    const years: VsmovYear[] = Array.from({ length: 15 }, (_, i) => {
      const y = currentYear - i;
      return {
        _id: y.toString(),
        name: y.toString(),
        slug: y.toString(),
        year: y,
      };
    });

    if (saveToStore) {
      saveToStore(years);
    }
    return years;
  }

  static getYears = MovieAPI.getOphimYears;

  /**
   * Get Home data (Phim mới cập nhật)
   */
  static async getOphimHome(
    saveToStore?: (homeData: {
      items: VsmovMovieItem[];
      pagination: VsmovPagination;
      seoOnPage: OphimSeoOnPage;
      appDomains: OphimAppDomains;
    }) => void
  ): Promise<VsmovMovieItem[]> {
    try {
      const response = await vsmovApi.get("/danh-sach/phim-moi-cap-nhat", {
        params: { page: 1 },
      });
      const data = response.data as VsmovListResponse;
      const items = (data.items || []).map(MovieAPI.sanitizeMovieItem);

      const result = {
        items,
        pagination: data.pagination || {
          totalItems: items.length,
          totalItemsPerPage: 24,
          currentPage: 1,
        },
        seoOnPage: {
          titleHead: "HyFlim - Xem phim online chất lượng cao",
          descriptionHead:
            "Kho phim chiếu rạp, phim mới, phim bộ và phim lẻ hấp dẫn nhất.",
          og_type: "website",
          og_image: [],
        },
        appDomains: {
          frontend: "https://vsmov.com",
          cdnImage: "https://vsmov.com",
        },
      };

      if (saveToStore) {
        saveToStore(result);
      }
      return items;
    } catch (error) {
      console.error("Error fetching VSMOV home data:", error);
      return [];
    }
  }

  static getHome = MovieAPI.getOphimHome;

  /**
   * Get list by category, slug and page
   */
  static async getOphimList(
    category: string,
    slug: string,
    page: number = 1,
    saveToStore?: (listData: {
      items: VsmovMovieItem[];
      pagination: VsmovPagination;
      seoOnPage: OphimSeoOnPage;
      titlePage: string;
      appDomains: OphimAppDomains;
    }) => void
  ): Promise<{
    items: VsmovMovieItem[];
    pagination: VsmovPagination;
    seoOnPage: OphimSeoOnPage;
    titlePage: string;
    appDomains: OphimAppDomains;
  }> {
    try {
      // Map alias slugs
      const resolvedSlug =
        slug === "phim-moi-phat-hanh" ? "phim-moi-cap-nhat" : slug;

      let endpoint = `/danh-sach/${resolvedSlug}`;
      if (category === "the-loai") {
        endpoint = `/the-loai/${resolvedSlug}`;
      } else if (category === "quoc-gia") {
        endpoint = `/quoc-gia/${resolvedSlug}`;
      }

      const response = await vsmovApi.get(endpoint, {
        params: { page },
      });
      const data = response.data as VsmovListResponse;
      const items = (data.items || []).map(MovieAPI.sanitizeMovieItem);

      const title =
        LIST_TITLES[slug] ||
        LIST_TITLES[resolvedSlug] ||
        MovieAPI.formatSlugToTitle(slug);

      const result = {
        items,
        pagination: data.pagination || {
          totalItems: items.length,
          totalItemsPerPage: 24,
          currentPage: page,
        },
        seoOnPage: {
          titleHead: `${title} | HyFlim`,
          descriptionHead: `Danh sách ${title} cập nhật mới nhất.`,
          og_type: "video.movie",
          og_image: [],
        },
        titlePage: title,
        appDomains: {
          frontend: "https://vsmov.com",
          cdnImage: "https://vsmov.com",
        },
      };

      if (saveToStore) {
        saveToStore(result);
      }
      return result;
    } catch (error) {
      console.error(
        `Error fetching VSMOV list for ${category}/${slug}:`,
        error
      );
      throw new Error(`Failed to fetch list data for ${category}/${slug}`);
    }
  }

  static getList = MovieAPI.getOphimList;

  /**
   * Get detailed movie information + episodes
   */
  static async getMovieDetails(slug: string): Promise<{
    item: VsmovMovieItem;
    cdnImage: string;
  }> {
    try {
      const response = await vsmovApi.get(`/phim/${slug}`);
      const data = response.data as VsmovDetailResponse;

      if (data.status && data.movie) {
        const movie = MovieAPI.sanitizeMovieItem(data.movie);
        // Attach episodes array
        movie.episodes = data.episodes || [];

        return {
          item: movie,
          cdnImage: "https://vsmov.com",
        };
      }
      throw new Error("Invalid movie details response from VSMOV");
    } catch (error) {
      console.error(`Error fetching movie details for ${slug}:`, error);
      throw new Error(`Failed to fetch movie details for ${slug}`);
    }
  }

  /**
   * Get movie peoples (fallback from movie item actor list)
   */
  static async getMoviePeoples(slug: string): Promise<MoviePerson[]> {
    try {
      // VSMOV embeds actor names in movie details
      const { item } = await MovieAPI.getMovieDetails(slug);
      const actors = item.actor || [];
      return actors.map((actorName, idx) => ({
        tmdb_people_id: idx + 1,
        name: actorName,
        character: "Diễn viên",
        known_for_department: "Acting",
        profile_path: "",
        also_known_as: [],
      }));
    } catch (error) {
      console.error(`Error fetching cast for ${slug}:`, error);
      return [];
    }
  }

  /**
   * Search movies by keyword
   */
  static async searchMovies(
    keyword: string,
    page: number = 1,
    saveToStore?: (searchData: {
      items: VsmovMovieItem[];
      pagination: VsmovPagination;
      seoOnPage: OphimSeoOnPage;
      titlePage: string;
      keyword: string;
      appDomains: OphimAppDomains;
    }) => void
  ): Promise<{
    items: VsmovMovieItem[];
    pagination: VsmovPagination;
    seoOnPage: OphimSeoOnPage;
    titlePage: string;
    keyword: string;
    appDomains: OphimAppDomains;
  }> {
    try {
      const response = await vsmovApi.get("/tim-kiem", {
        params: { keyword, page },
      });
      const data = response.data as VsmovListResponse;
      const items = (data.items || []).map(MovieAPI.sanitizeMovieItem);

      const result = {
        items,
        pagination: data.pagination || {
          totalItems: items.length,
          totalItemsPerPage: 20,
          currentPage: page,
        },
        seoOnPage: {
          titleHead: `Tìm kiếm: ${keyword} | HyFlim`,
          descriptionHead: `Kết quả tìm kiếm cho "${keyword}"`,
          og_type: "website",
          og_image: [],
        },
        titlePage: `Tìm kiếm: "${keyword}"`,
        keyword,
        appDomains: {
          frontend: "https://vsmov.com",
          cdnImage: "https://vsmov.com",
        },
      };

      if (saveToStore) {
        saveToStore(result);
      }
      return result;
    } catch (error) {
      console.error(`Error searching movies with keyword "${keyword}":`, error);
      return {
        items: [],
        pagination: { totalItems: 0, totalItemsPerPage: 20, currentPage: 1 },
        seoOnPage: {},
        titlePage: `Tìm kiếm: "${keyword}"`,
        keyword,
        appDomains: {
          frontend: "https://vsmov.com",
          cdnImage: "https://vsmov.com",
        },
      };
    }
  }

  /**
   * Helper: Get related movies based on category slug
   */
  static async getRelatedMovies(
    categorySlug: string = "hanh-dong",
    limit = 12
  ): Promise<VsmovMovieItem[]> {
    try {
      const result = await MovieAPI.getOphimList("the-loai", categorySlug, 1);
      return (result.items || []).slice(0, limit);
    } catch {
      // Fallback to phim chieu rap or phim moi
      try {
        const fallback = await MovieAPI.getOphimList("danh-sach", "phim-chieu-rap", 1);
        return (fallback.items || []).slice(0, limit);
      } catch {
        return [];
      }
    }
  }

  /**
   * Sanitize movie item to ensure safe properties
   */
  private static sanitizeMovieItem(item: VsmovMovieItem): VsmovMovieItem {
    const poster =
      typeof item.poster_url === "string" && item.poster_url.trim().length > 0
        ? item.poster_url.trim()
        : "";
    const thumb =
      typeof item.thumb_url === "string" && item.thumb_url.trim().length > 0
        ? item.thumb_url.trim()
        : "";

    return {
      ...item,
      poster_url: poster,
      thumb_url: thumb || poster || "/logo.png",
      quality: item.quality || "HD",
      year: item.year || new Date().getFullYear(),
    };
  }

  private static formatSlugToTitle(slug: string): string {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}
