import { useCallback, useEffect, useState } from "react";
import { Send } from "lucide-react";
import Avatar from "../../../../components/ui/Avatar";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import {
  confirmTrainingCompletion,
  getMyTeamTrainees,
  saveMentorTraineeReview,
} from "../../../../services/trainingService";
import type { Trainee } from "../../../../types/training";

const EVAL_LABEL: Record<string, string> = {
  studying: "Đang training",
  qualified: "Đạt",
  failed: "Trượt",
  certified: "Đã cấp CN",
};

/** UC Leader #6–7: đánh giá tổng kết + xác nhận hoàn thành */
export default function LeaderTrainingEvaluationPage() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTrainees(await getMyTeamTrainees());
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Tải danh sách thất bại");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <div className="neu-card h-40 animate-pulse" />;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <nav className="text-sm text-muted">
          Đào tạo thành viên mới ›{" "}
          <span className="text-foreground/80">Đánh giá</span>
        </nav>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Đánh giá tổng kết
        </h1>
        <p className="text-sm text-muted">
          Nhận xét năng lực và xác nhận hoàn thành để gửi Ban Chủ nhiệm
        </p>
      </header>

      {toast && (
        <div className="rounded-2xl bg-accent/15 px-4 py-2 text-sm font-medium text-accent">
          {toast}
        </div>
      )}

      {trainees.length === 0 ? (
        <div className="neu-card !p-10 text-center text-muted">
          Chưa có tân binh trong nhóm bạn phụ trách.
        </div>
      ) : (
        <ul className="space-y-4">
          {trainees.map((t) => (
            <EvalCard
              key={t.id}
              trainee={t}
              onChanged={(msg) => {
                showToast(msg);
                void load();
              }}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function EvalCard({
  trainee,
  onChanged,
}: {
  trainee: Trainee;
  onChanged: (msg: string) => void;
}) {
  const [score, setScore] = useState(
    trainee.avgScore != null ? String(trainee.avgScore) : "",
  );
  const [note, setNote] = useState(trainee.mentorNote ?? "");
  const [saving, setSaving] = useState(false);
  const submitted = trainee.mentorReviewStatus === "submitted";

  const handleSave = async (submit: boolean) => {
    const parsed = score.trim() === "" ? undefined : Number.parseFloat(score);
    if (parsed != null && (Number.isNaN(parsed) || parsed < 0 || parsed > 10)) {
      onChanged("Điểm phải từ 0 đến 10.");
      return;
    }
    if (!note.trim() && parsed == null) {
      onChanged("Nhập nhận xét tổng thể (bắt buộc khi đánh giá).");
      return;
    }
    setSaving(true);
    try {
      await saveMentorTraineeReview(trainee.id, {
        score: parsed ?? null,
        note: note.trim(),
        submit,
      });
      onChanged(
        submit
          ? `Đã gửi đánh giá của ${trainee.fullName} lên BCN.`
          : `Đã lưu nháp cho ${trainee.fullName}.`,
      );
    } catch (err) {
      onChanged(err instanceof Error ? err.message : "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await confirmTrainingCompletion(trainee.id, note.trim());
      onChanged(`Đã xác nhận hoàn thành training cho ${trainee.fullName}.`);
    } catch (err) {
      onChanged(err instanceof Error ? err.message : "Xác nhận thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="neu-card space-y-3 !p-5">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar name={trainee.fullName} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{trainee.fullName}</p>
          <p className="text-xs text-muted">{trainee.email}</p>
        </div>
        <Badge tone={submitted ? "success" : "muted"}>
          {submitted ? "Đã gửi BCN" : "Nháp"}
        </Badge>
        <Badge tone="accent">
          {EVAL_LABEL[trainee.evalStatus ?? "studying"]}
        </Badge>
      </div>
      <textarea
        className="neu-input min-h-[80px] w-full text-sm"
        placeholder="Nhận xét tổng thể năng lực *"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <input
          type="number"
          min={0}
          max={10}
          step={0.5}
          className="neu-input !h-9 w-28 text-sm"
          placeholder="Điểm (tuỳ chọn)"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
        <Button
          variant="secondary"
          size="sm"
          disabled={saving}
          onClick={() => void handleSave(false)}
        >
          Lưu nháp
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={saving}
          onClick={() => void handleSave(true)}
          leftIcon={<Icon icon={Send} size={14} />}
        >
          Gửi đánh giá
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={saving}
          onClick={() => void handleConfirm()}
        >
          Xác nhận hoàn thành
        </Button>
      </div>
    </li>
  );
}
