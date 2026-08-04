export type ApplicationStatus =
  | "cho_xet_duyet"
  | "dat_vong_don"
  | "khong_dat_vong_don"
  | "dat_phong_van"
  | "khong_dat_phong_van"
  | "trung_tuyen"
  | "khong_trung_tuyen"
  | "da_rut_don";

export type ApplicationRecord = {
  code: string;
  email: string;
  fullName: string;
  campaignName: string;
  submittedAt: string;
  wishes: string[];
  status: ApplicationStatus;
  note?: string;
};

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  cho_xet_duyet: "Chờ xét duyệt",
  dat_vong_don: "Đạt vòng đơn",
  khong_dat_vong_don: "Không đạt vòng đơn",
  dat_phong_van: "Đạt phỏng vấn",
  khong_dat_phong_van: "Không đạt phỏng vấn",
  trung_tuyen: "Trúng tuyển",
  khong_trung_tuyen: "Không trúng tuyển",
  da_rut_don: "Đã rút đơn",
};
