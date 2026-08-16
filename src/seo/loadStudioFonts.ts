let loaded = false;

/** Fonts for login + portal (not needed on the public marketing pages). */
export function loadStudioFonts() {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap";
  document.head.appendChild(link);
}
