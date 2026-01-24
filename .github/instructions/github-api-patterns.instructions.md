# GitHub API Integration Patterns

## Octokit Usage

This project uses `@octokit/rest` with pagination and throttling plugins.

## Pagination

Always use `octokit.paginate()` for endpoints that return multiple items:

```typescript
const reviews = await this.octokit.paginate(this.octokit.pulls.listReviews, {
  owner,
  repo,
  pull_number,
});
```

## Rate Limiting

The Octokit instance is configured with automatic throttling:

- Retries on rate limit exceeded
- Logs warnings for rate limit events
- Handles secondary rate limits

## Error Handling

- Catch and handle Octokit errors
- Provide meaningful error messages
- Handle 404 (not found) gracefully
- Handle 403 (forbidden) with clear messages

## Data Transformation

- Transform Octokit responses to internal types
- Extract only needed fields
- Normalize data structures
- Handle null/undefined values

## Common Patterns

### Get PR Data

```typescript
const pr = await this.octokit.pulls.get({
  owner,
  repo,
  pull_number,
});
```

### List with Pagination

```typescript
const items = await this.octokit.paginate(this.octokit.pulls.listFiles, {
  owner,
  repo,
  pull_number,
});
```

### Create Resource

```typescript
await this.octokit.pulls.createReview({
  owner,
  repo,
  pull_number,
  body,
  event,
});
```

## Authentication

- Use GitHub Personal Access Token
- Required scopes: `repo`, `read:user`
- Token passed via environment variable
- Never log or expose tokens

## Best Practices

- Always validate parameters before API calls
- Use TypeScript types for responses
- Handle edge cases (empty results, missing data)
- Cache when appropriate
- Respect rate limits
