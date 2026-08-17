import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { useInView } from "../../shared/useInView";

export function LpSection({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  const { ref, on } = useInView<HTMLElement>(0.16);
  return (
    <section
      ref={ref}
      id={id}
      className={`lp-section lp-reveal ${on ? "is-in" : ""} ${className}`}
    >
      <div className="lp-container relative z-[1]">{children}</div>
    </section>
  );
}

export function LpIcon({
  icon: Icon,
  className = "",
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <span className={`lp-ico ${className}`} aria-hidden>
      <Icon strokeWidth={1.75} />
    </span>
  );
}

export function LpButton({
  children,
  variant = "primary",
  to,
  href,
  className = "",
}: {
  children: ReactNode;
  variant?: "primary" | "ghost";
  to?: string;
  href?: string;
  className?: string;
}) {
  const cls = `lp-btn ${variant === "primary" ? "lp-btn-primary" : "lp-btn-ghost"} ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return (
    <a href={href || "#"} className={cls}>
      {children}
    </a>
  );
}

export function LandingImage({
  src,
  alt,
  className = "",
  fallbackSrc,
  hideOnError = false,
  filename = "",
  priority = false,
  width,
  height,
}: {
  src?: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  hideOnError?: boolean;
  filename?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}) {
  const [current, setCurrent] = useState(src ?? fallbackSrc ?? "");
  const [failed, setFailed] = useState(!src && !fallbackSrc);
  const [usedFallback, setUsedFallback] = useState(!src && Boolean(fallbackSrc));

  if (failed || !current) {
    if (hideOnError) return null;
    return (
      <div className={`lp-img-ph ${className}`} role="img" aria-label={alt || undefined} aria-hidden={!alt || undefined}>
        {filename || "src/assets"}
      </div>
    );
  }

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "low"}
      onError={() => {
        if (fallbackSrc && !usedFallback) {
          setUsedFallback(true);
          setCurrent(fallbackSrc);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
