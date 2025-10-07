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

  return (
    <video
      ref={videoRef}
      controls
      width={width}
      height={height}
      style={{ borderRadius: "12px", backgroundColor: "#000" }}
    />
  );
}

export default VideoPlayerCard;
