import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FlaskConical,
  GraduationCap,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import BackgroundVideo from "../../components/LandingBackgroundVideo";
import LandingNavBar from "../../components/LandingNavBar";
import LandingFooter from "../../components/LandingFooter";
import { LandingImage, LpButton, LpSection } from "../Landing/components/ui";
import { LANDING_IMAGES, MENTOR_FALLBACKS } from "../Landing/images";
import "../../styles/landing.css";
import "../../styles/landing-home.css";
import "../../styles/public-pages.css";

const MENTOR_DATA = {
  name: "TS. Phan Lý Huỳnh",
  title: "Giảng viên · Phụ trách Phòng Nghiên cứu phát triển Dịch vụ Viễn thông",
  org: "Viện Khoa học Kỹ thuật Bưu điện (RIPT) — Học viện Công nghệ Bưu chính Viễn thông (PTIT)",
  email: "huynhpl@ptit.edu.vn",
  roleAtClub: "Cố vấn học thuật IU CLUB",
  bio: "TS. Phan Lý Huỳnh hiện là Giảng viên và phụ trách Phòng Nghiên cứu phát triển Dịch vụ Viễn thông tại Viện Khoa học Kỹ thuật Bưu điện (RIPT) – Học viện Công nghệ Bưu chính Viễn thông (PTIT). Thầy từng có thời gian học tập, nghiên cứu chuyên sâu tại Pháp và là tác giả của nhiều công trình khoa học, bài báo và đề tài công nghệ tiêu biểu.",
  expertise: [
    "Trí tuệ nhân tạo (AI)",
    "Xử lý ngôn ngữ tự nhiên (NLP)",
    "Nhà thông minh (Smart Building)",
    "Năng lượng xanh (Green Energy)",
    "Xử lý & Quản trị dữ liệu (Data Science)",
  ],
  stats: [
    { label: "Bằng cấp & Học vị", value: "Tiến sĩ (Pháp)" },
    { label: "Bài báo khoa học", value: "11+" },
    { label: "Đề tài & Dự án", value: "7+" },
    { label: "Cố vấn IU CLUB", value: "Từ 2024" },
  ],
  education: [
    {
      period: "2017",
      role: "Cử nhân Công nghệ thông tin",
      place: "Học viện Công nghệ Bưu chính Viễn thông (PTIT)",
      desc: "Tốt nghiệp Đại học chính quy chuyên ngành Công nghệ thông tin.",
    },
    {
      period: "2018",
      role: "Thạc sĩ Khoa học máy tính",
      place: "Viện Công nghệ Grenoble INP (Pháp)",
      desc: "Nhận bằng Thạc sĩ Khoa học máy tính tại trường đại học kỹ thuật hàng đầu của Pháp.",
    },
    {
      period: "2018 – 2022",
      role: "Nghiên cứu sinh Tiến sĩ",
      place: "Đại học Bordeaux (Pháp)",
      desc: "Nghiên cứu và bảo vệ thành công luận án Tiến sĩ chuyên ngành Công nghệ thông tin năm 2022.",
    },
    {
      period: "2022 – 2023",
      role: "Nghiên cứu viên sau Tiến sĩ (Postdoc)",
      place: "Viện Nghiên cứu Toán & Cơ khí I2M, Đại học Bordeaux (Pháp)",
      desc: "Nghiên cứu chuyên sâu về các mô hình phân tích dữ liệu, hoạt động người dùng và nhà thông minh.",
    },
    {
      period: "09/2023 – Nay",
      role: "Giảng viên & Phụ trách Phòng NCPT Dịch vụ Viễn thông",
      place: "Viện Khoa học Kỹ thuật Bưu điện (RIPT) – PTIT",
      desc: "Chủ trì nhiều đề tài nghiên cứu AI, ứng dụng số và trực tiếp cố vấn định hướng cho sinh viên IU CLUB.",
    },
  ],
  journalPapers: [
    {
      title: "Analysis of Multivariate Indoor Building Data: A Comparative Study of Time-Series Clustering Methods",
      journal: "IEEE Access",
      year: "2025",
      type: "Tác giả liên hệ",
      tag: "Scopus / ISI",
    },
    {
      title: "A contextual approach to estimate household activities in instrumented dwellings",
      journal: "Elsevier Journal of Building Engineering",
      year: "2024",
      type: "Tác giả",
      tag: "Q1 Elsevier",
    },
    {
      title: "A bottom-up approach to enhance occupants’ actions regarding satisfaction in buildings",
      journal: "International Conference On Advanced Technologies For Communications",
      year: "2024",
      type: "Tác giả",
      tag: "Conference Proceeding",
    },
    {
      title: "Consequences-based graphical model for contextualized occupant activities estimation in connected buildings",
      journal: "17th International Conference of the International Building Performance Simulation Association (BS2021)",
      year: "2021",
      type: "Tác giả",
      tag: "IBPSA International",
    },
    {
      title: "Contextualized model for occupants’ activities estimation in connected buildings",
      journal: "Conférence IBPSA France 2020",
      year: "2020",
      type: "Tác giả",
      tag: "National Conference",
    },
  ],
  conferencePapers: [
    {
      title: "A Comparative Study of Anomaly Detection Approaches in Time-Series Environmental Sensor Data",
      conf: "2025 International Conference on Advanced Technologies for Communications (ATC)",
      year: "2025",
    },
    {
      title: "A Dual-Path approach for Time Series Anomaly Detection in Building Environmental Sensors",
      conf: "14th International Symposium on Information and Communication Technology (SOICT 2025)",
      year: "2025",
    },
    {
      title: "A contextual approach to modeling activity-related electricity consumption in instrumented dwellings",
      conf: "2025 RIVF International Conference on Computing and Communication Technologies (RIVF)",
      year: "2025",
    },
    {
      title: "Leveraging In-Context Adversarial Augmentation for Improved Natural Language Inference Performance",
      conf: "2025 RIVF International Conference on Computing and Communication Technologies (RIVF)",
      year: "2025",
    },
    {
      title: "Tổng quan về các loại ảo giác trong các mô hình nhận dạng giọng nói tự động",
      conf: "Hội thảo Quốc gia lần thứ XXVIII 'Một số vấn đề chọn lọc về CNTT & Truyền thông' (VNICT 2025)",
      year: "2025",
    },
    {
      title: "A bottom-up approach to enhance occupants’ actions regarding satisfaction in buildings",
      conf: "2024 International Conference On Advanced Technologies For Communications (ATC 2024)",
      year: "2024",
    },
  ],
  projects: [
    {
      level: "Nhiệm vụ cấp Quốc gia",
      title: "Nghiên cứu xây dựng nền tảng Chính quyền điện tử triển khai tại địa phương dựa trên phương pháp tiếp cận mới hình thành hệ sinh thái số kết nối chính quyền – doanh nghiệp – người dân",
      time: "12/2023 – 12/2025",
      role: "Tham gia thực hiện",
      badge: "Cấp Quốc gia",
    },
    {
      level: "Đề tài cấp Bộ",
      title: "Nghiên cứu, xây dựng hệ thống hỗ trợ thu thập, cảnh báo và quản lý tiêu chuẩn, quy chuẩn phục vụ cho Bộ Thông tin và Truyền thông",
      time: "2024",
      role: "Tham gia thực hiện",
      badge: "Cấp Bộ TT&TT",
    },
    {
      level: "Đề tài cấp Học viện",
      title: "Nghiên cứu phát triển hệ thống hỗ trợ checkin phục vụ sự kiện ứng dụng công nghệ trí tuệ nhân tạo",
      time: "2024",
      role: "Chủ trì đề tài",
      badge: "Chủ trì",
    },
    {
      level: "Nhiệm vụ cấp Học viện",
      title: "Nghiên cứu, xây dựng hệ thống tư vấn tuyển sinh tự động dựa trên trí tuệ nhân tạo cho Học viện Công nghệ Bưu chính Viễn thông",
      time: "2024",
      role: "Chủ trì nhiệm vụ",
      badge: "Chủ trì",
    },
    {
      level: "Nhiệm vụ cấp Học viện",
      title: "Tiếp nhận, vận hành, hỗ trợ kỹ thuật và phối hợp cùng đơn vị cung cấp dịch vụ để đảm bảo hệ thống đại học số của PTIT vận hành thông suốt",
      time: "06/2023 – 12/2023",
      role: "Chủ trì nhiệm vụ",
      badge: "Chủ trì",
    },
    {
      level: "Đề tài trọng điểm",
      title: "Nghiên cứu và phát triển máy đọc căn cước công dân phục vụ cải cách dịch vụ 1 cửa tại Học viện Công nghệ Bưu chính Viễn thông",
      time: "2024",
      role: "Tham gia thực hiện",
      badge: "Trọng điểm",
    },
    {
      level: "Đề tài trọng điểm",
      title: "Nghiên cứu và xây dựng giải pháp ứng dụng K8S để xây dựng lộ trình triển khai hệ thống đại học số của Học viện dưới dạng nền tảng",
      time: "2024",
      role: "Tham gia thực hiện",
      badge: "Trọng điểm",
    },
  ],
};

function MentorDetailPage() {
  const [activeTab, setActiveTab] = useState<"journals" | "conferences">("journals");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <div className="landing-theme lp-home relative min-h-screen">
      <BackgroundVideo />
      <div className="lp-page-veil" />
      <div className="relative z-10">
        <LandingNavBar />

        <main id="main">
          {/* Breadcrumb / Back Link */}
          <div className="lp-container pt-28 pb-4">
            <Link
              to="/#mentors"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} /> Quay lại danh sách Cố vấn
            </Link>
          </div>

          {/* ── PROFILE HERO SECTION ── */}
          <section className="lp-container pb-12">
            <div className="lp-panel p-6 md:p-10">
              <div className="grid gap-8 lg:grid-cols-[340px_1fr] items-start">
                {/* Photo Column */}
                <div className="flex flex-col items-center">
                  <div className="relative w-full max-w-[320px] aspect-[4/5] rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-950/50 bg-[#0d0a1a]">
                    <LandingImage
                      src={LANDING_IMAGES.mentor1}
                      fallbackSrc={MENTOR_FALLBACKS[0]}
                      filename="Thầy phan lý huỳnh.png"
                      alt={MENTOR_DATA.name}
                      className="w-full h-full object-cover object-top"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090614] via-transparent to-transparent opacity-60 pointer-events-none" />
                  </div>

                  {/* Contact Badge */}
                  <a
                    href={`mailto:${MENTOR_DATA.email}`}
                    className="mt-5 w-full max-w-[320px] inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm font-medium hover:bg-purple-500/20 hover:text-white transition-all shadow-lg shadow-purple-950/30"
                  >
                    <Mail size={16} className="text-purple-400" />
                    <span>{MENTOR_DATA.email}</span>
                  </a>
                </div>

                {/* Info Column */}
                <div className="flex flex-col gap-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-widest w-fit">
                    <Sparkles size={13} className="text-pink-400" />
                    {MENTOR_DATA.roleAtClub}
                  </div>

                  <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                    {MENTOR_DATA.name}
                  </h1>

                  <p className="text-base md:text-lg font-semibold text-purple-300 leading-snug">
                    {MENTOR_DATA.title}
                  </p>

                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
                    <MapPin size={15} className="text-purple-400 shrink-0" />
                    <span>{MENTOR_DATA.org}</span>
                  </div>

                  <p className="text-sm md:text-base text-gray-300 leading-relaxed text-justify mt-2">
                    {MENTOR_DATA.bio}
                  </p>

                  {/* Expertise Tags */}
                  <div className="mt-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                      Lĩnh vực chuyên môn & nghiên cứu:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {MENTOR_DATA.expertise.map((item) => (
                        <span
                          key={item}
                          className="px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stat Highlights */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10">
                    {MENTOR_DATA.stats.map((st) => (
                      <div key={st.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                        <div className="text-base md:text-lg font-black text-purple-300">{st.value}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{st.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── SECTION 1: QUÁ TRÌNH ĐÀO TẠO & CÔNG TÁC ── */}
          <LpSection id="dao-tao-cong-tac">
            <header className="lp-sec-head mb-8">
              <p className="lp-eyebrow">HÀNH TRÌNH HỌC THUẬT</p>
              <h2 className="lp-h2">QUÁ TRÌNH ĐÀO TẠO & CÔNG TÁC</h2>
            </header>

            <div className="max-w-4xl mx-auto space-y-4">
              {MENTOR_DATA.education.map((edu) => (
                <div
                  key={edu.period}
                  className="lp-card p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10 hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-300">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <div className="inline-block px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-1">
                        {edu.period}
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-white">{edu.role}</h3>
                      <p className="text-xs md:text-sm text-purple-300/80 font-medium">{edu.place}</p>
                      <p className="text-xs md:text-sm text-gray-400 mt-1">{edu.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </LpSection>

          {/* ── SECTION 2: BÀI BÁO & CÔNG TRÌNH KHOA HỌC ── */}
          <LpSection id="cong-trinh-khoa-hoc">
            <header className="lp-sec-head mb-8">
              <p className="lp-eyebrow">CÔNG BỐ KHOA HỌC</p>
              <h2 className="lp-h2">BÀI BÁO & CÔNG TRÌNH NGHIÊN CỨU</h2>
            </header>

            {/* Tabs */}
            <div className="flex justify-center gap-3 mb-8">
              <button
                type="button"
                onClick={() => setActiveTab("journals")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm tracking-wider uppercase transition-all ${
                  activeTab === "journals"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/40"
                    : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                }`}
              >
                Tạp chí Khoa học ({MENTOR_DATA.journalPapers.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("conferences")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm tracking-wider uppercase transition-all ${
                  activeTab === "conferences"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/40"
                    : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                }`}
              >
                Hội thảo Quốc tế & Quốc gia ({MENTOR_DATA.conferencePapers.length})
              </button>
            </div>

            {/* Tab content */}
            <div className="max-w-4xl mx-auto space-y-4">
              {activeTab === "journals" ? (
                MENTOR_DATA.journalPapers.map((paper) => (
                  <article
                    key={paper.title}
                    className="lp-card p-5 md:p-6 border border-white/10 hover:border-purple-500/40 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                        {paper.type}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {paper.tag}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold ml-auto">{paper.year}</span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-white leading-snug mt-1">
                      {paper.title}
                    </h3>
                    <p className="text-xs md:text-sm text-purple-300/80 font-medium">
                      {paper.journal}
                    </p>
                  </article>
                ))
              ) : (
                MENTOR_DATA.conferencePapers.map((paper) => (
                  <article
                    key={paper.title}
                    className="lp-card p-5 md:p-6 border border-white/10 hover:border-purple-500/40 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2 justify-between">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/40">
                        Hội thảo khoa học
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">{paper.year}</span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-white leading-snug mt-1">
                      {paper.title}
                    </h3>
                    <p className="text-xs md:text-sm text-purple-300/80 font-medium">
                      {paper.conf}
                    </p>
                  </article>
                ))
              )}
            </div>
          </LpSection>

          {/* ── SECTION 3: ĐỀ TÀI & DỰ ÁN ── */}
          <LpSection id="de-tai-du-an">
            <header className="lp-sec-head mb-8">
              <p className="lp-eyebrow">DỰ ÁN & NHIỆM VỤ</p>
              <h2 className="lp-h2">ĐỀ TÀI, DỰ ÁN KHOA HỌC TIÊU BIỂU</h2>
            </header>

            <div className="max-w-4xl mx-auto grid gap-4">
              {MENTOR_DATA.projects.map((proj) => (
                <div
                  key={proj.title}
                  className="lp-card p-5 md:p-6 border border-white/10 hover:border-purple-500/40 transition-all flex flex-col md:flex-row md:items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center shrink-0 text-pink-300">
                    <FlaskConical size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {proj.level}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-gray-300">
                        {proj.role}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">{proj.time}</span>
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-white leading-snug mt-1.5">
                      {proj.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </LpSection>

          {/* ── SECTION 4: ĐỒNG HÀNH CÙNG IU CLUB ── */}
          <LpSection id="dong-hanh">
            <div className="lp-panel p-8 md:p-12 text-center max-w-3xl mx-auto">
              <span className="lp-num mx-auto mb-4" aria-hidden>
                <Sparkles className="text-purple-300" />
              </span>
              <h2 className="text-xl md:text-3xl font-extrabold text-white mb-4">
                ĐỒNG HÀNH VÀ ĐỊNH HƯỚNG CÙNG IU CLUB
              </h2>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-8">
                Với tư cách là Cố vấn học thuật, TS. Phan Lý Huỳnh trực tiếp định hướng chuyên môn, các đề tài học thuật, seminar và tạo điều kiện cho các thành viên IU CLUB tiếp cận với các công nghệ mới và dự án nghiên cứu thực tế tại Viện Khoa học Kỹ thuật Bưu điện.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <LpButton to="/tuyen-thanh-vien">Ứng tuyển tham gia IU CLUB</LpButton>
                <LpButton variant="ghost" to="/#mentors">
                  Xem tất cả Cố vấn
                </LpButton>
              </div>
            </div>
          </LpSection>
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}

export default MentorDetailPage;
