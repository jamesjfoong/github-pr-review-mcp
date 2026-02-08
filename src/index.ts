#!/usr/bin/env node
import dotenv from "dotenv";
import { FastMCP } from "fastmcp";
import { z } from "zod";
import { CodeAnalyzer } from "./code-analyzer.js";
import { GitHubService } from "./github-service.js";
import { logger, withLogging } from "./logger.js";
import { sanitizeBody, sanitizePRParams } from "./sanitizer.js";
import type {
  AddCommentParams,
  EnsurePendingReviewParams,
  GetPRContextParams,
  GetPRFeedbackParams,
  PRParams,
  RespondToFeedbackParams,
  ReviewPRWithPromptParams,
  SubmitReviewParams,
  UpdatePRParams,
  ValidateCommentTargetParams,
} from "./types.js";
import {
  AddCommentSchema,
  ContextInclude,
  EnsurePendingReviewSchema,
  FeedbackType,
  GetPRContextSchema,
  GetPRFeedbackSchema,
  PRParamsSchema,
  RespondToFeedbackSchema,
  ReviewPRWithPromptSchema,
  SubmitReviewSchema,
  UpdatePRSchema,
  ValidateCommentTargetSchema,
} from "./types.js";
import {
  generateDocumentationReviewPrompt,
  generateImprovementSuggestionsPrompt,
  generatePerformanceReviewPrompt,
  generateSecurityReviewPrompt,
} from "./prompts/index.js";
import type {
  DocumentationType,
  PerformanceFocusArea,
  SecuritySeverityLevel,
  SuggestionLevel,
} from "./prompts/index.js";
import { formatFilesForReview, generateReviewPrompt } from "./review-prompt.js";

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error("❌ GITHUB_TOKEN environment variable is required");
  process.exit(1);
}

// Initialize GitHub service
const githubService = new GitHubService(GITHUB_TOKEN);

// Server start time for uptime calculation
const serverStartTime = Date.now();

// Initialize MCP server
const server = new FastMCP({
  name: "GitHub PR Review",
  version: "1.0.0",
});

// Initialize code analyzer (requires server for MCP sampling)
const codeAnalyzer = new CodeAnalyzer(server);

// Tool: Health Check
server.addTool({
  name: "health_check",
  description: "Check server health and readiness status",
  parameters: z.object({}),
  execute: async () => {
    const uptime = Math.floor((Date.now() - serverStartTime) / 1000);
    const metrics = logger.getMetrics();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "healthy",
              uptime: `${uptime}s`,
              version: "1.0.0",
              services: {
                github: "connected",
                analyzer: "ready",
              },
              metrics: {
                toolCalls: metrics,
              },
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
    };
  },
});

// Tool: Get PR Reviews
server.addTool({
  name: "get_pr_reviews",
  description: "Get all reviews for a GitHub pull request",
  parameters: PRParamsSchema,
  execute: async (params: PRParams) => {
    const reviews = await githubService.getPRReviews(params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(reviews, null, 2),
        },
      ],
    };
  },
});

// Tool: Get PR Comments
server.addTool({
  name: "get_pr_comments",
  description: "Get all comments on a GitHub pull request",
  parameters: PRParamsSchema,
  execute: async (params: PRParams) => {
    const comments = await githubService.getPRComments(params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(comments, null, 2),
        },
      ],
    };
  },
});

// Tool: Analyze PR Code (AI-powered via MCP sampling)
server.addTool({
  name: "analyze_pr_code",
  description:
    "Analyze code changes in a PR using AI for security, performance, and quality issues",
  parameters: PRParamsSchema,
  execute: async (params: PRParams) => {
    // Fetch files and PR details for context
    const [files, prDetails] = await Promise.all([
      githubService.getPRFiles(params),
      githubService.getPRDetails(params),
    ]);

    // Run AI-powered analysis
    const analysis = await codeAnalyzer.analyze(
      files,
      prDetails.title,
      prDetails.body ?? undefined
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(analysis, null, 2),
        },
      ],
    };
  },
});

// Tool: Get PR Files
server.addTool({
  name: "get_pr_files",
  description: "Get list of files changed in a pull request",
  parameters: PRParamsSchema,
  execute: async (params: PRParams) => {
    const files = await githubService.getPRFiles(params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(files, null, 2),
        },
      ],
    };
  },
});

// Tool: Submit PR Review (with audit logging)
server.addTool({
  name: "submit_pr_review",
  description: "Submit a review to a pull request",
  parameters: SubmitReviewSchema,
  execute: async (params: SubmitReviewParams) => {
    return withLogging("submit_pr_review", "submit", params, async () => {
      const sanitized = sanitizePRParams(params);
      const bodyResult = sanitizeBody(params.body);

      if (sanitized.warnings.length > 0 || bodyResult.warnings.length > 0) {
        logger.warn("submit_pr_review", "Input sanitization warnings", {
          warnings: [...sanitized.warnings, ...bodyResult.warnings],
        });
      }

      // Audit log for state-changing operation
      logger.logAudit("submit_pr_review", "create", "review", params, {
        metadata: {
          event: params.event,
          commentCount: params.comments?.length,
        },
      });

      await githubService.submitReview({
        ...params,
        owner: sanitized.owner,
        repo: sanitized.repo,
        prNumber: sanitized.prNumber,
        body: bodyResult.sanitized,
      });

      return {
        content: [
          {
            type: "text",
            text: "✅ Review submitted successfully",
          },
        ],
      };
    });
  },
});

// Tool: Add Comment to PR (with audit logging)
server.addTool({
  name: "add_pr_comment",
  description: "Add a comment to a PR (general or line-specific)",
  parameters: AddCommentSchema,
  execute: async (params: AddCommentParams) => {
    return withLogging("add_pr_comment", "create", params, async () => {
      const sanitized = sanitizePRParams(params);
      const bodyResult = sanitizeBody(params.body);

      if (sanitized.warnings.length > 0 || bodyResult.warnings.length > 0) {
        logger.warn("add_pr_comment", "Input sanitization warnings", {
          warnings: [...sanitized.warnings, ...bodyResult.warnings],
        });
      }

      const commentType =
        params.path && params.line ? "line-specific" : "general";

      // Audit log for state-changing operation
      logger.logAudit("add_pr_comment", "create", "comment", params, {
        metadata: { commentType, path: params.path, line: params.line },
      });

      await githubService.addComment({
        ...params,
        owner: sanitized.owner,
        repo: sanitized.repo,
        prNumber: sanitized.prNumber,
        body: bodyResult.sanitized,
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ ${commentType} comment added successfully`,
          },
        ],
      };
    });
  },
});

// Tool: Update PR (with audit logging)
server.addTool({
  name: "update_pr",
  description: "Update PR title, description, or state",
  parameters: UpdatePRSchema,
  execute: async (params: UpdatePRParams) => {
    return withLogging("update_pr", "update", params, async () => {
      const sanitized = sanitizePRParams(params);
      const changes: Record<string, unknown> = {};

      if (params.title) changes.title = params.title;
      if (params.body) {
        const bodyResult = sanitizeBody(params.body);
        changes.body = bodyResult.sanitized;
        if (bodyResult.warnings.length > 0) {
          logger.warn("update_pr", "Body sanitization warnings", {
            warnings: bodyResult.warnings,
          });
        }
      }
      if (params.state) changes.state = params.state;

      // Audit log for state-changing operation
      logger.logAudit("update_pr", "update", "pull_request", params, {
        resourceId: params.prNumber,
        changes,
      });

      await githubService.updatePR({
        ...params,
        owner: sanitized.owner,
        repo: sanitized.repo,
        prNumber: sanitized.prNumber,
        body: changes.body as string | undefined,
      });

      return {
        content: [
          {
            type: "text",
            text: "✅ PR updated successfully",
          },
        ],
      };
    });
  },
});

// Tool: Get PR Details
server.addTool({
  name: "get_pr_details",
  description: "Get detailed information about a pull request",
  parameters: PRParamsSchema,
  execute: async (params: PRParams) => {
    const details = await githubService.getPRDetails(params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(details, null, 2),
        },
      ],
    };
  },
});

// Tool: Get PR Diff Hunks
server.addTool({
  name: "get_pr_diff_hunks",
  description:
    "Get diff hunks with line mapping for all changed files in a PR. Returns per-file hunks with oldStart/oldLines, newStart/newLines, and patch content for accurate inline comment placement.",
  parameters: PRParamsSchema,
  execute: async (params: PRParams) => {
    const diffHunks = await githubService.getPRDiffHunks(params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(diffHunks, null, 2),
        },
      ],
    };
  },
});

// Tool: Validate PR Comment Target
server.addTool({
  name: "validate_pr_comment_target",
  description:
    "Validate if a comment target (path, line, side) is valid for the PR diff. Returns validation status, reason for invalidity, and nearest valid line suggestion if applicable.",
  parameters: ValidateCommentTargetSchema,
  execute: async (params: ValidateCommentTargetParams) => {
    const validation = await githubService.validatePRCommentTarget(params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(validation, null, 2),
        },
      ],
    };
  },
});

// Tool: Ensure Pending Review
server.addTool({
  name: "ensure_pending_review",
  description:
    "Ensure a pending review exists for the PR. Creates a new pending review if none exists, or returns the existing one. Returns reviewId and commitId for adding inline comments.",
  parameters: EnsurePendingReviewSchema,
  execute: async (params: EnsurePendingReviewParams) => {
    const review = await githubService.ensurePendingReview(params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(review, null, 2),
        },
      ],
    };
  },
});

// Tool: Get Pending Review
server.addTool({
  name: "get_pending_review",
  description:
    "Get the current pending review for the PR (if any). Returns null if no pending review exists.",
  parameters: PRParamsSchema,
  execute: async (params: PRParams) => {
    const review = await githubService.getPendingReview(params);
    return {
      content: [
        {
          type: "text",
          text: review
            ? JSON.stringify(review, null, 2)
            : "No pending review found",
        },
      ],
    };
  },
});

// Tool: List Pending Review Comments
server.addTool({
  name: "list_pending_review_comments",
  description:
    "List all draft comments in the pending review for the PR. Returns empty array if no pending review exists. Each comment includes path, line, side, body, and metadata.",
  parameters: PRParamsSchema,
  execute: async (params: PRParams) => {
    const comments = await githubService.listPendingReviewComments(params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(comments, null, 2),
        },
      ],
    };
  },
});

// Tool: Review PR with Prompt
server.addTool({
  name: "review_pr_with_prompt",
  description:
    "Get PR context and review prompt for AI-powered code review. Returns formatted PR data and review guidelines that can be used with an LLM to generate a comprehensive review. The LLM can then use submit_pr_review to submit the review.",
  parameters: ReviewPRWithPromptSchema,
  execute: async (params: ReviewPRWithPromptParams) => {
    const [prDetails, files] = await Promise.all([
      githubService.getPRDetails(params),
      githubService.getPRFiles(params),
    ]);

    const reviewPrompt = generateReviewPrompt(
      prDetails,
      files,
      params.customPrompt
    );
    const formattedFiles = formatFilesForReview(files);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              reviewPrompt,
              prContext: {
                title: prDetails.title,
                author: prDetails.author,
                state: prDetails.state,
                additions: prDetails.additions,
                deletions: prDetails.deletions,
                changedFiles: prDetails.changed_files,
                description: prDetails.body,
              },
              codeChanges: formattedFiles,
              nextSteps: [
                "Use the reviewPrompt with your LLM to generate a review",
                "Format the LLM response into review comments",
                "Use submit_pr_review to submit the review",
                "Or use ensure_pending_review and add_pr_comment for draft reviews",
              ],
            },
            null,
            2
          ),
        },
      ],
    };
  },
});

// Consolidated Tool: Get PR Feedback (reviews + comments)
server.addTool({
  name: "get_pr_feedback",
  description:
    "Get PR feedback including reviews and/or comments. Use 'type' to filter: 'reviews' (formal reviews only), 'comments' (general comments only), or 'all' (both). Returns summary with approval counts.",
  parameters: GetPRFeedbackSchema,
  execute: async (params: GetPRFeedbackParams) => {
    return withLogging("get_pr_feedback", "fetch", params, async () => {
      const sanitized = sanitizePRParams(params);
      if (sanitized.warnings.length > 0) {
        logger.warn("get_pr_feedback", "Input sanitization warnings", {
          warnings: sanitized.warnings,
        });
      }

      const feedback = await githubService.getPRFeedback({
        ...sanitized,
        type: params.type ?? FeedbackType.ALL,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(feedback, null, 2),
          },
        ],
      };
    });
  },
});

// Consolidated Tool: Get PR Context (details + files)
server.addTool({
  name: "get_pr_context",
  description:
    "Get PR context including details and/or files. Use 'include' to filter: 'details' (PR metadata only), 'files' (changed files only), or 'all' (both). Returns summary with change statistics.",
  parameters: GetPRContextSchema,
  execute: async (params: GetPRContextParams) => {
    return withLogging("get_pr_context", "fetch", params, async () => {
      const sanitized = sanitizePRParams(params);
      if (sanitized.warnings.length > 0) {
        logger.warn("get_pr_context", "Input sanitization warnings", {
          warnings: sanitized.warnings,
        });
      }

      const context = await githubService.getPRContext({
        ...sanitized,
        include: params.include ?? ContextInclude.ALL,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(context, null, 2),
          },
        ],
      };
    });
  },
});

// Consolidated Tool: Respond to Feedback (reply to comments)
server.addTool({
  name: "respond_to_feedback",
  description:
    "Reply to multiple PR review comments with a status update (e.g., 'Fixed in <commit_sha>'). Useful for batch resolving feedback after pushing changes.",
  parameters: RespondToFeedbackSchema,
  execute: async (params: RespondToFeedbackParams) => {
    return withLogging("respond_to_feedback", "create", params, async () => {
      const sanitized = sanitizePRParams(params);

      // Audit log for state-changing operation
      logger.logAudit(
        "respond_to_feedback",
        "create",
        "comment_reply",
        params,
        {
          metadata: {
            commentCount: params.commentIds.length,
            commitId: params.commitId,
          },
        }
      );

      await githubService.respondToFeedback({
        ...params,
        ...sanitized,
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ Replied to ${params.commentIds.length} comments`,
          },
        ],
      };
    });
  },
});

// ============================================================
// MCP RESOURCES - Read-only context data for LLMs
// ============================================================

// Resource: PR Metadata
server.addResourceTemplate({
  uriTemplate: "pr://{owner}/{repo}/{prNumber}",
  name: "PR Metadata",
  description:
    "Pull request details including title, description, state, author, and metrics",
  mimeType: "application/json",
  arguments: [
    {
      name: "owner",
      description: "Repository owner/organization",
      required: true,
    },
    {
      name: "repo",
      description: "Repository name",
      required: true,
    },
    {
      name: "prNumber",
      description: "Pull request number",
      required: true,
    },
  ],
  async load({ owner, repo, prNumber }) {
    const params = { owner, repo, prNumber: parseInt(prNumber, 10) };
    const details = await githubService.getPRDetails(params);
    return {
      text: JSON.stringify(details, null, 2),
    };
  },
});

// Resource: PR Files
server.addResourceTemplate({
  uriTemplate: "pr://{owner}/{repo}/{prNumber}/files",
  name: "PR Files",
  description:
    "List of changed files in the pull request with additions, deletions, and patches",
  mimeType: "application/json",
  arguments: [
    {
      name: "owner",
      description: "Repository owner/organization",
      required: true,
    },
    {
      name: "repo",
      description: "Repository name",
      required: true,
    },
    {
      name: "prNumber",
      description: "Pull request number",
      required: true,
    },
  ],
  async load({ owner, repo, prNumber }) {
    const params = { owner, repo, prNumber: parseInt(prNumber, 10) };
    const files = await githubService.getPRFiles(params);
    return {
      text: JSON.stringify(files, null, 2),
    };
  },
});

// Resource: PR Reviews
server.addResourceTemplate({
  uriTemplate: "pr://{owner}/{repo}/{prNumber}/reviews",
  name: "PR Reviews",
  description: "Historical reviews and comments on the pull request",
  mimeType: "application/json",
  arguments: [
    {
      name: "owner",
      description: "Repository owner/organization",
      required: true,
    },
    {
      name: "repo",
      description: "Repository name",
      required: true,
    },
    {
      name: "prNumber",
      description: "Pull request number",
      required: true,
    },
  ],
  async load({ owner, repo, prNumber }) {
    const params = { owner, repo, prNumber: parseInt(prNumber, 10) };
    const reviews = await githubService.getPRReviews(params);
    return {
      text: JSON.stringify(reviews, null, 2),
    };
  },
});

// Resource: Repository Info
server.addResourceTemplate({
  uriTemplate: "repo://{owner}/{repo}",
  name: "Repository Info",
  description:
    "Repository metadata including default branch, permissions, and settings",
  mimeType: "application/json",
  arguments: [
    {
      name: "owner",
      description: "Repository owner/organization",
      required: true,
    },
    {
      name: "repo",
      description: "Repository name",
      required: true,
    },
  ],
  async load({ owner, repo }) {
    const info = await githubService.getRepositoryInfo({ owner, repo });
    return {
      text: JSON.stringify(info, null, 2),
    };
  },
});

// ============================================================
// MCP PROMPTS - Specialized review prompt templates
// ============================================================

// Helper to generate file summary from PR files
async function getFileSummary(params: PRParams): Promise<string> {
  const files = await githubService.getPRFiles(params);
  return files
    .map(
      (f) =>
        `- ${f.filename} (${f.status}): +${f.additions}/-${f.deletions} lines`
    )
    .join("\n");
}

// Consolidated Prompt: Review PR (unified entry point)
server.addPrompt({
  name: "review_pr",
  description:
    "Unified PR review prompt. Use 'type' to select focus: general, security, performance, documentation, or improvements",
  arguments: [
    {
      name: "owner",
      description: "Repository owner/organization",
      required: true,
    },
    { name: "repo", description: "Repository name", required: true },
    { name: "prNumber", description: "Pull request number", required: true },
    {
      name: "type",
      description: "Review type",
      required: false,
      enum: [
        "general",
        "security",
        "performance",
        "documentation",
        "improvements",
      ],
    },
    {
      name: "customPrompt",
      description: "Custom prompt to override default",
      required: false,
    },
  ],
  async load(args) {
    const params = {
      owner: args.owner as string,
      repo: args.repo as string,
      prNumber: parseInt(args.prNumber as string, 10),
    };
    const [prDetails, fileSummary, files] = await Promise.all([
      githubService.getPRDetails(params),
      getFileSummary(params),
      githubService.getPRFiles(params),
    ]);

    const reviewType = (args.type as string) ?? "general";
    const customPrompt = args.customPrompt as string | undefined;

    let rawPrompt: string;
    switch (reviewType) {
      case "security":
        rawPrompt = generateSecurityReviewPrompt(
          prDetails.title,
          prDetails.body,
          fileSummary,
          { customPrompt }
        );
        break;
      case "performance":
        rawPrompt = generatePerformanceReviewPrompt(
          prDetails.title,
          prDetails.body,
          fileSummary,
          { customPrompt }
        );
        break;
      case "documentation":
        rawPrompt = generateDocumentationReviewPrompt(
          prDetails.title,
          prDetails.body,
          fileSummary,
          { customPrompt }
        );
        break;
      case "improvements":
        rawPrompt = generateImprovementSuggestionsPrompt(
          prDetails.title,
          prDetails.body,
          fileSummary,
          { customPrompt }
        );
        break;
      default:
        rawPrompt = generateReviewPrompt(prDetails, files, customPrompt);
    }

    return rawPrompt;
  },
});

// Prompt: Security-focused PR Review (specific variant)
server.addPrompt({
  name: "review_pr_security",
  description:
    "Security-focused PR review with vulnerability analysis and OWASP guidelines",
  arguments: [
    {
      name: "owner",
      description: "Repository owner/organization",
      required: true,
    },
    { name: "repo", description: "Repository name", required: true },
    { name: "prNumber", description: "Pull request number", required: true },
    {
      name: "severityLevel",
      description: "Security severity level",
      required: false,
      enum: ["strict", "standard", "relaxed"],
    },
    {
      name: "customPrompt",
      description: "Custom prompt to override default",
      required: false,
    },
  ],
  async load(args) {
    const params = {
      owner: args.owner as string,
      repo: args.repo as string,
      prNumber: parseInt(args.prNumber as string, 10),
    };
    const [prDetails, fileSummary] = await Promise.all([
      githubService.getPRDetails(params),
      getFileSummary(params),
    ]);
    return generateSecurityReviewPrompt(
      prDetails.title,
      prDetails.body,
      fileSummary,
      {
        severityLevel: args.severityLevel as SecuritySeverityLevel,
        customPrompt: args.customPrompt as string | undefined,
      }
    );
  },
});

// Prompt: Performance-focused PR Review
server.addPrompt({
  name: "review_pr_performance",
  description:
    "Performance-focused PR review identifying bottlenecks and optimization opportunities",
  arguments: [
    {
      name: "owner",
      description: "Repository owner/organization",
      required: true,
    },
    { name: "repo", description: "Repository name", required: true },
    { name: "prNumber", description: "Pull request number", required: true },
    {
      name: "focusArea",
      description: "Performance focus area",
      required: false,
      enum: ["database", "algorithm", "memory", "network", "all"],
    },
    {
      name: "customPrompt",
      description: "Custom prompt to override default",
      required: false,
    },
  ],
  async load(args) {
    const params = {
      owner: args.owner as string,
      repo: args.repo as string,
      prNumber: parseInt(args.prNumber as string, 10),
    };
    const [prDetails, fileSummary] = await Promise.all([
      githubService.getPRDetails(params),
      getFileSummary(params),
    ]);
    return generatePerformanceReviewPrompt(
      prDetails.title,
      prDetails.body,
      fileSummary,
      {
        focusArea: args.focusArea as PerformanceFocusArea,
        customPrompt: args.customPrompt as string | undefined,
      }
    );
  },
});

// Prompt: Documentation-focused PR Review
server.addPrompt({
  name: "review_pr_documentation",
  description:
    "Documentation-focused PR review ensuring code changes are properly documented",
  arguments: [
    {
      name: "owner",
      description: "Repository owner/organization",
      required: true,
    },
    { name: "repo", description: "Repository name", required: true },
    { name: "prNumber", description: "Pull request number", required: true },
    {
      name: "docType",
      description: "Documentation type to focus on",
      required: false,
      enum: ["code", "api", "readme", "all"],
    },
    {
      name: "customPrompt",
      description: "Custom prompt to override default",
      required: false,
    },
  ],
  async load(args) {
    const params = {
      owner: args.owner as string,
      repo: args.repo as string,
      prNumber: parseInt(args.prNumber as string, 10),
    };
    const [prDetails, fileSummary] = await Promise.all([
      githubService.getPRDetails(params),
      getFileSummary(params),
    ]);
    return generateDocumentationReviewPrompt(
      prDetails.title,
      prDetails.body,
      fileSummary,
      {
        docType: args.docType as DocumentationType,
        customPrompt: args.customPrompt as string | undefined,
      }
    );
  },
});

// Prompt: Improvement Suggestions
server.addPrompt({
  name: "suggest_pr_improvements",
  description:
    "Constructive improvement suggestions without blocking (always COMMENT)",
  arguments: [
    {
      name: "owner",
      description: "Repository owner/organization",
      required: true,
    },
    { name: "repo", description: "Repository name", required: true },
    { name: "prNumber", description: "Pull request number", required: true },
    {
      name: "suggestionLevel",
      description: "Filter suggestions by impact level",
      required: false,
      enum: ["high", "medium", "low", "all"],
    },
    {
      name: "customPrompt",
      description: "Custom prompt to override default",
      required: false,
    },
  ],
  async load(args) {
    const params = {
      owner: args.owner as string,
      repo: args.repo as string,
      prNumber: parseInt(args.prNumber as string, 10),
    };
    const [prDetails, fileSummary] = await Promise.all([
      githubService.getPRDetails(params),
      getFileSummary(params),
    ]);
    return generateImprovementSuggestionsPrompt(
      prDetails.title,
      prDetails.body,
      fileSummary,
      {
        suggestionLevel: args.suggestionLevel as SuggestionLevel,
        customPrompt: args.customPrompt as string | undefined,
      }
    );
  },
});

server.start({
  transportType: "stdio",
});

console.error("🚀 GitHub PR Review MCP Server (FastMCP) started");
