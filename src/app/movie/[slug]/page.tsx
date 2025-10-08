"use client";
import SliderCastSection from "@/app/components/SliderCastSection";
import VideoPlayerCard from "@/app/components/VideoPlayerCard";
import { MovieAPI } from "@/app/lib/api";
import { MoviePerson, OphimMovieItem } from "@/app/types/navType";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React, { useEffect, useState } from "react";

interface MoviePageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface WatchProgress {
  movieSlug: string;
  episodeSlug: string;
  currentTime: number;
  duration: number;
  timestamp: number;
}

export default function MoviePage({ params }: MoviePageProps) {
  const [slug, setSlug] = useState<string>("");
  const [movieDetails, setMovieDetails] = useState<OphimMovieItem | null>(null);
  const [moviePeoples, setMoviePeoples] = useState<MoviePerson[]>([]);
  const [currentVideo, setCurrentVideo] = useState<string>("");
  const [selectedEpisode, setSelectedEpisode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [resumeTime, setResumeTime] = useState<number>(0);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedProgress, setSavedProgress] = useState<WatchProgress | null>(
    null
  );

  // Unwrap params first
  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    async function fetchData() {
      try {
        const details = await MovieAPI.getMovieDetails(slug);
        setMovieDetails(details);

        // Set first episode as default
        const firstEpisode = details.episodes?.[0]?.server_data?.[0];
        if (firstEpisode) {
          setCurrentVideo(firstEpisode.link_m3u8);
          setSelectedEpisode(firstEpisode.slug);

          // Check for saved progress
          checkSavedProgress(slug, firstEpisode.slug);
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

  const checkSavedProgress = (movieSlug: string, episodeSlug: string) => {
    const savedData = localStorage.getItem(
      `watch_progress_${movieSlug}_${episodeSlug}`
    );

    if (savedData) {
      const progress: WatchProgress = JSON.parse(savedData);
      const percentWatched = (progress.currentTime / progress.duration) * 100;

      if (progress.currentTime > 30 && percentWatched < 90) {
        setSavedProgress(progress);
        setShowResumeDialog(true);
        return true;
      }
    }
    return false;
  };

  const handleEpisodeClick = (episodeLink: string, episodeSlug: string) => {
    setResumeTime(0);
    setSavedProgress(null);

    setCurrentVideo(episodeLink);
    setSelectedEpisode(episodeSlug);

    setTimeout(() => {
      checkSavedProgress(slug, episodeSlug);
    }, 100);
  };

  const handleResume = () => {
    if (savedProgress) {
      setResumeTime(savedProgress.currentTime);
    }
    setShowResumeDialog(false);
  };

  const handleStartFromBeginning = () => {
    setResumeTime(0);
    setSavedProgress(null);

    if (savedProgress) {
      localStorage.removeItem(
        `watch_progress_${savedProgress.movieSlug}_${savedProgress.episodeSlug}`
      );
    }
    setShowResumeDialog(false);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 lg:py-8">
          {/* Video Player Skeleton */}
          <div className="flex justify-center items-center w-full mb-8">
            <Skeleton className="w-full h-[450px] rounded-lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left Column - Main Content */}
            <div className="md:col-span-2 flex flex-col gap-4">
              {/* Movie Info Skeleton */}
              <div className="bg-black/60 flex flex-col gap-4 p-4 rounded-lg">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-5 w-32 mt-2" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-20 rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Description Skeleton */}
              <div className="bg-black/60 flex flex-col gap-4 p-4 rounded-lg">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Cast Section Skeleton */}
              <div className="bg-black/60 flex flex-col gap-4 p-4 rounded-lg">
                <Skeleton className="h-6 w-32 mb-2" />
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex-shrink-0 space-y-2">
                      <Skeleton className="w-24 h-24 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-black/60 flex flex-col gap-3 p-4 rounded-lg">
                <Skeleton className="h-6 w-40 mb-2" />
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
        {/* Resume Dialog */}
        <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tiếp tục xem?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn đã xem đến{" "}
                {savedProgress && formatTime(savedProgress.currentTime)}. Bạn có
                muốn xem tiếp từ vị trí đã dừng không?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleStartFromBeginning}>
                Xem từ đầu
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleResume}>
                Tiếp tục xem
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* video player */}
        {currentVideo && (
          <div className="flex justify-center items-center w-full mb-8">
            <VideoPlayerCard
              src={currentVideo}
              width="100%"
              height="450"
              movieSlug={slug}
              episodeSlug={selectedEpisode}
              resumeTime={resumeTime}
            />
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
