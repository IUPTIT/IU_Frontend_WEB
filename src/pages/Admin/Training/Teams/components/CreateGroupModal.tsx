import { useEffect, useMemo, useState } from "react";
import { Building2, Search, UserRound, X } from "lucide-react";
import Button from "../../../../../components/ui/Button";
import Icon from "../../../../../components/ui/Icon";
import Avatar from "../../../../../components/ui/Avatar";
import Select from "../../../../../components/ui/Select";
import { createTrainingGroup } from "../../../../../services/trainingService";
import type { ClubDepartment } from "../../../../../types/departments";
import type { Trainee, TrainingMentor } from "../../../../../types/training";

/**
 * Admin thiết lập đội training: chọn Ban áp dụng + tân binh + Mentor training.
 * Layout 2 cột — form bên trái, preview trực tiếp bên phải.
 */
export default function CreateGroupModal({
  open,
  trainees,
  mentors,
  departments,
  campaignId,
  onClose,
  onSaved,
}: {
  open: boolean;
  trainees: Trainee[];
  mentors: TrainingMentor[];
  departments: ClubDepartment[];
  campaignId?: string;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [mentorId, setMentorId] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setDepartmentName(departments[0]?.name ?? "");
    setMentorId("");
    setMemberIds([]);
    setQuery("");
    setError(null);
  }, [open, departments]);

  const available = useMemo(
    () => trainees.filter((t) => t.status !== "removed" && !t.groupId),
    [trainees],
  );

  const filteredAvailable = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter(
      (t) =>
        t.fullName.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q),
    );
  }, [available, query]);

  const selected = useMemo(
    () => available.filter((t) => memberIds.includes(t.id)),
    [available, memberIds],
  );

  // Tiến độ phân bổ theo Ban áp dụng: đã chọn / tổng tân binh chưa có đội của Ban đó
  const banPoolTotal = useMemo(() => {
    if (!departmentName) return available.length;
    return available.filter((t) => t.departmentName === departmentName).length;
  }, [available, departmentName]);
  const banSelectedCount = useMemo(() => {
    if (!departmentName) return selected.length;
    return selected.filter((t) => t.departmentName === departmentName).length;
  }, [selected, departmentName]);
  const progressPct =
    banPoolTotal > 0
      ? Math.min(100, Math.round((banSelectedCount / banPoolTotal) * 100))
      : 0;

  const mentorName = mentors.find((m) => m.id === mentorId)?.name ?? "";
  const mentorRole = mentors.find((m) => m.id === mentorId)?.roleLabel ?? "";

  // Nêu rõ còn thiếu gì để nút Lưu không bị hiểu là hỏng khi bấm không có gì xảy ra
  const missing: string[] = [];
  if (!name.trim()) missing.push("tên nhóm");
  if (memberIds.length === 0) missing.push("ít nhất 1 tân binh");

  if (!open) return null;

  const toggleMember = (id: string) => {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Tên nhóm bắt buộc.");
      return;
    }
    if (memberIds.length === 0) {
      setError("Chọn ít nhất 1 tân binh.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const dept =
        departmentName ||
        selected[0]?.departmentName ||
        "Tổng hợp";
      await createTrainingGroup({
        name: name.trim(),
        campaignId,
        departmentName: dept,
        specialtyLabel: dept,
        mentorId: mentorId || undefined,
        memberIds,
      });
      onSaved(
        mentorId
          ? `Đã tạo nhóm "${name.trim()}" và chỉ định Mentor training.`
          : `Đã tạo nhóm "${name.trim()}" — có thể chỉ định Mentor sau.`,
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tạo nhóm thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[min(92vh,760px)] w-full max-w-4xl flex-col overflow-hidden rounded-card bg-background shadow-soft"
      >
        <header className="flex items-start justify-between gap-3 border-b border-black/5 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-2xl font-extrabold">Thiết lập Nhóm Training</h2>
            <p className="mt-1 text-sm text-muted">
              Phân bổ tân binh vào các nhóm nhỏ để tối ưu hóa quá trình hướng dẫn và theo dõi tiến độ đào tạo.
            </p>
          </div>
          <Button variant="icon" size="sm" aria-label="Đóng" onClick={onClose}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="m6 6 8 8M14 6l-8 8" strokeLinecap="round" />
            </svg>
          </Button>
        </header>

        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-[1.4fr_1fr]">
          {/* Cột form */}
          <div className="min-h-0 space-y-5 overflow-y-auto p-5 sm:px-6">
            <div className="flex items-center gap-2 text-accent">
              <Icon icon={UserRound} size={18} />
              <span className="font-display text-lg font-bold">Thông tin Nhóm</span>
            </div>

            <label className="block space-y-1.5">
              <span className="ui-field-label">TÊN NHÓM</span>
              <input
                className="ui-input !h-11 w-full text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Team Alpha, Nhóm Code Mới..."
              />
            </label>

            <div className="space-y-1.5">
              <span className="ui-field-label">BAN ÁP DỤNG</span>
              {departments.length === 0 ? (
                <p className="rounded-2xl bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                  Chưa có Ban — tạo Ban ở Quản lý Ban trước.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {departments.map((d) => {
                    const activeBan = d.name === departmentName;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDepartmentName(d.name)}
                        className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all ${
                          activeBan
                            ? "bg-accent/15 text-accent shadow-hairline ring-1 ring-accent/40"
                            : "shadow-soft-sm text-muted hover:text-foreground"
                        }`}
                      >
                        <Icon icon={Building2} size={16} />
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="ui-field-label">MENTOR TRAINING PHỤ TRÁCH</span>
              <Select
                width="full"
                value={mentorId}
                onChange={setMentorId}
                placeholder="Chọn Mentor từ danh sách thành viên câu lạc bộ..."
                options={[
                  { value: "", label: "— Chỉ định sau —" },
                  ...mentors.map((m) => ({
                    value: m.id,
                    label: `${m.name} (${m.roleLabel})`,
                  })),
                ]}
              />
            </div>

            <div className="space-y-2">
              <span className="ui-field-label">THÀNH VIÊN (TÂN BINH)</span>
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selected.map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 py-1 pl-2 pr-1 text-xs font-medium text-accent"
                    >
                      {t.fullName}
                      <button
                        type="button"
                        aria-label={`Bỏ ${t.fullName}`}
                        className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-accent/20"
                        onClick={() => toggleMember(t.id)}
                      >
                        <Icon icon={X} size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                  <Icon icon={Search} size={16} />
                </span>
                <input
                  className="ui-input !h-11 w-full pl-9 text-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm kiếm và chọn tân binh..."
                />
              </div>
              <ul className="max-h-52 space-y-1 overflow-y-auto rounded-2xl bg-background p-2 shadow-hairline">
                {filteredAvailable.map((t) => {
                  const checked = memberIds.includes(t.id);
                  return (
                    <li key={t.id}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-accent/5">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[var(--color-accent)]"
                          checked={checked}
                          onChange={() => toggleMember(t.id)}
                        />
                        <Avatar name={t.fullName} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {t.fullName}
                          </span>
                          <span className="text-xs text-muted">
                            {t.departmentName}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
                {filteredAvailable.length === 0 && (
                  <li className="px-3 py-6 text-center text-sm text-muted">
                    {available.length === 0
                      ? "Tất cả tân binh của đợt này đã được xếp đội — không còn ai để thêm."
                      : "Không tìm thấy tân binh phù hợp."}
                  </li>
                )}
              </ul>
              <p className="text-[11px] text-muted">
                Danh sách này chỉ lấy từ API tân binh. Có thể chọn nhiều người cùng lúc.
                {!campaignId && " Chọn đợt tuyển trên trang chính để lọc đúng đợt."}
              </p>
            </div>
          </div>

          {/* Cột preview */}
          <aside className="hidden min-h-0 flex-col overflow-y-auto border-l border-black/5 bg-background/60 p-5 sm:px-6 lg:flex">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-base font-bold text-accent">Preview Nhóm</span>
              <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                Bản nháp
              </span>
            </div>

            <div className="ui-card !p-4 space-y-4">
              <div>
                <p className="font-display text-xl font-extrabold text-accent">
                  {name.trim() || "Tên nhóm..."}
                </p>
                {departmentName && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-muted">
                    <Icon icon={Building2} size={13} />
                    Ban {departmentName}
                  </span>
                )}
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted">Mentor</p>
                {mentorId ? (
                  <div className="mt-1 flex items-center gap-2">
                    <Avatar name={mentorName} size="sm" />
                    <div>
                      <p className="text-sm font-semibold">{mentorName}</p>
                      <p className="text-xs text-muted">{mentorRole}</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted">Chỉ định sau</p>
                )}
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted">
                  Thành viên ({selected.length})
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {selected.slice(0, 8).map((t) => (
                    <Avatar
                      key={t.id}
                      name={t.fullName}
                      size="sm"
                      className="ring-2 ring-background"
                    />
                  ))}
                  {selected.length === 0 && (
                    <span className="text-sm text-muted">Chưa chọn tân binh</span>
                  )}
                  {selected.length > 8 && (
                    <span className="text-xs font-medium text-muted">
                      +{selected.length - 8}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Trạng thái:</span>
                <span
                  className={
                    memberIds.length > 0 && name.trim()
                      ? "font-semibold text-emerald-600"
                      : "font-semibold text-muted"
                  }
                >
                  {memberIds.length > 0 && name.trim()
                    ? "✓ Sẵn sàng lưu"
                    : "Đang soạn..."}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between text-muted">
                  <span>
                    Tiến độ phân bổ{departmentName ? ` (Ban ${departmentName})` : ""}:
                  </span>
                  <span className="font-medium text-foreground">
                    {banSelectedCount}/{banPoolTotal} Tân binh
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="flex flex-wrap items-center gap-3 border-t border-black/5 px-5 py-4 sm:px-6">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <p
            role={error ? "alert" : undefined}
            className={`min-w-0 flex-1 text-sm ${
              error ? "font-medium text-rose-500" : "text-muted"
            }`}
          >
            {error ??
              (missing.length > 0 ? `Cần nhập ${missing.join(" và ")}.` : "")}
          </p>
          <Button
            variant="primary"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? "Đang lưu..." : "Lưu nhóm"}
          </Button>
        </footer>
      </div>
    </div>
  );
}
