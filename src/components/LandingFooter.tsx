import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { NAV_ITEMS } from "../pages/Landing/content";
import "../styles/landing-home.css";

const CONTACTS = [
  { icon: "phone", label: "098 981 14 24", href: "tel:0989811424" },
  { icon: "mail", label: "iuptitclub@gmail.com", href: "mailto:iuptitclub@gmail.com" },
  { icon: "globe", label: "https://iuptit.com", href: "https://iuptit.com" },
] as const;

const FANPAGE_URL = "https://www.facebook.com/profile.php?id=61564322655289";
const YOUTUBE_URL = "https://www.youtube.com/@IUCLUB-hh4sv";

type FooterLink = {
  label: string;
  href?: string;
  to?: string;
  anchor?: string;
};

const RECRUIT_LINKS: FooterLink[] = [
  { label: "Tuyển thành viên", to: "/tuyen-thanh-vien" },
  { label: "Tra cứu hồ sơ", to: "/tra-cuu" },
];

const SOCIAL_LINKS = [
  { name: "facebook", href: FANPAGE_URL, label: "Facebook" },
  { name: "youtube", href: YOUTUBE_URL, label: "YouTube" },
];

const icons: Record<string, ReactNode> = {
  phone: <path d="M4 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 5a2 2 0 0 1 2-2Z" />,
  mail: <path d="M3 5h16v12H3V5Zm0 1 8 6 8-6" />,
  globe: (
    <g>
      <circle cx="11" cy="11" r="8" />
      <path d="M3 11h16M11 3c2.5 2.5 2.5 13.5 0 16M11 3c-2.5 2.5-2.5 13.5 0 16" />
    </g>
  ),
  facebook: <path d="M13 9h3l-.5 3H13v8h-3v-8H8V9h2V7.5C10 5.5 11 4 13.5 4H16v3h-2c-.7 0-1 .3-1 1V9Z" />,
  youtube: (
    <g>
      <rect x="3" y="6" width="16" height="11" rx="3" />
      <path d="m10 9.5 4 2-4 2v-4Z" fill="currentColor" stroke="none" />
    </g>
  ),
};

function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      className={className ?? "h-4 w-4"}
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {icons[name]}
    </svg>
  );
}

function LandingFooter() {
  const navigate = useNavigate();

  const goTo = (link: FooterLink) => {
    if (!link.to) return;
    navigate(link.to);
    window.setTimeout(() => {
      if (link.anchor) document.getElementById(link.anchor)?.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <footer className="relative z-10 border-t border-white/10 bg-[hsl(var(--landing-background)/0.92)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 sm:py-14 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="" className="h-9 w-auto" width={36} height={36} decoding="async" aria-hidden />
            <p className="landing-display text-2xl font-bold text-purple-400">IU CLUB</p>
          </div>
          <p className="landing-display mt-4 text-sm tracking-[0.14em] text-white/70">SHINE AND THRIVE</p>
          <p className="mt-2 text-sm text-[hsl(var(--landing-foreground)/0.65)]">
            Cùng nhau tỏa sáng. Cùng nhau trưởng thành.
          </p>
        </div>

        <div>
          <h3 className="landing-headline text-sm font-semibold uppercase tracking-wide">Điều hướng</h3>
          <ul className="mt-5 space-y-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  to={"anchor" in item && item.anchor ? `${item.to}#${item.anchor}` : item.to}
                  onClick={(event) => {
                    event.preventDefault();
                    goTo(item);
                  }}
                  className="text-sm text-[hsl(var(--landing-foreground)/0.7)] transition-colors hover:text-purple-300"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="landing-headline text-sm font-semibold uppercase tracking-wide">Tuyển thành viên</h3>
          <ul className="mt-5 space-y-3">
            {RECRUIT_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to ?? "/"}
                  onClick={(event) => {
                    event.preventDefault();
                    goTo(link);
                  }}
                  className="text-sm text-[hsl(var(--landing-foreground)/0.7)] transition-colors hover:text-purple-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="landing-headline text-sm font-semibold uppercase tracking-wide">Mạng xã hội</h3>
          <ul className="mt-5 space-y-3">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.name}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[hsl(var(--landing-foreground)/0.7)] transition-colors hover:text-purple-300"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="landing-headline text-sm font-semibold uppercase tracking-wide">Liên hệ</h3>
          <ul className="mt-5 space-y-3">
            {CONTACTS.map((contact) => (
              <li key={contact.label}>
                <a
                  href={contact.href}
                  target={contact.icon === "globe" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-[hsl(var(--landing-foreground)/0.7)] transition-colors hover:text-[hsl(var(--landing-foreground))]"
                >
                  <Icon name={contact.icon} />
                  {contact.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center">
        <p className="text-sm text-[hsl(var(--landing-foreground)/0.7)]">©2026 | Bản quyền thuộc IU Club</p>
        <div className="mt-3 flex justify-center gap-4">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="flex h-11 w-11 items-center justify-center rounded-full text-[hsl(var(--landing-foreground)/0.78)] transition-all duration-300 hover:bg-white/10 hover:text-[hsl(var(--landing-foreground))]"
            >
              <Icon name={social.name} className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
