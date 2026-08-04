import Select from "react-select";
import type { StylesConfig } from "react-select";

type Option = { value: string; label: string };

type Props = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isClearable?: boolean;
  compact?: boolean; // bản nhỏ gọn — dùng trong header datepicker
  isSearchable?: boolean;
};

// Style react-select theo dark theme landing
const buildStyles = (compact: boolean): StylesConfig<Option, false> => ({
  control: (base, state) => ({
    ...base,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: compact ? 10 : 14,
    minHeight: compact ? 34 : 48,
    border: state.isFocused ? "1px solid rgba(168, 85, 247, 0.7)" : "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(168, 85, 247, 0.25)" : "none",
    cursor: "pointer",
    ":hover": { borderColor: "rgba(168, 85, 247, 0.5)" },
  }),
  valueContainer: (base) => ({ ...base, padding: compact ? "0 8px" : "2px 16px" }),
  singleValue: (base) => ({ ...base, color: "hsl(40 6% 95%)" }),
  placeholder: (base) => ({ ...base, color: "hsl(40 6% 95% / 0.4)" }),
  input: (base) => ({ ...base, color: "hsl(40 6% 95%)" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base, state) => ({
    ...base,
    padding: compact ? 2 : base.padding,
    color: "hsl(40 6% 95% / 0.5)",
    transition: "transform 0.3s ease-out",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : undefined,
    ":hover": { color: "hsl(40 6% 95%)" },
  }),
  clearIndicator: (base) => ({ ...base, color: "hsl(40 6% 95% / 0.5)", ":hover": { color: "#f87171" } }),
  menu: (base) => ({
    ...base,
    backgroundColor: "hsl(258 45% 11%)",
    borderRadius: 16,
    border: "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
    overflow: "hidden",
    zIndex: 30,
  }),
  menuList: (base) => ({ ...base, padding: 6, maxHeight: compact ? 220 : 300 }),
  option: (base, state) => ({
    ...base,
    borderRadius: 10,
    cursor: "pointer",
    padding: compact ? "6px 10px" : base.padding,
    backgroundColor: state.isSelected
      ? "rgba(168, 85, 247, 0.35)"
      : state.isFocused
        ? "rgba(255, 255, 255, 0.08)"
        : "transparent",
    color: "hsl(40 6% 95%)",
    ":active": { backgroundColor: "rgba(168, 85, 247, 0.25)" },
  }),
  noOptionsMessage: (base) => ({ ...base, color: "hsl(40 6% 95% / 0.5)" }),
  // Menu render qua portal ra body — không bị card overflow-hidden cắt
  menuPortal: (base) => ({ ...base, zIndex: 60 }),
});

function LandingSelect({ options, value, onChange, placeholder, isClearable, compact, isSearchable }: Props) {
  const opts: Option[] = options.map((o) => ({ value: o, label: o }));
  return (
    <Select<Option, false>
      options={opts}
      value={opts.find((o) => o.value === value) ?? null}
      onChange={(selected) => onChange(selected?.value ?? "")}
      placeholder={placeholder ?? "— Chọn —"}
      isClearable={isClearable}
      isSearchable={isSearchable ?? false}
      styles={buildStyles(!!compact)}
      menuPortalTarget={document.body}
      noOptionsMessage={() => "Không có lựa chọn"}
    />
  );
}

export default LandingSelect;
