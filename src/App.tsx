import { useEffect, useState } from "react";
import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/Login";
import { getDefaultPath } from "./constants/navigation";
import { renderPortalPage } from "./routes/portalRoutes";
import { useAuth } from "./context/AuthContext";

function App() {
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

export default App;
