import { useEffect, useRef, useState } from "react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4";

const FADE_SECONDS = 0.5;
const REPLAY_DELAY_MS = 100;
const START_AFTER_MS = 1100;

function applyFade(video: HTMLVideoElement) {
  if (!video.duration || video.ended) return;
  const t = video.currentTime;
  const remaining = video.duration - t;
  let opacity = 1;
  if (t < FADE_SECONDS) opacity = t / FADE_SECONDS;
  else if (remaining < FADE_SECONDS) opacity = Math.max(remaining / FADE_SECONDS, 0);
  video.style.opacity = opacity.toFixed(3);
}

function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setActive(true), START_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active) return;

    let replayTimer = 0;

    const handleEnded = () => {
      video.style.opacity = "0";
      replayTimer = window.setTimeout(() => {
        video.currentTime = 0;
        void video.play().catch(() => {});
      }, REPLAY_DELAY_MS);
    };

    const onTime = () => applyFade(video);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", handleEnded);
    void video.play().catch(() => {});

    return () => {
      window.clearTimeout(replayTimer);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", handleEnded);
    };
  }, [active]);

  if (!active) return null;

  return (
    <video
      ref={videoRef}
      src={VIDEO_URL}
      muted
      playsInline
      autoPlay
      preload="none"
      className="fixed inset-0 h-full w-full object-cover"
      style={{ opacity: 0 }}
      aria-hidden
    />
  );
}

export default BackgroundVideo;
