import { useState } from "react";
import type { FormEvent } from "react";

type Props = {
  onSearch: (query: string) => void;
  notFound: boolean;
};

function LookupForm({ onSearch, notFound }: Props) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="liquid-glass landing-card-solid rounded-3xl p-6 md:p-8">
      <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--landing-foreground)/0.8)]">
        Email hoặc Mã hồ sơ
      </label>
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          className="landing-input flex-1"
          placeholder="VD: ban@student.edu.vn hoặc APP-2026F-0142"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="landing-btn-primary shrink-0 px-8 py-3">
          Tra cứu
        </button>
      </div>
      {notFound && (
        <p className="mt-3 text-sm text-red-400">
          Không tìm thấy hồ sơ nào khớp — kiểm tra lại email hoặc mã hồ sơ trong email xác nhận.
        </p>
      )}
    </form>
  );
}

export default LookupForm;
