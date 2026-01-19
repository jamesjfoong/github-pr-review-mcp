import { Octokit } from "@octokit/rest";
import { paginateRest } from "@octokit/plugin-paginate-rest";
import { throttling } from "@octokit/plugin-throttling";
import {
  type AddCommentParams,
  type CodeFile,
  type CommentTargetValidation,
  DEFAULT_AUTHOR,
  type DiffHunk,
  DiffSide,
  type EnsurePendingReviewParams,
  type FileDiffInfo,
  FileStatus,
  type PendingReview,
  type PendingReviewComment,
  type PRDetails,
  type PRParams,
  type Review,
  type ReviewComment,
  ReviewState,
  type SubmitReviewParams,
  type UpdatePRParams,
  type ValidateCommentTargetParams,
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
      reviews.map(async (review) => {
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
          state: this.mapReviewState(review.state),
          body: review.body ?? "",
          author: review.user?.login ?? DEFAULT_AUTHOR,
          submittedAt: review.submitted_at ?? "",
          comments: comments.map((comment) => this.mapReviewComment(comment)),
        };
      })
    );
  }

  private mapReviewState(state: string): ReviewState {
    switch (state) {
      case "APPROVED":
        return ReviewState.APPROVED;
      case "CHANGES_REQUESTED":
        return ReviewState.CHANGES_REQUESTED;
      case "COMMENTED":
        return ReviewState.COMMENTED;
      case "PENDING":
        return ReviewState.PENDING;
      default:
        return ReviewState.COMMENTED;
    }
  }

  private mapReviewComment(comment: any): ReviewComment {
    return {
      id: comment.id,
      body: comment.body,
      path: comment.path,
      line: comment.line ?? undefined,
      author: comment.user?.login ?? DEFAULT_AUTHOR,
      createdAt: comment.created_at,
    };
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

    return comments.map((comment) => ({
      id: comment.id,
      body: comment.body ?? "",
      author: comment.user?.login ?? DEFAULT_AUTHOR,
      createdAt: comment.created_at,
    }));
  }

  async getPRFiles(params: PRParams): Promise<CodeFile[]> {
    const files = await this.octokit.paginate(this.octokit.pulls.listFiles, {
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
    });

    return files.map((file) => ({
      filename: file.filename,
      status: this.mapFileStatus(file.status),
      additions: file.additions,
      deletions: file.deletions,
      patch: file.patch,
    }));
  }

  private mapFileStatus(status: string): FileStatus {
    switch (status) {
      case "added":
        return FileStatus.ADDED;
      case "modified":
        return FileStatus.MODIFIED;
      case "deleted":
        return FileStatus.DELETED;
      case "renamed":
        return FileStatus.RENAMED;
      default:
        return FileStatus.MODIFIED;
    }
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
    const updateData: {
      owner: string;
      repo: string;
      pull_number: number;
      title?: string;
      body?: string;
      state?: "open" | "closed";
    } = {
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
    };

    if (params.title) updateData.title = params.title;
    if (params.body) updateData.body = params.body;
    if (params.state) updateData.state = params.state as "open" | "closed";

    await this.octokit.pulls.update(updateData);
  }

  async getPRDetails(params: PRParams): Promise<PRDetails> {
    const response = await this.octokit.pulls.get({
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
    });

    const data = response.data;
    return {
      title: data.title,
      body: data.body,
      state: data.state,
      author: data.user?.login,
      created_at: data.created_at,
      updated_at: data.updated_at,
      mergeable: data.mergeable,
      merged: data.merged,
      additions: data.additions,
      deletions: data.deletions,
      changed_files: data.changed_files,
      head_sha: data.head.sha,
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

    return files.map((file) => {
      const hunks = file.patch ? this.parseDiffHunks(file.patch) : [];
      return {
        filename: file.filename,
        status: this.mapFileStatus(file.status),
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
        const oldStart = parseInt(hunkMatch[1], 10);
        const oldLines = hunkMatch[2] ? parseInt(hunkMatch[2], 10) : 1;
        const newStart = parseInt(hunkMatch[3], 10);
        const newLines = hunkMatch[4] ? parseInt(hunkMatch[4], 10) : 1;

        // Validate parsed values
        if (
          isNaN(oldStart) ||
          isNaN(oldLines) ||
          isNaN(newStart) ||
          isNaN(newLines)
        ) {
          continue; // Skip malformed hunk header
        }

        currentHunk = {
          oldStart,
          oldLines,
          newStart,
          newLines,
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
    const side = params.side ?? DiffSide.RIGHT;
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
      if (side === DiffSide.RIGHT) {
        // Check new file side
        // Handle edge case: if newLines is 0 (pure deletion), skip this hunk for RIGHT side
        if (hunk.newLines === 0) continue;

        const endLine = hunk.newStart + hunk.newLines - 1;
        if (params.line >= hunk.newStart && params.line <= endLine) {
          return {
            valid: true,
            position: this.computePosition(file.patch, params.line, side),
          };
        }
      } else {
        // Check old file side (LEFT)
        // Handle edge case: if oldLines is 0 (pure addition), skip this hunk for LEFT side
        if (hunk.oldLines === 0) continue;

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
  private computePosition(patch: string, line: number, side: DiffSide): number {
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
        const parsedOldLine = parseInt(hunkMatch[1], 10);
        const parsedNewLine = parseInt(hunkMatch[3], 10);

        // Validate parsed values to handle malformed hunk headers
        if (Number.isNaN(parsedOldLine) || Number.isNaN(parsedNewLine)) {
          // Skip malformed hunk header; continue with existing line counters
          continue;
        }

        currentOldLine = parsedOldLine - 1;
        currentNewLine = parsedNewLine - 1;
        continue;
      }

      // Track line numbers based on diff markers
      if (diffLine.startsWith("-")) {
        currentOldLine++;
        if (side === DiffSide.LEFT && currentOldLine === line) {
          return position;
        }
      } else if (diffLine.startsWith("+")) {
        currentNewLine++;
        if (side === DiffSide.RIGHT && currentNewLine === line) {
          return position;
        }
      } else if (!diffLine.startsWith("\\")) {
        // Context line (no +/-)
        currentOldLine++;
        currentNewLine++;
        if (
          (side === DiffSide.LEFT && currentOldLine === line) ||
          (side === DiffSide.RIGHT && currentNewLine === line)
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
    side: DiffSide
  ): { line: number; side: DiffSide } | undefined {
    let nearest: { line: number; distance: number } | null = null;

    for (const hunk of hunks) {
      if (side === DiffSide.RIGHT) {
        const nearestInHunk = this.findNearestInHunkForNewFile(
          hunk,
          targetLine
        );
        nearest = this.updateNearest(nearest, nearestInHunk);
      } else {
        const nearestInHunk = this.findNearestInHunkForOldFile(
          hunk,
          targetLine
        );
        nearest = this.updateNearest(nearest, nearestInHunk);
      }
    }

    return nearest ? { line: nearest.line, side } : undefined;
  }

  private findNearestInHunkForNewFile(
    hunk: DiffHunk,
    targetLine: number
  ): { line: number; distance: number } | null {
    // Skip hunks with no new lines (pure deletions)
    if (hunk.newLines === 0) return null;

    const start = hunk.newStart;
    const end = hunk.newStart + hunk.newLines - 1;

    if (targetLine < start) {
      return { line: start, distance: start - targetLine };
    } else if (targetLine > end) {
      return { line: end, distance: targetLine - end };
    }
    return null;
  }

  private findNearestInHunkForOldFile(
    hunk: DiffHunk,
    targetLine: number
  ): { line: number; distance: number } | null {
    // Skip hunks with no old lines (pure additions)
    if (hunk.oldLines === 0) return null;

    const start = hunk.oldStart;
    const end = hunk.oldStart + hunk.oldLines - 1;

    if (targetLine < start) {
      return { line: start, distance: start - targetLine };
    } else if (targetLine > end) {
      return { line: end, distance: targetLine - end };
    }
    return null;
  }

  private updateNearest(
    current: { line: number; distance: number } | null,
    candidate: { line: number; distance: number } | null
  ): { line: number; distance: number } | null {
    if (!candidate) return current;
    if (!current) return candidate;
    return candidate.distance < current.distance ? candidate : current;
  }

  /**
   * Get the current pending review for the PR from the authenticated user
   */
  async getPendingReview(params: PRParams): Promise<PendingReview | null> {
    // Get authenticated user
    const { data: user } = await this.octokit.users.getAuthenticated();

    const reviews = await this.octokit.pulls.listReviews({
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
    });

    // Find the pending review from the authenticated user
    const pendingReview = reviews.data.find(
      (review) =>
        review.state === ReviewState.PENDING &&
        review.user?.login === user.login
    );

    if (!pendingReview) {
      return null;
    }

    return {
      id: pendingReview.id,
      state: ReviewState.PENDING,
      commitId: pendingReview.commit_id ?? "",
      body: pendingReview.body ?? "",
      user: pendingReview.user?.login ?? DEFAULT_AUTHOR,
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
    // Note: The GitHub API accepts "PENDING" as an event type to create a draft review,
    // but this value is not included in the official Octokit TypeScript types.
    // We intentionally escape the type system here (`as any`) and then cast to
    // the expected union type to document this discrepancy between the API
    // behavior and the TypeScript definitions.
    const review = await this.octokit.pulls.createReview({
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
      commit_id: commitId,
      body: params.body ?? "",
      event: "PENDING" as any as "APPROVE" | "REQUEST_CHANGES" | "COMMENT",
    });

    return {
      id: review.data.id,
      state: ReviewState.PENDING,
      commitId,
      body: params.body ?? "",
      user: review.data.user?.login ?? DEFAULT_AUTHOR,
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

    return comments.data.map((comment) =>
      this.mapPendingReviewComment(comment)
    );
  }

  private mapPendingReviewComment(comment: any): PendingReviewComment {
    return {
      id: comment.id,
      path: comment.path,
      line: comment.line ?? null,
      side: this.mapDiffSide(comment.side),
      body: comment.body,
      commitId: comment.commit_id,
      createdAt: comment.created_at,
      user: comment.user?.login ?? DEFAULT_AUTHOR,
    };
  }

  private mapDiffSide(side: string | null): DiffSide | null {
    if (side === "LEFT") return DiffSide.LEFT;
    if (side === "RIGHT") return DiffSide.RIGHT;
    return null;
  }
}
