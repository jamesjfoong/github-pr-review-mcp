#!/usr/bin/env node
import dotenv from "dotenv";
import { FastMCP } from "fastmcp";
import { CodeAnalyzer } from "./code-analyzer";
import { GitHubService } from "./github-service";
import type {
  AddCommentParams,
  PRParams,
  SubmitReviewParams,
  UpdatePRParams,
} from "./types";
import {
  AddCommentSchema,
  PRParamsSchema,
  SubmitReviewSchema,
  UpdatePRSchema,
} from "./types";

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error("❌ GITHUB_TOKEN environment variable is required");
  process.exit(1);
}

const githubService = new GitHubService(GITHUB_TOKEN);
const codeAnalyzer = new CodeAnalyzer();

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

server.start({
  transportType: "stdio",
});

console.error("🚀 GitHub PR Review MCP Server (FastMCP) started");
