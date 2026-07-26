"use client";
import SliderCastSection from "@/app/components/SliderCastSection";
import VideoPlayerCard from "@/app/components/VideoPlayerCard";
import EpisodePicker from "@/app/components/EpisodePicker";
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
import Link from "next/link";
import Image from "next/image";
import { Star, Clock, Calendar, Globe, Clapperboard } from "lucide-react";

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
  const [cdnImage, setCdnImage] = useState("");
  const [moviePeoples, setMoviePeoples] = useState<MoviePerson[]>([]);
  const [currentVideo, setCurrentVideo] = useState<string>("");
  const [selectedEpisode, setSelectedEpisode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [resumeTime, setResumeTime] = useState<number>(0);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedProgress, setSavedProgress] = useState<WatchProgress | null>(
    null
  );

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    async function fetchData() {
      try {
        const { item, cdnImage: cdn } = await MovieAPI.getMovieDetails(slug);
        setMovieDetails(item);
        setCdnImage(cdn);

        const firstEpisode = item.episodes?.[0]?.server_data?.[0];
        if (firstEpisode) {
          setCurrentVideo(firstEpisode.link_m3u8);
          setSelectedEpisode(firstEpisode.slug);
          checkSavedProgress(slug, firstEpisode.slug);
        }

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

  const backdropUrl = movieDetails
    ? movieDetails.poster_url?.startsWith("http")
      ? movieDetails.poster_url
      : movieDetails.thumb_url?.startsWith("http")
        ? movieDetails.thumb_url
        : cdnImage
          ? `${cdnImage}/uploads/movies/${movieDetails.poster_url || movieDetails.thumb_url}`
          : ""
    : "";

  if (loading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="w-full h-[40vh] rounded-none bg-white/5" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 space-y-4">
          <Skeleton className="w-full aspect-video max-h-[450px] rounded-xl bg-white/10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-40 w-full rounded-xl bg-white/10" />
              <Skeleton className="h-32 w-full rounded-xl bg-white/10" />
            </div>
            <Skeleton className="h-64 w-full rounded-xl bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!movieDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">
            Không thể tải thông tin phim. Vui lòng thử lại sau.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-md font-medium transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const actorsList = movieDetails.actor || [];
  const directorsList = movieDetails.director || [];
  const actors = moviePeoples.filter(
    (person) => person.known_for_department === "Acting"
  );
  const episodes = movieDetails.episodes?.[0]?.server_data || [];

  return (
    <div className="min-h-screen relative">
      {/* Backdrop */}
      {backdropUrl && (
        <div className="absolute top-0 left-0 right-0 h-[50vh] overflow-hidden pointer-events-none">
          <Image
            src={backdropUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-top opacity-40 scale-105"
            aria-hidden
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#0a0a0a]/80 to-[#0a0a0a]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a]/80" />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-12">
        <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
          <AlertDialogContent className="bg-[#141414] border-white/10 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Tiếp tục xem?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Bạn đã xem đến{" "}
                {savedProgress && formatTime(savedProgress.currentTime)}. Bạn có
                muốn xem tiếp từ vị trí đã dừng không?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={handleStartFromBeginning}
                className="bg-white/10 border-white/10 text-white hover:bg-white/20"
              >
                Xem từ đầu
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResume}
                className="bg-brand hover:bg-brand-hover text-white"
              >
                Tiếp tục xem
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Player */}
        {currentVideo && (
          <div className="w-full mb-8 rounded-xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60 bg-black">
            <VideoPlayerCard
              src={currentVideo}
              width="100%"
              height="auto"
              movieSlug={slug}
              episodeSlug={selectedEpisode}
              resumeTime={resumeTime}
            />
          </div>
        )}

        {/* Title strip */}
        <div className="mb-6 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            {movieDetails.quality && (
              <span className="bg-brand text-white px-2 py-0.5 rounded font-bold uppercase">
                {movieDetails.quality}
              </span>
            )}
            {movieDetails.chieurap && (
              <span className="bg-amber-500/90 text-black px-2 py-0.5 rounded font-bold text-[10px] uppercase">
                Chiếu rạp
              </span>
            )}
            <span className="text-white/70">{movieDetails.year}</span>
            {movieDetails.time && (
              <>
                <span className="text-white/30">•</span>
                <span className="text-white/70">{movieDetails.time}</span>
              </>
            )}
            {movieDetails.lang && (
              <>
                <span className="text-white/30">•</span>
                <span className="text-white/70">{movieDetails.lang}</span>
              </>
            )}
          </div>
          <h1 className="font-extrabold text-2xl sm:text-3xl md:text-4xl tracking-tight">
            {movieDetails.name}
          </h1>
          {movieDetails.origin_name &&
            movieDetails.origin_name !== movieDetails.name && (
              <h2 className="text-base sm:text-lg text-muted-foreground">
                {movieDetails.origin_name}
              </h2>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="md:col-span-2 flex flex-col gap-4">
            {/* Episodes */}
            {episodes.length > 0 && (
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 sm:p-5 backdrop-blur-sm">
                <EpisodePicker
                  episodes={episodes}
                  selectedSlug={selectedEpisode}
                  onSelect={handleEpisodeClick}
                />
              </div>
            )}

            {/* Description */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 sm:p-5 backdrop-blur-sm space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-white/70">
                Nội dung phim
              </h3>
              <div
                className="text-white/80 text-sm sm:text-base leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: movieDetails.content }}
              />
            </div>

            {/* Cast */}
            {actors.length > 0 && (
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 sm:p-5 backdrop-blur-sm space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-white/70">
                  Diễn viên
                </h3>
                <SliderCastSection actors={actors} />
              </div>
            )}

            {actors.length === 0 &&
              (actorsList.length > 0 || directorsList.length > 0) && (
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 sm:p-5 space-y-4">
                  {actorsList.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-white/70 mb-2">
                        Diễn viên
                      </h3>
                      <p className="text-white/80 text-sm">
                        {actorsList.join(", ")}
                      </p>
                    </div>
                  )}
                  {directorsList.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-white/70 mb-2">
                        Đạo diễn
                      </h3>
                      <p className="text-white/80 text-sm">
                        {directorsList.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 sm:p-5 backdrop-blur-sm space-y-4 sticky top-20">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-white/70">
                Thông tin phim
              </h3>

              <dl className="space-y-3 text-sm">
                {movieDetails.category && movieDetails.category.length > 0 && (
                  <div className="flex gap-2">
                    <Clapperboard className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-white/50 text-xs mb-1">Thể loại</dt>
                      <dd className="flex flex-wrap gap-1.5">
                        {movieDetails.category.map((cat) => (
                          <Link
                            key={cat.slug || cat.id}
                            href={`/the-loai/${cat.slug}`}
                            className="bg-white/10 hover:bg-brand/30 px-2 py-0.5 rounded text-xs transition-colors"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </dd>
                    </div>
                  </div>
                )}

                {movieDetails.country && movieDetails.country.length > 0 && (
                  <div className="flex gap-2">
                    <Globe className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-white/50 text-xs mb-1">Quốc gia</dt>
                      <dd className="text-white/90">
                        {movieDetails.country.map((c) => c.name).join(", ")}
                      </dd>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Calendar className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-white/50 text-xs mb-1">Năm</dt>
                    <dd className="text-white/90">{movieDetails.year}</dd>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Clock className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-white/50 text-xs mb-1">Thời lượng</dt>
                    <dd className="text-white/90">{movieDetails.time}</dd>
                  </div>
                </div>

                <div>
                  <dt className="text-white/50 text-xs mb-1">Trạng thái</dt>
                  <dd className="text-white/90">
                    {movieDetails.episode_current}
                    {movieDetails.episode_total
                      ? ` / ${movieDetails.episode_total}`
                      : ""}
                  </dd>
                </div>

                {movieDetails.imdb && movieDetails.imdb.vote_average > 0 && (
                  <div className="flex gap-2 items-start pt-2 border-t border-white/10">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-white/50 text-xs mb-1">IMDb</dt>
                      <dd>
                        <span className="text-amber-400 font-semibold">
                          {movieDetails.imdb.vote_average}/10
                        </span>
                        <span className="text-muted-foreground text-xs ml-2">
                          ({movieDetails.imdb.vote_count} votes)
                        </span>
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
