# GitHub API Integration Skill

## Capability

Seamless integration with GitHub API for PR operations using Octokit with pagination and throttling.

## Features

- **Pagination**: Automatic handling of paginated responses
- **Rate Limiting**: Built-in throttling and retry logic
- **Error Handling**: Graceful error handling with meaningful messages
- **Type Safety**: Full TypeScript support

## Operations

### Read Operations

- Get PR details
- List PR reviews
- List PR comments
- List PR files
- Get review comments

### Write Operations

- Submit PR review
- Add PR comment (general or line-specific)
- Update PR (title, description, state)
- Reply to comments

## Patterns

### Pagination

```typescript
const items = await this.octokit.paginate(this.octokit.pulls.listReviews, {
  owner,
  repo,
  pull_number,
});
```

### Error Handling

```typescript
try {
  const result = await this.octokit.pulls.get(params);
  return transform(result.data);
} catch (error) {
  if (error.status === 404) {
    throw new Error("PR not found");
  }
  throw error;
}
```

### Data Transformation

```typescript
return {
  id: review.id,
  state: review.state,
  body: review.body || "",
  author: review.user?.login || "unknown",
  // ...
};
```

## Configuration

- Authentication via GitHub token
- Automatic rate limit handling
- Retry logic for transient failures
- Request throttling

## Best Practices

- Always use pagination for list endpoints
- Transform API responses to internal types
- Handle null/undefined values
- Validate parameters before API calls
- Log errors appropriately
