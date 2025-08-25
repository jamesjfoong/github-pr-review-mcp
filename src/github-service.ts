import { Octokit } from "@octokit/rest";
import { paginateRest } from "@octokit/plugin-paginate-rest";
import { throttling } from "@octokit/plugin-throttling";
import type {
  AddCommentParams,
  CodeFile,
  PRParams,
  Review,
  ReviewComment,
  SubmitReviewParams,
  UpdatePRParams,
} from "./types";

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
    };
  }
}
