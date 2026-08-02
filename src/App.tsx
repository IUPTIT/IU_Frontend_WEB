import AdminLayout from "./layouts/AdminLayout";
import AdminPage from "./pages/Admin";

function App() {
  return (
    <AdminLayout role="admin">
      <AdminPage />
    </AdminLayout>
  );
}

export default App;
