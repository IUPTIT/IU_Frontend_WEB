import { useEffect, useRef } from "react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4";

const FADE_SECONDS = 0.5;
const REPLAY_DELAY_MS = 100;

function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let rafId = 0;
    let replayTimer = 0;

    const tick = () => {
      if (video.duration && !video.ended) {
        const t = video.currentTime;
        const remaining = video.duration - t;
        let opacity = 1;
        if (t < FADE_SECONDS) opacity = t / FADE_SECONDS;
        else if (remaining < FADE_SECONDS) opacity = Math.max(remaining / FADE_SECONDS, 0);
        video.style.opacity = opacity.toFixed(3);
      }
      rafId = requestAnimationFrame(tick);
    };

    const handleEnded = () => {
      video.style.opacity = "0";
      replayTimer = window.setTimeout(() => {
        video.currentTime = 0;
        void video.play().catch(() => {});
      }, REPLAY_DELAY_MS);
    };

    video.addEventListener("ended", handleEnded);
    rafId = requestAnimationFrame(tick);
    void video.play().catch(() => {});

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(replayTimer);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={VIDEO_URL}
      muted
      playsInline
      autoPlay
      className="absolute inset-0 h-full w-full object-cover"
      style={{ opacity: 0 }}
      aria-hidden
    />
  );
}

export default BackgroundVideo;
