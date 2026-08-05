import { useCallback, useEffect, useState } from "react";
import {
  TrainingRoadmapPanel,
  TrainingTeamPanel,
} from "../../../../components/training/TraineeTrainingHub";
import {
  getMyTraining,
  type MyTraining,
} from "../../../../services/trainingService";

/** Member UC 1–2: lộ trình + nhóm/mentor — kế thừa panel soft-UI Admin/Candidate */
export default function MemberTrainingRoadmapPage() {
  const [training, setTraining] = useState<MyTraining | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setTraining(await getMyTraining());
  }, []);

  useEffect(() => {
    let alive = true;
    void load()
      .catch(() => alive && setTraining(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [load]);

  if (loading) {
    return <div className="neu-card h-64 animate-pulse" aria-busy="true" />;
  }

  if (!training) {
    return (
      <section className="neu-card !p-10 text-center space-y-2">
        <h1 className="font-display text-2xl font-extrabold">
          Lộ trình & nhóm
        </h1>
        <p className="text-muted mx-auto max-w-md text-sm">
          Bạn chưa được đưa vào chương trình đào tạo thành viên mới. Khi trúng
          tuyển và được chia nhóm, lộ trình sẽ hiện tại đây.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <nav className="text-sm text-muted">
          Đào tạo thành viên mới ›{" "}
          <span className="text-foreground/80">Lộ trình & nhóm</span>
        </nav>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Lộ trình của tôi
        </h1>
        <p className="text-muted">
          {training.trainee.cohortLabel ?? "Tân binh"} · Ban{" "}
          {training.trainee.departmentName}
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <TrainingTeamPanel training={training} />
        <TrainingRoadmapPanel training={training} />
      </div>
    </section>
  );
}
