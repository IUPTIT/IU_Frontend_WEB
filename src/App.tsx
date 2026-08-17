<<<<<<< HEAD
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/Landing";
import { getDefaultPath } from "./constants/navigation";
import { useAuth } from "./context/useAuth";

// Code-split: landing eager (vào trang chủ hiện ngay), phần còn lại tải khi cần —
// đặc biệt AdminPortal (khu quản trị, nặng nhất) không đè lên khách vãng lai.
const AdminPortal = lazy(() => import("./routes/PortalApp"));
=======
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import LandingPage from "./pages/Landing";
import SeoHead from "./components/SeoHead";
import { getDefaultPath } from "./constants/navigation";
import { useAuth } from "./context/useAuth";

>>>>>>> 75e632fc91b6e6020967105ffc0c842c74b0d58d
const LoginPage = lazy(() => import("./pages/Login"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPassword"));
const RecruitmentPage = lazy(() => import("./pages/Recruitment"));
const LookupPage = lazy(() => import("./pages/Lookup"));
<<<<<<< HEAD
const ComingSoonPage = lazy(() => import("./pages/ComingSoon"));
=======
const AboutClubPage = lazy(() => import("./pages/AboutClub"));
const DaoTaoPage = lazy(() => import("./pages/DaoTao"));
const SuKienPage = lazy(() => import("./pages/SuKien"));
const AdminPortal = lazy(() => import("./routes/AdminPortal"));

function PageFallback() {
  return <div className="min-h-svh bg-[#05050c]" role="status" aria-label="Đang tải trang" />;
}
>>>>>>> 75e632fc91b6e6020967105ffc0c842c74b0d58d

function LoginRoute() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) return <Navigate to={getDefaultPath(user.role)} replace />;
  return <LoginPage />;
}

function App() {
  return (
    <BrowserRouter>
<<<<<<< HEAD
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
=======
      <SeoHead />
      <a className="skip-link" href="#main">
        Bỏ qua điều hướng
      </a>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/ve-iu-club" element={<AboutClubPage />} />
          <Route path="/dao-tao" element={<DaoTaoPage />} />
          <Route path="/su-kien" element={<SuKienPage />} />
          <Route path="/tuyen-thanh-vien" element={<RecruitmentPage />} />
          <Route path="/tra-cuu" element={<LookupPage />} />
>>>>>>> 75e632fc91b6e6020967105ffc0c842c74b0d58d
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
