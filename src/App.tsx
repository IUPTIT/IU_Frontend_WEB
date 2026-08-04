import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/Login";
import LandingPage from "./pages/Landing";
import RecruitmentPage from "./pages/Recruitment";
import LookupPage from "./pages/Lookup";
import { getDefaultPath } from "./constants/navigation";
import { renderPortalPage } from "./routes/portalRoutes";
import { useAuth } from "./context/AuthContext";

// Khu quản trị: gate đăng nhập, điều hướng nội bộ bằng activePath (PortalUi)
function AdminPortal() {
  const { user, isAuthenticated } = useAuth();
  const [activePath, setActivePath] = useState(() =>
    user ? getDefaultPath(user.role) : "/admin",
  );

  useEffect(() => {
    if (user) setActivePath(getDefaultPath(user.role));
  }, [user]);

  if (!isAuthenticated || !user) {
    return <LoginPage />;
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
        <Route path="/admin/*" element={<AdminPortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
