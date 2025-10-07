"use client";
import SliderCastSection from "@/app/components/SliderCastSection";
import VideoPlayerCard from "@/app/components/VideoPlayerCard";
import { MovieAPI } from "@/app/lib/api";
import { MoviePerson, OphimMovieItem } from "@/app/types/navType";
import React, { useEffect, useState } from "react";

interface MoviePageProps {
  params: {
    slug: string;
  };
}

export default function MoviePage({ params }: MoviePageProps) {
  const { slug } = params;
  const [movieDetails, setMovieDetails] = useState<OphimMovieItem | null>(null);
  const [moviePeoples, setMoviePeoples] = useState<MoviePerson[]>([]);
  const [currentVideo, setCurrentVideo] = useState<string>("");
  const [selectedEpisode, setSelectedEpisode] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const details = await MovieAPI.getMovieDetails(slug);
        setMovieDetails(details);

        // Set first episode as default
        const firstEpisode = details.episodes?.[0]?.server_data?.[0];
        if (firstEpisode) {
          setCurrentVideo(firstEpisode.link_m3u8);
          setSelectedEpisode(firstEpisode.slug);
        }

        // Fetch movie peoples
        try {
          const peoples = await MovieAPI.getMoviePeoples(slug);
          setMoviePeoples(peoples);
        } catch (error) {
          console.log("Movie peoples not available:", error);
        }
      } catch (error) {
        console.error("Failed to fetch movie details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  const handleEpisodeClick = (episodeLink: string, episodeSlug: string) => {
    setCurrentVideo(episodeLink);
    setSelectedEpisode(episodeSlug);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!movieDetails) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">
          Không thể tải thông tin phim. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  // Parse actors from movie details (fallback)
  const actorsList = movieDetails.actor || [];
  const directorsList = movieDetails.director || [];

  // Filter actors from peoples API
  const actors = moviePeoples.filter(
    (person) => person.known_for_department === "Acting"
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 lg:py-8">
        {/* video player */}
        {currentVideo && (
          <div className="flex justify-center items-center w-full mb-8">
            <VideoPlayerCard src={currentVideo} width="100%" height="450" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 flex flex-col gap-4">
            {/* Movie Info */}
            <div className="bg-black/60 flex flex-col gap-4 p-4 rounded-lg">
              <h1 className="font-bold text-xl md:text-2xl">
                {movieDetails.name}
              </h1>
              <h2 className="font-bold text-lg text-gray-300">
                {movieDetails.origin_name}
              </h2>

              {/* Episodes */}
              {movieDetails.episodes && movieDetails.episodes.length > 0 && (
                <>
                  <h3 className="font-semibold mt-2">Danh sách tập</h3>
                  <div className="flex flex-wrap gap-2">
                    {movieDetails.episodes[0].server_data.map((episode) => (
                      <button
                        key={episode.slug}
                        onClick={() =>
                          handleEpisodeClick(episode.link_m3u8, episode.slug)
                        }
                        className={`${
                          selectedEpisode === episode.slug
                            ? "bg-red-500"
                            : "bg-gray-600 hover:bg-red-500"
                        } duration-300 ease-in-out cursor-pointer text-white px-4 py-2 rounded-lg`}
                      >
                        {episode.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Description */}
            <div className="bg-black/60 flex flex-col gap-4 p-4 rounded-lg">
              <h1 className="font-bold text-lg">Nội dung phim</h1>
              <div
                className="text-gray-300"
                dangerouslySetInnerHTML={{ __html: movieDetails.content }}
              />
            </div>

            {/* Cast Section with peoples API */}
            {actors.length > 0 && (
              <div className="bg-black/60 flex flex-col gap-4 p-4 rounded-lg">
                <h1 className="font-bold text-lg mb-2">Diễn viên</h1>
                <SliderCastSection actors={actors} />
              </div>
            )}

            {/* Fallback: Actors & Directors from movie details */}
            {actors.length === 0 &&
              (actorsList.length > 0 || directorsList.length > 0) && (
                <div className="bg-black/60 flex flex-col gap-4 p-4 rounded-lg">
                  {actorsList.length > 0 && (
                    <div>
                      <h1 className="font-bold text-lg mb-2">Diễn viên</h1>
                      <p className="text-gray-300">{actorsList.join(", ")}</p>
                    </div>
                  )}
                  {directorsList.length > 0 && (
                    <div>
                      <h1 className="font-bold text-lg mb-2">Đạo diễn</h1>
                      <p className="text-gray-300">
                        {directorsList.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Sidebar - Movie Info */}
          <div className="md:col-span-1">
            <div className="bg-black/60 flex flex-col gap-3 p-4 rounded-lg">
              <h1 className="font-bold text-lg mb-2">Thông tin phim</h1>

              {movieDetails.category && movieDetails.category.length > 0 && (
                <div>
                  <span className="font-semibold">Thể loại: </span>
                  <span className="text-gray-300">
                    {movieDetails.category.map((cat) => cat.name).join(", ")}
                  </span>
                </div>
              )}

              {movieDetails.country && movieDetails.country.length > 0 && (
                <div>
                  <span className="font-semibold">Quốc gia: </span>
                  <span className="text-gray-300">
                    {movieDetails.country.map((c) => c.name).join(", ")}
                  </span>
                </div>
              )}

              <div>
                <span className="font-semibold">Năm phát hành: </span>
                <span className="text-gray-300">{movieDetails.year}</span>
              </div>

              <div>
                <span className="font-semibold">Âm thanh: </span>
                <span className="text-gray-300">{movieDetails.lang}</span>
              </div>

              <div>
                <span className="font-semibold">Chất lượng: </span>
                <span className="text-gray-300">{movieDetails.quality}</span>
              </div>

              <div>
                <span className="font-semibold">Thời lượng: </span>
                <span className="text-gray-300">{movieDetails.time}</span>
              </div>

              <div>
                <span className="font-semibold">Trạng thái: </span>
                <span className="text-gray-300">
                  {movieDetails.episode_current}
                </span>
              </div>

              {movieDetails.imdb && (
                <div>
                  <span className="font-semibold">IMDB: </span>
                  <span className="text-yellow-400">
                    ⭐ {movieDetails.imdb.vote_average}/10
                  </span>
                  <span className="text-gray-400 text-sm ml-2">
                    ({movieDetails.imdb.vote_count} votes)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
