"use client";

import React, { useEffect } from "react";
import { useStore } from "../store/useStore";
import { MovieAPI } from "../lib/api";
import ContentRow from "./ContentRow";

interface SliderListFilmSectionProps {
  slug: string;
  title: string;
  category?: string;
}

const SliderListFilmSection: React.FC<SliderListFilmSectionProps> = ({
  slug,
  title,
  category = "danh-sach",
}) => {
  const { listDataBySlug, setListData, isLoadingList, setIsLoadingList } =
    useStore();

  const listData = listDataBySlug[slug];
  const isLoading = isLoadingList[slug] || false;

  useEffect(() => {
    if (!listData) {
      const fetchListData = async () => {
        setIsLoadingList(slug, true);
        try {
          await MovieAPI.getOphimList(category, slug, 1, (data) => {
            setListData(slug, data);
          });
        } catch (error) {
          console.error(`Failed to fetch list data for ${slug}:`, error);
        } finally {
          setIsLoadingList(slug, false);
        }
      };
      fetchListData();
    }
  }, [slug, listData, setListData, setIsLoadingList, category]);

  if (!isLoading && !listData) {
    return null;
  }

  return (
    <ContentRow
      title={listData?.titlePage || title}
      items={listData?.items || []}
      cdnImage={listData?.appDomains.cdnImage || ""}
      seeAllHref={`/${category}/${slug}`}
      isLoading={isLoading || !listData}
      maxItems={16}
    />
  );
};

export default SliderListFilmSection;
