function HeroContent() {
  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="landing-display text-[64px] font-normal leading-[1.02] tracking-[-0.024em] text-[hsl(var(--landing-foreground))] md:text-[120px] lg:text-[180px]">
        IU{" "}
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(to left, #6366f1, #a855f7, #fcd34d)" }}
        >
          Club
        </span>
      </h1>

      <p
        className="mt-4 text-2xl font-medium leading-snug tracking-[-0.01em] text-[hsl(var(--landing-foreground))] md:text-3xl"
        style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
      >
        Kết nối <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(to right, #a855f7, #fcd34d)" }}>đam mê</span>, kiến tạo{" "}
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(to right, #fcd34d, #6366f1)" }}>tương lai</span>
      </p>

      <button className="landing-btn-secondary liquid-glass mt-[25px] px-[29px] py-[24px]">
        Xem tin mới nhất
      </button>
    </div>
  );
}

export default HeroContent;
