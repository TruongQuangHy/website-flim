"use client";

import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import {
  OphimCategory,
  OphimCountry,
  OphimYear,
  OphimHomeItem,
  OphimPagination,
  OphimSeoOnPage,
  OphimAppDomains,
} from "../types/navType";

interface CategoryStore {
  categories: OphimCategory[];
  setCategories: (categories: OphimCategory[]) => void;
  isLoadingCategories: boolean;
  setIsLoadingCategories: (loading: boolean) => void;

  countries: OphimCountry[];
  setCountries: (countries: OphimCountry[]) => void;
  isLoadingCountries: boolean;
  setIsLoadingCountries: (loading: boolean) => void;

  years: (OphimYear & { _id: string; name: string; slug: string })[];
  setYears: (
    years: (OphimYear & { _id: string; name: string; slug: string })[]
  ) => void;
  isLoadingYears: boolean;
  setIsLoadingYears: (loading: boolean) => void;

  homeItems: OphimHomeItem[];
  homePagination: OphimPagination | null;
  homeSeoOnPage: OphimSeoOnPage | null;
  homeAppDomains: OphimAppDomains;
  setHomeData: (homeData: {
    items: OphimHomeItem[];
    pagination: OphimPagination;
    seoOnPage: OphimSeoOnPage;
    appDomains: OphimAppDomains;
  }) => void;
  isLoadingHomeItems: boolean;
  setIsLoadingHomeItems: (loading: boolean) => void;

  // List data by slug
  listDataBySlug: Record<
    string,
    {
      items: OphimHomeItem[];
      pagination: OphimPagination;
      seoOnPage: OphimSeoOnPage;
      titlePage: string;
      appDomains: OphimAppDomains;
    }
  >;
  setListData: (
    slug: string,
    listData: {
      items: OphimHomeItem[];
      pagination: OphimPagination;
      seoOnPage: OphimSeoOnPage;
      titlePage: string;
      appDomains: OphimAppDomains;
    }
  ) => void;
  isLoadingList: Record<string, boolean>;
  setIsLoadingList: (slug: string, loading: boolean) => void;
}

export const useStore = create<CategoryStore>()(
  devtools(
    persist(
      (set) => ({
        categories: [],
        setCategories: (categories) => set({ categories }),
        isLoadingCategories: false,
        setIsLoadingCategories: (loading) =>
          set({ isLoadingCategories: loading }),

        countries: [],
        setCountries: (countries) => set({ countries }),
        isLoadingCountries: false,
        setIsLoadingCountries: (loading) =>
          set({ isLoadingCountries: loading }),

        years: [],
        setYears: (years) => set({ years }),
        isLoadingYears: false,
        setIsLoadingYears: (loading) => set({ isLoadingYears: loading }),

        homeItems: [],
        homePagination: null,
        homeSeoOnPage: null,
        homeAppDomains: { frontend: "", cdnImage: "" },
        setHomeData: (homeData) =>
          set({
            homeItems: homeData.items,
            homePagination: homeData.pagination,
            homeSeoOnPage: homeData.seoOnPage,
            homeAppDomains: homeData.appDomains,
          }),
        isLoadingHomeItems: false,
        setIsLoadingHomeItems: (loading) =>
          set({ isLoadingHomeItems: loading }),

        listDataBySlug: {},
        setListData: (slug, listData) =>
          set((state) => ({
            listDataBySlug: {
              ...state.listDataBySlug,
              [slug]: listData,
            },
          })),
        isLoadingList: {},
        setIsLoadingList: (slug, loading) =>
          set((state) => ({
            isLoadingList: {
              ...state.isLoadingList,
              [slug]: loading,
            },
          })),
      }),
      {
        name: "ophim-data-storage",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);
