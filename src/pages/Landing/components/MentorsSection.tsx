import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { LANDING_IMAGES, MENTOR_FALLBACKS } from "../images";
import { LandingImage, LpSection } from "./ui";

const HUYNH = {
  name: "TS. Phan Lý Huỳnh",
  role: "Giảng viên · Phụ trách P.NCPT Dịch vụ Viễn thông",
};

const DAI = {
  name: "Thầy Trần Quang Đại",
  role: "Giảng viên RIPT — Cố vấn CLB",
};

function MentorsSection() {
  return (
    <LpSection id="mentors">
      {/* Header */}
      <header className="lp-sec-head" style={{ marginBottom: "40px" }}>
        <p className="lp-eyebrow">CỐ VẤN IU CLUB</p>
        <h2 className="lp-h2">HÀNH TRÌNH KHÔNG ĐI MỘT MÌNH</h2>
        <p className="lp-sec-intro lp-lead">
          Để phát triển thành một cộng đồng vững mạnh như hiện nay, IU CLUB đã may mắn
          nhận được sự hỗ trợ, chỉ dẫn và đồng hành từ các thầy cô có nhiều năm kinh
          nghiệm giảng dạy tại Viện Khoa học Kỹ thuật Bưu điện.
        </p>
      </header>

      {/* ── 2 card layout cân đối ── */}
      <div className="lp-mentors-grid">
        {/* Card Thầy Huỳnh */}
        <article className="lp-card lp-card-static lp-mentor-card">
          <LandingImage
            src={LANDING_IMAGES.mentor1}
            fallbackSrc={MENTOR_FALLBACKS[0]}
            filename="Thầy phan lý huỳnh.png"
            alt={HUYNH.name}
            className="lp-mentor-photo"
          />
          <div className="lp-mentor-meta">
            <div className="lp-mentor-info">
              <h3 className="lp-h3">{HUYNH.name}</h3>
              <p className="lp-body">{HUYNH.role}</p>
            </div>
            {/* Chuyển qua trang chi tiết riêng */}
            <Link
              to="/co-van/ts-phan-ly-huynh"
              className="lp-mentor-expand-btn"
              aria-label={`Xem hồ sơ chi tiết của ${HUYNH.name}`}
            >
              <span>KHÁM PHÁ GIẢNG VIÊN</span>
              <ChevronRight size={15} />
            </Link>
          </div>
        </article>

        {/* Card Thầy Đại */}
        <article className="lp-card lp-card-static lp-mentor-card">
          <LandingImage
            src={LANDING_IMAGES.mentor2}
            fallbackSrc={MENTOR_FALLBACKS[1]}
            filename="Thầy Trần Quang Đại.png"
            alt={DAI.name}
            className="lp-mentor-photo"
          />
          <div className="lp-mentor-meta">
            <div className="lp-mentor-info">
              <h3 className="lp-h3">{DAI.name}</h3>
              <p className="lp-body">{DAI.role}</p>
            </div>
          </div>
        </article>
      </div>
    </LpSection>
  );
}

export default MentorsSection;
