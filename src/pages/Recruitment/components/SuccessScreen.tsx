import { Link } from "react-router-dom";
import { Check } from "lucide-react";

type Props = {
  applicationCode: string;
  email: string;
};

function SuccessScreen({ applicationCode, email }: Props) {
  return (
    <div className="reg-rise liquid-glass landing-card-glass glass-shine mx-auto max-w-xl rounded-3xl p-6 text-center sm:p-8 md:p-10">
      <div className="landing-btn-primary reg-check mx-auto mb-5 flex h-16 w-16 cursor-default items-center justify-center rounded-full">
        <Check size={32} strokeWidth={3} />
      </div>
      <h2 className="landing-headline text-2xl font-semibold text-[hsl(var(--landing-foreground))]">
        Đã nhận đơn của bạn!
      </h2>
      <p className="mt-3 text-[hsl(var(--landing-foreground)/0.7)]">
        Email xác nhận kèm thông tin hồ sơ đã được gửi tới <span className="font-medium">{email}</span>. Trạng thái đơn
        hiện tại: <span className="font-medium">Chờ xét duyệt</span>.
      </p>

      <div className="mx-auto mt-6 w-fit rounded-2xl border border-purple-400/40 bg-purple-500/10 px-6 py-4">
        <p className="text-xs uppercase tracking-wide text-[hsl(var(--landing-foreground)/0.5)]">Mã hồ sơ của bạn</p>
        <p className="landing-headline mt-1 text-2xl font-semibold tracking-wider text-purple-300">{applicationCode}</p>
      </div>

      <p className="mt-4 text-sm text-[hsl(var(--landing-foreground)/0.55)]">
        Lưu lại mã này để tra cứu trạng thái hoặc sửa hồ sơ trước hạn đóng đơn.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/tra-cuu" className="landing-btn-primary inline-flex px-6 py-2.5">
          Tra cứu hồ sơ
        </Link>
        <Link to="/" className="landing-btn-secondary liquid-glass inline-flex rounded-full px-6 py-2.5">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default SuccessScreen;
