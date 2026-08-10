import type { ReactNode } from "react";
import { ROUTES } from "../constants/routes";

import AdminOverviewPage from "../pages/Admin";
import AdminRecruitmentOpenPage from "../pages/Admin/Recruitment/Open";
import AdminRecruitmentApplicationsPage from "../pages/Admin/Recruitment/Applications";
import AdminRecruitmentApplicationDetailPage from "../pages/Admin/Recruitment/Applications/Detail";
import AdminRecruitmentInterviewsPage from "../pages/Admin/Recruitment/Interviews";
import AdminInterviewSlotDetailPage from "../pages/Admin/Recruitment/Interviews/SlotDetail";
import AdminInterviewNotePage from "../pages/Admin/Recruitment/Interviews/CandidateNote";
import AdminRecruitmentResultsPage from "../pages/Admin/Recruitment/Results";
import AdminTrainingTeamsPage from "../pages/Admin/Training/Teams";
import AdminTrainingProgramsPage from "../pages/Admin/Training/Programs";
import AdminTrainingTraineesPage from "../pages/Admin/Training/Trainees";
import AdminTrainingReviewPage from "../pages/Admin/Training/Review";
import AdminSettingsPage from "../pages/Admin/Settings";
import AdminEmailPage from "../pages/Admin/Settings/Email";
import AdminHelpPage from "../pages/Admin/Help";
import AdminMembersPage from "../pages/Admin/Members";
import AdminPermissionsPage from "../pages/Admin/Permissions";
import AdminDepartmentsPage from "../pages/Admin/Departments";
import AdminDepartmentDetailPage from "../pages/Admin/Departments/Detail";

import LeaderOverviewPage from "../pages/Leader";
import LeaderMembersPage from "../pages/Leader/Members";
import LeaderRecruitmentInterviewsPage from "../pages/Leader/Recruitment/Interviews";
import LeaderTrainingGroupsPage from "../pages/Leader/Training/Groups";
import LeaderTrainingTasksPage from "../pages/Leader/Training/Tasks";
import LeaderTrainingEvaluationPage from "../pages/Leader/Training/Evaluation";
import LeaderSettingsPage from "../pages/Leader/Settings";
import LeaderHelpPage from "../pages/Leader/Help";

import CandidateInterviewPage from "../pages/Candidate/Interview";
import CandidateProfilePage from "../pages/Candidate/Profile";
import CandidateTrainingPage from "../pages/Candidate/Training";

import MemberOverviewPage from "../pages/Member";
import MemberTrainingRoadmapPage from "../pages/Member/Training/Roadmap";
import MemberTrainingTasksPage from "../pages/Member/Training/Tasks";
import MemberTrainingProgressPage from "../pages/Member/Training/Progress";
import MemberTrainingTaskDetailPage from "../pages/Member/Training/TaskDetail";
import MemberMentorRoadmapPage from "../pages/Member/MentorRoadmap";
import MemberMentorTasksPage from "../pages/Member/MentorTasks";
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
  [ROUTES.admin.departments]: <AdminDepartmentsPage />,
  [ROUTES.admin.training.trainees]: <AdminTrainingTraineesPage />,
  [ROUTES.admin.training.teams]: <AdminTrainingTeamsPage />,
  [ROUTES.admin.training.review]: <AdminTrainingReviewPage />,
  [ROUTES.admin.settings]: <AdminSettingsPage />,
  [ROUTES.admin.email]: <AdminEmailPage />,
  [ROUTES.admin.permissions]: <AdminPermissionsPage />,
  [ROUTES.admin.help]: <AdminHelpPage />,

  [ROUTES.leader.overview]: <LeaderOverviewPage />,
  [ROUTES.leader.members]: <LeaderMembersPage />,
  [ROUTES.leader.recruitment.interviews]: <LeaderRecruitmentInterviewsPage />,
  [ROUTES.leader.training.programs]: <AdminTrainingProgramsPage />,
  [ROUTES.leader.training.groups]: <LeaderTrainingGroupsPage />,
  [ROUTES.leader.training.tasks]: <LeaderTrainingTasksPage />,
  [ROUTES.leader.training.evaluation]: <LeaderTrainingEvaluationPage />,
  [ROUTES.leader.training.myRoadmap]: <MemberTrainingRoadmapPage />,
  [ROUTES.leader.training.myTasks]: <MemberTrainingTasksPage />,
  [ROUTES.leader.settings]: <LeaderSettingsPage />,
  [ROUTES.leader.help]: <LeaderHelpPage />,

  [ROUTES.candidate.interview]: <CandidateInterviewPage />,
  [ROUTES.candidate.training]: <CandidateTrainingPage />,
  [ROUTES.candidate.trainingRoadmap]: <MemberTrainingRoadmapPage />,
  [ROUTES.candidate.trainingTasks]: <MemberTrainingTasksPage />,
  [ROUTES.candidate.trainingProgress]: <MemberTrainingProgressPage />,
  [ROUTES.candidate.profile]: <CandidateProfilePage />,

  [ROUTES.member.overview]: <MemberOverviewPage />,
  [ROUTES.member.recruitment.interviews]: <LeaderRecruitmentInterviewsPage />,
  [ROUTES.member.mentorRoadmap]: <MemberMentorRoadmapPage />,
  [ROUTES.member.mentorTasks]: <MemberMentorTasksPage />,
  [ROUTES.member.training.roadmap]: <MemberTrainingRoadmapPage />,
  [ROUTES.member.training.tasks]: <MemberTrainingTasksPage />,
  [ROUTES.member.training.progress]: <MemberTrainingProgressPage />,
  [ROUTES.member.settings]: <MemberSettingsPage />,
  [ROUTES.member.help]: <MemberHelpPage />,
};

const APPLICATION_DETAIL_RE = /^\/admin\/recruitment\/applications\/([^/]+)$/;
const DEPARTMENT_DETAIL_RE = /^\/admin\/departments\/([^/]+)$/;
const INTERVIEW_SLOT_RE =
  /^\/(?:admin|leader|member)\/recruitment\/interviews\/slots\/([^/]+)$/;
const INTERVIEW_NOTE_RE =
  /^\/(?:admin|leader|member)\/recruitment\/interviews\/notes\/([^/]+)$/;
const TRAINING_TASK_DETAIL_RE =
  /^\/(candidate|member)\/training\/tasks\/([^/]+)$|^\/leader\/training\/my-tasks\/([^/]+)$/;

export function renderPortalPage(path: string): ReactNode {
  const detailMatch = path.match(APPLICATION_DETAIL_RE);
  if (detailMatch) {
    return (
      <AdminRecruitmentApplicationDetailPage applicationId={detailMatch[1]} />
    );
  }
  const deptMatch = path.match(DEPARTMENT_DETAIL_RE);
  if (deptMatch) {
    return <AdminDepartmentDetailPage departmentId={deptMatch[1]} />;
  }
  const slotMatch = path.match(INTERVIEW_SLOT_RE);
  if (slotMatch) {
    return <AdminInterviewSlotDetailPage slotId={slotMatch[1]} />;
  }
  const noteMatch = path.match(INTERVIEW_NOTE_RE);
  if (noteMatch) {
    return <AdminInterviewNotePage bookingId={noteMatch[1]} />;
  }
  const taskDetailMatch = path.match(TRAINING_TASK_DETAIL_RE);
  if (taskDetailMatch) {
    const scope = taskDetailMatch[1] ?? "leader";
    const taskId = taskDetailMatch[2] ?? taskDetailMatch[3];
    const tasksBasePath =
      scope === "candidate"
        ? ROUTES.candidate.trainingTasks
        : scope === "member"
          ? ROUTES.member.training.tasks
          : ROUTES.leader.training.myTasks;
    return (
      <MemberTrainingTaskDetailPage
        taskId={taskId}
        tasksBasePath={tasksBasePath}
      />
    );
  }

  return (
    PAGE_MAP[path] ?? (
      <section>
        <h1 className="font-display text-2xl font-bold">
          Không tìm thấy trang
        </h1>
        <p className="text-muted mt-2">Path: {path}</p>
      </section>
    )
  );
}
