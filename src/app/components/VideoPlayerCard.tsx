"use client";
import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface VideoPlayerCardProps {
  src: string;
  width?: string;
  height?: string;
}

function VideoPlayerCard({
  src,
  width = "100%",
  height = "auto",
}: VideoPlayerCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!src) return;
    const video = videoRef.current;

    // Check if video element exists
    if (!video) return;

    // Nếu trình duyệt hỗ trợ HLS.js
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((err) => console.log("Autoplay prevented:", err));
      });

      return () => {
        hls.destroy();
      };
    }
    // Nếu là Safari (hỗ trợ HLS native)
    else if (video.canPlayType("application/vnd.apple.mpegurl")) {
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
