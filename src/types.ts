import { z } from "zod";

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
  state: z.enum(["open", "closed"]).optional().describe("PR state"),
});

// Types
export type PRParams = z.infer<typeof PRParamsSchema>;
export type SubmitReviewParams = z.infer<typeof SubmitReviewSchema>;
export type AddCommentParams = z.infer<typeof AddCommentSchema>;
export type UpdatePRParams = z.infer<typeof UpdatePRSchema>;

export interface Review {
  id: number;
  state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "PENDING";
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
  status: "added" | "modified" | "deleted";
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
