#!/usr/bin/env node
import dotenv from "dotenv";
import { FastMCP } from "fastmcp";
import { CodeAnalyzer } from "./code-analyzer.js";
import { GitHubService } from "./github-service.js";
import type {
  AddCommentParams,
  EnsurePendingReviewParams,
  PRParams,
  ReviewPRWithPromptParams,
  SubmitReviewParams,
  UpdatePRParams,
  ValidateCommentTargetParams,
} from "./types.js";
import {
  AddCommentSchema,
  EnsurePendingReviewSchema,
  PRParamsSchema,
  ReviewPRWithPromptSchema,
  SubmitReviewSchema,
  UpdatePRSchema,
  ValidateCommentTargetSchema,
} from "./types.js";
import { formatFilesForReview, generateReviewPrompt } from "./review-prompt.js";

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error("❌ GITHUB_TOKEN environment variable is required");
  process.exit(1);
}

// Initialize services
const githubService = new GitHubService(GITHUB_TOKEN);
const codeAnalyzer = new CodeAnalyzer();

// Initialize MCP server
const server = new FastMCP({
  name: "GitHub PR Review",
  version: "1.0.0",
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

// Tool: Analyze PR Code
server.addTool({
  name: "analyze_pr_code",
  description: "Analyze code changes in a PR for issues and suggestions",
  parameters: PRParamsSchema,
  execute: async (params: PRParams) => {
    const files = await githubService.getPRFiles(params);
    const analysis = codeAnalyzer.analyze(files);

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

// Tool: Submit PR Review
server.addTool({
  name: "submit_pr_review",
  description: "Submit a review to a pull request",
  parameters: SubmitReviewSchema,
  execute: async (params: SubmitReviewParams) => {
    await githubService.submitReview(params);
    return {
      content: [
        {
          type: "text",
          text: "✅ Review submitted successfully",
        },
      ],
    };
  },
});

// Tool: Add Comment to PR
server.addTool({
  name: "add_pr_comment",
  description: "Add a comment to a PR (general or line-specific)",
  parameters: AddCommentSchema,
  execute: async (params: AddCommentParams) => {
    await githubService.addComment(params);
    const commentType =
      params.path && params.line ? "line-specific comment" : "general comment";
    return {
      content: [
        {
          type: "text",
          text: `✅ ${commentType} added successfully`,
        },
      ],
    };
  },
});

// Tool: Update PR
server.addTool({
  name: "update_pr",
  description: "Update PR title, description, or state",
  parameters: UpdatePRSchema,
  execute: async (params: UpdatePRParams) => {
    await githubService.updatePR(params);
    return {
      content: [
        {
          type: "text",
          text: "✅ PR updated successfully",
        },
      ],
    };
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

server.start({
  transportType: "stdio",
});

console.error("🚀 GitHub PR Review MCP Server (FastMCP) started");
