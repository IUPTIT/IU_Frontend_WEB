import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/Login";
import LandingPage from "./pages/Landing";
import RecruitmentPage from "./pages/Recruitment";
import LookupPage from "./pages/Lookup";
import { getDefaultPath } from "./constants/navigation";
import { renderPortalPage } from "./routes/portalRoutes";
import ChangePasswordGate from "./components/ChangePasswordGate";
import { useAuth } from "./context/useAuth";

// Trang đăng nhập — đã đăng nhập rồi thì chuyển thẳng vào khu quản trị
function LoginRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/admin" replace />;
  return <LoginPage />;
}

// Khu quản trị: chưa đăng nhập → về /login; điều hướng nội bộ bằng activePath (PortalUi)
function AdminPortal() {
  const { user, isAuthenticated } = useAuth();
  const [activePath, setActivePath] = useState(() =>
    user ? getDefaultPath(user.role) : "/admin",
  );

  // Reset activePath khi user đổi (adjust state during render)
  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    if (user) setActivePath(getDefaultPath(user.role));
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Tài khoản sinh tự động (ứng viên) — bắt đổi mật khẩu trước khi vào portal
  if (user.requirePasswordChange) {
    return <ChangePasswordGate />;
  }

  return (
    <AdminLayout role={user.role} activePath={activePath} onNavigate={setActivePath}>
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
        {/* Khu quản trị */}
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/admin/*" element={<AdminPortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
