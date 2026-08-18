/** Copy trang Sự kiện — cùng giọng với landing / Về IU CLUB. */

export const EVENT_HERO = {
  eyebrow: "SỰ KIỆN IU CLUB",
  headline: "NƠI KIẾN THỨC ĐƯỢC MANG RA NGOÀI GIẢNG ĐƯỜNG",
  tagline: "Buổi thực hành, cuộc thi, tọa đàm và những ngày hội của tập thể — mỗi năm một nhịp khác nhau.",
  cta: "KHÁM PHÁ CHƯƠNG TRÌNH",
} as const;

export const EVENT_GALLERY = {
  eyebrow: "01 — CHƯƠNG TRÌNH ĐÃ DIỄN RA",
  headline: "NHỮNG SỰ KIỆN TẠO NÊN IU CLUB",
  intro: "Từ đào tạo thành viên mới đến ngày hội cuối năm — mỗi chương trình là một lần học hỏi, thử sức và gắn kết.",
  perPage: 4,
  items: [
    {
      date: "12/08/2026",
      time: "14:00 – 17:00",
      title: "Đào tạo thành viên mới",
      place: "Viện Khoa học Kỹ thuật Bưu điện",
      file: "Traning New.png",
    },
    {
      date: "28/07/2026",
      time: "08:00 – 17:00",
      title: "AI Challenge 2025",
      place: "Học viện Công nghệ Bưu chính Viễn thông",
      file: "AI CHALLENGE 2025.png",
    },
    {
      date: "27/03/2026",
      time: "13:00 – 18:00",
      title: "UDU Open Esports Championship 2025",
      place: "Viện Khoa học Kỹ thuật Bưu điện",
      file: "UDU OPEN ESPORTS CHAMPIONSHIP 2025.png",
    },
    {
      date: "15/06/2026",
      time: "18:00 – 21:00",
      title: "Year End Party",
      place: "Viện Khoa học Kỹ thuật Bưu điện",
      file: "YEAR END PARTY.png",
    },
    {
      date: "18/04/2026",
      time: "18:00 – 21:00",
      title: "Sinh nhật IU CLUB",
      place: "Viện Khoa học Kỹ thuật Bưu điện",
      file: "Sinh nhật IU.png",
    },
    {
      date: "03/05/2026",
      time: "09:00 – 16:00",
      title: "Coding Fest 2025",
      place: "University of Sydney",
      file: "Coding Fest.png",
    },
  ],
} as const;

export const EVENT_TYPES = {
  eyebrow: "02 — BỐN DẠNG SỰ KIỆN",
  headline: "MỖI DẠNG MỘT MỤC ĐÍCH",
  intro: "Ban Truyền thông & Sự kiện xây dựng chương trình. Bạn đến để học, thi và gặp nhau.",
  items: [
    { n: "01", title: "BUỔI THỰC HÀNH", body: "Làm cùng nhau: công cụ, kỹ năng và một sản phẩm mang về." },
    { n: "02", title: "CUỘC THI", body: "AI, dữ liệu, lập trình — đấu trường với những bài toán thực tế." },
    { n: "03", title: "TỌA ĐÀM", body: "Nghe người đi trước, hỏi trực tiếp, mở ra hướng học mới." },
    { n: "04", title: "NỘI BỘ", body: "Sinh nhật câu lạc bộ, tất niên và những buổi dành cho thành viên." },
  ],
} as const;

export const EVENT_YEAR = {
  eyebrow: "03 — NHỊP MỘT NĂM",
  headline: "SỰ KIỆN XOAY THEO MÙA",
  intro: "Đây là khung lịch thường thấy. Ngày cụ thể được công bố trước từng đợt.",
  seasons: [
    {
      when: "Đầu năm",
      title: "MÙA MỞ ĐẦU",
      body: "Đón tân binh, buổi thực hành nhập môn và những buổi làm quen đội.",
    },
    {
      when: "Giữa năm",
      title: "MÙA HỌC THUẬT",
      body: "Cuộc thi công nghệ, tọa đàm chuyên môn và các buổi đào tạo mở.",
    },
    {
      when: "Cuối năm",
      title: "MÙA HỘI TỤ",
      body: "Nhìn lại hành trình, ngày hội thành viên và sinh nhật IU CLUB.",
    },
  ],
} as const;

export const EVENT_JOIN = {
  eyebrow: "04 — BẠN THAM GIA THẾ NÀO?",
  headline: "MỞ CHO CỘNG ĐỒNG — SÂU HƠN KHI LÀ THÀNH VIÊN",
  points: [
    { title: "MỞ", body: "Một số buổi thực hành và cuộc thi mở cho sinh viên ngoài câu lạc bộ." },
    { title: "THÀNH VIÊN", body: "Được ưu tiên chỗ, tham gia đội chuẩn bị và lên sân khấu." },
    { title: "LỊCH", body: "Từng đợt được thông báo trước trên Facebook và trong nhóm nội bộ." },
  ],
} as const;

export const EVENT_NEXT = {
  eyebrow: "05 — BƯỚC TIẾP THEO",
  headline: "CHƯƠNG TRÌNH CẦN NGƯỜI LÀM — KHÔNG CHỈ NGƯỜI XEM",
  body: "Gia nhập IU CLUB để được gọi vào đội tổ chức, không chỉ đứng ngoài theo dõi.",
  closer: "VÀ BIẾT ĐÂU, CHƯƠNG TIẾP THEO SẼ CÓ TÊN BẠN.",
  ctaJoin: "THAM GIA IU CLUB",
  ctaTrain: "XEM ĐÀO TẠO",
} as const;
