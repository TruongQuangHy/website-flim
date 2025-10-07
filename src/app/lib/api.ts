import axios from "axios";
import {
  OphimCategory,
  OphimCategoriesResponse,
  OphimCountry,
  OphimCountriesResponse,
  OphimYear,
  OphimYearsResponse,
  OphimHomeItem,
  OphimHomeResponse,
  OphimPagination,
  OphimSeoOnPage,
  OphimAppDomains,
  OphimListResponse,
  OphimMovieDetailsResponse,
  OphimMovieItem,
  MoviePeoplesResponse,
  MoviePerson,
} from "../types/navType";

// =======================
// 🔧 API Configuration
// =======================
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const OPHIM_BASE_URL = "https://ophim1.com";

const ophimApi = axios.create({
  baseURL: OPHIM_BASE_URL,
});

// =======================
// 📦 Mock Data Support
// =======================
const USE_MOCK_DATA = !TMDB_API_KEY;

// =======================
// 🎬 MovieAPI Class
// =======================
export class MovieAPI {
  // Get categories from Ophim API
  static async getOphimCategories(
    saveToStore?: (categories: OphimCategory[]) => void
  ): Promise<OphimCategory[]> {
    try {
      const response = await ophimApi.get("/v1/api/the-loai");
      const responseData = response.data as OphimCategoriesResponse;

      if (responseData.status && responseData.data?.items) {
        const categories = responseData.data.items;

        // Save to store if callback provided
        if (saveToStore) {
          saveToStore(categories);
        }

        return categories;
      } else {
        throw new Error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching Ophim categories:", error);
      throw new Error("Failed to fetch categories from Ophim");
    }
  }

  // Get countries from Ophim API
  static async getOphimCountries(
    saveToStore?: (countries: OphimCountry[]) => void
  ): Promise<OphimCountry[]> {
    try {
      const response = await ophimApi.get("/v1/api/quoc-gia");
      const responseData = response.data as OphimCountriesResponse;

      if (responseData.status && responseData.data?.items) {
        const countries = responseData.data.items;

        // Save to store if callback provided
        if (saveToStore) {
          saveToStore(countries);
        }

        return countries;
      } else {
        throw new Error("Failed to fetch countries");
      }
    } catch (error) {
      console.error("Error fetching Ophim countries:", error);
      throw new Error("Failed to fetch countries from Ophim");
    }
  }

  // Get years from Ophim API
  static async getOphimYears(
    saveToStore?: (
      years: (OphimYear & { _id: string; name: string; slug: string })[]
    ) => void
  ): Promise<(OphimYear & { _id: string; name: string; slug: string })[]> {
    try {
      const response = await ophimApi.get("/v1/api/nam-phat-hanh");
      const responseData = response.data as OphimYearsResponse;

      if (responseData.status && responseData.data?.items) {
        const years = responseData.data.items.map((item) => ({
          _id: item.year.toString(),
          name: item.year.toString(),
          slug: item.year.toString(),
          year: item.year,
        }));

        // Save to store if callback provided
        if (saveToStore) {
          saveToStore(years);
        }

        return years;
      } else {
        throw new Error("Failed to fetch years");
      }
    } catch (error) {
      console.error("Error fetching Ophim years:", error);
      throw new Error("Failed to fetch years from Ophim");
    }
  }

  // Get home data from Ophim API
  static async getOphimHome(
    saveToStore?: (homeData: {
      items: OphimHomeItem[];
      pagination: OphimPagination;
      seoOnPage: OphimSeoOnPage;
      appDomains: OphimAppDomains;
    }) => void
  ): Promise<OphimHomeItem[]> {
    try {
      const response = await ophimApi.get("/v1/api/home");
      const responseData = response.data as OphimHomeResponse;

      if (responseData.status && responseData.data?.items) {
        const homeItems = responseData.data.items;

        // Save to store if callback provided
        if (saveToStore) {
          saveToStore({
            items: homeItems,
            pagination: responseData.data.params.pagination,
            seoOnPage: responseData.data.seoOnPage,
            appDomains: {
              frontend: responseData.data.APP_DOMAIN_FRONTEND,
              cdnImage: responseData.data.APP_DOMAIN_CDN_IMAGE,
            },
          });
        }

        return homeItems;
      } else {
        throw new Error("Failed to fetch home data");
      }
    } catch (error) {
      console.error("Error fetching Ophim home data:", error);
      throw new Error("Failed to fetch home data from Ophim");
    }
  }

  // Get list data from Ophim API by category and slug
  static async getOphimList(
    category: string,
    slug: string,
    page: number = 1,
    saveToStore?: (listData: {
      items: OphimHomeItem[];
      pagination: OphimPagination;
      seoOnPage: OphimSeoOnPage;
      titlePage: string;
      appDomains: OphimAppDomains;
    }) => void
  ): Promise<{
    items: OphimHomeItem[];
    pagination: OphimPagination;
    seoOnPage: OphimSeoOnPage;
    titlePage: string;
    appDomains: OphimAppDomains;
  }> {
    try {
      const response = await ophimApi.get(`/v1/api/${category}/${slug}`, {
        params: { page },
      });
      const responseData = response.data as OphimListResponse;

      if (responseData.status === "success" && responseData.data?.items) {
        const result = {
          items: responseData.data.items,
          pagination: responseData.data.params.pagination,
          seoOnPage: responseData.data.seoOnPage,
          titlePage: responseData.data.titlePage,
          appDomains: {
            frontend: responseData.data.APP_DOMAIN_FRONTEND,
            cdnImage: responseData.data.APP_DOMAIN_CDN_IMAGE,
          },
        };

        // Save to store if callback provided
        if (saveToStore) {
          saveToStore(result);
        }

        return result;
      } else {
        throw new Error("Failed to fetch list data");
      }
    } catch (error) {
      console.error(
        `Error fetching Ophim list for ${category}/${slug}:`,
        error
      );
      throw new Error(
        `Failed to fetch list data from Ophim for ${category}/${slug}`
      );
    }
  }
  static async getMovieDetails(slug: string): Promise<OphimMovieItem> {
    try {
      const response = await ophimApi.get(`/v1/api/phim/${slug}`);
      const responseData = response.data as OphimMovieDetailsResponse;

      if (responseData.status === "success" && responseData.data?.item) {
        return responseData.data.item;
      } else {
        throw new Error("Failed to fetch movie details - invalid response");
      }
    } catch (error) {
      console.error(`Error fetching movie details for ${slug}:`, error);
      throw new Error(`Failed to fetch movie details from Ophim for ${slug}`);
    }
  }

  // Get movie peoples (cast & crew) from Ophim API
  static async getMoviePeoples(slug: string): Promise<MoviePerson[]> {
    try {
      const response = await ophimApi.get(`/v1/api/phim/${slug}/peoples`);
      const responseData = response.data as MoviePeoplesResponse;

      if (responseData.success && responseData.data?.peoples) {
        return responseData.data.peoples;
      } else {
        throw new Error("Failed to fetch movie peoples - invalid response");
      }
    } catch (error) {
      console.error(`Error fetching movie peoples for ${slug}:`, error);
      throw new Error(`Failed to fetch movie peoples from Ophim for ${slug}`);
    }
  }
}

// Utility function
export const isUsingMockData = () => USE_MOCK_DATA;
