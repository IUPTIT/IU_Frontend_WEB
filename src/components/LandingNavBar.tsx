import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoMark from "../assets/logo-mark.webp";
import { NAV_ITEMS } from "../pages/Landing/content";
import "../styles/landing-home.css";

type NavItem = (typeof NAV_ITEMS)[number];

<<<<<<< HEAD
const NAV_ITEMS: NavItem[] = [
  {
    label: "Giới thiệu",
    to: "/",
    children: [
      { label: "Về IU Club", to: "/", anchor: "gioi-thieu" },
      { label: "Cố vấn", to: "/", anchor: "co-van" },
      { label: "Ban điều hành", to: "/", anchor: "ban-dieu-hanh" },
    ],
  },
  { label: "Tin tức", to: "/tin-tuc" },
  { label: "Tuyển thành viên", to: "/tuyen-thanh-vien" },
  { label: "Tra cứu hồ sơ", to: "/tra-cuu" },
  { label: "Sự kiện", to: "/su-kien" },
];
=======
function isNavActive(item: NavItem, pathname: string) {
  if (item.to !== "/" && pathname === item.to) return true;
  if (pathname === "/" && "anchor" in item && item.anchor === "hero") return true;
  return false;
}
>>>>>>> 75e632fc91b6e6020967105ffc0c842c74b0d58d

function itemHref(item: NavItem) {
  if ("anchor" in item && item.anchor) return `${item.to}#${item.anchor}`;
  return item.to;
}

function goTo(
  navigate: ReturnType<typeof useNavigate>,
  pathname: string,
  item: { to: string; anchor?: string },
) {
  const samePage = pathname === item.to || (item.to === "/" && pathname === "/");
  if (item.anchor) {
    const anchor = item.anchor;
    if (samePage && pathname === "/") {
      document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    navigate({ pathname: item.to, hash: anchor });
    window.setTimeout(() => {
      document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
    }, 120);
    return;
  }
  navigate(item.to);
  window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 80);
}

function LandingNavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const overlay =
    pathname === "/" ||
    pathname === "/ve-iu-club" ||
    pathname === "/dao-tao" ||
    pathname === "/su-kien";

  useEffect(() => {
    if (!overlay) {
      setScrolled(false);
      return;
    }

    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 1280px)").matches) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const onItem = (item: NavItem) => {
    goTo(navigate, pathname, item);
    setOpen(false);
  };

  return (
    <header
      className={`lp-header ${overlay ? "is-overlay" : ""} ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""}`}
    >
      <div className="lp-header-inner">
        <Link to="/" className="lp-brand" onClick={() => setOpen(false)}>
          <img src={logoMark} alt="" className="lp-brand-mark" width={40} height={40} decoding="async" />
          <span className="lp-brand-text">
            <span className="lp-brand-name">IU CLUB</span>
            <span className="lp-brand-tag">SHINE AND THRIVE</span>
          </span>
        </Link>

        <nav className="lp-nav-desktop" aria-label="Điều hướng chính">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={itemHref(item)}
              className={`lp-nav-link ${isNavActive(item, pathname) ? "is-active" : ""}`}
              aria-current={isNavActive(item, pathname) ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                onItem(item);
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="lp-nav-toggle"
          aria-label={open ? "Đóng menu" : "Mở menu"}
          aria-expanded={open}
          aria-controls="lp-mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <nav id="lp-mobile-nav" className="lp-nav-mobile" aria-label="Menu điện thoại">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={itemHref(item)}
              onClick={(event) => {
                event.preventDefault();
                onItem(item);
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

export default LandingNavBar;
