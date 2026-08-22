import { useEffect, useRef } from "react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4";

const FADE_SECONDS = 0.5;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function applyFade(video: HTMLVideoElement) {
  if (!video.duration || video.ended) return;
  const t = video.currentTime;
  const remaining = video.duration - t;
  let opacity = 0.85;
  if (t < FADE_SECONDS) opacity = (t / FADE_SECONDS) * 0.85;
  else if (remaining < FADE_SECONDS) opacity = Math.max((remaining / FADE_SECONDS) * 0.85, 0);
  video.style.opacity = opacity.toFixed(3);
}

function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipVideo = prefersReducedMotion();

  useEffect(() => {
    if (skipVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      void video.play().catch(() => {});
    };

    const handleEnded = () => {
      video.currentTime = 0;
      void video.play().catch(() => {});
    };

    const onTime = () => applyFade(video);

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", handleEnded);

    // Bắt đầu play ngay
    void video.play().catch(() => {});

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", handleEnded);
    };
  }, [skipVideo]);

  if (skipVideo) return null;

  return (
    <video
      ref={videoRef}
      src={VIDEO_URL}
      muted
      playsInline
      autoPlay
      loop
      preload="auto"
      className="fixed inset-0 h-full w-full object-cover pointer-events-none transition-opacity duration-700"
      style={{
        opacity: 0,
        zIndex: -1,
        willChange: "opacity",
      }}
      aria-hidden
    />
  );
}

export default BackgroundVideo;
