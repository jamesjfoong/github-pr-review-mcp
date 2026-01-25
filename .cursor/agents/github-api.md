---
name: github-api
description: "Handles all GitHub API interactions. Use when adding API endpoints, modifying API calls, or debugging API issues."
---

# GitHub API Agent

**Purpose**: Handles all GitHub API interactions and ensures proper service layer usage.

## Documentation Reference

When working with GitHub API, use Context7 to fetch up-to-date documentation:

- **Octokit client**: `@context7 /octokit/rest.js` - JavaScript client API
- **GitHub REST API**: `@context7 /websites/github_en_rest` - Full endpoint docs

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
- Use `this.octokit.*` for API calls (e.g., `this.octokit.pulls.get`)
- Handle errors gracefully with try-catch
- Log errors with `console.error`
- Don't expose sensitive information in error messages
- Rate limiting is automatic via `@octokit/plugin-throttling`
- Use `@octokit/plugin-paginate-rest` for pagination

## Examples

```typescript
// CORRECT
async getPRDetails(params: PRParams): Promise<PRDetails> {
  try {
    const result = await this.octokit.pulls.get({
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
    });
    return result.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error fetching PR:", message);
    throw new Error(`Failed to fetch PR: ${message}`);
  }
}

// WRONG - Bypassing service layer
const result = await octokit.pulls.get({...});
```
