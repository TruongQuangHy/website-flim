"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Lightbulb,
  LightbulbOff,
  ChevronLeft,
  ChevronRight,
  Tv,
  Sparkles,
} from "lucide-react";

interface VideoPlayerCardProps {
  src: string;
  width?: string;
  height?: string;
  movieSlug: string;
  episodeSlug: string;
  episodeName?: string;
  serverName?: string;
  hasPrevEpisode?: boolean;
  hasNextEpisode?: boolean;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
  onTimeUpdate?: (currentTime: number, duration?: number) => void;
  resumeTime?: number;
}

function VideoPlayerCard({
  src,
  width = "100%",
  height = "auto",
  movieSlug,
  episodeSlug,
  episodeName,
  serverName,
  hasPrevEpisode = false,
  hasNextEpisode = false,
  onPrevEpisode,
  onNextEpisode,
  onTimeUpdate,
  resumeTime,
}: VideoPlayerCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // States for modern cinematic controls
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isLightsOff, setIsLightsOff] = useState(false);
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Check whether source is an embed iframe or m3u8 stream
  const isEmbed = Boolean(
    src &&
      (!src.includes(".m3u8") ||
        src.includes("/video/") ||
        src.includes("embed") ||
        src.includes("streamvsmov"))
  );

  // Handle Lights Off body scroll & escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isLightsOff) setIsLightsOff(false);
        if (isTheaterMode) setIsTheaterMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightsOff, isTheaterMode]);

  // Save watch progress to localStorage (for HLS / direct video)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isEmbed) return;

    const handleProgressUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;

      if (currentTime > 0 && duration > 0) {
        const watchProgress = {
          movieSlug,
          episodeSlug,
          currentTime,
          duration,
          timestamp: Date.now(),
        };

        localStorage.setItem(
          `watch_progress_${movieSlug}_${episodeSlug}`,
          JSON.stringify(watchProgress)
        );

        if (onTimeUpdate) {
          onTimeUpdate(currentTime, duration);
        }
      }
    };

    video.addEventListener("timeupdate", handleProgressUpdate);
    return () => {
      video.removeEventListener("timeupdate", handleProgressUpdate);
    };
  }, [movieSlug, episodeSlug, onTimeUpdate, isEmbed]);

  // Resume playback for HLS video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isEmbed || !resumeTime) return;

    const setVideoTime = () => {
      if (video.readyState >= 2) {
        video.currentTime = resumeTime;
      } else {
        const handleCanPlay = () => {
          video.currentTime = resumeTime;
          video.removeEventListener("canplay", handleCanPlay);
        };
        video.addEventListener("canplay", handleCanPlay);
      }
    };

    setVideoTime();
    return () => {
      video.removeEventListener("canplay", setVideoTime);
    };
  }, [resumeTime, isEmbed]);

  // Setup Hls.js when source is an m3u8 stream
  useEffect(() => {
    if (!src || isEmbed) return;
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
      });
    }
  }, [src, isEmbed, reloadKey]);

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
  };

  const cleanServerName = serverName
    ? serverName.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim()
    : "";

  return (
    <>
      {/* Lights Off Overlay */}
      {isLightsOff && (
        <div
          onClick={() => setIsLightsOff(false)}
          className="fixed inset-0 bg-black/92 z-40 backdrop-blur-md transition-opacity duration-500 cursor-pointer"
          title="Bấm để bật lại đèn"
        />
      )}

      {/* Main Player Container */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isLightsOff ? "relative z-50" : "relative"
        } ${
          isTheaterMode
            ? "sm:w-screen sm:relative sm:left-1/2 sm:-translate-x-1/2 sm:max-w-[1920px] sm:px-6 w-full"
            : "w-full"
        }`}
      >
        {/* Ambient Glow Aura */}
        {ambientGlow && (
          <div
            className="absolute -inset-1 sm:-inset-4 bg-gradient-to-r from-red-600/20 via-brand/15 to-amber-600/15 rounded-xl sm:rounded-2xl blur-xl sm:blur-3xl opacity-70 pointer-events-none -z-10 animate-pulse-slow"
            aria-hidden
          />
        )}

        {/* Video Frame */}
        <div className="relative w-full aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group/player">
          {isEmbed ? (
            <iframe
              key={`embed-${src}-${reloadKey}`}
              src={src}
              className="w-full h-full border-0 object-cover bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              title={episodeName || "Trình phát phim HyFlim"}
            />
          ) : (
            <video
              key={`video-${src}-${reloadKey}`}
              ref={videoRef}
              controls
              width={width}
              height={height}
              className="w-full h-full object-contain bg-black"
              playsInline
              controlsList="nodownload"
              aria-label="Trình phát video"
            />
          )}
        </div>

        {/* Cinematic Control Bar */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-0.5 text-xs text-white/70">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {cleanServerName && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white font-medium text-[11px] sm:text-xs">
                  <Tv className="w-3.5 h-3.5 text-brand shrink-0" />
                  <span className="truncate max-w-[140px] sm:max-w-none">
                    {cleanServerName}
                  </span>
                </span>
              )}
              {episodeName && (
                <span className="font-semibold text-white px-2 py-1 rounded bg-brand/20 text-brand text-[11px] sm:text-xs">
                  Tập: {episodeName}
                </span>
              )}
            </div>

            {/* Mobile reload button */}
            <button
              type="button"
              onClick={handleReload}
              className="sm:hidden p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
              title="Tải lại trình phát khi bị giật lag"
              aria-label="Tải lại trình phát"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5">
              {/* Prev Episode */}
              {hasPrevEpisode && onPrevEpisode && (
                <button
                  type="button"
                  onClick={onPrevEpisode}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 hover:text-white transition-colors text-[11px] sm:text-xs font-medium"
                  title="Tập trước"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span>Tập trước</span>
                </button>
              )}

              {/* Next Episode */}
              {hasNextEpisode && onNextEpisode && (
                <button
                  type="button"
                  onClick={onNextEpisode}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 hover:text-white transition-colors text-[11px] sm:text-xs font-medium"
                  title="Tập tiếp theo"
                >
                  <span>Tập tiếp</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 ml-auto sm:ml-0">
              {/* Ambient Glow Toggle */}
              <button
                type="button"
                onClick={() => setAmbientGlow(!ambientGlow)}
                className={`p-1.5 rounded-lg transition-colors ${
                  ambientGlow
                    ? "text-brand bg-brand/10 hover:bg-brand/20"
                    : "bg-white/5 hover:bg-white/15 text-white/60 hover:text-white"
                }`}
                title={ambientGlow ? "Tắt đèn viền (Ambient)" : "Bật đèn viền (Ambient)"}
                aria-label="Đèn viền"
              >
                <Sparkles className="w-4 h-4" />
              </button>

              {/* Lights Off Mode */}
              <button
                type="button"
                onClick={() => setIsLightsOff(!isLightsOff)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLightsOff
                    ? "text-yellow-400 bg-yellow-400/10"
                    : "bg-white/5 hover:bg-white/15 text-white/60 hover:text-white"
                }`}
                title={isLightsOff ? "Bật lại đèn (Esc)" : "Tắt đèn rạp phim"}
                aria-label="Tắt đèn"
              >
                {isLightsOff ? (
                  <LightbulbOff className="w-4 h-4" />
                ) : (
                  <Lightbulb className="w-4 h-4" />
                )}
              </button>

              {/* Theater Mode (Desktop only) */}
              <button
                type="button"
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className={`hidden sm:inline-flex p-1.5 rounded-lg transition-colors ${
                  isTheaterMode
                    ? "text-brand bg-brand/10"
                    : "bg-white/5 hover:bg-white/15 text-white/60 hover:text-white"
                }`}
                title={isTheaterMode ? "Thu nhỏ về mặc định" : "Mở rộng rạp phim (Theater Mode)"}
                aria-label="Mở rộng rạp phim"
              >
                {isTheaterMode ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              {/* Desktop reload button */}
              <button
                type="button"
                onClick={handleReload}
                className="hidden sm:inline-flex p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors"
                title="Tải lại trình phát khi bị giật lag"
                aria-label="Tải lại trình phát"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default VideoPlayerCard;
