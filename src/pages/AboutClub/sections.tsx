import {
  BookOpen,
  Compass,
  Flag,
  Megaphone,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { LANDING_IMAGES } from "../Landing/images";
import { LandingImage, LpButton, LpSection } from "../Landing/components/ui";
import { PublicPageHero } from "../shared/PublicPageHero";
import {
  ABOUT_BOARD,
  ABOUT_CONTINUITY,
  ABOUT_FOUNDERS,
  ABOUT_GENERATIONS,
  ABOUT_HERO,
  ABOUT_NEXT,
  ABOUT_ORIGIN,
  ABOUT_PEOPLE,
  ABOUT_STRUCTURE,
} from "./content";

function SecHead({ eyebrow, headline }: { eyebrow: string; headline: string }) {
  return (
    <header className="lp-sec-head">
      <p className="lp-eyebrow">{eyebrow}</p>
      <h2 className="lp-h2">{headline}</h2>
    </header>
  );
}

const HERO_SLIDES = LANDING_IMAGES.aboutHero.map((shot) => shot.src).filter(Boolean) as string[];

export function AboutHero() {
  return (
    <PublicPageHero
      id="about-hero"
      eyebrow={ABOUT_HERO.eyebrow}
      headline={ABOUT_HERO.headline}
      tagline={ABOUT_HERO.tagline}
      lead={ABOUT_HERO.paragraphs[0]}
      cta={ABOUT_HERO.cta}
      ctaHref="#khoi-dau"
      images={HERO_SLIDES}
    />
  );
}

const ORIGIN_STEPS = [
  {
    n: "01",
    title: ABOUT_ORIGIN.date,
    label: "Thành lập",
    note: ABOUT_ORIGIN.lead,
    Icon: Flag,
  },
  {
    n: "02",
    title: "Tập thể nhỏ",
    label: "Gặp gỡ & làm việc",
    note: "Một môi trường để sinh viên gặp gỡ, làm việc cùng nhau ngoài giảng đường.",
    Icon: Users,
  },
  {
    n: "03",
    title: "Sẵn sàng bắt đầu",
    label: "Những người đầu tiên",
    note: "Không có một cộng đồng lớn ngay từ ngày đầu. Chỉ có những người sẵn sàng bắt đầu.",
    Icon: Sparkles,
  },
  {
    n: "04",
    title: "Văn hóa riêng",
    label: "Tinh thần IU CLUB",
    note: "Từ những cuộc gặp gỡ đầu tiên, IU CLUB hình thành cách vận hành và tinh thần riêng.",
    Icon: Compass,
  },
] as const;

export function OriginSection() {
  const shot = LANDING_IMAGES.aboutHero[1]?.src ?? LANDING_IMAGES.about1;

  return (
    <LpSection id="khoi-dau">
      <SecHead eyebrow={ABOUT_ORIGIN.eyebrow} headline={ABOUT_ORIGIN.headline} />
      <p className="lp-sec-intro lp-lead">{ABOUT_ORIGIN.close}</p>
      <div className="ab-split">
        <figure className="ab-split-media">
          {shot ? (
            <img
              src={shot}
              alt="Những ngày đầu của IU CLUB"
              width={1200}
              height={800}
              loading="lazy"
              decoding="async"
            />
          ) : null}
        </figure>
        <ol className="ab-spine">
          {ORIGIN_STEPS.map((step) => (
            <li key={step.n} className="ab-spine-item">
              <span className="ab-spine-dot" aria-hidden />
              <article className="lp-card lp-card-static ab-spine-card">
                <span className="lp-ico" aria-hidden>
                  <step.Icon className="lp-icon-neon" />
                </span>
                <div>
                  <p className="ab-step-n">{step.n}</p>
                  <h3 className="lp-h3">{step.title}</h3>
                  <p className="ab-role">{step.label}</p>
                  <p className="lp-body">{step.note}</p>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </LpSection>
  );
}

export function FoundersSection() {
  const photos = LANDING_IMAGES.founders;

  return (
    <LpSection id="nen-mong">
      <SecHead eyebrow={ABOUT_FOUNDERS.eyebrow} headline={ABOUT_FOUNDERS.headline} />
      <p className="lp-sec-intro lp-lead">{ABOUT_FOUNDERS.intro[0]}</p>
      <ol className="ab-found-path">
        {ABOUT_FOUNDERS.people.map((person, index) => {
          const side = index % 2 === 0 ? "is-left" : "is-right";
          return (
            <li key={person.name} className={`ab-found-node ${side}`}>
              <span className="ab-found-dot" aria-hidden />
              <div className="ab-found-shot">
                <LandingImage
                  src={photos[person.photoKey]}
                  filename={person.file}
                  alt={person.name}
                  className="ab-found-img"
                />
                <span className="ab-found-num">0{index + 1}</span>
              </div>
              <article className="lp-card lp-card-static ab-found-card">
                <p className="ab-found-mark">{ABOUT_FOUNDERS.marks[index]}</p>
                <h3 className="lp-h3">{person.name}</h3>
                <p className="ab-role">{person.role}</p>
                <p className="ab-term">{person.term}</p>
                <p className="lp-body">{person.bio}</p>
              </article>
            </li>
          );
        })}
      </ol>
    </LpSection>
  );
}

export function ContinuitySection() {
  return (
    <LpSection id="tiep-noi">
      <SecHead eyebrow={ABOUT_CONTINUITY.eyebrow} headline={ABOUT_CONTINUITY.headline} />
      <p className="lp-sec-intro lp-lead">Mỗi thế hệ là một chương mới trong cùng một câu chuyện.</p>
      <ol className="ab-rail">
        {ABOUT_CONTINUITY.years.map((item) => (
          <li key={item.year} className="ab-rail-item">
            <p className="ab-rail-year">{item.year}</p>
            <span className="ab-rail-dot" aria-hidden />
            <h3 className="lp-h3">{item.title}</h3>
            <p className="lp-body">{item.body}</p>
          </li>
        ))}
      </ol>
    </LpSection>
  );
}

export function BoardSection() {
  return (
    <LpSection id="ban-dieu-hanh">
      <SecHead eyebrow={ABOUT_BOARD.eyebrow} headline={ABOUT_BOARD.headline} />
      <p className="lp-sec-intro lp-lead">{ABOUT_BOARD.intro}</p>
      <div className="ab-board">
        {ABOUT_BOARD.people.map((person) => (
          <article key={person.name} className="ab-portrait">
            {"photoKey" in person && person.photoKey ? (
              <LandingImage
                src={LANDING_IMAGES.founders[person.photoKey]}
                filename={person.file}
                alt={person.name}
                className="ab-portrait-img"
              />
            ) : (
              <div className="ab-ph" aria-hidden>
                {person.name
                  .split(" ")
                  .slice(-2)
                  .map((part) => part[0])
                  .join("")}
              </div>
            )}
            <h3 className="lp-h3">{person.name}</h3>
            <p className="ab-role">{person.title}</p>
            {"subtitle" in person && person.subtitle ? <p className="ab-term">{person.subtitle}</p> : null}
            <p className="lp-body">{person.body}</p>
          </article>
        ))}
      </div>
    </LpSection>
  );
}

const UNIT_ICONS: LucideIcon[] = [Compass, BookOpen, Megaphone];

function OrgCard({
  unit,
  Icon,
}: {
  unit: (typeof ABOUT_STRUCTURE.units)[number];
  Icon: LucideIcon;
}) {
  return (
    <article className="lp-card lp-card-static ab-org-card">
      <p className="ab-org-watermark" aria-hidden>
        {unit.num}
      </p>
      <div className="ab-org-top">
        <span className="lp-ico" aria-hidden>
          <Icon className="lp-icon-neon" />
        </span>
        <p className="ab-unit-num">{unit.num}</p>
      </div>
      <h3 className="lp-h3">{unit.name}</h3>
      <p className="ab-unit-title">{unit.title}</p>
      <p className="lp-body">{unit.body}</p>
      <div className="ab-org-tiles">
        {unit.items.slice(0, 4).map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </article>
  );
}

export function StructureSection() {
  const [lead, ...rest] = ABOUT_STRUCTURE.units;

  return (
    <LpSection id="van-hanh">
      <SecHead eyebrow={ABOUT_STRUCTURE.eyebrow} headline={ABOUT_STRUCTURE.headline} />
      <p className="lp-sec-intro lp-lead">{ABOUT_STRUCTURE.intro}</p>
      <div className="ab-hub">
        {lead ? <OrgCard unit={lead} Icon={Compass} /> : null}
        <div className="ab-hub-fork" aria-hidden>
          <span className="ab-hub-stem" />
          <span className="ab-hub-arms" />
        </div>
        <div className="ab-hub-row">
          {rest.map((unit, index) => {
            const Icon = UNIT_ICONS[index + 1];
            return Icon ? <OrgCard key={unit.num} unit={unit} Icon={Icon} /> : null;
          })}
        </div>
      </div>
    </LpSection>
  );
}

export function GenerationsSection() {
  return (
    <LpSection id="the-he">
      <SecHead eyebrow={ABOUT_GENERATIONS.eyebrow} headline={ABOUT_GENERATIONS.headline} />
      <p className="lp-sec-intro lp-lead">Người đi trước để lại kinh nghiệm. Người đến sau tiếp nhận và phát triển.</p>
      <ol className="ab-stairs">
        {ABOUT_GENERATIONS.gens.map((gen, index) => (
          <li
            key={gen.label}
            className={`ab-stair ${index === ABOUT_GENERATIONS.gens.length - 1 ? "is-open" : ""}`}
            style={{ ["--stair-n" as string]: String(index) }}
          >
            <p className="ab-stair-gen">{gen.label}</p>
            <article className="lp-card lp-card-static ab-stair-card">
              <h3 className="lp-h3">{gen.title}</h3>
              <p className="lp-body">{gen.body}</p>
            </article>
          </li>
        ))}
      </ol>
    </LpSection>
  );
}

function VoiceCard({ story, hidden }: { story: (typeof ABOUT_PEOPLE.stories)[number]; hidden?: boolean }) {
  const initials = story.name
    .split(" ")
    .slice(-2)
    .map((part) => part[0])
    .join("");
  const photo =
    "photoKey" in story && story.photoKey ? LANDING_IMAGES.founders[story.photoKey] : undefined;

  return (
    <article className="lp-card lp-card-static ab-voice-card" aria-hidden={hidden || undefined} {...(hidden ? { inert: true } : {})}>
      <p className="ab-voice-mark" aria-hidden>
        “
      </p>
      <blockquote>{story.quote}</blockquote>
      <footer className="ab-voice-who">
        {photo ? (
          <LandingImage
            src={photo}
            filename={"file" in story ? story.file : undefined}
            alt={story.name}
            className="ab-voice-avatar"
          />
        ) : (
          <span className="ab-ph ab-voice-avatar" aria-hidden>
            {initials}
          </span>
        )}
        <span>
          <strong className="lp-h3">{story.name}</strong>
          <em className="ab-role">{story.role}</em>
        </span>
      </footer>
    </article>
  );
}

export function PeopleSection() {
  return (
    <LpSection id="thanh-vien">
      <SecHead eyebrow={ABOUT_PEOPLE.eyebrow} headline={ABOUT_PEOPLE.headline} />
      <p className="lp-sec-intro lp-lead">Mỗi người đóng góp theo một cách khác nhau — và những điều nhỏ ấy tạo nên cộng đồng.</p>
      <div className="ab-voice-rail">
        <div className="ab-voice-track">
          {ABOUT_PEOPLE.stories.map((story) => (
            <VoiceCard key={story.name} story={story} />
          ))}
          {ABOUT_PEOPLE.stories.map((story) => (
            <VoiceCard key={`loop-${story.name}`} story={story} hidden />
          ))}
        </div>
      </div>
    </LpSection>
  );
}

export function NextSection() {
  const shot = LANDING_IMAGES.about1 ?? LANDING_IMAGES.activities[4]?.src;
  const faces = [
    { src: LANDING_IMAGES.founders.dinh, file: "TranDucDinh.png" },
    { src: LANDING_IMAGES.founders.minh, file: "DoVanMinh.png" },
    { src: LANDING_IMAGES.founders.phong, file: "NguyenKhaPhong.png" },
    { src: LANDING_IMAGES.founders.linh, file: "NguyenPhuongLinh.png" },
  ];

  return (
    <LpSection id="tiep-theo" className="ab-finale">
      <div className="ab-join">
        <figure className="ab-join-media">
          {shot ? (
            <img
              src={shot}
              alt="Cộng đồng IU CLUB"
              width={1200}
              height={800}
              loading="lazy"
              decoding="async"
            />
          ) : null}
        </figure>
        <div className="ab-join-copy">
          <p className="lp-eyebrow">{ABOUT_NEXT.eyebrow}</p>
          <h2 className="lp-h2">{ABOUT_NEXT.headline}</h2>
          <p className="ab-finale-line">{ABOUT_NEXT.closer}</p>
          <ul className="ab-join-points">
            {ABOUT_NEXT.paragraphs.slice(0, 4).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="ab-join-cta">
            <LpButton to="/tuyen-thanh-vien">{ABOUT_NEXT.ctaJoin}</LpButton>
            <LpButton variant="ghost" to="/dao-tao">
              {ABOUT_NEXT.ctaExplore}
            </LpButton>
          </div>
          <div className="ab-join-faces">
            <div>
              {faces.map((face) => (
                <LandingImage key={face.file} src={face.src} filename={face.file} alt="" />
              ))}
            </div>
            <p>Mọi hành trình đều cần một bước đầu tiên.</p>
          </div>
        </div>
      </div>
    </LpSection>
  );
}
