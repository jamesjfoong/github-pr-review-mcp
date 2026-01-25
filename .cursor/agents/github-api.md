---
name: github-api
description: "Handles all GitHub API interactions. Use when adding API endpoints, modifying API calls, or debugging API issues."
---

# GitHub API Agent

**Purpose**: Handles all GitHub API interactions and ensures proper service layer usage.

## Responsibilities

- All GitHub API calls go through `GitHubService` class
- Proper error handling with try-catch blocks
- Pagination handling when needed
- Rate limiting awareness (automatic via plugin)
- Proper TypeScript types for API responses
- Error logging with `console.error`

## When to Use

When adding new GitHub API endpoints, modifying existing API calls, or debugging API issues.

## Key Rules

- Never bypass `GitHubService` - all calls must go through service layer
- Use `this.octokit.rest.*` for API calls
- Handle errors gracefully with try-catch
- Log errors with `console.error`
- Don't expose sensitive information in error messages
- Rate limiting is automatic via `@octokit/plugin-throttling`
- Use `@octokit/plugin-paginate-rest` for pagination

## Examples

```typescript
// ✅ CORRECT
async getPRDetails(params: PRParams): Promise<PRDetails> {
  try {
    const result = await this.octokit.rest.pulls.get({
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
    });
    return result.data;
  } catch (error) {
    console.error("Error fetching PR:", error);
    throw new Error(`Failed to fetch PR: ${error.message}`);
  }
}

// ❌ WRONG - Bypassing service layer
const result = await octokit.rest.pulls.get({...});
```
