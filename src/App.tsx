import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/Landing";
import { getDefaultPath } from "./constants/navigation";
import { useAuth } from "./context/useAuth";

// Code-split: landing eager (vào trang chủ hiện ngay), phần còn lại tải khi cần —
// đặc biệt AdminPortal (khu quản trị, nặng nhất) không đè lên khách vãng lai.
const AdminPortal = lazy(() => import("./routes/PortalApp"));
const LoginPage = lazy(() => import("./pages/Login"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPassword"));
const RecruitmentPage = lazy(() => import("./pages/Recruitment"));
const LookupPage = lazy(() => import("./pages/Lookup"));
const ComingSoonPage = lazy(() => import("./pages/ComingSoon"));

// Trang đăng nhập — đã đăng nhập rồi thì chuyển thẳng vào portal đúng role
function LoginRoute() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) return <Navigate to={getDefaultPath(user.role)} replace />;
  return <LoginPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
        <Routes>
          {/* Khu công khai (landing) — sau này tách domain riêng */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/tuyen-thanh-vien" element={<RecruitmentPage />} />
          <Route path="/tra-cuu" element={<LookupPage />} />
          <Route
            path="/tin-tuc"
            element={
              <ComingSoonPage
                title="Tin tức"
                metaTitle="Tin tức | IU Club — IU PTIT"
                metaDescription="Tin tức và hoạt động mới nhất của IU Club (IUPTIT) — câu lạc bộ CNTT định hướng ứng dụng."
                path="/tin-tuc"
              />
            }
          />
          <Route
            path="/su-kien"
            element={
              <ComingSoonPage
                title="Sự kiện"
                metaTitle="Sự kiện | IU Club — IU PTIT"
                metaDescription="Các sự kiện sắp diễn ra của IU Club (IUPTIT) — workshop, talkshow và hoạt động dành cho sinh viên."
                path="/su-kien"
              />
            }
          />
          {/* Khu quản trị — mọi role dùng chung portal, URL phản ánh trang con */}
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin/*" element={<AdminPortal />} />
          <Route path="/leader/*" element={<AdminPortal />} />
          <Route path="/member/*" element={<AdminPortal />} />
          <Route path="/candidate/*" element={<AdminPortal />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
