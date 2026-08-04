type Props = {
  title: string;
  description?: string;
};

/** Placeholder cho trang chưa có ảnh thiết kế — chỉ khung tiêu đề */
function PagePlaceholder({ title, description }: Props) {
  return (
    <section className="space-y-3">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h1>
      <p className="text-muted max-w-2xl">
        {description ?? "Trang đang chờ ảnh thiết kế — chưa code UI thật."}
      </p>
    </section>
  );
}

export default PagePlaceholder;
