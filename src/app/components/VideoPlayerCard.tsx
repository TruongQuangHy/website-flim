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

/**
 * Extracts a direct .m3u8 master playlist from known embed player URLs (vsmov, phimapi, etc.)
 * This allows playing directly via native HTML5 / Hls.js instead of an iframe.
 */
export function extractDirectHlsUrl(url?: string): string {
  if (!url) return "";
  const clean = (url || "").trim();

  // Already a direct .m3u8
  if (/\.m3u8(\?|#|$)/i.test(clean)) return clean;

  // Streamvsmov embed: https://v*.streamvsmov.com/video/UUID -> https://v*.streamvsmov.com/stream/UUID/master.m3u8
  const vsmovMatch = clean.match(/^(https?:\/\/[^\/]+)\/video\/([0-9a-f-]{36})/i);
  if (vsmovMatch) {
    return `${vsmovMatch[1]}/stream/${vsmovMatch[2]}/master.m3u8`;
  }

  // Phimapi player embed: https://player.phimapi.com/player/?url=M3U8_URL
  const phimapiMatch = clean.match(/[?&]url=([^&#]+)/i);
  if (phimapiMatch) {
    const decoded = decodeURIComponent(phimapiMatch[1]);
    if (/\.m3u8/i.test(decoded)) return decoded;
  }

  return "";
}

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

  const [isAppleMobile, setIsAppleMobile] = useState(false);
  useEffect(() => {
    setIsAppleMobile(detectAppleMobile());
  }, []);

  // Track whether resumeTime has been successfully applied to the video
  const hasSoughtRef = useRef(false);

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
    // 1. Direct m3u8Src prop
    if (m3u8Src && isM3u8Url(m3u8Src)) return normalizeUrl(m3u8Src);
    // 2. Direct src prop if it's m3u8
    if (src && isM3u8Url(src)) return normalizeUrl(src);
    // 3. Extract stream from embed URLs (vsmov, phimapi)
    const fromSrc = extractDirectHlsUrl(src);
    if (fromSrc) return normalizeUrl(fromSrc);
    const fromEmbed = extractDirectHlsUrl(embedSrc);
    if (fromEmbed) return normalizeUrl(fromEmbed);
    return "";
  }, [m3u8Src, src, embedSrc]);

  // If HLS is available, ALWAYS prefer it across all devices (native on iOS Safari, hls.js on Android/Desktop).
  // HLS allows exact seek/resume, live progress tracking, full cinema controls,
  // and eliminates 3rd-party ads and iframe restrictions.
  const defaultMode: PlayMode = useMemo(() => {
    if (hlsUrl) return "hls";
    if (embedUrl) return "embed";
    return "hls";
  }, [hlsUrl, embedUrl]);

  const mode: PlayMode =
    forcedMode === "embed" && embedUrl
      ? "embed"
      : forcedMode === "hls" && hlsUrl
      ? "hls"
      : defaultMode;

  const canSwitchSource = Boolean(embedUrl && hlsUrl);

  // If playing in embed mode and resumeTime is available, append start params
  const embedUrlWithResume = useMemo(() => {
    if (!embedUrl) return "";
    if (!resumeTime || resumeTime <= 10) return embedUrl;
    const cleanUrl = embedUrl.split("#")[0];
    const hash = embedUrl.includes("#") ? `#${embedUrl.split("#")[1]}` : "";
    const sep = cleanUrl.includes("?") ? "&" : "?";
    const startSec = Math.floor(resumeTime);
    return `${cleanUrl}${sep}start=${startSec}&t=${startSec}${hash}`;
  }, [embedUrl, resumeTime]);

  // Reset seek state and source choice whenever the episode changes
  useEffect(() => {
    hasSoughtRef.current = false;
    setForcedMode(null);
    setPlayError(null);
  }, [embedUrl, hlsUrl, movieSlug, episodeSlug]);

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

      // Shield: If we are supposed to resume at e.g. 400s+, and the video is still at < 15s
      // and seek hasn't confirmed yet, DO NOT report this initial startup period as user progress!
      if (resumeTime && resumeTime > 20 && !hasSoughtRef.current && currentTime < 15) {
        return;
      }

      // If video has reached near resumeTime or beyond, mark seek as confirmed
      if (resumeTime && (currentTime >= resumeTime - 5 || Math.abs(currentTime - resumeTime) < 5)) {
        hasSoughtRef.current = true;
      }

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
  }, [movieSlug, episodeSlug, mode, hlsUrl, reloadKey, resumeTime]);

  // Robust resume playback position across all browsers and devices (iOS Safari, Android, Desktop)
  useEffect(() => {
    if (mode !== "hls" || !resumeTime || resumeTime <= 3) return;
    const video = videoRef.current;
    if (!video) return;

    const performSeek = () => {
      if (hasSoughtRef.current) return;
      try {
        const dur = video.duration;
        // Apply seek if duration is not yet known or resumeTime is within range
        if (!dur || isNaN(dur) || !isFinite(dur) || resumeTime < dur) {
          video.currentTime = resumeTime;
          if (Math.abs(video.currentTime - resumeTime) < 5) {
            hasSoughtRef.current = true;
          }
        }
      } catch (err) {
        console.warn("Seek error:", err);
      }
    };

    // 1. Immediate seek if ready
    if (video.readyState >= 1) {
      performSeek();
    }

    // 2. Lifecycle hooks
    const onMeta = () => performSeek();
    const onData = () => performSeek();
    const onCanPlay = () => performSeek();
    // 3. Crucial for iOS: user gesture triggers play, ensure seek applies
    const onPlay = () => {
      if (!hasSoughtRef.current && video.currentTime < 5) {
        performSeek();
      }
    };
    // 4. First timeupdate fallback
    const onFirstTimeUpdate = () => {
      if (!hasSoughtRef.current && video.currentTime < 3) {
        performSeek();
      }
    };

    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("loadeddata", onData);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("play", onPlay);
    video.addEventListener("timeupdate", onFirstTimeUpdate);

    // Also attach to HLS instance if active
    const hls = hlsRef.current;
    if (hls) {
      hls.on(Hls.Events.MANIFEST_PARSED, performSeek);
      hls.on(Hls.Events.LEVEL_LOADED, performSeek);
    }

    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("loadeddata", onData);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("timeupdate", onFirstTimeUpdate);
      if (hls) {
        hls.off(Hls.Events.MANIFEST_PARSED, performSeek);
        hls.off(Hls.Events.LEVEL_LOADED, performSeek);
      }
    };
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
              key={`embed-${embedUrlWithResume}-${reloadKey}`}
              src={embedUrlWithResume}
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
