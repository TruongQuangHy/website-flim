"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Repeat,
  AlertTriangle,
} from "lucide-react";

interface VideoPlayerCardProps {
  src: string;
  /** Embed (iframe) link of the current episode, if any */
  embedSrc?: string;
  /** Direct HLS (.m3u8) link of the current episode, if any */
  m3u8Src?: string;
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

type PlayMode = "embed" | "hls";

const isM3u8Url = (url?: string) => Boolean(url && /\.m3u8(\?|#|$)/i.test(url));

// iOS Safari blocks http:// content inside https pages (mixed content) -> black frame.
const normalizeUrl = (url?: string) => {
  const clean = (url || "").trim();
  if (!clean) return "";
  if (clean.startsWith("//")) return `https:${clean}`;
  return clean.replace(/^http:\/\//i, "https://");
};

// iPhone / iPad (including iPadOS that reports itself as Mac)
const detectAppleMobile = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return (
    /iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh/i.test(ua) && typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1)
  );
};

function VideoPlayerCard({
  src,
  embedSrc,
  m3u8Src,
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
  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;

  const [isAppleMobile] = useState(detectAppleMobile);

  // States for modern cinematic controls
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isLightsOff, setIsLightsOff] = useState(false);
  // Animated blur layers next to a <video> cause black frames on iOS Safari -> off by default there
  const [ambientGlow, setAmbientGlow] = useState(() => !detectAppleMobile());
  const [reloadKey, setReloadKey] = useState(0);
  const [forcedMode, setForcedMode] = useState<PlayMode | null>(null);
  const [playError, setPlayError] = useState<string | null>(null);

  // Resolve both possible sources for this episode
  const embedUrl = useMemo(() => {
    const candidate = embedSrc || (!isM3u8Url(src) ? src : "");
    return normalizeUrl(candidate);
  }, [embedSrc, src]);

  const hlsUrl = useMemo(() => {
    const candidate = m3u8Src || (isM3u8Url(src) ? src : "");
    return normalizeUrl(candidate);
  }, [m3u8Src, src]);

  // iPhone: third-party embed players frequently render a black frame (ITP / autoplay / MSE limits),
  // while iOS plays .m3u8 natively and reliably -> prefer HLS on Apple mobile devices.
  const defaultMode: PlayMode = useMemo(() => {
    if (isAppleMobile && hlsUrl) return "hls";
    if (embedUrl) return "embed";
    return "hls";
  }, [isAppleMobile, hlsUrl, embedUrl]);

  const mode: PlayMode =
    forcedMode === "embed" && embedUrl
      ? "embed"
      : forcedMode === "hls" && hlsUrl
      ? "hls"
      : defaultMode;

  const canSwitchSource = Boolean(embedUrl && hlsUrl);

  // Reset source choice whenever the episode changes
  useEffect(() => {
    setForcedMode(null);
    setPlayError(null);
  }, [embedUrl, hlsUrl]);

  // Handle Lights Off & escape key
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

  const fallbackFromHls = useCallback(
    (reason: string) => {
      if (embedUrl) {
        setForcedMode("embed");
        setPlayError(null);
      } else {
        setPlayError(reason);
      }
    },
    [embedUrl]
  );

  // Setup HLS playback (native on Safari/iOS, hls.js elsewhere)
  useEffect(() => {
    if (mode !== "hls" || !hlsUrl) return;
    const video = videoRef.current;
    if (!video) return;

    setPlayError(null);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const canPlayNative = Boolean(video.canPlayType("application/vnd.apple.mpegurl"));
    const handleNativeError = () => fallbackFromHls("Không phát được nguồn video này.");

    // Native HLS first on Apple devices. hls.js on iOS 17+ uses ManagedMediaSource which
    // stays black unless AirPlay is disabled — native playback avoids that entirely.
    if (canPlayNative && (isAppleMobile || !Hls.isSupported())) {
      video.src = hlsUrl;
      video.load();
      video.addEventListener("error", handleNativeError);
      return () => {
        video.removeEventListener("error", handleNativeError);
        video.removeAttribute("src");
        video.load();
      };
    }

    if (Hls.isSupported()) {
      video.disableRemotePlayback = true;
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 60,
      });
      hlsRef.current = hls;

      let networkRetries = 0;
      let mediaRetries = 0;

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && networkRetries < 2) {
          networkRetries += 1;
          hls.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRetries < 2) {
          mediaRetries += 1;
          hls.recoverMediaError();
          return;
        }
        hls.destroy();
        hlsRef.current = null;
        fallbackFromHls("Nguồn video bị lỗi hoặc không phản hồi.");
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
        if (hlsRef.current === hls) hlsRef.current = null;
      };
    }

    if (canPlayNative) {
      video.src = hlsUrl;
      video.load();
      video.addEventListener("error", handleNativeError);
      return () => video.removeEventListener("error", handleNativeError);
    }

    fallbackFromHls("Trình duyệt không hỗ trợ phát video HLS.");
  }, [mode, hlsUrl, reloadKey, isAppleMobile, fallbackFromHls]);

  // Save watch progress (HLS / direct video) — re-bound whenever the <video> element changes
  useEffect(() => {
    if (mode !== "hls") return;
    const video = videoRef.current;
    if (!video) return;

    const handleProgressUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      if (!(currentTime > 0) || !(duration > 0) || !isFinite(duration)) return;

      try {
        localStorage.setItem(
          `watch_progress_${movieSlug}_${episodeSlug}`,
          JSON.stringify({ movieSlug, episodeSlug, currentTime, duration, timestamp: Date.now() })
        );
      } catch {
        // Private mode / quota exceeded on iOS -> ignore
      }

      onTimeUpdateRef.current?.(currentTime, duration);
    };

    video.addEventListener("timeupdate", handleProgressUpdate);
    return () => video.removeEventListener("timeupdate", handleProgressUpdate);
  }, [movieSlug, episodeSlug, mode, hlsUrl, reloadKey]);

  // Resume playback position (HLS). iOS ignores currentTime before metadata is loaded.
  useEffect(() => {
    if (mode !== "hls" || !resumeTime) return;
    const video = videoRef.current;
    if (!video) return;

    const applySeek = () => {
      try {
        if (video.duration && resumeTime < video.duration) {
          video.currentTime = resumeTime;
        }
      } catch {}
    };

    if (video.readyState >= 1) {
      applySeek();
      return;
    }

    video.addEventListener("loadedmetadata", applySeek, { once: true });
    return () => video.removeEventListener("loadedmetadata", applySeek);
  }, [resumeTime, mode, hlsUrl, reloadKey]);

  const handleReload = () => {
    setPlayError(null);
    setReloadKey((prev) => prev + 1);
  };

  const handleSwitchSource = () => {
    setPlayError(null);
    setForcedMode(mode === "embed" ? "hls" : "embed");
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
          className="fixed inset-0 bg-black/92 z-40 transition-opacity duration-500 cursor-pointer"
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

        {/* Video Frame — translateZ(0) gives iOS Safari its own compositing layer so
            rounded + overflow-hidden containers don't render the video as a black box */}
        <div
          className="relative w-full aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group/player isolate"
          style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)" }}
        >
          {mode === "embed" ? (
            <iframe
              key={`embed-${embedUrl}-${reloadKey}`}
              src={embedUrl}
              className="absolute inset-0 w-full h-full border-0 bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              referrerPolicy="origin"
              title={episodeName || "Trình phát phim HyFlim"}
            />
          ) : (
            <video
              key={`video-${hlsUrl}-${reloadKey}`}
              ref={videoRef}
              controls
              width={width}
              height={height}
              className="absolute inset-0 w-full h-full object-contain bg-black"
              playsInline
              preload="metadata"
              controlsList="nodownload"
              aria-label="Trình phát video"
              {...{ "webkit-playsinline": "true", "x-webkit-airplay": "allow" }}
            />
          )}

          {playError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85 px-6 text-center text-white">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              <p className="text-sm sm:text-base font-semibold">{playError}</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleReload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold"
                >
                  <RotateCcw className="w-4 h-4" /> Thử lại
                </button>
                {canSwitchSource && (
                  <button
                    type="button"
                    onClick={handleSwitchSource}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 text-white text-xs font-semibold"
                  >
                    <Repeat className="w-4 h-4" /> Đổi nguồn phát
                  </button>
                )}
              </div>
            </div>
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

            <div className="flex items-center gap-1 sm:hidden">
              {canSwitchSource && (
                <button
                  type="button"
                  onClick={handleSwitchSource}
                  className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 text-[11px] font-medium"
                  title="Đổi nguồn phát nếu màn hình bị đen"
                  aria-label="Đổi nguồn phát"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  {mode === "embed" ? "Nguồn 2" : "Nguồn 1"}
                </button>
              )}
              {/* Mobile reload button */}
              <button
                type="button"
                onClick={handleReload}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
                title="Tải lại trình phát khi bị giật lag"
                aria-label="Tải lại trình phát"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
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
              {/* Source switch (desktop) */}
              {canSwitchSource && (
                <button
                  type="button"
                  onClick={handleSwitchSource}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors text-xs font-medium"
                  title="Đổi nguồn phát nếu màn hình bị đen"
                >
                  <Repeat className="w-4 h-4" />
                  {mode === "embed" ? "Nguồn 2" : "Nguồn 1"}
                </button>
              )}

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
