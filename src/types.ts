import { z } from "zod";

// Constants and Enums
export const DEFAULT_AUTHOR = "unknown";

export enum DiffSide {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

export enum ReviewState {
  APPROVED = "APPROVED",
  CHANGES_REQUESTED = "CHANGES_REQUESTED",
  COMMENTED = "COMMENTED",
  PENDING = "PENDING",
}

export enum FileStatus {
  ADDED = "added",
  MODIFIED = "modified",
  DELETED = "deleted",
  RENAMED = "renamed",
}

export enum PRState {
  OPEN = "open",
  CLOSED = "closed",
}

// Zod schemas for validation
export const PRParamsSchema = z.object({
  owner: z.string().describe("Repository owner/organization"),
  repo: z.string().describe("Repository name"),
  prNumber: z.number().describe("Pull request number"),
});

export const SubmitReviewSchema = PRParamsSchema.extend({
  body: z.string().describe("Review comment body"),
  event: z
    .enum(["APPROVE", "REQUEST_CHANGES", "COMMENT"])
    .describe("Review action"),
  comments: z
    .array(
      z.object({
        path: z.string(),
        line: z.number(),
        body: z.string(),
      })
    )
    .optional()
    .describe("Inline comments on specific lines"),
});

export const AddCommentSchema = PRParamsSchema.extend({
  body: z.string().describe("Comment body"),
  path: z.string().optional().describe("File path for line comment"),
  line: z.number().optional().describe("Line number for line comment"),
  commit_id: z.string().optional().describe("SHA of the commit to comment on"),
  in_reply_to: z.number().optional().describe("ID of comment to reply to"),
});

export const UpdatePRSchema = PRParamsSchema.extend({
  title: z.string().optional().describe("New PR title"),
  body: z.string().optional().describe("New PR description"),
  state: z.nativeEnum(PRState).optional().describe("PR state"),
});

export const ValidateCommentTargetSchema = PRParamsSchema.extend({
  path: z.string().describe("File path in the PR"),
  line: z.number().describe("Line number to validate"),
  side: z
    .nativeEnum(DiffSide)
    .optional()
    .describe("Side of the diff (LEFT for old, RIGHT for new)"),
});

export const EnsurePendingReviewSchema = PRParamsSchema.extend({
  body: z
    .string()
    .optional()
    .describe("Optional body text for the pending review"),
});

export const ReviewPRWithPromptSchema = PRParamsSchema.extend({
  customPrompt: z
    .string()
    .optional()
    .describe(
      "Optional custom review prompt. If not provided, uses default PR review guidelines."
    ),
});

// Types
export type PRParams = z.infer<typeof PRParamsSchema>;
export type SubmitReviewParams = z.infer<typeof SubmitReviewSchema>;
export type AddCommentParams = z.infer<typeof AddCommentSchema>;
export type UpdatePRParams = z.infer<typeof UpdatePRSchema>;
export type ValidateCommentTargetParams = z.infer<
  typeof ValidateCommentTargetSchema
>;
export type EnsurePendingReviewParams = z.infer<
  typeof EnsurePendingReviewSchema
>;
export type ReviewPRWithPromptParams = z.infer<typeof ReviewPRWithPromptSchema>;

export interface Review {
  id: number;
  state: ReviewState;
  body: string;
  author: string;
  submittedAt: string;
  comments: ReviewComment[];
}

export interface ReviewComment {
  id: number;
  body: string;
  path?: string;
  line?: number;
  author: string;
  createdAt: string;
}

export interface CodeFile {
  filename: string;
  status: FileStatus;
  additions: number;
  deletions: number;
  patch?: string;
}

export interface CodeIssue {
  type: "error" | "warning" | "suggestion" | "security";
  severity: "high" | "medium" | "low";
  file: string;
  line?: number;
  message: string;
  suggestion?: string;
}

export interface AnalysisResult {
  summary: {
    totalFiles: number;
    totalAdditions: number;
    totalDeletions: number;
    issuesFound: number;
    securityIssues: number;
  };
  issues: CodeIssue[];
  suggestions: string[];
  assessment: "approved" | "needs-work" | "requires-changes";
}

// Diff-related interfaces
export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[];
}

export interface FileDiffInfo {
  filename: string;
  status: FileStatus;
  additions: number;
  deletions: number;
  patch?: string;
  hunks: DiffHunk[];
}

export interface CommentTargetValidation {
  valid: boolean;
  reason?: string;
  nearestValidLine?: {
    line: number;
    side: DiffSide;
  };
  position?: number;
}

export interface PendingReview {
  id: number;
  state: ReviewState.PENDING;
  commitId: string;
  body: string;
  user: string;
}

export interface PendingReviewComment {
  id: number;
  path: string;
  line: number | null;
  side: DiffSide | null;
  body: string;
  commitId: string;
  createdAt: string;
  user: string;
}

export interface PRDetails {
  title: string;
  body: string | null;
  state: string;
  author: string | undefined;
  created_at: string;
  updated_at: string;
  mergeable: boolean | null;
  merged: boolean;
  additions: number;
  deletions: number;
  changed_files: number;
  head_sha: string;
}
