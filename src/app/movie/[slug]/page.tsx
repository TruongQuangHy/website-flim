"use client";

import SliderCastSection from "@/app/components/SliderCastSection";
import VideoPlayerCard from "@/app/components/VideoPlayerCard";
import EpisodePicker from "@/app/components/EpisodePicker";
import MovieCard from "@/app/components/MovieCard";
import { MovieAPI, getMovieImageUrl } from "@/app/lib/api";
import { MoviePerson, VsmovMovieItem, VsmovEpisodeItem } from "@/app/types/navType";
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
import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  Clock,
  Calendar,
  Globe,
  Clapperboard,
  Share2,
  Check,
  Film,
  Sparkles,
  Heart,
  RotateCcw,
  X,
} from "lucide-react";
import { useUserHistoryStore } from "@/app/store/useUserHistoryStore";

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
  const [movieDetails, setMovieDetails] = useState<VsmovMovieItem | null>(null);
  const [cdnImage, setCdnImage] = useState("");
  const [moviePeoples, setMoviePeoples] = useState<MoviePerson[]>([]);
  const [relatedMovies, setRelatedMovies] = useState<VsmovMovieItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<string>("");
  const [selectedEpisodeSlug, setSelectedEpisodeSlug] = useState<string>("");
  const [selectedEpisodeName, setSelectedEpisodeName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [resumeTime, setResumeTime] = useState<number>(0);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedProgress, setSavedProgress] = useState<WatchProgress | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);

  const { user, history, saveProgress, syncFromDatabase } = useUserHistoryStore();
  const currentPosRef = useRef<number>(0);

  useEffect(() => {
    if (user?.isLoggedIn) {
      syncFromDatabase();
    }
  }, [user?.isLoggedIn, syncFromDatabase]);

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    setLoading(true);

    async function fetchData() {
      try {
        const { item, cdnImage: cdn } = await MovieAPI.getMovieDetails(slug);
        if (!isMounted) return;

        setMovieDetails(item);
        setCdnImage(cdn);

        // Pick episode: Check if user Hai Yen has history for this movie
        const movieHistory = user?.isLoggedIn ? history[slug] : null;
        const firstServer = item.episodes?.[0];
        let targetEpisode: VsmovEpisodeItem | undefined;

        if (movieHistory?.lastEpisodeSlug && firstServer?.server_data?.length) {
          targetEpisode = firstServer.server_data.find(
            (ep) => ep.slug === movieHistory.lastEpisodeSlug
          );
        }

        if (!targetEpisode) {
          targetEpisode = firstServer?.server_data?.[0];
        }

        if (targetEpisode) {
          const videoSrc = targetEpisode.link_embed || targetEpisode.link_m3u8 || "";
          setCurrentVideo(videoSrc);
          setSelectedEpisodeSlug(targetEpisode.slug);
          setSelectedEpisodeName(targetEpisode.name);

          if (movieHistory && movieHistory.lastPositionSeconds > 10) {
            setResumeTime(movieHistory.lastPositionSeconds);
            currentPosRef.current = movieHistory.lastPositionSeconds;
            const mins = Math.floor(movieHistory.lastPositionSeconds / 60);
            const secs = Math.floor(movieHistory.lastPositionSeconds % 60);
            const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;
            setResumeNotice(
              `✨ Chào Hải Yến! Đang tự động mở ${targetEpisode.name} từ đoạn xem dở (${timeStr}).`
            );
          } else {
            checkSavedProgress(slug, targetEpisode.slug);
          }
        }

        // Fetch cast / crew
        try {
          const peoples = await MovieAPI.getMoviePeoples(slug);
          if (isMounted) setMoviePeoples(peoples);
        } catch {
          // Cast fallback
        }

        // Fetch related movies by category
        try {
          const categorySlug = item.category?.[0]?.slug || "hanh-dong";
          const related = await MovieAPI.getRelatedMovies(categorySlug, 10);
          if (isMounted) {
            setRelatedMovies(related.filter((m) => m.slug !== slug));
          }
        } catch {
          // Ignore related movies error
        }
      } catch (error) {
        console.error("Failed to fetch movie details:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Flattened episode list for current active server
  const allCurrentEpisodes: VsmovEpisodeItem[] = useMemo(() => {
    if (!movieDetails?.episodes?.length) return [];
    return movieDetails.episodes[0]?.server_data || [];
  }, [movieDetails]);

  const currentEpisodeIndex = useMemo(() => {
    return allCurrentEpisodes.findIndex((ep) => ep.slug === selectedEpisodeSlug);
  }, [allCurrentEpisodes, selectedEpisodeSlug]);

  // Both sources of the active episode (player picks the best one per device)
  const activeEpisode = useMemo(() => {
    for (const srv of movieDetails?.episodes || []) {
      const found = srv.server_data?.find((ep) => ep.slug === selectedEpisodeSlug);
      if (found) return found;
    }
    return undefined;
  }, [movieDetails, selectedEpisodeSlug]);

  const hasPrevEpisode = currentEpisodeIndex > 0;
  const hasNextEpisode =
    currentEpisodeIndex >= 0 &&
    currentEpisodeIndex < allCurrentEpisodes.length - 1;

  const handlePrevEpisode = () => {
    if (hasPrevEpisode) {
      const prev = allCurrentEpisodes[currentEpisodeIndex - 1];
      handleEpisodeClick(
        prev.link_embed || prev.link_m3u8 || "",
        prev.slug,
        prev.name
      );
    }
  };

  const handleNextEpisode = () => {
    if (hasNextEpisode) {
      const next = allCurrentEpisodes[currentEpisodeIndex + 1];
      handleEpisodeClick(
        next.link_embed || next.link_m3u8 || "",
        next.slug,
        next.name
      );
    }
  };

  const checkSavedProgress = (mSlug: string, epSlug: string) => {
    try {
      const savedData = localStorage.getItem(`watch_progress_${mSlug}_${epSlug}`);
      if (savedData) {
        const progress: WatchProgress = JSON.parse(savedData);
        const percentWatched = (progress.currentTime / progress.duration) * 100;

        if (progress.currentTime > 30 && percentWatched < 90) {
          setSavedProgress(progress);
          setShowResumeDialog(true);
          return true;
        }
      }
    } catch {}
    return false;
  };

  const handleEpisodeClick = (
    episodeLink: string,
    episodeSlug: string,
    episodeName?: string
  ) => {
    setResumeTime(0);
    currentPosRef.current = 0;
    setSavedProgress(null);
    setCurrentVideo(episodeLink);
    setSelectedEpisodeSlug(episodeSlug);
    if (episodeName) setSelectedEpisodeName(episodeName);
    setResumeNotice(null);

    if (user?.isLoggedIn && movieDetails) {
      saveProgress({
        movieSlug: slug,
        movieName: movieDetails.name,
        originName: movieDetails.origin_name,
        posterUrl: getMovieImageUrl(movieDetails, cdnImage),
        quality: movieDetails.quality,
        year: movieDetails.year,
        lastEpisodeSlug: episodeSlug,
        lastEpisodeName: episodeName || "Tập",
        lastPositionSeconds: 0,
        durationSeconds: 2700,
        totalEpisodes: allCurrentEpisodes.length || 1,
      });
    }

    setTimeout(() => {
      checkSavedProgress(slug, episodeSlug);
    }, 100);
  };

  // Periodic watch progress tracking for Hai Yen
  useEffect(() => {
    if (!user?.isLoggedIn || !movieDetails || !selectedEpisodeSlug) return;

    const currentEpName = selectedEpisodeName || "Tập 1";
    const totalEps = allCurrentEpisodes.length || 1;
    const existing = history[slug];
    const initialPos =
      existing?.lastEpisodeSlug === selectedEpisodeSlug
        ? existing.lastPositionSeconds
        : currentPosRef.current;
    const initialDuration = existing?.durationSeconds || 2700;

    saveProgress({
      movieSlug: slug,
      movieName: movieDetails.name,
      originName: movieDetails.origin_name,
      posterUrl: getMovieImageUrl(movieDetails, cdnImage),
      quality: movieDetails.quality,
      year: movieDetails.year,
      lastEpisodeSlug: selectedEpisodeSlug,
      lastEpisodeName: currentEpName,
      lastPositionSeconds: initialPos,
      durationSeconds: initialDuration,
      totalEpisodes: totalEps,
    });

    const interval = setInterval(() => {
      currentPosRef.current += 10;
      saveProgress({
        movieSlug: slug,
        movieName: movieDetails.name,
        originName: movieDetails.origin_name,
        posterUrl: getMovieImageUrl(movieDetails, cdnImage),
        quality: movieDetails.quality,
        year: movieDetails.year,
        lastEpisodeSlug: selectedEpisodeSlug,
        lastEpisodeName: currentEpName,
        lastPositionSeconds: currentPosRef.current,
        durationSeconds: initialDuration,
        totalEpisodes: totalEps,
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [user?.isLoggedIn, movieDetails?.name, selectedEpisodeSlug, selectedEpisodeName]);

  const handleTimeUpdate = (currentTime: number, duration?: number) => {
    currentPosRef.current = Math.floor(currentTime);
    if (user?.isLoggedIn && movieDetails && selectedEpisodeSlug) {
      saveProgress({
        movieSlug: slug,
        movieName: movieDetails.name,
        originName: movieDetails.origin_name,
        posterUrl: getMovieImageUrl(movieDetails, cdnImage),
        quality: movieDetails.quality,
        year: movieDetails.year,
        lastEpisodeSlug: selectedEpisodeSlug,
        lastEpisodeName: selectedEpisodeName || "Tập",
        lastPositionSeconds: Math.floor(currentTime),
        durationSeconds: duration ? Math.floor(duration) : 2700,
        totalEpisodes: allCurrentEpisodes.length || 1,
      });
    }
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

  const handleShareMovie = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
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

  const backdropUrl = movieDetails ? getMovieImageUrl(movieDetails, cdnImage) : "";

  if (loading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="w-full h-[40vh] rounded-none bg-white/5" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 space-y-4">
          <Skeleton className="w-full aspect-video max-h-[480px] rounded-2xl bg-white/10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <p className="text-xl text-white/70">
            Không tìm thấy thông tin phim hoặc kết nối gián đoạn.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            Về trang chủ HyFlim
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
  const currentServerName = movieDetails.episodes?.[0]?.server_name || "VIP Server";
  const tmdbRating = movieDetails.tmdb?.vote_average
    ? Number(movieDetails.tmdb.vote_average).toFixed(1)
    : null;

  return (
    <div className="min-h-screen relative pb-16 overflow-x-clip">
      {/* Backdrop background blur */}
      {backdropUrl && (
        <div className="absolute top-0 left-0 right-0 h-[45vh] sm:h-[55vh] overflow-hidden pointer-events-none">
          <Image
            src={backdropUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-top opacity-30 blur-sm"
            aria-hidden
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#0a0a0a]/90 to-[#0a0a0a]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 lg:pt-6">
        {/* Resume Watch Progress Alert */}
        <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
          <AlertDialogContent className="bg-[#141414] border-white/10 text-white rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Tiếp tục xem phim?</AlertDialogTitle>
              <AlertDialogDescription className="text-white/70">
                Bạn đã xem đến{" "}
                <span className="font-semibold text-brand">
                  {savedProgress && formatTime(savedProgress.currentTime)}
                </span>
                . Bạn có muốn tiếp tục từ thời điểm này không?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={handleStartFromBeginning}
                className="bg-white/10 border-white/10 text-white hover:bg-white/20"
              >
                Xem lại từ đầu
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResume}
                className="bg-brand hover:bg-brand-hover text-white font-semibold"
              >
                Tiếp tục xem
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Hai Yen Auto-Resume Banner */}
        {resumeNotice && (
          <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-brand/20 via-pink-500/15 to-brand/10 border border-brand/40 flex items-center justify-between gap-3 text-xs sm:text-sm text-white animate-fadeIn shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 fill-white" />
              </span>
              <span>{resumeNotice}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setResumeTime(0);
                  currentPosRef.current = 0;
                  setResumeNotice(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Xem từ đầu</span>
              </button>
              <button
                type="button"
                onClick={() => setResumeNotice(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                aria-label="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Video Player */}
        {currentVideo ? (
          <div className="w-full mb-6">
            <VideoPlayerCard
              src={currentVideo}
              embedSrc={activeEpisode?.link_embed}
              m3u8Src={activeEpisode?.link_m3u8}
              movieSlug={slug}
              episodeSlug={selectedEpisodeSlug}
              episodeName={selectedEpisodeName}
              serverName={currentServerName}
              hasPrevEpisode={hasPrevEpisode}
              hasNextEpisode={hasNextEpisode}
              onPrevEpisode={handlePrevEpisode}
              onNextEpisode={handleNextEpisode}
              resumeTime={resumeTime}
              onTimeUpdate={handleTimeUpdate}
            />
          </div>
        ) : (
          <div className="w-full aspect-video bg-black/60 border border-white/10 rounded-2xl flex items-center justify-center text-white/60 mb-6">
            <p>Phim đang cập nhật nguồn phát...</p>
          </div>
        )}

        {/* Title Bar & Quick Actions */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              {movieDetails.quality && (
                <span className="bg-brand text-white px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                  {movieDetails.quality}
                </span>
              )}
              {movieDetails.chieurap && (
                <span className="bg-amber-500 text-black px-2 py-0.5 rounded font-black text-[10px] uppercase">
                  Chiếu Rạp
                </span>
              )}
              {tmdbRating && Number(tmdbRating) > 0 && (
                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded ring-1 ring-amber-400/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {tmdbRating} TMDB
                </span>
              )}
              <span className="text-white/70">{movieDetails.year}</span>
              {movieDetails.time && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="text-white/70">{movieDetails.time}</span>
                </>
              )}
              {movieDetails.episode_current && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="text-white/70">
                    {movieDetails.episode_current}
                  </span>
                </>
              )}
            </div>

            <h1 className="font-black text-xl sm:text-3xl md:text-4xl text-white tracking-tight">
              {movieDetails.name}
            </h1>

            {movieDetails.origin_name &&
              movieDetails.origin_name !== movieDetails.name && (
                <h2 className="text-sm sm:text-base text-white/60 italic">
                  {movieDetails.origin_name}
                </h2>
              )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareMovie}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              title="Chia sẻ liên kết phim"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Chia sẻ</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Episode Picker */}
            {movieDetails.episodes && movieDetails.episodes.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-md">
                <EpisodePicker
                  servers={movieDetails.episodes}
                  selectedSlug={selectedEpisodeSlug}
                  onSelect={handleEpisodeClick}
                  movieSlug={slug}
                />
              </div>
            )}

            {/* Movie Description */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-md space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-white/80 flex items-center gap-2">
                <Film className="w-4 h-4 text-brand" />
                Nội dung phim
              </h3>
              <div
                className="text-white/85 text-sm sm:text-base leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: movieDetails.content || "Đang cập nhật nội dung...",
                }}
              />
            </div>

            {/* Cast Section */}
            {actors.length > 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-md space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-white/80">
                  Diễn viên tham gia
                </h3>
                <SliderCastSection actors={actors} />
              </div>
            ) : actorsList.length > 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-md space-y-2">
                <h3 className="font-bold text-sm uppercase tracking-wider text-white/80">
                  Diễn viên
                </h3>
                <p className="text-white/80 text-sm">{actorsList.join(", ")}</p>
              </div>
            ) : null}

            {/* Related Movies Section */}
            {relatedMovies.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand" />
                  <h3 className="font-extrabold text-lg text-white">
                    Phim cùng thể loại đề xuất
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {relatedMovies.slice(0, 8).map((rel) => (
                    <MovieCard
                      key={rel._id}
                      item={rel}
                      cdnImage={cdnImage}
                      className="w-full"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Metadata */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-md space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-white/80">
                Thông tin chi tiết
              </h3>

              <dl className="space-y-3 text-xs sm:text-sm">
                {directorsList.length > 0 && (
                  <div>
                    <dt className="text-white/50 flex items-center gap-1.5 mb-1">
                      <Clapperboard className="w-3.5 h-3.5 text-brand" />
                      Đạo diễn
                    </dt>
                    <dd className="text-white/90 font-medium">
                      {directorsList.join(", ")}
                    </dd>
                  </div>
                )}

                {movieDetails.category && movieDetails.category.length > 0 && (
                  <div>
                    <dt className="text-white/50 mb-1.5">Thể loại</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {movieDetails.category.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/the-loai/${cat.slug}`}
                          className="bg-white/10 hover:bg-white/20 text-white/90 px-2 py-0.5 rounded text-xs transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </dd>
                  </div>
                )}

                {movieDetails.country && movieDetails.country.length > 0 && (
                  <div>
                    <dt className="text-white/50 flex items-center gap-1.5 mb-1">
                      <Globe className="w-3.5 h-3.5 text-brand" />
                      Quốc gia
                    </dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {movieDetails.country.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/quoc-gia/${c.slug}`}
                          className="bg-white/10 hover:bg-white/20 text-white/90 px-2 py-0.5 rounded text-xs transition-colors"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-white/50 flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-brand" />
                    Năm phát hành
                  </dt>
                  <dd className="text-white/90 font-medium">
                    {movieDetails.year}
                  </dd>
                </div>

                {movieDetails.time && (
                  <div>
                    <dt className="text-white/50 flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5 text-brand" />
                      Thời lượng
                    </dt>
                    <dd className="text-white/90 font-medium">
                      {movieDetails.time}
                    </dd>
                  </div>
                )}

                {movieDetails.status && (
                  <div>
                    <dt className="text-white/50 mb-1">Tình trạng</dt>
                    <dd className="text-white/90 font-medium capitalize">
                      {movieDetails.status === "completed"
                        ? "Hoàn tất"
                        : movieDetails.status === "ongoing"
                          ? "Đang phát hành"
                          : movieDetails.status}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
