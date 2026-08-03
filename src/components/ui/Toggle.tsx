type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
};

/** Toggle kích hoạt — cột Kích hoạt bảng đợt tuyển */
function Toggle({ checked, onChange, disabled, "aria-label": ariaLabel }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40 disabled:pointer-events-none ${
        checked ? "bg-accent shadow-inset-sm" : "bg-background shadow-inset"
      }`}
    >
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-extruded-sm transition-transform duration-300 ease-out ${
          checked ? "translate-x-7" : "translate-x-1"
        }`}
      >
        {checked && (
          <svg className="h-3.5 w-3.5 text-accent" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 10.5 8.5 14 15 6.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}

export default Toggle;
