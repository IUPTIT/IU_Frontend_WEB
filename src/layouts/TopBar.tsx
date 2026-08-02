type Props = {
  search: string;
  onSearchChange: (value: string) => void;
};

function TopBar({ search, onSearchChange }: Props) {
  return (
    <header className="sticky top-4 sm:top-6 z-10">
      <div className="flex items-center gap-4 rounded-card bg-background/80 backdrop-blur px-6 py-4 shadow-extruded">
        <label className="relative flex-1 max-w-xl">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-placeholder" aria-hidden>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="9" r="6" />
              <path d="m14 14 4 4" strokeLinecap="round" />
            </svg>
          </span>
          <input
            className="neu-input pl-12"
            placeholder="Tìm kiếm đợt tuyển..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>

        <div className="ml-auto flex items-center gap-4">
          <button className="neu-btn h-12 w-12 !px-0 rounded-full" aria-label="Thông báo">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 2.5a5 5 0 0 0-5 5v3l-1.5 3h13L15 10.5v-3a5 5 0 0 0-5-5Z" strokeLinejoin="round" />
              <path d="M8 16.5a2 2 0 0 0 4 0" />
            </svg>
          </button>
          <button className="neu-btn h-12 w-12 !px-0 rounded-full" aria-label="Tài khoản">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="10" cy="7" r="3.5" />
              <path d="M3.5 17a6.5 6.5 0 0 1 13 0" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
