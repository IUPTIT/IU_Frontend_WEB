/** Copy trang Đào tạo — cùng giọng với landing / Về IU CLUB. */

export const TRAIN_HERO = {
  eyebrow: "ĐÀO TẠO IU CLUB",
  headline: "LỘ TRÌNH SAU KHI BẠN GIA NHẬP",
  tagline: "Người hướng dẫn đồng hành. Bài học theo tuần. Bài tập để bạn làm thật.",
  cta: "KHÁM PHÁ LỘ TRÌNH",
} as const;

export const TRAIN_SKILLS = {
  eyebrow: "01 — IU CLUB ĐÀO TẠO NHỮNG GÌ?",
  headline: "SÁU MẢNG KIẾN THỨC CỐT LÕI",
  intro: "Ban Chuyên môn xây dựng nội dung. Bạn học theo nhóm, theo người hướng dẫn, đúng hướng mình chọn.",
  items: [
    { title: "LẬP TRÌNH", body: "Tư duy viết chương trình, cú pháp và thói quen code rõ ràng." },
    { title: "WEB", body: "Giao diện, website và sản phẩm chạy được trên trình duyệt." },
    { title: "AI", body: "Làm quen mô hình, công cụ và những bài toán trí tuệ nhân tạo." },
    { title: "DATA", body: "Thu thập, làm sạch và đọc dữ liệu trước khi đưa ra quyết định." },
    { title: "THUẬT TOÁN", body: "Rèn luyện tư duy qua bài tập, buổi chia sẻ và luyện tập nhóm." },
    { title: "DỰ ÁN", body: "Gắn kiến thức vào bài tập thật — có nộp bài, có nhận xét." },
  ],
} as const;

export const TRAIN_ROADMAP = {
  eyebrow: "02 — LỘ TRÌNH TÂN BINH",
  headline: "BỐN CHẶNG ĐỂ TRỞ THÀNH THÀNH VIÊN CHÍNH THỨC",
  intro: "Sau khi trúng tuyển, bạn được xếp nhóm và nhận người hướng dẫn. Lộ trình chạy theo tuần, có hạn nộp bài.",
  steps: [
    {
      n: "01",
      when: "Tuần 1 – 2",
      title: "ĐỊNH HƯỚNG",
      body: "Làm quen IU CLUB, người hướng dẫn, nhóm và chọn hướng học. Biết mình sẽ đi những tuần nào.",
    },
    {
      n: "02",
      when: "Tuần 3 – 6",
      title: "NỀN TẢNG",
      body: "Bài học, tài liệu, video và buổi đào tạo kiến thức cốt lõi theo từng mảng.",
    },
    {
      n: "03",
      when: "Tuần 7 – 10",
      title: "THỰC HÀNH",
      body: "Nhận bài tập, nộp bài, trao đổi trong nhóm. Người hướng dẫn chấm và góp ý.",
    },
    {
      n: "04",
      when: "Kết thúc đợt",
      title: "ĐÁNH GIÁ",
      body: "Người hướng dẫn tổng kết quá trình. Đạt yêu cầu, bạn trở thành thành viên chính thức của IU CLUB.",
    },
  ],
} as const;

export const TRAIN_HOW = {
  eyebrow: "03 — ĐÀO TẠO ĐƯỢC VẬN HÀNH NHƯ THẾ NÀO?",
  headline: "MỘT NHÓM — MỘT NGƯỜI HƯỚNG DẪN — MỘT LỘ TRÌNH",
  items: [
    { title: "NGƯỜI HƯỚNG DẪN", body: "Dẫn nhóm, giao bài, nhận xét và theo sát từng tuần." },
    { title: "BÀI TẬP", body: "Mỗi bài có hạn nộp. Bạn làm, được chấm, biết mình đang ở đâu." },
    { title: "NHÓM", body: "Cùng học, cùng hỏi, không đi một mình." },
  ],
} as const;

export const TRAIN_NEXT = {
  eyebrow: "04 — BƯỚC TIẾP THEO",
  headline: "LỘ TRÌNH MỞ RA KHI BẠN GIA NHẬP IU CLUB",
  body: "Đào tạo dành cho tân binh sau khi trúng tuyển. Hãy bắt đầu từ vòng ứng tuyển.",
  closer: "MỌI HÀNH TRÌNH ĐỀU CẦN MỘT BƯỚC ĐẦU TIÊN.",
  ctaJoin: "THAM GIA IU CLUB",
  ctaEvents: "XEM SỰ KIỆN",
} as const;
