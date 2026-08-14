import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import { getDefaultPath } from "../constants/navigation";
import { ROUTES } from "../constants/routes";
import { renderPortalPage } from "./portalRoutes";
import { useAuth } from "../context/useAuth";
import ChangePasswordGate from "../components/ChangePasswordGate";
import type { Role } from "../types/navigation";

// Prefix URL theo role — dùng để chặn truy cập chéo portal
const ROLE_PREFIX: Record<Role, string> = {
  admin: "/admin",
  leader: "/leader",
  member: "/member",
  candidate: "/candidate",
};

/** Các route chỉ dành cho user.isMentor (nav đã ẩn; chặn deep-link) */
function isMentorOnlyPath(path: string): boolean {
  const mentorPaths = [
    ROUTES.leader.training.programs,
    ROUTES.leader.training.groups,
    ROUTES.leader.training.tasks,
    ROUTES.leader.training.evaluation,
    ROUTES.member.mentorRoadmap,
    ROUTES.member.mentorTasks,
  ];
  return mentorPaths.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}

// Khu quản trị: URL thật là nguồn điều hướng — mỗi trang con có route phụ riêng
// (VD /admin/recruitment/interviews), reload/share link đều giữ đúng trang.
// Tách file riêng để lazy-load: khách vào landing không phải tải code portal.
function AdminPortal() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const routerNavigate = useNavigate();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Tài khoản sinh tự động (ứng viên) — bắt đổi mật khẩu trước khi vào portal
  if (user.requirePasswordChange) {
    return <ChangePasswordGate />;
  }

  const prefix = ROLE_PREFIX[user.role];
  const activePath = location.pathname.replace(/\/+$/, "") || location.pathname;
  const defaultPath = getDefaultPath(user.role);

  // Vào sai portal (VD member mở /admin/...) hoặc đứng ở gốc chưa có trang → về trang mặc định
  if (!activePath.startsWith(prefix) || (activePath === prefix && defaultPath !== prefix)) {
    return <Navigate to={defaultPath} replace />;
  }

  // Mentor-only: Leader/Member không có isMentor không được vào URL mentor bằng tay
  if (isMentorOnlyPath(activePath) && user.isMentor !== true) {
    return <Navigate to={defaultPath} replace />;
  }

  return (
    <AdminLayout
      role={user.role}
      activePath={activePath}
      onNavigate={(path) => routerNavigate(path)}
    >
      {renderPortalPage(activePath)}
    </AdminLayout>
  );
}

export default AdminPortal;
