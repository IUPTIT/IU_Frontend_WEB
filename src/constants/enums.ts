/** Enum trạng thái theo backlog — dùng chung toàn app */

export const CAMPAIGN_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CLOSED: "closed",
} as const;

export const PASS_FAIL = {
  PASS: "pass",
  FAIL: "fail",
  PENDING: "pending",
} as const;

export const APPLICATION_STATUS = {
  SUBMITTED: "submitted",
  SCREENING: "screening",
  INTERVIEW: "interview",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

export const QUESTION_TYPE = {
  SHORT_TEXT: "short_text",
  LONG_TEXT: "long_text",
  SINGLE_CHOICE: "single_choice",
  MULTI_CHOICE: "multi_choice",
  FILE_UPLOAD: "file_upload",
  RATING: "rating",
} as const;

export const TRAINEE_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  REMOVED: "removed",
} as const;

export const TRAINING_TASK_STATUS = {
  TODO: "todo",
  SUBMITTED: "submitted",
  GRADED: "graded",
  OVERDUE: "overdue",
} as const;

export const PENALTY_ACTION = {
  FINAL_REMINDER: "final_reminder",
  REMOVE_FROM_CLUB: "remove_from_club",
} as const;
