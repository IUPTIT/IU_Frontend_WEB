import { GraduationCap } from "lucide-react";
import Icon from "../../../components/ui/Icon";

/**
 * Đào tạo trong CLB (bồi dưỡng thành viên chính thức) — TÁCH BIỆT với
 * "Vòng training" của quy trình tuyển (vòng loại chọn tân binh, nằm trong menu Tuyển dụng).
 * Module này sẽ phát triển sau: khoá học nội bộ, workshop, mentoring dài hạn...
 */
function ClubTrainingPage() {
  return (
    <>
      <section className="space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
          Đào tạo CLB
        </h1>
        <p className="text-muted max-w-xl">
          Chương trình bồi dưỡng dành cho thành viên chính thức của câu lạc bộ.
        </p>
      </section>

      <section className="neu-card !p-12 text-center space-y-4">
        <div className="neu-well mx-auto flex h-16 w-16 items-center justify-center text-accent">
          <Icon icon={GraduationCap} size={28} />
        </div>
        <p className="font-semibold text-foreground">Module đang được xây dựng</p>
        <p className="mx-auto max-w-md text-sm text-muted">
          Nơi này sẽ quản lý khoá học nội bộ, workshop và mentoring dài hạn cho thành viên.
          Phần <b>Vòng training tuyển chọn tân binh</b> nằm trong menu{" "}
          <b>Tuyển dụng → Lộ trình / Chia đội / Tổng kết training</b>.
        </p>
      </section>
    </>
  );
}

export default ClubTrainingPage;
