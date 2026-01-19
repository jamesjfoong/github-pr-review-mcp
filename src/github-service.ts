import { Octokit } from "@octokit/rest";
import { paginateRest } from "@octokit/plugin-paginate-rest";
import { throttling } from "@octokit/plugin-throttling";
import type {
  AddCommentParams,
  CodeFile,
  CommentTargetValidation,
  DiffHunk,
  EnsurePendingReviewParams,
  FileDiffInfo,
  PendingReview,
  PendingReviewComment,
  PRParams,
  Review,
  ReviewComment,
  SubmitReviewParams,
  UpdatePRParams,
  ValidateCommentTargetParams,
} from "./types.js";

const MyOctokit = Octokit.plugin(paginateRest, throttling);

export class GitHubService {
  private octokit: InstanceType<typeof MyOctokit>;

  constructor(token: string) {
    this.octokit = new MyOctokit({
      auth: token,
      throttle: {
        onRateLimit: (retryAfter: number) => {
          console.warn(`Rate limit hit, retrying after ${retryAfter}s`);
          return true;
        },
        onSecondaryRateLimit: (retryAfter: number) => {
          console.warn(
            `Secondary rate limit hit, retrying after ${retryAfter}s`
          );
          return true;
        },
      },
    });
  }

  async getPRReviews(params: PRParams): Promise<Review[]> {
    const reviews = await this.octokit.paginate(
      this.octokit.pulls.listReviews,
      {
        owner: params.owner,
        repo: params.repo,
        pull_number: params.prNumber,
      }
    );

    return Promise.all(
      reviews.map(async (review: any) => {
        const comments = await this.octokit.paginate(
          this.octokit.pulls.listCommentsForReview,
          {
            owner: params.owner,
            repo: params.repo,
            pull_number: params.prNumber,
            review_id: review.id,
          }
        );

        return {
          id: review.id,
          state: review.state as Review["state"],
          body: review.body || "",
          author: review.user?.login || "unknown",
          submittedAt: review.submitted_at || "",
          comments: comments.map((comment: any) => ({
            id: comment.id,
            body: comment.body,
            path: comment.path,
            line: comment.line || undefined,
            author: comment.user?.login || "unknown",
            createdAt: comment.created_at,
          })),
        };
      })
    );
  }

  async getPRComments(params: PRParams): Promise<ReviewComment[]> {
    const comments = await this.octokit.paginate(
      this.octokit.issues.listComments,
      {
        owner: params.owner,
        repo: params.repo,
        issue_number: params.prNumber,
      }
    );

    return comments.map((comment: any) => ({
      id: comment.id,
      body: comment.body || "",
      author: comment.user?.login || "unknown",
      createdAt: comment.created_at,
    }));
  }

  async getPRFiles(params: PRParams): Promise<CodeFile[]> {
    const files = await this.octokit.paginate(this.octokit.pulls.listFiles, {
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
    });

    return files.map((file: any) => ({
      filename: file.filename,
      status: file.status as CodeFile["status"],
      additions: file.additions,
      deletions: file.deletions,
      patch: file.patch,
    }));
  }

  async submitReview(params: SubmitReviewParams): Promise<void> {
    await this.octokit.pulls.createReview({
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
      body: params.body,
      event: params.event,
      comments: params.comments,
    });
  }

  async addComment(params: AddCommentParams): Promise<void> {
    if (params.path && params.line) {
      // For line-specific comments, we need the commit SHA
      let commitId = params.commit_id;
      if (!commitId) {
        // Get the latest commit SHA from the PR
        const pr = await this.octokit.pulls.get({
          owner: params.owner,
          repo: params.repo,
          pull_number: params.prNumber,
        });
        commitId = pr.data.head.sha;
      }

      // Add line-specific comment
      await this.octokit.pulls.createReviewComment({
        owner: params.owner,
        repo: params.repo,
        pull_number: params.prNumber,
        body: params.body,
        commit_id: commitId,
        path: params.path,
        line: params.line,
        ...(params.in_reply_to && { in_reply_to: params.in_reply_to }),
      });
    } else {
      // Add general comment
      await this.octokit.issues.createComment({
        owner: params.owner,
        repo: params.repo,
        issue_number: params.prNumber,
        body: params.body,
      });
    }
  }

  async updatePR(params: UpdatePRParams): Promise<void> {
    const updateData: any = {
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
    };

    if (params.title) updateData.title = params.title;
    if (params.body) updateData.body = params.body;
    if (params.state) updateData.state = params.state;

    await this.octokit.pulls.update(updateData);
  }

  async getPRDetails(params: PRParams): Promise<any> {
    const response = await this.octokit.pulls.get({
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
    });

    return {
      title: response.data.title,
      body: response.data.body,
      state: response.data.state,
      author: response.data.user?.login,
      created_at: response.data.created_at,
      updated_at: response.data.updated_at,
      mergeable: response.data.mergeable,
      merged: response.data.merged,
      additions: response.data.additions,
      deletions: response.data.deletions,
      changed_files: response.data.changed_files,
      head_sha: response.data.head.sha,
    };
  }

  /**
   * Get PR diff hunks with line mapping for all changed files
   */
  async getPRDiffHunks(params: PRParams): Promise<FileDiffInfo[]> {
    const files = await this.octokit.paginate(this.octokit.pulls.listFiles, {
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
    });

    return files.map((file: any) => {
      const hunks = file.patch ? this.parseDiffHunks(file.patch) : [];
      return {
        filename: file.filename,
        status: file.status as FileDiffInfo["status"],
        additions: file.additions,
        deletions: file.deletions,
        patch: file.patch,
        hunks,
      };
    });
  }

  /**
   * Parse diff patch into structured hunks
   */
  private parseDiffHunks(patch: string): DiffHunk[] {
    const hunks: DiffHunk[] = [];
    const lines = patch.split("\n");
    let currentHunk: DiffHunk | null = null;

    for (const line of lines) {
      // Match hunk header: @@ -oldStart,oldLines +newStart,newLines @@
      const hunkMatch = line.match(
        /@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/
      );
      if (hunkMatch) {
        if (currentHunk) {
          hunks.push(currentHunk);
        }
        currentHunk = {
          oldStart: parseInt(hunkMatch[1]),
          oldLines: hunkMatch[2] ? parseInt(hunkMatch[2]) : 1,
          newStart: parseInt(hunkMatch[3]),
          newLines: hunkMatch[4] ? parseInt(hunkMatch[4]) : 1,
          lines: [],
        };
      } else if (currentHunk) {
        currentHunk.lines.push(line);
      }
    }

    if (currentHunk) {
      hunks.push(currentHunk);
    }

    return hunks;
  }

  /**
   * Validate if a comment target (path, line, side) is valid for the PR diff
   */
  async validatePRCommentTarget(
    params: ValidateCommentTargetParams
  ): Promise<CommentTargetValidation> {
    const side = params.side || "RIGHT";
    const diffHunks = await this.getPRDiffHunks(params);
    const file = diffHunks.find((f) => f.filename === params.path);

    if (!file) {
      return {
        valid: false,
        reason: `File '${params.path}' not found in PR changes`,
      };
    }

    if (!file.patch) {
      return {
        valid: false,
        reason: `No diff available for file '${params.path}' (may be binary or too large)`,
      };
    }

    // Check if the line is within any hunk
    for (const hunk of file.hunks) {
      if (side === "RIGHT") {
        // Check new file side
        const endLine = hunk.newStart + hunk.newLines - 1;
        if (params.line >= hunk.newStart && params.line <= endLine) {
          return {
            valid: true,
            position: this.computePosition(file.patch, params.line, side),
          };
        }
      } else {
        // Check old file side (LEFT)
        const endLine = hunk.oldStart + hunk.oldLines - 1;
        if (params.line >= hunk.oldStart && params.line <= endLine) {
          return {
            valid: true,
            position: this.computePosition(file.patch, params.line, side),
          };
        }
      }
    }

    // Find nearest valid line
    const nearestValid = this.findNearestValidLine(
      file.hunks,
      params.line,
      side
    );

    return {
      valid: false,
      reason: `Line ${params.line} on ${side} side is not in the diff range`,
      nearestValidLine: nearestValid,
    };
  }

  /**
   * Compute the position in the diff for a given line and side
   */
  private computePosition(
    patch: string,
    line: number,
    side: "LEFT" | "RIGHT"
  ): number {
    const lines = patch.split("\n");
    let position = 0;
    let currentOldLine = 0;
    let currentNewLine = 0;

    for (const diffLine of lines) {
      position++;

      // Parse hunk header
      const hunkMatch = diffLine.match(
        /@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/
      );
      if (hunkMatch) {
        currentOldLine = parseInt(hunkMatch[1]) - 1;
        currentNewLine = parseInt(hunkMatch[3]) - 1;
        continue;
      }

      // Track line numbers based on diff markers
      if (diffLine.startsWith("-")) {
        currentOldLine++;
        if (side === "LEFT" && currentOldLine === line) {
          return position;
        }
      } else if (diffLine.startsWith("+")) {
        currentNewLine++;
        if (side === "RIGHT" && currentNewLine === line) {
          return position;
        }
      } else if (!diffLine.startsWith("\\")) {
        // Context line (no +/-)
        currentOldLine++;
        currentNewLine++;
        if (
          (side === "LEFT" && currentOldLine === line) ||
          (side === "RIGHT" && currentNewLine === line)
        ) {
          return position;
        }
      }
    }

    return position;
  }

  /**
   * Find the nearest valid line in the diff hunks
   */
  private findNearestValidLine(
    hunks: DiffHunk[],
    targetLine: number,
    side: "LEFT" | "RIGHT"
  ): { line: number; side: "LEFT" | "RIGHT" } | undefined {
    let nearest: { line: number; distance: number } | null = null;

    for (const hunk of hunks) {
      if (side === "RIGHT") {
        // Check new file side
        const start = hunk.newStart;
        const end = hunk.newStart + hunk.newLines - 1;

        if (targetLine < start) {
          const distance = start - targetLine;
          if (!nearest || distance < nearest.distance) {
            nearest = { line: start, distance };
          }
        } else if (targetLine > end) {
          const distance = targetLine - end;
          if (!nearest || distance < nearest.distance) {
            nearest = { line: end, distance };
          }
        }
      } else {
        // Check old file side
        const start = hunk.oldStart;
        const end = hunk.oldStart + hunk.oldLines - 1;

        if (targetLine < start) {
          const distance = start - targetLine;
          if (!nearest || distance < nearest.distance) {
            nearest = { line: start, distance };
          }
        } else if (targetLine > end) {
          const distance = targetLine - end;
          if (!nearest || distance < nearest.distance) {
            nearest = { line: end, distance };
          }
        }
      }
    }

    return nearest ? { line: nearest.line, side } : undefined;
  }

  /**
   * Get the current pending review for the PR (if any)
   */
  async getPendingReview(params: PRParams): Promise<PendingReview | null> {
    const reviews = await this.octokit.pulls.listReviews({
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
    });

    // Find the pending review from the authenticated user
    const pendingReview = reviews.data.find(
      (review: any) => review.state === "PENDING"
    );

    if (!pendingReview) {
      return null;
    }

    return {
      id: pendingReview.id,
      state: "PENDING",
      commitId: pendingReview.commit_id || "",
      body: pendingReview.body || "",
      user: pendingReview.user?.login || "unknown",
    };
  }

  /**
   * Ensure a pending review exists, creating one if necessary
   */
  async ensurePendingReview(
    params: EnsurePendingReviewParams
  ): Promise<PendingReview> {
    // Check if a pending review already exists
    const existingReview = await this.getPendingReview(params);
    if (existingReview) {
      return existingReview;
    }

    // Get the head commit SHA
    const pr = await this.octokit.pulls.get({
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
    });

    const commitId = pr.data.head.sha;

    // Create a new pending review
    const review = await this.octokit.pulls.createReview({
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
      commit_id: commitId,
      body: params.body || "",
      event: "PENDING" as any, // Create as pending
    });

    return {
      id: review.data.id,
      state: "PENDING",
      commitId,
      body: params.body || "",
      user: review.data.user?.login || "unknown",
    };
  }

  /**
   * List all pending review comments (draft comments)
   */
  async listPendingReviewComments(
    params: PRParams
  ): Promise<PendingReviewComment[]> {
    const pendingReview = await this.getPendingReview(params);

    if (!pendingReview) {
      return [];
    }

    // Get all comments for the pending review
    const comments = await this.octokit.pulls.listCommentsForReview({
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
      review_id: pendingReview.id,
    });

    return comments.data.map((comment: any) => ({
      id: comment.id,
      path: comment.path,
      line: comment.line || null,
      side: (comment.side as "LEFT" | "RIGHT") || null,
      body: comment.body,
      commitId: comment.commit_id,
      createdAt: comment.created_at,
      user: comment.user?.login || "unknown",
    }));
  }
}
