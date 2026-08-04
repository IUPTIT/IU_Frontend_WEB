import logo from "../../../assets/logo.png";

const NAV_ITEMS = [
  { label: "Giới thiệu", hasChevron: false },
  { label: "Tin tức", hasChevron: false },
  { label: "Tuyển thành viên", hasChevron: false },
  { label: "Sự kiện", hasChevron: false },
];

function ChevronDown() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="m6 8 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavBar() {
  return (
    <header>
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center px-8 py-5">
        <div className="flex items-center gap-2.5 justify-self-start">
          <img src={logo} alt="IU-Club" className="h-12 w-auto" />
          <span className="landing-headline text-2xl font-semibold leading-none">IU Club</span>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className="landing-btn-secondary gap-1 px-4 py-2 text-[hsl(var(--landing-foreground)/0.9)]"
            >
              {item.label}
              {item.hasChevron && <ChevronDown />}
            </button>
          ))}
        </nav>

        <button className="landing-btn-primary justify-self-end px-5 py-2.5">
          Tham gia câu lạc bộ
        </button>
      </div>
      <div className="mt-[3px] h-px bg-gradient-to-r from-transparent via-[hsl(var(--landing-foreground)/0.2)] to-transparent" />
    </header>
  );
}

export default NavBar;
