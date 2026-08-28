import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/Landing";
import SeoHead from "./components/SeoHead";
import { getDefaultPath } from "./constants/navigation";
import { useAuth } from "./context/useAuth";

// Code-split: landing eager (vào trang chủ hiện ngay), phần còn lại tải khi cần —
// đặc biệt AdminPortal (khu quản trị, nặng nhất) không đè lên khách vãng lai.
const AdminPortal = lazy(() => import("./routes/PortalApp"));
const LoginPage = lazy(() => import("./pages/Login"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPassword"));
const RecruitmentPage = lazy(() => import("./pages/Recruitment"));
const LookupPage = lazy(() => import("./pages/Lookup"));
const AboutClubPage = lazy(() => import("./pages/AboutClub"));
const DaoTaoPage = lazy(() => import("./pages/DaoTao"));
const SuKienPage = lazy(() => import("./pages/SuKien"));
const MentorDetailPage = lazy(() => import("./pages/MentorDetail"));

function PageFallback() {
  return <div className="min-h-svh bg-[#05050c]" role="status" aria-label="Đang tải trang" />;
}

function LoginRoute() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) return <Navigate to={getDefaultPath(user.role)} replace />;
  return <LoginPage />;
}

function App() {
  return (
    <BrowserRouter>
      <SeoHead />
      <a className="skip-link" href="#main">
        Bỏ qua điều hướng
      </a>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Khu công khai (landing) — sau này tách domain riêng */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/ve-iu-club" element={<AboutClubPage />} />
          <Route path="/dao-tao" element={<DaoTaoPage />} />
          <Route path="/su-kien" element={<SuKienPage />} />
          <Route path="/co-van/ts-phan-ly-huynh" element={<MentorDetailPage />} />
          <Route path="/giang-vien/phan-ly-huynh" element={<MentorDetailPage />} />
          <Route path="/tuyen-thanh-vien" element={<RecruitmentPage />} />
          <Route path="/tra-cuu" element={<LookupPage />} />
          <Route path="/lookup" element={<Navigate to="/tra-cuu" replace />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          {/* Khu quản trị — mọi role dùng chung portal, URL phản ánh trang con */}
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
