import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import LandingPage from "./pages/Landing";
import SeoHead from "./components/SeoHead";
import { getDefaultPath } from "./constants/navigation";
import { useAuth } from "./context/useAuth";

const LoginPage = lazy(() => import("./pages/Login"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPassword"));
const RecruitmentPage = lazy(() => import("./pages/Recruitment"));
const LookupPage = lazy(() => import("./pages/Lookup"));
const AboutClubPage = lazy(() => import("./pages/AboutClub"));
const DaoTaoPage = lazy(() => import("./pages/DaoTao"));
const SuKienPage = lazy(() => import("./pages/SuKien"));
const AdminPortal = lazy(() => import("./routes/AdminPortal"));

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
          <Route path="/" element={<LandingPage />} />
          <Route path="/ve-iu-club" element={<AboutClubPage />} />
          <Route path="/dao-tao" element={<DaoTaoPage />} />
          <Route path="/su-kien" element={<SuKienPage />} />
          <Route path="/tuyen-thanh-vien" element={<RecruitmentPage />} />
          <Route path="/tra-cuu" element={<LookupPage />} />
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
