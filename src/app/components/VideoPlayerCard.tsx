"use client";
import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface VideoPlayerCardProps {
  src: string;
  width?: string;
  height?: string;
  movieSlug: string;
  episodeSlug: string;
  onTimeUpdate?: (currentTime: number) => void;
  resumeTime?: number;
}

function VideoPlayerCard({
  src,
  width = "100%",
  height = "auto",
  movieSlug,
  episodeSlug,
  onTimeUpdate,
  resumeTime,
}: VideoPlayerCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Save watch progress to localStorage
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;

      // Only save if video is playing and has valid duration
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

        // Call parent callback if provided
        if (onTimeUpdate) {
          onTimeUpdate(currentTime);
        }
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [movieSlug, episodeSlug, onTimeUpdate]);

  // Resume from saved time if provided
  useEffect(() => {
    const video = videoRef.current;
    if (!video || resumeTime === undefined || resumeTime === 0) return;

    const setVideoTime = () => {
      // Check if video is ready
      if (video.readyState >= 2) {
        // HAVE_CURRENT_DATA or greater
        video.currentTime = resumeTime;
      } else {
        // Wait for metadata to load
        const handleCanPlay = () => {
          video.currentTime = resumeTime;
          video.removeEventListener("canplay", handleCanPlay);
        };
        video.addEventListener("canplay", handleCanPlay);
      }
    };

    // Set time immediately or wait for video to be ready
    setVideoTime();

    return () => {
      video.removeEventListener("canplay", setVideoTime);
    };
  }, [resumeTime]);

  useEffect(() => {
    if (!src) return;
    const video = videoRef.current;
    if (!video) return;

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((err) => console.log("Autoplay prevented:", err));
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch((err) => console.log("Autoplay prevented:", err));
      });
    }
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleFullscreenChange = async () => {
      try {
        // Check if entering fullscreen
        const isFullscreen = !!(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement
        );

        if (isFullscreen) {
          // Entering fullscreen - rotate to landscape
          if (window.screen.orientation?.lock) {
            try {
              await window.screen.orientation.lock("landscape");
            } catch (err) {
              console.log("Orientation lock not supported:", err);
            }
          }
        } else {
          // Exiting fullscreen - unlock orientation
          if (window.screen.orientation?.unlock) {
            window.screen.orientation.unlock();
          }
        }
      } catch (error) {
        console.log("Orientation change error:", error);
      }
    };

    // Add event listeners for different browsers
    video.addEventListener("fullscreenchange", handleFullscreenChange);
    video.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    video.addEventListener("mozfullscreenchange", handleFullscreenChange);
    video.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      video.removeEventListener("fullscreenchange", handleFullscreenChange);
      video.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      video.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      video.removeEventListener("MSFullscreenChange", handleFullscreenChange);

      // Unlock orientation when component unmounts
      if (window.screen.orientation?.unlock) {
        try {
          window.screen.orientation.unlock();
        } catch (err) {
          console.log("Failed to unlock orientation:", err);
        }
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      controls
      width={width}
      height={height}
      style={{ borderRadius: "12px", backgroundColor: "#000" }}
      playsInline
    />
  );
}

export default VideoPlayerCard;
