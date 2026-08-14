import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Fallback tuỳ biến; bỏ trống = dùng màn báo lỗi mặc định theo vibe landing */
  fallback?: ReactNode;
};

type State = { hasError: boolean };

/**
 * Chặn lỗi render lan ra cả app (React unmount hết → trắng màn phải F5).
 * Bắt được lỗi thì hiện fallback + nút tải lại, giữ nền landing.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log để còn lần được nguyên nhân về sau
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="mx-auto my-16 max-w-md px-4">
        <div className="liquid-glass landing-card-glass rounded-3xl p-8 text-center">
          <div className="landing-btn-primary mx-auto mb-5 flex h-14 w-14 cursor-default items-center justify-center rounded-full text-2xl">
            !
          </div>
          <h2 className="landing-headline text-xl font-semibold text-[hsl(var(--landing-foreground))]">
            Có gì đó trục trặc
          </h2>
          <p className="mt-3 text-sm text-[hsl(var(--landing-foreground)/0.7)]">
            Trang gặp lỗi ngoài dự kiến. Tải lại để tiếp tục — thông tin bạn đã
            nhập có thể cần điền lại.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="landing-btn-primary mt-6 px-6 py-2.5"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
