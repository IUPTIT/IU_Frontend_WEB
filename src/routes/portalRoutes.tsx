import type { ReactNode } from "react";
import { ROUTES } from "../constants/routes";

import AdminOverviewPage from "../pages/Admin";
import AdminRecruitmentOpenPage from "../pages/Admin/Recruitment/Open";
import AdminRecruitmentApplicationsPage from "../pages/Admin/Recruitment/Applications";
import AdminRecruitmentApplicationDetailPage from "../pages/Admin/Recruitment/Applications/Detail";
import AdminRecruitmentInterviewsPage from "../pages/Admin/Recruitment/Interviews";
import AdminRecruitmentResultsPage from "../pages/Admin/Recruitment/Results";
import AdminMembersPage from "../pages/Admin/Members";
import AdminTrainingRoadmapPage from "../pages/Admin/Training/Roadmap";
import AdminTrainingTeamsPage from "../pages/Admin/Training/Teams";
import AdminTrainingReviewPage from "../pages/Admin/Training/Review";
import AdminSettingsPage from "../pages/Admin/Settings";
import AdminEmailConfigPage from "../pages/Admin/Settings/Email";
import AdminPermissionsPage from "../pages/Admin/Permissions";
import AdminHelpPage from "../pages/Admin/Help";

import LeaderOverviewPage from "../pages/Leader";
import LeaderTrainingGroupsPage from "../pages/Leader/Training/Groups";
import LeaderTrainingTasksPage from "../pages/Leader/Training/Tasks";
import LeaderTrainingEvaluationPage from "../pages/Leader/Training/Evaluation";
import LeaderSettingsPage from "../pages/Leader/Settings";
import LeaderHelpPage from "../pages/Leader/Help";

import CandidateInterviewPage from "../pages/Candidate/Interview";
import CandidateProfilePage from "../pages/Candidate/Profile";

import MemberOverviewPage from "../pages/Member";
import MemberTrainingRoadmapPage from "../pages/Member/Training/Roadmap";
import MemberTrainingTasksPage from "../pages/Member/Training/Tasks";
import MemberTrainingProgressPage from "../pages/Member/Training/Progress";
import MemberSettingsPage from "../pages/Member/Settings";
import MemberHelpPage from "../pages/Member/Help";

/** Map path → page component theo menu 3 role */
const PAGE_MAP: Record<string, ReactNode> = {
  [ROUTES.admin.overview]: <AdminOverviewPage />,
  [ROUTES.admin.recruitment.open]: <AdminRecruitmentOpenPage />,
  [ROUTES.admin.recruitment.applications]: <AdminRecruitmentApplicationsPage />,
  [ROUTES.admin.recruitment.interviews]: <AdminRecruitmentInterviewsPage />,
  [ROUTES.admin.recruitment.results]: <AdminRecruitmentResultsPage />,
  [ROUTES.admin.members]: <AdminMembersPage />,
  [ROUTES.admin.training.roadmap]: <AdminTrainingRoadmapPage />,
  [ROUTES.admin.training.teams]: <AdminTrainingTeamsPage />,
  [ROUTES.admin.training.review]: <AdminTrainingReviewPage />,
  [ROUTES.admin.settings]: <AdminSettingsPage />,
  [ROUTES.admin.email]: <AdminEmailConfigPage />,
  [ROUTES.admin.permissions]: <AdminPermissionsPage />,
  [ROUTES.admin.help]: <AdminHelpPage />,

  [ROUTES.leader.overview]: <LeaderOverviewPage />,
  [ROUTES.leader.training.groups]: <LeaderTrainingGroupsPage />,
  [ROUTES.leader.training.tasks]: <LeaderTrainingTasksPage />,
  [ROUTES.leader.training.evaluation]: <LeaderTrainingEvaluationPage />,
  [ROUTES.leader.settings]: <LeaderSettingsPage />,
  [ROUTES.leader.help]: <LeaderHelpPage />,

  [ROUTES.candidate.interview]: <CandidateInterviewPage />,
  [ROUTES.candidate.profile]: <CandidateProfilePage />,

  [ROUTES.member.overview]: <MemberOverviewPage />,
  [ROUTES.member.training.roadmap]: <MemberTrainingRoadmapPage />,
  [ROUTES.member.training.tasks]: <MemberTrainingTasksPage />,
  [ROUTES.member.training.progress]: <MemberTrainingProgressPage />,
  [ROUTES.member.settings]: <MemberSettingsPage />,
  [ROUTES.member.help]: <MemberHelpPage />,
};

const APPLICATION_DETAIL_RE = /^\/admin\/recruitment\/applications\/([^/]+)$/;

export function renderPortalPage(path: string): ReactNode {
  const detailMatch = path.match(APPLICATION_DETAIL_RE);
  if (detailMatch) {
    return <AdminRecruitmentApplicationDetailPage applicationId={detailMatch[1]} />;
  }

  return (
    PAGE_MAP[path] ?? (
      <section>
        <h1 className="font-display text-2xl font-bold">Không tìm thấy trang</h1>
        <p className="text-muted mt-2">Path: {path}</p>
      </section>
    )
  );
}
