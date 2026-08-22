import { CalendarDays } from "lucide-react";
import { NEWS } from "../content";
import { LANDING_IMAGES } from "../images";
import { LandingImage, LpButton, LpSection } from "./ui";

const PHOTOS = [...LANDING_IMAGES.activities, ...LANDING_IMAGES.achievements];

function NewsCard({
  post,
  hidden,
}: {
  post: (typeof NEWS.posts)[number];
  hidden?: boolean;
}) {
  const photo = PHOTOS.find((item) => item.file === post.file);

  return (
    <article className="lp-news-card" aria-hidden={hidden || undefined} {...(hidden ? { inert: true } : {})}>
      <LandingImage
        src={photo?.src}
        filename={post.file}
        alt={hidden ? "" : post.title}
        className="lp-news-thumb"
      />
      <div className="lp-news-meta">
        <p className="lp-news-date">
          <CalendarDays size={14} strokeWidth={2.2} aria-hidden />
          {post.date}
        </p>
        <h3 className="lp-h3">{post.title}</h3>
        <a className="lp-news-more" href="/su-kien" tabIndex={hidden ? -1 : undefined}>
          {NEWS.readMore}
          <span aria-hidden> →</span>
        </a>
      </div>
    </article>
  );
}

function NewsSection() {
  return (
    <LpSection id="news">
      <header className="lp-sec-head">
        <p className="lp-eyebrow">{NEWS.eyebrow}</p>
        <h2 className="lp-h2">{NEWS.headline}</h2>
      </header>

      <div className="lp-news-rail mt-10">
        <div className="lp-news-track">
          {NEWS.posts.map((post) => (
            <NewsCard key={post.title} post={post} />
          ))}
          {NEWS.posts.map((post) => (
            <NewsCard key={`loop-${post.title}`} post={post} hidden />
          ))}
        </div>
      </div>

      <div className="lp-sec-cta">
        <LpButton to="/su-kien">{NEWS.cta}</LpButton>
      </div>
    </LpSection>
  );
}

export default NewsSection;
