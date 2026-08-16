import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import ChangePasswordGate from "../components/ChangePasswordGate";
import { getDefaultPath } from "../constants/navigation";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../context/useAuth";
import { renderPortalPage } from "./portalRoutes";
import type { Role } from "../types/navigation";

const ROLE_PREFIX: Record<Role, string> = {
  admin: "/admin",
  leader: "/leader",
  member: "/member",
  candidate: "/candidate",
};

function isMentorOnlyPath(path: string): boolean {
  const mentorPaths = [
    ROUTES.leader.training.programs,
    ROUTES.leader.training.groups,
    ROUTES.leader.training.tasks,
    ROUTES.leader.training.evaluation,
    ROUTES.member.mentorRoadmap,
    ROUTES.member.mentorTasks,
  ];
  return mentorPaths.some((p) => path === p || path.startsWith(`${p}/`));
}

export default function AdminPortal() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const routerNavigate = useNavigate();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.requirePasswordChange) {
    return <ChangePasswordGate />;
  }

  const prefix = ROLE_PREFIX[user.role];
  const activePath = location.pathname.replace(/\/+$/, "") || location.pathname;
  const defaultPath = getDefaultPath(user.role);

  if (!activePath.startsWith(prefix) || (activePath === prefix && defaultPath !== prefix)) {
    return <Navigate to={defaultPath} replace />;
  }

  if (isMentorOnlyPath(activePath) && user.isMentor !== true) {
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
