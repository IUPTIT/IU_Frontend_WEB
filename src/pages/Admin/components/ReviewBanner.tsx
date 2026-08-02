import type { PendingReview } from "../../../types/admin";

function ReviewBanner({ review, onAction }: { review: PendingReview; onAction: () => void }) {
  return (
    <article className="neu-card flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 sm:p-8">
      <div className="neu-well h-14 w-14 rounded-full shrink-0 text-accent">
        <svg className="h-6 w-6" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 8v4l9 3V5L3 8Zm9-3 4-1.5v13L12 15M5 12v4" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex-1">
        <h3 className="text-lg">Cần đánh giá {review.count} hồ sơ</h3>
        <p className="mt-1 text-sm text-muted">{review.message}</p>
      </div>
      <button className="neu-btn-primary shrink-0" onClick={onAction}>
        Đánh giá ngay
      </button>
    </article>
  );
}

export default ReviewBanner;
