---
name: code-patterns
description: "Common code patterns for this project. Use when implementing features or handling errors."
---

# Code Patterns

## When to Use

- Implementing new features
- Handling GitHub API calls
- Adding code analysis patterns
- Writing type-safe code

## GitHub API Error Handling

```typescript
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
```

- Rate limiting: automatic via `@octokit/plugin-throttling`
- Pagination: use `@octokit/plugin-paginate-rest`
- Auth: ensure `GITHUB_TOKEN` in `.env`

## Type-Safe Code

```typescript
// CORRECT
export const PRParamsSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  prNumber: z.number(),
});
export type PRParams = z.infer<typeof PRParamsSchema>;

// WRONG - don't use excessive unions
type BadType = string | null | undefined;

// CORRECT - use optional
type GoodType = { value?: string };
```

## Adding Analysis Patterns

Security patterns (`src/code-analyzer.ts`):

```typescript
{
  pattern: /your-regex-pattern/gi,
  message: "Description of the issue",
}
```

Code smell patterns:

```typescript
{
  pattern: /your-regex-pattern/g,
  message: "Description of the smell",
}
```

## Service Layer

All GitHub API calls must go through `GitHubService`:

```typescript
// CORRECT
const result = await githubService.getPRDetails(params);

// WRONG - bypasses service
const result = await octokit.rest.pulls.get({...});
```
