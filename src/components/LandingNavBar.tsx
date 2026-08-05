import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

type NavItem = { label: string; to: string; anchor?: string; children?: NavItem[] };

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
  { label: "Tin tức", to: "/" },
  { label: "Tuyển thành viên", to: "/tuyen-thanh-vien" },
  { label: "Tra cứu hồ sơ", to: "/tra-cuu" },
  { label: "Sự kiện", to: "/" },
];

function ChevronDown() {
  return (
    <svg
      className="h-4 w-4 transition-transform duration-300 ease-out group-hover:rotate-180"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="m6 8 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LandingNavBar() {
  const navigate = useNavigate();

  const goTo = (item: NavItem) => {
    navigate(item.to);
    const anchor = item.anchor;
    if (anchor) {
      // Đợi trang đích render xong rồi mới cuộn tới section
      window.setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      // Không có anchor → về đầu trang
      window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[hsl(var(--landing-background)/0.75)] backdrop-blur-md">
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center px-8 py-5">
        <Link to="/" className="flex items-center gap-2.5 justify-self-start">
          <img src={logo} alt="IU-Club" className="h-12 w-auto" />
          <span className="landing-display text-2xl font-semibold leading-none">IU Club</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="group relative">
              <button
                onClick={() => goTo(item)}
                aria-haspopup={item.children ? "menu" : undefined}
                className="landing-btn-secondary gap-1 px-4 py-2 text-[hsl(var(--landing-foreground)/0.9)]"
              >
                {item.label}
                {item.children && <ChevronDown />}
              </button>

              {item.children && (
                <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all duration-300 ease-out group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="liquid-glass landing-card-solid min-w-44 rounded-2xl p-2">
                    {item.children.map((child) => (
                      <button
                        key={child.label}
                        onClick={() => goTo(child)}
                        className="block w-full rounded-xl px-4 py-2.5 text-left text-sm text-[hsl(var(--landing-foreground)/0.8)] transition-colors duration-200 hover:bg-white/10 hover:text-[hsl(var(--landing-foreground))]"
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <button
          onClick={() => navigate("/tuyen-thanh-vien")}
          className="landing-btn-primary justify-self-end px-5 py-2.5"
        >
          Tham gia câu lạc bộ
        </button>
      </div>
      <div className="mt-[3px] h-px bg-gradient-to-r from-transparent via-[hsl(var(--landing-foreground)/0.2)] to-transparent" />
    </header>
  );
}

export default LandingNavBar;
