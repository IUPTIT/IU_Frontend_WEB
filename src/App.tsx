import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/Login";
import LandingPage from "./pages/Landing";
import RecruitmentPage from "./pages/Recruitment";
import LookupPage from "./pages/Lookup";
import { getDefaultPath } from "./constants/navigation";
import { renderPortalPage } from "./routes/portalRoutes";
import { useAuth } from "./context/useAuth";
import ChangePasswordGate from "./components/ChangePasswordGate";
import type { Role } from "./types/navigation";

// Prefix URL theo role — dùng để chặn truy cập chéo portal
const ROLE_PREFIX: Record<Role, string> = {
  admin: "/admin",
  leader: "/leader",
  member: "/member",
  candidate: "/candidate",
};

// Trang đăng nhập — đã đăng nhập rồi thì chuyển thẳng vào portal đúng role
function LoginRoute() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) return <Navigate to={getDefaultPath(user.role)} replace />;
  return <LoginPage />;
}

// Khu quản trị: URL thật là nguồn điều hướng — mỗi trang con có route phụ riêng
// (VD /admin/recruitment/interviews), reload/share link đều giữ đúng trang.
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Khu công khai (landing) — sau này tách domain riêng */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/tuyen-thanh-vien" element={<RecruitmentPage />} />
        <Route path="/tra-cuu" element={<LookupPage />} />
        {/* Khu quản trị — mọi role dùng chung portal, URL phản ánh trang con */}
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/admin/*" element={<AdminPortal />} />
        <Route path="/leader/*" element={<AdminPortal />} />
        <Route path="/member/*" element={<AdminPortal />} />
        <Route path="/candidate/*" element={<AdminPortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
