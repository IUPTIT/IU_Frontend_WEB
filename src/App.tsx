import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import AdminPage from "./pages/Admin";
import LandingPage from "./pages/Landing";
import RecruitmentPage from "./pages/Recruitment";
import LookupPage from "./pages/Lookup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tuyen-thanh-vien" element={<RecruitmentPage />} />
        <Route path="/tra-cuu" element={<LookupPage />} />
        <Route
          path="/admin"
          element={
            <AdminLayout role="admin">
              <AdminPage />
            </AdminLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
